<x-emails.layout :locale="$locale" :title="$order->order_number">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Commande #{{ $order->order_number }}
    @elseif($locale === 'ar') الطلب رقم {{ $order->order_number }}
    @else Order #{{ $order->order_number }}
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @switch($status)
      @case('confirmed')
        @if($locale === 'fr') Votre commande est confirmée
        @elseif($locale === 'ar') تم تأكيد طلبك
        @else Your order is confirmed
        @endif
        @break
      @case('shipped')
        @if($locale === 'fr') Votre commande est en route
        @elseif($locale === 'ar') طلبك في الطريق إليك
        @else Your order is on its way
        @endif
        @break
      @case('delivered')
        @if($locale === 'fr') Votre commande a été livrée
        @elseif($locale === 'ar') تم تسليم طلبك
        @else Your order has been delivered
        @endif
        @break
      @case('cancelled')
        @if($locale === 'fr') Votre commande a été annulée
        @elseif($locale === 'ar') تم إلغاء طلبك
        @else Your order has been cancelled
        @endif
        @break
    @endswitch
  </h1>

  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @switch($status)
      @case('confirmed')
        @if($locale === 'fr') Le vendeur prépare votre commande.
        @elseif($locale === 'ar') البائع يقوم الآن بتجهيز طلبك.
        @else The seller is now preparing your order.
        @endif
        @break
      @case('shipped')
        @if($locale === 'fr')
          Votre commande a été expédiée.@if($trackingNumber) Numéro de suivi : <strong style="color:#1f1b16;">{{ $trackingNumber }}</strong>.@endif
        @elseif($locale === 'ar')
          تم شحن طلبك.@if($trackingNumber) رقم التتبع: <strong style="color:#1f1b16;">{{ $trackingNumber }}</strong>.@endif
        @else
          Your order has shipped.@if($trackingNumber) Tracking number: <strong style="color:#1f1b16;">{{ $trackingNumber }}</strong>.@endif
        @endif
        @break
      @case('delivered')
        @if($locale === 'fr') Votre commande a été livrée avec succès. Profitez-en !
        @elseif($locale === 'ar') تم تسليم طلبك بنجاح. استمتع بمشترياتك!
        @else Your order has been successfully delivered. Enjoy!
        @endif
        @break
      @case('cancelled')
        @if($locale === 'fr') Votre commande a été annulée par le vendeur.
        @elseif($locale === 'ar') تم إلغاء طلبك من قِبل البائع.
        @else Your order was cancelled by the seller.
        @endif
        @break
    @endswitch
  </p>

  @if($status !== 'cancelled')
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/customer/orders/{{ $order->id }}"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Voir ma commande
          @elseif($locale === 'ar') عرض طلبي
          @else View my order
          @endif
        </a>
      </td>
    </tr>
  </table>
  @endif

</x-emails.layout>
