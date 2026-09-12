<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Nouvel avis' : ($locale === 'ar' ? 'تقييم جديد' : 'New review')">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Avis client
    @elseif($locale === 'ar') تقييم عميل
    @else Customer review
    @endif
  </p>

  <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Nouvel avis sur {{ $productName }}
    @elseif($locale === 'ar') تقييم جديد على {{ $productName }}
    @else New review on {{ $productName }}
    @endif
  </h1>

  <p style="margin:0 0 32px;font-size:18px;letter-spacing:2px;color:#c9a227;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    {{ str_repeat('★', $rating) }}{{ str_repeat('☆', 5 - $rating) }}
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/seller/products"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Voir mes produits
          @elseif($locale === 'ar') عرض منتجاتي
          @else View my products
          @endif
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
