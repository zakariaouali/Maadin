<x-emails.layout locale="ar" title="عميل جديد سجّل في المنصة">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:right;">تنبيه للإدارة</p>

  <h1 style="margin:0 0 18px;font-size:22px;font-weight:700;color:#1a1610;line-height:1.3;text-align:right;">
    عميل جديد سجّل في المنصة
  </h1>

  <p style="margin:0 0 8px;font-size:14px;color:#5c4f3a;line-height:1.65;text-align:right;">
    <strong style="color:#1a1610;">{{ $customerName }}</strong> أنشأ حساب عميل جديد.
  </p>
  <p style="margin:0 0 28px;font-size:14px;color:#5c4f3a;line-height:1.65;text-align:right;">
    البريد الإلكتروني: {{ $customerEmail }}
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="right">
        <a href="{{ $siteUrl }}/ar/admin/users"
           style="display:inline-block;background:#c9a227;color:#1a1610;text-decoration:none;font-size:14px;font-weight:700;padding:13px 28px;border-radius:6px;">
          عرض المستخدمين
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
