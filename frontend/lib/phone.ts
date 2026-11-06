/** A tel: link that keeps only digits and a leading + */
export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** A WhatsApp chat link. Moroccan national numbers (06…, 07…) get the 212 country code. */
export function whatsappUrl(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "212" + digits.slice(1);
  return `https://wa.me/${digits}`;
}
