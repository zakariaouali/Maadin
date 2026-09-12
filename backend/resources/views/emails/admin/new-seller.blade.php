<x-emails.layout locale="ar" title="بائع جديد سجّل متجراً">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:right;">تنبيه للإدارة</p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:right;">
    بائع جديد سجّل متجراً
  </h1>

  <p style="margin:0 0 8px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    <strong style="color:#1f1b16;">{{ $sellerName }}</strong> أنشأ متجراً باسم
    <strong style="color:#1f1b16;">{{ $storeName }}</strong>.
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    البريد الإلكتروني: {{ $sellerEmail }}
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="right">
        <a href="{{ $siteUrl }}/ar/admin/sellers"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          مراجعة البائعين
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
