import { deleteContentAction, saveAboutAction, saveAnnouncementAction, saveBenefitAction, saveCampaignAction, saveFaqAction, saveHeroAction, savePolicyAction, saveStepAction, saveUseCaseAction } from "@/app/actions/admin";
import { getAbout, getAnnouncement, getBenefits, getCampaigns, getFaqs, getHomepage, getPolicies, getSteps, getUseCases } from "@/lib/db";
import { live } from "@/lib/live";
import { FAQ_CATEGORIES, ICON_KEYS } from "@/lib/types";

export const instant = false;

const field = "min-h-11 w-full rounded-[10px] border border-line bg-surface px-3";

export default async function ContentPage() {
  await live();
  const home = await getHomepage();
  const announcement = await getAnnouncement();
  const about = await getAbout();
  const policies = await getPolicies();
  const benefits = await getBenefits();
  const steps = await getSteps();
  const useCases = await getUseCases();
  const faqs = await getFaqs();
  const campaigns = await getCampaigns();
  return (
    <div className="grid gap-12">
      <h1 className="font-display text-4xl">Content</h1>
      <p className="text-sm text-muted">Draft benefits, steps, use cases, and questions stay off the storefront until Published is checked. Do not publish instructions or claims the manufacturer has not confirmed.</p>

      <form action={saveAnnouncementAction} className="grid gap-3">
        <h2 className="font-display text-3xl">Announcement</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={announcement.enabled} /> Enabled</label>
        <input name="message" defaultValue={announcement.message} placeholder="Message" className={field} />
        <input name="href" defaultValue={announcement.href} placeholder="Optional link" className={field} />
        <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save announcement</button>
      </form>

      <form action={saveHeroAction} className="grid gap-3">
        <h2 className="font-display text-3xl">Homepage copy</h2>
        {Object.entries({
          eyebrow: home.hero.eyebrow,
          headline: home.hero.headline,
          description: home.hero.description,
          primaryLabel: home.hero.primaryLabel,
          primaryHref: home.hero.primaryHref,
          secondaryLabel: home.hero.secondaryLabel,
          secondaryHref: home.hero.secondaryHref,
          benefitsHeading: home.benefitsHeading,
          benefitsIntro: home.benefitsIntro,
          stepsHeading: home.stepsHeading,
          stepsIntro: home.stepsIntro,
          showcaseHeading: home.showcaseHeading,
          showcaseIntro: home.showcaseIntro,
          useCasesHeading: home.useCasesHeading,
          useCasesIntro: home.useCasesIntro,
          trustHeading: home.trustHeading,
          trustIntro: home.trustIntro,
          faqHeading: home.faqHeading,
          faqIntro: home.faqIntro,
          finalHeading: home.finalHeading,
          finalText: home.finalText,
          videoHeading: home.video.heading,
          videoDescription: home.video.description,
          videoUrl: home.video.url,
          posterUrl: home.video.posterUrl,
        }).map(([name, value]) => (
          <label key={name} className="grid gap-1 text-sm">{name}<input name={name} defaultValue={value} className={field} /></label>
        ))}
        <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save homepage</button>
      </form>

      <section className="grid gap-4">
        <h2 className="font-display text-3xl">Benefits</h2>
        {benefits.map((item) => (
          <form key={item.id} action={saveBenefitAction} className="grid gap-2 rounded-[16px] border border-line p-4">
            <input type="hidden" name="id" value={item.id} />
            <input name="title" defaultValue={item.title} className={field} />
            <textarea name="description" defaultValue={item.description} className={`${field} min-h-20 py-2`} />
            <select name="icon" defaultValue={item.icon} className={field}>{ICON_KEYS.map((icon) => <option key={icon}>{icon}</option>)}</select>
            <input name="sort" type="number" defaultValue={item.sort} className={field} />
            <label className="text-sm"><input type="checkbox" name="published" defaultChecked={item.published} /> Published</label>
            <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-sm text-paper">Save benefit</button>
          </form>
        ))}
        <form action={saveBenefitAction} className="grid gap-2"><input name="title" placeholder="New benefit" className={field} /><button className="text-sm underline">Add benefit</button></form>
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-3xl">How it works</h2>
        {steps.map((item) => (
          <form key={item.id} action={saveStepAction} className="grid gap-2 rounded-[16px] border border-line p-4">
            <input type="hidden" name="id" value={item.id} />
            <input name="title" defaultValue={item.title} className={field} />
            <textarea name="body" defaultValue={item.body} className={`${field} min-h-20 py-2`} />
            <input name="imageUrl" defaultValue={item.imageUrl} placeholder="Image URL" className={field} />
            <input name="imageAlt" defaultValue={item.imageAlt} placeholder="Image alt text" className={field} />
            <input name="sort" type="number" defaultValue={item.sort} className={field} />
            <label className="text-sm"><input type="checkbox" name="published" defaultChecked={item.published} /> Published</label>
            <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-sm text-paper">Save step</button>
          </form>
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-3xl">Use cases</h2>
        {useCases.map((item) => (
          <form key={item.id} action={saveUseCaseAction} className="grid gap-2 rounded-[16px] border border-line p-4">
            <input type="hidden" name="id" value={item.id} />
            <input name="title" defaultValue={item.title} className={field} />
            <textarea name="description" defaultValue={item.description} className={`${field} min-h-20 py-2`} />
            <select name="icon" defaultValue={item.icon} className={field}>{ICON_KEYS.map((icon) => <option key={icon}>{icon}</option>)}</select>
            <input name="sort" type="number" defaultValue={item.sort} className={field} />
            <label className="text-sm"><input type="checkbox" name="published" defaultChecked={item.published} /> Published</label>
            <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-sm text-paper">Save use case</button>
          </form>
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-3xl">FAQs</h2>
        {faqs.map((item) => (
          <form key={item.id} action={saveFaqAction} className="grid gap-2 rounded-[16px] border border-line p-4">
            <input type="hidden" name="id" value={item.id} />
            <input name="question" defaultValue={item.question} className={field} />
            <textarea name="answer" defaultValue={item.answer} className={`${field} min-h-20 py-2`} />
            <select name="category" defaultValue={item.category} className={field}>{FAQ_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
            <input name="sort" type="number" defaultValue={item.sort} className={field} />
            <label className="text-sm"><input type="checkbox" name="published" defaultChecked={item.published} /> Published</label>
            <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-sm text-paper">Save question</button>
          </form>
        ))}
        <form action={saveFaqAction} className="grid gap-2">
          <input name="question" placeholder="New question" className={field} />
          <textarea name="answer" placeholder="Answer" className={`${field} min-h-20 py-2`} />
          <button className="text-sm underline">Add question</button>
        </form>
      </section>

      <form action={saveAboutAction} className="grid gap-3">
        <h2 className="font-display text-3xl">About</h2>
        <input name="heading" defaultValue={about.heading} className={field} />
        <textarea name="body" defaultValue={about.body} className={`${field} min-h-40 py-2`} />
        <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save about</button>
      </form>

      {(Object.keys(policies) as Array<keyof typeof policies>).map((key) => (
        <form key={key} action={savePolicyAction} className="grid gap-3">
          <h2 className="font-display text-3xl">{policies[key].title}</h2>
          <input type="hidden" name="key" value={key} />
          <input name="title" defaultValue={policies[key].title} className={field} />
          <textarea name="body" defaultValue={policies[key].body} className={`${field} min-h-48 py-2`} />
          <label className="text-sm"><input type="checkbox" name="reviewed" defaultChecked={policies[key].reviewed} /> Mark as reviewed by the business</label>
          <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-paper">Save policy</button>
        </form>
      ))}

      <section className="grid gap-4">
        <h2 className="font-display text-3xl">Campaign pages</h2>
        {campaigns.map((item) => (
          <form key={item.id} action={saveCampaignAction} className="grid gap-2 rounded-[16px] border border-line p-4">
            <input type="hidden" name="id" value={item.id} />
            <input name="title" defaultValue={item.title} className={field} />
            <input name="slug" defaultValue={item.slug} className={field} />
            <input name="eyebrow" defaultValue={item.eyebrow} className={field} />
            <textarea name="description" defaultValue={item.description} className={`${field} min-h-16 py-2`} />
            <textarea name="body" defaultValue={item.body} className={`${field} min-h-28 py-2`} />
            <input name="productSlug" defaultValue={item.productSlug} placeholder="Product slug" className={field} />
            <label className="text-sm"><input type="checkbox" name="published" defaultChecked={item.published} /> Published</label>
            <button className="min-h-11 w-fit rounded-[10px] bg-pine px-4 text-sm text-paper">Save campaign</button>
            <button formAction={deleteContentAction} name="kind" value="campaign" className="text-sm underline">Remove</button>
            <input type="hidden" name="id" value={item.id} />
          </form>
        ))}
        <form action={saveCampaignAction} className="grid gap-2">
          <input name="title" placeholder="Campaign title" className={field} />
          <button className="text-sm underline">Add campaign</button>
        </form>
      </section>
    </div>
  );
}
