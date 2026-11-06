<?php

namespace App\Services;

use App\Mail\OrderStatusChangedMail;
use App\Mail\ReviewRequestMail;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Seller;
use App\Support\NotificationMessages;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * The one place that moves an order through its states. Both the seller screens and the
 * admin screens (for admin-managed stores) call this, so the rules cannot drift apart.
 */
class OrderStatusService
{
    public const TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    /** @throws HttpResponseException 422 when the move is not allowed */
    public function change(Order $order, string $status, ?string $trackingNumber = null): Order
    {
        if (!in_array($status, self::TRANSITIONS[$order->status] ?? [], true)) {
            $this->refuse(__('Cannot change status from ":from" to ":to".', ['from' => $order->status, 'to' => $status]));
        }

        // A paused order cannot move forward; cancelling stays possible
        if ($order->on_hold && $status !== 'cancelled') {
            $this->refuse(__('This order is on hold. Release the hold before moving it forward.'));
        }

        DB::transaction(function () use ($order, $status, $trackingNumber) {
            $update = ['status' => $status];

            if ($trackingNumber !== null && $trackingNumber !== '') {
                $update['tracking_number'] = $trackingNumber;
            }
            if ($status === 'shipped') {
                $update['shipped_at'] = now();
            }
            if ($status === 'delivered') {
                $update['delivered_at'] = now();
                $update['payment_status'] = 'received';
            }
            if ($status === 'cancelled') {
                $this->reverseStockAndSales($order);
                // Only touch the hold columns when there is a hold to clear, so a normal cancel
                // never depends on them (safe even before the hold migration has been run)
                if ($order->on_hold) {
                    $update['on_hold'] = false;
                    $update['hold_reason'] = null;
                }
            }

            $order->update($update);

            if ($status === 'delivered') {
                Seller::whereKey($order->seller_id)->increment('total_orders');
            }

            $this->notifyCustomer($order, $status, $trackingNumber);
        });

        return $order->fresh();
    }

    public function setHold(Order $order, bool $onHold, ?string $reason = null): Order
    {
        if ($onHold && in_array($order->status, ['delivered', 'cancelled'], true)) {
            $this->refuse(__('A :status order cannot be put on hold.', ['status' => $order->status]));
        }

        $order->update([
            'on_hold' => $onHold,
            'hold_reason' => $onHold ? $reason : null,
        ]);

        return $order->fresh();
    }

    private function notifyCustomer(Order $order, string $status, ?string $trackingNumber): void
    {
        $customer = $order->customer()->first();
        $locale = $customer?->locale ?? 'en';

        $trackingSuffix = '';
        if ($status === 'shipped' && !empty($trackingNumber)) {
            $trackingSuffix = match ($locale) {
                'fr' => " Suivi : {$trackingNumber}",
                'ar' => " رقم التتبع: {$trackingNumber}",
                default => " Tracking: {$trackingNumber}",
            };
        }

        [$title, $body] = NotificationMessages::get('order.' . $status, $locale, [
            'number' => $order->order_number,
            'tracking' => $trackingSuffix,
        ]);
        Notification::send($order->customer_id, 'order', $title, $body, '/customer/orders/' . $order->id, ['order_id' => $order->id]);

        if ($customer) {
            Mail::to($customer->email)->send(new OrderStatusChangedMail($order, $status, $trackingNumber, $locale));

            if ($status === 'delivered') {
                Mail::to($customer->email)->send(new ReviewRequestMail($order, $locale));
            }
        }
    }

    private function reverseStockAndSales(Order $order): void
    {
        foreach ($order->items as $item) {
            $product = $item->product()->lockForUpdate()->first();
            if ($product) {
                // "Sur commande" products have no stock count to give back
                if (!$product->is_made_to_order) {
                    $product->increment('stock_quantity', $item->quantity);
                }
                $product->decrement('total_sales', $item->quantity);
            }
        }
    }

    private function refuse(string $message): never
    {
        throw new HttpResponseException(response()->json(['message' => $message], 422));
    }
}
