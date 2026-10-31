import { removeDeliveryAction, saveDeliveryAction, saveStoreAction } from "@/app/actions/admin";
import { Badge, Card, Check, EmptyRow, Label, Notice, PageHeader, SubmitButton, field, textarea } from "@/components/admin/ui";
import { getStore } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { live } from "@/lib/live";
import { formatMoney } from "@/lib/money";
import { paymentsMode } from "@/lib/moolre";
import { smsConfigured } from "@/lib/sms";

export const instant = false;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { notice } = await searchParams;
  const store = await getStore();
  const payments = paymentsMode() !== "disabled";
  const email = emailConfigured();
  const sms = smsConfigured();
  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" />
      {notice ? <Notice tone={notice.startsWith("Enter") ? "warn" : "success"}>{notice}</Notice> : null}

      <Card title="Connections">
        <ul className="grid gap-4 text-sm">
          <li className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="font-medium">Online payment</p>
              <p className="mt-0.5 leading-6 text-muted">
                {payments
                  ? "Customers can pay with MTN, Telecel, or AirtelTigo on Moolre. Orders are marked paid only after Moolre confirms the money."
                  : "Moolre is disconnected. Customers can’t pay on the site. When the new merchant account is ready, add its API user, public key, account number, and callback secret in Vercel, and set the Moolre callback URL to this site’s /api/moolre/webhook."}
              </p>
            </div>
            <Badge tone={payments ? "green" : "amber"}>{payments ? "Connected" : "Not connected"}</Badge>
          </li>
          <li className="flex flex-wrap items-start justify-between gap-3 border-t border-line pt-4">
            <div className="max-w-xl">
              <p className="font-medium">Email</p>
              <p className="mt-0.5 leading-6 text-muted">
                {email
                  ? "Order confirmations, new-order alerts, and password-reset links are sent by email."
                  : "Order confirmations, new-order alerts, and password-reset links are not sent yet. To turn this on, add RESEND_API_KEY and EMAIL_FROM in Vercel."}
              </p>
            </div>
            <Badge tone={email ? "green" : "amber"}>{email ? "Set up" : "Not set up"}</Badge>
          </li>
          <li className="flex flex-wrap items-start justify-between gap-3 border-t border-line pt-4">
            <div className="max-w-xl">
              <p className="font-medium">SMS</p>
              <p className="mt-0.5 leading-6 text-muted">
                {sms
                  ? "Signed-in admins can text a customer from the SMS page or an order."
                  : "Texts are not sent yet. Add MOOLRE_SMS_VASKEY and an approved MOOLRE_SMS_SENDER_ID in Vercel."}
              </p>
            </div>
            <Badge tone={sms ? "green" : "amber"}>{sms ? "Connected" : "Not connected"}</Badge>
          </li>
        </ul>
      </Card>

      <form action={saveStoreAction} className="grid gap-6">
        <Card title="Store status">
          <div className="grid gap-4">
            <Label label="Status">
              <select name="storeStatus" defaultValue={store.storeStatus} className={field}>
                <option value="open">Open</option>
                <option value="coming_soon">Coming soon</option>
                <option value="paused">Paused</option>
              </select>
            </Label>
            <Check name="showPreparationNotice" label="Show a notice bar under the menu" defaultChecked={store.showPreparationNotice} />
            <Label label="Notice text">
              <textarea name="preparationNotice" defaultValue={store.preparationNotice} className={textarea} />
            </Label>
          </div>
        </Card>

        <Card title="Business">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label label="Business name"><input name="businessName" defaultValue={store.businessName} className={field} /></Label>
            <Label label="Registered name" hint="Optional"><input name="legalName" defaultValue={store.legalName} className={field} /></Label>
            <Label label="Tagline" className="sm:col-span-2"><input name="tagline" defaultValue={store.tagline} className={field} /></Label>
            <Label label="Footer description" className="sm:col-span-2"><textarea name="shortDescription" defaultValue={store.shortDescription} className={textarea} /></Label>
            <Label label="Logo address" hint="Link to the logo image." className="sm:col-span-2"><input name="logoUrl" defaultValue={store.logoUrl} className={field} /></Label>
          </div>
        </Card>

        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label label="Phone"><input name="phone" type="tel" defaultValue={store.phone} className={field} /></Label>
            <Label label="Email"><input name="email" type="email" defaultValue={store.email} className={field} /></Label>
            <Label label="Address" hint="Optional"><input name="address" defaultValue={store.address} className={field} /></Label>
            <Label label="Opening hours" hint="Optional"><input name="supportHours" defaultValue={store.supportHours} className={field} /></Label>
          </div>
        </Card>

        <Card title="Social links" description="Paste the full link. Leave blank to hide the icon.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label label="WhatsApp"><input name="whatsapp" defaultValue={store.social.whatsapp} placeholder="https://wa.me/233…" className={field} /></Label>
            <Label label="Instagram"><input name="instagram" defaultValue={store.social.instagram} className={field} /></Label>
            <Label label="Facebook"><input name="facebook" defaultValue={store.social.facebook} className={field} /></Label>
            <Label label="TikTok"><input name="tiktok" defaultValue={store.social.tiktok} className={field} /></Label>
            <Label label="YouTube"><input name="youtube" defaultValue={store.social.youtube} className={field} /></Label>
          </div>
        </Card>

        <Card title="Advanced">
          <div className="grid gap-4 sm:grid-cols-3">
            <Label label="Currency"><input name="currency" defaultValue={store.currency} className={field} /></Label>
            <Label label="Time zone"><input name="timezone" defaultValue={store.timezone} className={field} /></Label>
            <Label label="Hold items for (minutes)" hint="While a customer is paying."><input name="reservationMinutes" type="number" min={5} max={180} defaultValue={store.reservationMinutes} className={field} /></Label>
          </div>
        </Card>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
          <SubmitButton className="w-full sm:w-fit">Save settings</SubmitButton>
        </div>
      </form>

      <Card id="delivery" title="Delivery options" description="Customers choose one of these at checkout.">
        {store.deliveryMethods.length === 0 ? (
          <EmptyRow>No delivery options yet. Add one below.</EmptyRow>
        ) : (
          <ul className="divide-y divide-line">
            {store.deliveryMethods.map((method) => (
              <li key={method.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="font-medium">
                    {method.label} <span className="font-normal text-muted">· {formatMoney(method.feeMinor, store.currency)}</span>
                  </p>
                  {method.summary ? <p className="text-sm text-muted">{method.summary}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={method.active ? "green" : "grey"}>{method.active ? "Active" : "Off"}</Badge>
                  <form action={removeDeliveryAction}>
                    <input type="hidden" name="id" value={method.id} />
                    <button className="min-h-10 px-2 text-sm text-danger underline-offset-4 hover:underline">Remove</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form action={saveDeliveryAction} className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <Label label="Name"><input name="label" required placeholder="Accra delivery" className={field} /></Label>
          <Label label={`Fee (${store.currency})`} hint="Use 0.00 for free delivery."><input name="fee" required inputMode="decimal" placeholder="0.00" className={field} /></Label>
          <Label label="What the customer should know" className="sm:col-span-2"><textarea name="summary" placeholder="Areas covered and how long it takes." className={textarea} /></Label>
          <Check name="active" label="Active" defaultChecked />
          <div className="sm:col-span-2">
            <SubmitButton variant="secondary">Add delivery option</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
