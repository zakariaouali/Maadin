<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Nouveau message' : ($locale === 'ar' ? 'رسالة جديدة' : 'New message')">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Message
    @elseif($locale === 'ar') رسالة
    @else Message
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Nouveau message de {{ $senderName }}
    @elseif($locale === 'ar') رسالة جديدة من {{ $senderName }}
    @else New message from {{ $senderName }}
    @endif
  </h1>

  <p style="margin:0 0 32px;font-size:15px;color:#5c4f3a;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};font-style:italic;">
    "{{ $preview }}"
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/messages/{{ $conversationId }}"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Répondre
          @elseif($locale === 'ar') الرد
          @else Reply
          @endif
        </a>
      </td>
    </tr>
  </table>

</x-emails.layout>
