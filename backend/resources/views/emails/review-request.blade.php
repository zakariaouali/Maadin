<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Comment était votre commande ?' : ($locale === 'ar' ? 'كيف كان طلبك؟' : 'How was your order?')">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Commande #{{ $order->order_number }}
    @elseif($locale === 'ar') الطلب رقم {{ $order->order_number }}
    @else Order #{{ $order->order_number }}
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Comment était votre commande&nbsp;?
    @elseif($locale === 'ar') كيف كان طلبك؟
    @else How was your order?
    @endif
  </h1>

  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr')
      Votre commande a été livrée. Prenez un instant pour partager votre avis — cela aide beaucoup l'artisan qui l'a créée.
    @elseif($locale === 'ar')
      تم تسليم طلبك. خذ لحظة لمشاركة رأيك — سيساعد ذلك الحرفي الذي صنع منتجك كثيراً.
    @else
      Your order has been delivered. Take a moment to share your thoughts — it means a lot to the artisan who made it.
    @endif
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/customer/orders/{{ $order->id }}"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Laisser un avis
          @elseif($locale === 'ar') إضافة تقييم
          @else Leave a review
          @endif
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
