/** International digits for a phone number, treating 10-digit numbers starting with 0 as Ghanaian. */
export function phoneDigits(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) digits = `233${digits.slice(1)}`;
  if (digits.length === 9) digits = `233${digits}`;
  return digits.length >= 10 ? digits : "";
}

export function telLink(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : null;
}

export function whatsappLink(phone: string, text?: string) {
  const digits = phoneDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
