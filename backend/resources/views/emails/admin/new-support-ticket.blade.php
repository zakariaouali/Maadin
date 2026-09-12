<x-emails.layout locale="ar" title="تذكرة دعم جديدة">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:right;">تنبيه للإدارة</p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:right;">
    تذكرة دعم جديدة
  </h1>

  <p style="margin:0 0 6px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    من: <strong style="color:#1f1b16;">{{ $fromName }}</strong> ({{ $fromEmail }})
  </p>
  <p style="margin:0 0 6px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    الفئة: {{ $category }}
  </p>
  <p style="margin:0 0 20px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    الموضوع: <strong style="color:#1f1b16;">{{ $subject }}</strong>
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="background:#f7f4ea;border-radius:6px;padding:16px 18px;font-size:14px;color:#3d3020;line-height:1.7;text-align:right;">
        {{ $ticketMessage }}
      </td>
    </tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="right">
        <a href="{{ $siteUrl }}/ar/admin/support"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          الرد على التذكرة
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
