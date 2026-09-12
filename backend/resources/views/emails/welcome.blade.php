<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Bienvenue sur Marrakech Maadine' : ($locale === 'ar' ? 'مرحباً بك في مراكش معادن' : 'Welcome to Marrakech Maadine')">

  {{-- Greeting --}}
  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Bonjour {{ $userName }},
    @elseif($locale === 'ar') مرحباً {{ $userName }}،
    @else Hi {{ $userName }},
    @endif
  </p>

  {{-- Headline --}}
  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($role === 'seller')
      @if($locale === 'fr') Bienvenue chez les artisans Maadine
      @elseif($locale === 'ar') مرحباً بك بين حرفيي معادن
      @else Welcome to the Maadine artisans
      @endif
    @else
      @if($locale === 'fr') Bienvenue sur Marrakech Maadine
      @elseif($locale === 'ar') مرحباً بك في مراكش معادن
      @else Welcome to Marrakech Maadine
      @endif
    @endif
  </h1>

  {{-- Body --}}
  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($role === 'seller')
      @if($locale === 'fr')
        Votre compte vendeur est créé. La prochaine étape : configurez votre boutique pour commencer à vendre vos créations artisanales aux clients du monde entier.
      @elseif($locale === 'ar')
        تم إنشاء حساب البائع الخاص بك. الخطوة التالية: قم بإعداد متجرك لبدء بيع إبداعاتك الحرفية لعملاء من جميع أنحاء العالم.
      @else
        Your seller account is set up. Next step: configure your store so you can start selling your handmade creations to customers worldwide.
      @endif
    @else
      @if($locale === 'fr')
        Votre compte est prêt. Découvrez des créations artisanales authentiques, faites à la main par des artisans marocains partout dans le pays.
      @elseif($locale === 'ar')
        حسابك جاهز الآن. اكتشف إبداعات حرفية أصيلة، مصنوعة يدوياً من قبل حرفيين مغاربة في جميع أنحاء البلاد.
      @else
        Your account is ready. Discover authentic handmade creations, crafted by Moroccan artisans across the country.
      @endif
    @endif
  </p>

  {{-- CTA Button --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/{{ $role === 'seller' ? 'seller/store' : 'products' }}"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($role === 'seller')
            @if($locale === 'fr') Configurer ma boutique
            @elseif($locale === 'ar') إعداد متجري
            @else Set up my store
            @endif
          @else
            @if($locale === 'fr') Découvrir les produits
            @elseif($locale === 'ar') تصفح المنتجات
            @else Browse products
            @endif
          @endif
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
