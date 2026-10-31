import { sendSmsAction } from "@/app/actions/admin-sms-action";
import { Label, SubmitButton, field, textarea } from "@/components/admin/ui";

export function SmsForm({
  phone = "",
  message = "",
  orderId = "",
  returnTo,
  ready,
}: {
  phone?: string;
  message?: string;
  orderId?: string;
  returnTo: string;
  ready: boolean;
}) {
  return (
    <form action={sendSmsAction} className="grid gap-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      {orderId ? <input type="hidden" name="orderId" value={orderId} /> : null}
      <Label label="Phone" hint="A Ghana mobile number. It is sent to Moolre as 233\u2026">
        <input name="phone" defaultValue={phone} required inputMode="tel" autoComplete="tel" className={field} />
      </Label>
      <Label label="Message" hint="One SMS is 160 characters.">
        <textarea name="message" defaultValue={message} required maxLength={160} className={textarea} />
      </Label>
      <Label label="Network" hint="Leave this on the default unless Moolre has approved another network.">
        <select name="network" defaultValue="" className={field}>
          <option value="">Default (Telecel)</option>
          <option value="TELECEL">Telecel</option>
          <option value="MTN">MTN</option>
        </select>
      </Label>
      <SubmitButton className="w-fit" disabled={!ready}>
        Send SMS
      </SubmitButton>
    </form>
  );
}
