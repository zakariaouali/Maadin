<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Commande confirmée' : ($locale === 'ar' ? 'تم تأكيد الطلب' : 'Order confirmed')">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Commande #{{ $order->order_number }}
    @elseif($locale === 'ar') الطلب رقم {{ $order->order_number }}
    @else Order #{{ $order->order_number }}
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Merci pour votre commande
    @elseif($locale === 'ar') شكراً لطلبك
    @else Thanks for your order
    @endif
  </h1>

  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr')
      Nous avons bien reçu votre commande et le vendeur la prépare.
    @elseif($locale === 'ar')
      تلقّينا طلبك بنجاح والبائع يقوم الآن بتجهيزه.
    @else
      We've received your order and the seller is getting it ready.
    @endif
  </p>

  {{-- Line items --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    @foreach($order->items as $item)
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #efe9db;font-size:14px;color:#3d3020;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
        {{ $item->product_name }} <span style="color:#a89b82;">&times;{{ $item->quantity }}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #efe9db;font-size:14px;color:#3d3020;text-align:{{ $locale === 'ar' ? 'left' : 'right' }};white-space:nowrap;">
        {{ number_format($item->price_at_purchase * $item->quantity, 2) }} MAD
      </td>
    </tr>
    @endforeach
    <tr>
      <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1f1b16;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
        @if($locale === 'fr') Total
        @elseif($locale === 'ar') المجموع
        @else Total
        @endif
      </td>
      <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#1f1b16;text-align:{{ $locale === 'ar' ? 'left' : 'right' }};white-space:nowrap;">
        {{ number_format($order->total_price, 2) }} MAD
      </td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/customer/orders/{{ $order->id }}"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Suivre ma commande
          @elseif($locale === 'ar') تتبع طلبي
          @else Track my order
          @endif
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
