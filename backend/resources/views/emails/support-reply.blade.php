<x-emails.layout :locale="$locale" :title="$locale === 'fr' ? 'Réponse à votre demande' : ($locale === 'ar' ? 'رد على طلبك' : 'Reply to your request')">

  <p style="margin:0 0 4px;font-size:14px;color:#8a7d67;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Demande : {{ $ticket->subject }}
    @elseif($locale === 'ar') الطلب: {{ $ticket->subject }}
    @else Request: {{ $ticket->subject }}
    @endif
  </p>

  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1f1b16;line-height:1.3;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Nous avons répondu à votre demande
    @elseif($locale === 'ar') لقد قمنا بالرد على طلبك
    @else We replied to your request
    @endif
  </h1>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="background:#f7f4ea;border-radius:6px;padding:16px 18px;font-size:14px;color:#3d3020;line-height:1.7;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
        {{ $ticket->admin_reply }}
      </td>
    </tr>
  </table>

  @if($ticket->user_id)
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr>
      <td align="{{ $locale === 'ar' ? 'right' : 'left' }}">
        <a href="{{ $siteUrl }}/{{ $locale }}/support"
           style="display:inline-block;background:#c9a227;color:#1f1b16;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;">
          @if($locale === 'fr') Voir ma demande
          @elseif($locale === 'ar') عرض طلبي
          @else View my request
          @endif
        </a>
      </td>
    </tr>
  </table>
  @else
  <p style="margin:0;font-size:13px;color:#8a7d67;line-height:1.6;text-align:{{ $locale === 'ar' ? 'right' : 'left' }};">
    @if($locale === 'fr') Si vous avez d'autres questions, n'hésitez pas à soumettre une nouvelle demande sur notre page d'assistance.
    @elseif($locale === 'ar') إذا كانت لديك أسئلة أخرى، لا تتردد في إرسال طلب جديد عبر صفحة الدعم.
    @else If you have further questions, feel free to submit a new request on our support page.
    @endif
  </p>
  @endif

</x-emails.layout>
