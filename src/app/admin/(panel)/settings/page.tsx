import { removeDeliveryAction, saveDeliveryAction, saveStoreAction } from "@/app/actions/admin";
import { getStore } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { live } from "@/lib/live";
import { minorToMajorInput } from "@/lib/money";
import { paymentsMode } from "@/lib/paystack";

export const instant = false;

const field = "min-h-11 w-full rounded-[10px] border border-line bg-surface px-3";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { notice } = await searchParams;
  const store = await getStore();
  return (
    <div className="grid gap-10">
      <div>
        {notice ? <p className="mb-4 rounded-[10px] bg-[#f8f1e6] px-3 py-2 text-sm">{notice}</p> : null}
        <h1 className="font-display text-4xl">Settings</h1>
        <ul className="mt-3 text-sm text-muted">
          <li>Payments: {paymentsMode()}</li>
          <li>Email: {emailConfigured() ? "configured" : "not configured"}</li>
          <li>Secrets stay in server environment variables and are not edited here.</li>
        </ul>
      </div>
      <form action={saveStoreAction} className="grid gap-3">
        <label className="text-sm">Business name<input name="businessName" defaultValue={store.businessName} className={field} /></label>
        <label className="text-sm">Legal name<input name="legalName" defaultValue={store.legalName} className={field} /></label>
        <label className="text-sm">Tagline<input name="tagline" defaultValue={store.tagline} className={field} /></label>
        <label className="text-sm">Footer description<textarea name="shortDescription" defaultValue={store.shortDescription} className={`${field} min-h-24 py-2`} /></label>
        <label className="text-sm">Logo URL<input name="logoUrl" defaultValue={store.logoUrl} className={field} /></label>
        <label className="text-sm">Currency<input name="currency" defaultValue={store.currency} className={field} /></label>
        <label className="text-sm">Email<input name="email" defaultValue={store.email} className={field} /></label>
        <label className="text-sm">Phone<input name="phone" defaultValue={store.phone} className={field} /></label>
        <label className="text-sm">Address<input name="address" defaultValue={store.address} className={field} /></label>
        <label className="text-sm">Support hours<input name="supportHours" defaultValue={store.supportHours} className={field} /></label>
        <label className="text-sm">Instagram<input name="instagram" defaultValue={store.social.instagram} className={field} /></label>
        <label className="text-sm">Facebook<input name="facebook" defaultValue={store.social.facebook} className={field} /></label>
        <label className="text-sm">TikTok<input name="tiktok" defaultValue={store.social.tiktok} className={field} /></label>
        <label className="text-sm">YouTube<input name="youtube" defaultValue={store.social.youtube} className={field} /></label>
        <label className="text-sm">WhatsApp<input name="whatsapp" defaultValue={store.social.whatsapp} className={field} /></label>
        <label className="text-sm">Store status
          <select name="storeStatus" defaultValue={store.storeStatus} className={field}>
            <option value="coming_soon">Coming soon</option>
            <option value="open">Open</option>
            <option value="paused">Paused</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showPreparationNotice" defaultChecked={store.showPreparationNotice} /> Show preparation notice</label>
        <textarea name="preparationNotice" defaultValue={store.preparationNotice} className={`${field} min-h-20 py-2`} />
        <label className="text-sm">Reservation minutes<input name="reservationMinutes" type="number" defaultValue={store.reservationMinutes} className={field} /></label>
        <label className="text-sm">Timezone<input name="timezone" defaultValue={store.timezone} className={field} /></label>
        <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save settings</button>
      </form>
      <section>
        <h2 className="font-display text-3xl">Delivery methods</h2>
        <ul className="mt-3 text-sm">
          {store.deliveryMethods.map((method) => (
            <li key={method.id} className="flex items-center justify-between gap-3 border-b border-line py-2">
              <span>{method.label} · {minorToMajorInput(method.feeMinor)} · {method.active ? "active" : "inactive"} · {method.summary}</span>
              <form action={removeDeliveryAction}>
                <input type="hidden" name="id" value={method.id} />
                <button className="min-h-11 rounded-[10px] border border-line px-3">Remove</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={saveDeliveryAction} className="mt-4 grid gap-3">
          <input name="label" placeholder="Label" required className={field} />
          <input name="fee" placeholder="Fee, such as 20.00" required className={field} />
          <textarea name="summary" placeholder="What the customer should know" className={`${field} min-h-20 py-2`} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
          <button className="min-h-11 w-fit rounded-[10px] border border-line px-4">Add delivery method</button>
        </form>
      </section>
    </div>
  );
}
