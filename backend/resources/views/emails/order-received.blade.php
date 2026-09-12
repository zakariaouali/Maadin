<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Nouvelle commande' : ($locale === 'ar' ? 'طلب جديد' : 'New order received')">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Commande #{{ $order->order_number }}
    @elseif($locale === 'ar') الطلب رقم {{ $order->order_number }}
    @else Order #{{ $order->order_number }}
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Vous avez une nouvelle commande
    @elseif($locale === 'ar') لديك طلب جديد
    @else You've got a new order
    @endif
  </h1>

  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr')
      Un client vient de passer une commande de <strong style="color:#1f1b16;">{{ number_format($order->total_price, 2) }} MAD</strong> ({{ $order->items->count() }} article{{ $order->items->count() > 1 ? 's' : '' }}). Préparez-la dès que possible.
    @elseif($locale === 'ar')
      قام عميل للتو بتقديم طلب بقيمة <strong style="color:#1f1b16;">{{ number_format($order->total_price, 2) }} درهم</strong> ({{ $order->items->count() }} منتج). جهّزه في أقرب وقت ممكن.
    @else
      A customer just placed an order worth <strong style="color:#1f1b16;">{{ number_format($order->total_price, 2) }} MAD</strong> ({{ $order->items->count() }} item{{ $order->items->count() > 1 ? 's' : '' }}). Please prepare it as soon as possible.
    @endif
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/seller/orders/{{ $order->id }}"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Voir la commande
          @elseif($locale === 'ar') عرض الطلب
          @else View order
          @endif
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
