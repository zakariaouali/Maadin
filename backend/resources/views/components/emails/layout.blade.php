{{--
    Shared branded email shell, modeled on how top-tier products actually
    send transactional email (Stripe, Apple, Linear, Airbnb): a single
    consistent background, no card border, no colored banner. Hierarchy
    comes entirely from typography and spacing, not boxes. One quiet
    accent color, used only where it matters (the CTA).

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
<body style="margin:0;padding:0;background:#fbf9f4;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1f1b16;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf9f4;padding:64px 24px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;">

        {{-- Quiet logo lockup — no banner, no card, sits directly on the page --}}
        <tr>
          <td align="center" style="padding-bottom:48px;">
            <img src="https://res.cloudinary.com/dsoukycbj/image/upload/v1782562030/maadin/logo.png" alt="" width="64" style="display:block;margin:0 auto 14px;" />
            <span style="font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#1f1b16;letter-spacing:0.4px;">
              {{ $locale === 'ar' ? 'مراكش معادن' : 'Marrakech Maadine' }}
            </span>
          </td>
        </tr>

        {{-- Content --}}
        <tr>
          <td>
            {{ $slot }}
          </td>
        </tr>

        {{-- Footer --}}
        <tr>
          <td style="padding-top:56px;">
            <div style="height:1px;background:#e8e2d3;margin-bottom:24px;"></div>
            <p style="margin:0 0 4px;font-size:12px;color:#a89b82;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
              © {{ date('Y') }} Marrakech Maadine
            </p>
            <p style="margin:0;font-size:11px;color:#c2b8a3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
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
