{{--
    Shared branded email shell — best-practice transactional pattern:
    centered logo lockup, generous whitespace, single clear focal point
    per email, quiet neutral chrome with one gold accent reserved for
    the primary action. No decorative icons or tinted boxes here —
    those live (sparingly, if ever) in individual templates.

    Usage:
        <x-emails.layout :locale="$locale" :title="'Some page title'">
            (headline, body, CTA button, etc. go here)
        </x-emails.layout>

    Translation pattern (matches the rest of the codebase): inline
    at-if/at-elseif/at-else blocks inside the slot content — there is no
    resources/lang/emails.php file, by design.
--}}
<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $locale === 'ar' ? 'rtl' : 'ltr' }}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{ $title }}</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" type="text/css">
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#f9f7f2;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;color:#25211a;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f2;padding:56px 20px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        {{-- Centered logo lockup --}}
        <tr>
          <td align="center" style="padding-bottom:40px;">
            <img src="https://res.cloudinary.com/dsoukycbj/image/upload/v1782562030/maadin/logo.png" alt="" width="32" style="display:block;margin:0 auto 10px;" />
            <span style="font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;color:#25211a;letter-spacing:0.2px;">
              {{ $locale === 'ar' ? 'مراكش معادن' : 'Marrakech Maadine' }}
            </span>
          </td>
        </tr>

        {{-- White content panel --}}
        <tr>
          <td style="background:#ffffff;border:1px solid #ece6d8;border-radius:8px;padding:40px 36px;">
            {{ $slot }}
          </td>
        </tr>

        {{-- Footer --}}
        <tr>
          <td align="center" style="padding-top:32px;">
            <p style="margin:0 0 4px;font-size:12px;color:#a89b82;">
              © {{ date('Y') }} Marrakech Maadine
            </p>
            <p style="margin:0;font-size:11px;color:#c2b8a3;">
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
