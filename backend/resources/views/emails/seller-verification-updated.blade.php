<x-emails.layout :locale="$locale" :title="$status === 'verified' ? ($locale === 'fr' ? 'Boutique vérifiée' : ($locale === 'ar' ? 'تم توثيق المتجر' : 'Store verified')) : ($locale === 'fr' ? 'Boutique suspendue' : ($locale === 'ar' ? 'تم تعليق المتجر' : 'Store suspended'))">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Bonjour {{ $sellerName }},
    @elseif($locale === 'ar') مرحباً {{ $sellerName }}،
    @else Hi {{ $sellerName }},
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($status === 'verified')
      @if($locale === 'fr') Votre boutique est vérifiée
      @elseif($locale === 'ar') تم توثيق متجرك
      @else Your store is verified
      @endif
    @else
      @if($locale === 'fr') Votre boutique a été suspendue
      @elseif($locale === 'ar') تم تعليق متجرك
      @else Your store has been suspended
      @endif
    @endif
  </h1>

  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($status === 'verified')
      @if($locale === 'fr')
        Bonne nouvelle : <strong style="color:#1f1b16;">{{ $storeName }}</strong> est maintenant vérifiée et visible par tous les clients de la marketplace.
      @elseif($locale === 'ar')
        خبر سار: تم توثيق متجر <strong style="color:#1f1b16;">{{ $storeName }}</strong> وهو الآن مرئي لجميع العملاء في السوق.
      @else
        Good news: <strong style="color:#1f1b16;">{{ $storeName }}</strong> is now verified and visible to every customer on the marketplace.
      @endif
    @else
      @if($locale === 'fr')
        Votre boutique <strong style="color:#1f1b16;">{{ $storeName }}</strong> a été suspendue par notre équipe et n'est plus visible aux clients. Contactez-nous pour plus de détails.
      @elseif($locale === 'ar')
        تم تعليق متجرك <strong style="color:#1f1b16;">{{ $storeName }}</strong> من قِبل فريقنا ولم يعد مرئياً للعملاء. تواصل معنا لمزيد من التفاصيل.
      @else
        Your store <strong style="color:#1f1b16;">{{ $storeName }}</strong> has been suspended by our team and is no longer visible to customers. Contact us for details.
      @endif
    @endif
  </p>

  @if($status === 'verified')
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/seller/store"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Voir ma boutique
          @elseif($locale === 'ar') عرض متجري
          @else View my store
          @endif
        </a>
      </td>
    </tr>
  </table>
  @endif

</x-emails.layout>
