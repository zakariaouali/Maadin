<x-emails.layout locale="ar" title="نسخة احتياطية لقاعدة البيانات">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:right;">تنبيه للإدارة</p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:right;">
    نسخة احتياطية لقاعدة البيانات
  </h1>

  <p style="margin:0 0 8px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    تم إنشاء نسخة احتياطية كاملة لقاعدة البيانات بتاريخ <strong style="color:#1f1b16;">{{ $date }}</strong>.
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:right;">
    الملف المرفق: <strong style="color:#1f1b16;">{{ $fileName }}</strong> ({{ $sizeKb }} كيلوبايت)
  </p>

  <p style="margin:0;font-size:12px;color:#a89b82;text-align:right;">
    احتفظ بهذا الملف في مكان آمن. لاستعادة قاعدة البيانات، فك ضغط الملف واستورده عبر phpMyAdmin أو أداة MySQL.
  </p>

</x-emails.layout>
