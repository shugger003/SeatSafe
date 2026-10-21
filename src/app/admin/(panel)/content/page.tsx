import { deleteContentAction, saveAboutAction, saveAnnouncementAction, saveBenefitAction, saveCampaignAction, saveFaqAction, saveHeroAction, savePolicyAction, saveStepAction, saveUseCaseAction } from "@/app/actions/admin";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Badge, Card, Check, Label, Notice, PageHeader, SubmitButton, field, textarea } from "@/components/admin/ui";
import { getAbout, getAnnouncement, getBenefits, getCampaigns, getFaqs, getHomepage, getPolicies, getSteps, getUseCases } from "@/lib/db";
import { live } from "@/lib/live";
import { FAQ_CATEGORIES, ICON_KEYS } from "@/lib/types";

export const instant = false;

const SECTIONS = [
  ["homepage", "Homepage"],
  ["announcement", "Announcement"],
  ["benefits", "Benefits"],
  ["steps", "How it works"],
  ["use-cases", "Where to use it"],
  ["faqs", "Questions"],
  ["about", "About"],
  ["policies", "Policies"],
  ["campaigns", "Campaign pages"],
] as const;

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  await live();
  const { notice } = await searchParams;
  const home = await getHomepage();
  const announcement = await getAnnouncement();
  const about = await getAbout();
  const policies = await getPolicies();
  const benefits = await getBenefits();
  const steps = await getSteps();
  const useCases = await getUseCases();
  const faqs = await getFaqs();
  const campaigns = await getCampaigns();
  const sorted = <T extends { sort: number }>(items: T[]) => [...items].sort((a, b) => a.sort - b.sort);

  return (
    <div className="grid gap-6">
      <PageHeader title="Content" description="The words on your store. Items marked Draft stay hidden until you tick Show on store." />
      {notice ? <Notice>{notice}</Notice> : null}

      <nav aria-label="Content sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-line bg-surface px-4 text-sm hover:border-pine">
            {label}
          </a>
        ))}
      </nav>

      <Card id="homepage" title="Homepage">
        <form action={saveHeroAction} className="grid gap-6">
          <fieldset className="grid gap-4">
            <legend className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">Top of the page</legend>
            <Label label="Small heading above the title"><input name="eyebrow" defaultValue={home.hero.eyebrow} className={field} /></Label>
            <Label label="Title"><input name="headline" defaultValue={home.hero.headline} className={field} /></Label>
            <Label label="Intro"><textarea name="description" defaultValue={home.hero.description} className={textarea} /></Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Label label="Main button text"><input name="primaryLabel" defaultValue={home.hero.primaryLabel} className={field} /></Label>
              <Label label="Main button link"><input name="primaryHref" defaultValue={home.hero.primaryHref} className={field} /></Label>
              <Label label="Second button text"><input name="secondaryLabel" defaultValue={home.hero.secondaryLabel} className={field} /></Label>
              <Label label="Second button link"><input name="secondaryHref" defaultValue={home.hero.secondaryHref} className={field} /></Label>
            </div>
          </fieldset>
          <fieldset className="grid gap-4 border-t border-line pt-5">
            <legend className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">Section titles</legend>
            <SectionPair label="Benefits" heading={["benefitsHeading", home.benefitsHeading]} intro={["benefitsIntro", home.benefitsIntro]} />
            <SectionPair label="How it works" heading={["stepsHeading", home.stepsHeading]} intro={["stepsIntro", home.stepsIntro]} />
            <SectionPair label="Product" heading={["showcaseHeading", home.showcaseHeading]} intro={["showcaseIntro", home.showcaseIntro]} />
            <SectionPair label="Where to use it" heading={["useCasesHeading", home.useCasesHeading]} intro={["useCasesIntro", home.useCasesIntro]} />
            <SectionPair label="Why trust us" heading={["trustHeading", home.trustHeading]} intro={["trustIntro", home.trustIntro]} />
            <SectionPair label="Questions" heading={["faqHeading", home.faqHeading]} intro={["faqIntro", home.faqIntro]} />
            <SectionPair label="Closing" heading={["finalHeading", home.finalHeading]} intro={["finalText", home.finalText]} />
          </fieldset>
          <fieldset className="grid gap-4 border-t border-line pt-5">
            <legend className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">Video</legend>
            <SectionPair label="Video" heading={["videoHeading", home.video.heading]} intro={["videoDescription", home.video.description]} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Label label="Video link" hint="YouTube or Vimeo"><input name="videoUrl" defaultValue={home.video.url} className={field} /></Label>
              <Label label="Cover image link" hint="Optional"><input name="posterUrl" defaultValue={home.video.posterUrl} className={field} /></Label>
            </div>
          </fieldset>
          <SubmitButton className="w-fit">Save homepage</SubmitButton>
        </form>
      </Card>

      <Card id="announcement" title="Announcement" description="A thin bar at the very top of every page.">
        <form action={saveAnnouncementAction} className="grid gap-4">
          <Check name="enabled" label="Show the announcement" defaultChecked={announcement.enabled} />
          <Label label="Message"><input name="message" defaultValue={announcement.message} className={field} /></Label>
          <Label label="Link" hint="Optional"><input name="href" defaultValue={announcement.href} className={field} /></Label>
          <SubmitButton className="w-fit">Save announcement</SubmitButton>
        </form>
      </Card>

      <Card id="benefits" title="Benefits">
        <div className="grid gap-3">
          {sorted(benefits).map((item) => (
            <Item key={item.id} title={item.title} published={item.published}>
              <form action={saveBenefitAction} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <Label label="Title"><input name="title" defaultValue={item.title} className={field} /></Label>
                <Label label="Text"><textarea name="description" defaultValue={item.description} className={textarea} /></Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label label="Icon"><select name="icon" defaultValue={item.icon} className={field}>{ICON_KEYS.map((icon) => <option key={icon}>{icon}</option>)}</select></Label>
                  <Label label="Order"><input name="sort" type="number" defaultValue={item.sort} className={field} /></Label>
                </div>
                <Check name="published" label="Show on store" defaultChecked={item.published} />
                <SubmitButton variant="secondary" className="w-fit">Save benefit</SubmitButton>
              </form>
            </Item>
          ))}
          <AddForm action={saveBenefitAction} name="title" placeholder="New benefit title" button="Add benefit" />
        </div>
      </Card>

      <Card id="steps" title="How it works" description="Only add steps the manufacturer has confirmed.">
        <div className="grid gap-3">
          {sorted(steps).map((item) => (
            <Item key={item.id} title={item.title} published={item.published}>
              <form action={saveStepAction} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <Label label="Title"><input name="title" defaultValue={item.title} className={field} /></Label>
                <Label label="Text"><textarea name="body" defaultValue={item.body} className={textarea} /></Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label label="Image link" hint="Optional"><input name="imageUrl" defaultValue={item.imageUrl} className={field} /></Label>
                  <Label label="Describe the image"><input name="imageAlt" defaultValue={item.imageAlt} className={field} /></Label>
                  <Label label="Order"><input name="sort" type="number" defaultValue={item.sort} className={field} /></Label>
                </div>
                <Check name="published" label="Show on store" defaultChecked={item.published} />
                <SubmitButton variant="secondary" className="w-fit">Save step</SubmitButton>
              </form>
            </Item>
          ))}
        </div>
      </Card>

      <Card id="use-cases" title="Where to use it">
        <div className="grid gap-3">
          {sorted(useCases).map((item) => (
            <Item key={item.id} title={item.title} published={item.published}>
              <form action={saveUseCaseAction} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <Label label="Title"><input name="title" defaultValue={item.title} className={field} /></Label>
                <Label label="Text"><textarea name="description" defaultValue={item.description} className={textarea} /></Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label label="Icon"><select name="icon" defaultValue={item.icon} className={field}>{ICON_KEYS.map((icon) => <option key={icon}>{icon}</option>)}</select></Label>
                  <Label label="Order"><input name="sort" type="number" defaultValue={item.sort} className={field} /></Label>
                </div>
                <Check name="published" label="Show on store" defaultChecked={item.published} />
                <SubmitButton variant="secondary" className="w-fit">Save</SubmitButton>
              </form>
            </Item>
          ))}
        </div>
      </Card>

      <Card id="faqs" title="Questions">
        <div className="grid gap-3">
          {sorted(faqs).map((item) => (
            <Item key={item.id} title={item.question} published={item.published}>
              <form action={saveFaqAction} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <Label label="Question"><input name="question" defaultValue={item.question} className={field} /></Label>
                <Label label="Answer"><textarea name="answer" defaultValue={item.answer} className={textarea} /></Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label label="Topic"><select name="category" defaultValue={item.category} className={field}>{FAQ_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></Label>
                  <Label label="Order"><input name="sort" type="number" defaultValue={item.sort} className={field} /></Label>
                </div>
                <Check name="published" label="Show on store" defaultChecked={item.published} />
                <SubmitButton variant="secondary" className="w-fit">Save question</SubmitButton>
              </form>
            </Item>
          ))}
          <details className="group rounded-lg border border-dashed border-line">
            <summary className="flex min-h-12 items-center px-4 text-sm font-medium text-pine">Add a question</summary>
            <form action={saveFaqAction} className="grid gap-4 border-t border-line p-4">
              <Label label="Question"><input name="question" required className={field} /></Label>
              <Label label="Answer"><textarea name="answer" className={textarea} /></Label>
              <Check name="published" label="Show on store" />
              <SubmitButton variant="secondary" className="w-fit">Add question</SubmitButton>
            </form>
          </details>
        </div>
      </Card>

      <Card id="about" title="About page">
        <form action={saveAboutAction} className="grid gap-4">
          <Label label="Title"><input name="heading" defaultValue={about.heading} className={field} /></Label>
          <Label label="Text" hint="Leave a blank line between paragraphs."><textarea name="body" defaultValue={about.body} className={`${textarea} min-h-48`} /></Label>
          <SubmitButton className="w-fit">Save about page</SubmitButton>
        </form>
      </Card>

      <Card id="policies" title="Policies" description="Start a line with # to make it a heading.">
        <div className="grid gap-3">
          {(Object.keys(policies) as Array<keyof typeof policies>).map((key) => (
            <details key={key} className="group rounded-lg border border-line bg-paper/40">
              <summary className="flex min-h-12 items-center justify-between gap-3 px-4">
                <span className="font-medium">{policies[key].title}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={policies[key].reviewed ? "green" : "amber"}>{policies[key].reviewed ? "Reviewed" : "Draft"}</Badge>
                  <CaretDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                </span>
              </summary>
              <form action={savePolicyAction} className="grid gap-4 border-t border-line p-4">
                <input type="hidden" name="key" value={key} />
                <Label label="Title"><input name="title" defaultValue={policies[key].title} className={field} /></Label>
                <Label label="Text"><textarea name="body" defaultValue={policies[key].body} className={`${textarea} min-h-64`} /></Label>
                <Check name="reviewed" label="Reviewed and ready (hides the draft warning on the store)" defaultChecked={policies[key].reviewed} />
                <SubmitButton variant="secondary" className="w-fit">Save policy</SubmitButton>
              </form>
            </details>
          ))}
        </div>
      </Card>

      <Card id="campaigns" title="Campaign pages" description="Extra landing pages for promotions, at /c/ followed by the web address.">
        <div className="grid gap-3">
          {campaigns.map((item) => (
            <Item key={item.id} title={item.title} published={item.published}>
              <form action={saveCampaignAction} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label label="Title"><input name="title" defaultValue={item.title} className={field} /></Label>
                  <Label label="Web address"><input name="slug" defaultValue={item.slug} className={field} /></Label>
                  <Label label="Small heading"><input name="eyebrow" defaultValue={item.eyebrow} className={field} /></Label>
                  <Label label="Product web address" hint="The part after /product/"><input name="productSlug" defaultValue={item.productSlug} className={field} /></Label>
                </div>
                <Label label="Summary"><textarea name="description" defaultValue={item.description} className={textarea} /></Label>
                <Label label="Text"><textarea name="body" defaultValue={item.body} className={`${textarea} min-h-32`} /></Label>
                <Check name="published" label="Show on store" defaultChecked={item.published} />
                <div className="flex flex-wrap items-center gap-3">
                  <SubmitButton variant="secondary">Save campaign</SubmitButton>
                  <button formAction={deleteContentAction} name="kind" value="campaign" className="min-h-11 px-2 text-sm text-danger underline-offset-4 hover:underline">Delete</button>
                </div>
              </form>
            </Item>
          ))}
          <AddForm action={saveCampaignAction} name="title" placeholder="New campaign title" button="Add campaign" />
        </div>
      </Card>
    </div>
  );
}

function SectionPair({ label, heading, intro }: { label: string; heading: [string, string]; intro: [string, string] }) {
  return (
    <div className="grid gap-3 rounded-lg bg-paper/50 p-3 sm:grid-cols-[1fr_1.5fr]">
      <Label label={`${label}: title`}><input name={heading[0]} defaultValue={heading[1]} className={field} /></Label>
      <Label label={`${label}: text`}><textarea name={intro[0]} defaultValue={intro[1]} className={`${textarea} min-h-11`} /></Label>
    </div>
  );
}

function Item({ title, published, children }: { title: string; published: boolean; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-line bg-paper/40">
      <summary className="flex min-h-12 items-center justify-between gap-3 px-4">
        <span className="min-w-0 truncate font-medium">{title || "Untitled"}</span>
        <span className="flex shrink-0 items-center gap-2">
          <Badge tone={published ? "green" : "grey"}>{published ? "Shown" : "Draft"}</Badge>
          <CaretDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="border-t border-line p-4">{children}</div>
    </details>
  );
}

function AddForm({ action, name, placeholder, button }: { action: (formData: FormData) => Promise<void>; name: string; placeholder: string; button: string }) {
  return (
    <form action={action} className="flex gap-2">
      <input name={name} required placeholder={placeholder} aria-label={placeholder} className={field} />
      <SubmitButton variant="secondary" className="shrink-0">{button}</SubmitButton>
    </form>
  );
}
