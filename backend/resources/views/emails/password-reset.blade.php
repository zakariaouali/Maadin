<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $locale === 'ar' ? 'rtl' : 'ltr' }}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>
    @if($locale === 'fr') Créer un nouveau mot de passe
    @elseif($locale === 'ar') إنشاء كلمة مرور جديدة
    @else Create a new password
    @endif
  </title>
</head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1610;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:48px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        {{-- Logo --}}
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <img
              src="https://res.cloudinary.com/dsoukycbj/image/upload/v1782562030/maadin/logo.png"
              alt="Marrakech Maadine"
              width="150"
              style="display:block;height:auto;"
            />
          </td>
        </tr>

        {{-- Card --}}
        <tr>
          <td style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

            {{-- Gold top bar --}}
            <div style="height:4px;background:linear-gradient(90deg,#c9a227,#e6c050,#c9a227);"></div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 44px;">

                  {{-- Headline --}}
                  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1610;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    @if($locale === 'fr') Créez votre nouveau mot de passe
                    @elseif($locale === 'ar') أنشئ كلمة مرورك الجديدة
                    @else Create your new password
                    @endif
                  </h1>

                  {{-- Sub-headline --}}
                  <p style="margin:0 0 28px;font-size:14px;color:#9c8c7a;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    @if($locale === 'fr') Demande de réinitialisation du mot de passe
                    @elseif($locale === 'ar') طلب إعادة تعيين كلمة المرور
                    @else Password reset request
                    @endif
                  </p>

                  {{-- Greeting --}}
                  <p style="margin:0 0 16px;font-size:15px;color:#3d3020;line-height:1.6;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    @if($locale === 'fr') Bonjour <strong style="color:#1a1610;">{{ $userName }}</strong>,
                    @elseif($locale === 'ar') مرحباً <strong style="color:#1a1610;">{{ $userName }}</strong>،
                    @else Hi <strong style="color:#1a1610;">{{ $userName }}</strong>,
                    @endif
                  </p>

                  {{-- Body --}}
                  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    @if($locale === 'fr')
                      Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte Maadine. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé.
                    @elseif($locale === 'ar')
                      تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك على معدن. انقر على الزر أدناه لاختيار كلمة مرور جديدة وآمنة.
                    @else
                      We received a request to reset the password for your Maadine account. Click the button below to choose a new secure password.
                    @endif
                  </p>

                  {{-- CTA Button --}}
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
                        <a href="{{ $resetUrl }}"
                           style="display:inline-block;background:#c9a227;color:#1a1610;text-decoration:none;font-size:15px;font-weight:700;padding:15px 40px;border-radius:6px;letter-spacing:0.3px;">
                          @if($locale === 'fr') Créer un nouveau mot de passe →
                          @elseif($locale === 'ar') ← إنشاء كلمة مرور جديدة
                          @else Create new password →
                          @endif
                        </a>
                      </td>
                    </tr>
                  </table>

                  {{-- Expiry box --}}
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:#fdf6e3;border:1px solid #e6c050;border-radius:6px;padding:14px 18px;">
                        <p style="margin:0;font-size:13px;color:#7a6520;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                          ⏱&nbsp;
                          @if($locale === 'fr') Ce lien est valable pendant <strong>60 minutes</strong>. Après expiration, vous devrez faire une nouvelle demande.
                          @elseif($locale === 'ar') هذا الرابط صالح لمدة <strong>60 دقيقة</strong>. بعد انتهاء الصلاحية ستحتاج إلى طلب جديد.
                          @else This link is valid for <strong>60 minutes</strong>. After that you'll need to request a new one.
                          @endif
                        </p>
                      </td>
                    </tr>
                  </table>

                  {{-- Divider --}}
                  <hr style="border:none;border-top:1px solid #ede8df;margin:0 0 24px;" />

                  {{-- Ignore notice --}}
                  <p style="margin:0 0 20px;font-size:13px;color:#9c8c7a;line-height:1.6;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    @if($locale === 'fr') Vous n'avez pas demandé de réinitialisation ? Ignorez cet e-mail — votre mot de passe ne changera pas.
                    @elseif($locale === 'ar') لم تطلب إعادة التعيين؟ تجاهل هذا البريد — لن تتغير كلمة مرورك.
                    @else Didn't request a reset? You can safely ignore this email — your password won't change.
                    @endif
                  </p>

                  {{-- Fallback URL --}}
                  <p style="margin:0 0 4px;font-size:12px;color:#9c8c7a;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    @if($locale === 'fr') Si le bouton ne fonctionne pas, copiez ce lien :
                    @elseif($locale === 'ar') إذا لم يعمل الزر، انسخ هذا الرابط:
                    @else If the button doesn't work, copy this link:
                    @endif
                  </p>
                  <p style="margin:0;font-size:11px;color:#c9a227;word-break:break-all;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
                    {{ $resetUrl }}
                  </p>

                </td>
              </tr>
            </table>

          </td>
        </tr>

        {{-- Footer --}}
        <tr>
          <td style="padding:28px 0;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#a09080;">
              © {{ date('Y') }} Marrakech Maadine &nbsp;·&nbsp;
              @if($locale === 'fr') La marketplace de l'artisanat marocain authentique
              @elseif($locale === 'ar') سوق الحرف المغربية الأصيلة
              @else The authentic Moroccan artisan marketplace
              @endif
            </p>
            <p style="margin:0;font-size:11px;color:#c0b49a;">
              @if($locale === 'fr') Marrakech, Maroc
              @elseif($locale === 'ar') مراكش، المغرب
              @else Marrakech, Morocco
              @endif
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
