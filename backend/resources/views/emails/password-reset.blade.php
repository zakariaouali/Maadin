<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Créer un nouveau mot de passe' : ($locale === 'ar' ? 'إنشاء كلمة مرور جديدة' : 'Create a new password')">

  {{-- Greeting --}}
  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Bonjour {{ $userName }},
    @elseif($locale === 'ar') مرحباً {{ $userName }}،
    @else Hi {{ $userName }},
    @endif
  </p>

  {{-- Headline (clean sans, states the purpose immediately) --}}
  <h1 style="margin:0 0 18px;font-size:22px;font-weight:700;color:#1a1610;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Réinitialisez votre mot de passe
    @elseif($locale === 'ar') إعادة تعيين كلمة المرور
    @else Reset your password
    @endif
  </h1>

  {{-- Body --}}
  <p style="margin:0 0 28px;font-size:14px;color:#5c4f3a;line-height:1.65;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr')
      Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
    @elseif($locale === 'ar')
      تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك. انقر على الزر أدناه لاختيار كلمة مرور جديدة.
    @else
      We received a request to reset the password for your account. Click the button below to choose a new one.
    @endif
  </p>

  {{-- CTA Button --}}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $resetUrl }}"
           style="display:inline-block;background:#c9a227;color:#1a1610;text-decoration:none;font-size:14px;font-weight:700;padding:13px 28px;border-radius:6px;">
          @if($locale === 'fr') Réinitialiser le mot de passe
          @elseif($locale === 'ar') إعادة تعيين كلمة المرور
          @else Reset password
          @endif
        </a>
      </td>
    </tr>
  </table>

  {{-- Expiry note — quiet, no box --}}
  <p style="margin:0 0 24px;font-size:12px;color:#a89b82;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Ce lien expire dans 60 minutes.
    @elseif($locale === 'ar') هذا الرابط صالح لمدة 60 دقيقة.
    @else This link expires in 60 minutes.
    @endif
  </p>

  {{-- Divider --}}
  <hr style="border:none;border-top:1px solid #f0ebe0;margin:0 0 20px;" />

  {{-- Ignore notice --}}
  <p style="margin:0 0 14px;font-size:12px;color:#a89b82;line-height:1.6;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Vous n'avez pas demandé ceci ? Ignorez cet e-mail.
    @elseif($locale === 'ar') لم تطلب هذا؟ يمكنك تجاهل هذا البريد.
    @else Didn't request this? You can safely ignore this email.
    @endif
  </p>

  {{-- Fallback URL --}}
  <p style="margin:0;font-size:11px;color:#c2b8a3;word-break:break-all;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    {{ $resetUrl }}
  </p>

</x-emails.layout>
