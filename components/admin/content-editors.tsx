'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Category, FooterColumn, InfoItem, LinkItem, ReviewItem, SiteContent, StatItem } from '@/lib/cms/content'
import { AdminCard, EditorGrid, TextArea, TextInput, ToggleField } from './admin-fields'

type Props = { content: SiteContent; onChange: (content: SiteContent) => void }

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" size="icon" variant="ghost" onClick={onClick} aria-label={label} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 /></Button>
}

export function HomepageEditor({ content, onChange }: Props) {
  const updateHero = (patch: Partial<SiteContent['hero']>) => onChange({ ...content, hero: { ...content.hero, ...patch } })
  const updateLink = (index: number, patch: Partial<LinkItem>) => onChange({ ...content, navigation: content.navigation.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })
  const updateInfo = (key: 'assurances' | 'benefits', index: number, patch: Partial<InfoItem>) => onChange({ ...content, [key]: content[key].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })

  return (
    <div className="flex flex-col gap-5">
      <AdminCard title="Announcement" description="The slim message bar above the storefront navigation.">
        <div className="flex flex-col gap-4">
          <ToggleField label="Show announcement" checked={content.announcement.enabled} onChange={(enabled) => onChange({ ...content, announcement: { ...content.announcement, enabled } })} />
          <TextArea label="Announcement text" value={content.announcement.text} onChange={(text) => onChange({ ...content, announcement: { ...content.announcement, text } })} rows={2} />
        </div>
      </AdminCard>

      <AdminCard title="Navigation" description="Add, rename, and reorder storefront links.">
        <div className="flex flex-col gap-3">
          {content.navigation.map((link, index) => (
            <div key={link.id} className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <TextInput label="Label" value={link.label} onChange={(label) => updateLink(index, { label })} />
              <TextInput label="Destination" value={link.href} onChange={(href) => updateLink(index, { href })} />
              <RemoveButton label={`Remove ${link.label}`} onClick={() => onChange({ ...content, navigation: content.navigation.filter((_, itemIndex) => itemIndex !== index) })} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, navigation: [...content.navigation, { id: id('nav'), label: 'New link', href: '#' }] })}><Plus data-icon="inline-start" />Add link</Button>
        </div>
      </AdminCard>

      <AdminCard title="Hero" description="The storefront introduction and featured product mosaic.">
        <div className="flex flex-col gap-4">
          <EditorGrid>
            <TextInput label="Eyebrow" value={content.hero.eyebrow} onChange={(eyebrow) => updateHero({ eyebrow })} />
            <TextInput label="Main headline" value={content.hero.title} onChange={(title) => updateHero({ title })} />
            <TextInput label="Accent headline" value={content.hero.accent} onChange={(accent) => updateHero({ accent })} />
            <TextInput label="Picks eyebrow" value={content.hero.picksEyebrow} onChange={(picksEyebrow) => updateHero({ picksEyebrow })} />
          </EditorGrid>
          <TextArea label="Description" value={content.hero.description} onChange={(description) => updateHero({ description })} />
          <EditorGrid>
            <TextInput label="Primary button" value={content.hero.primaryCta} onChange={(primaryCta) => updateHero({ primaryCta })} />
            <TextInput label="Primary destination" value={content.hero.primaryHref} onChange={(primaryHref) => updateHero({ primaryHref })} />
            <TextInput label="Secondary button" value={content.hero.secondaryCta} onChange={(secondaryCta) => updateHero({ secondaryCta })} />
            <TextInput label="Secondary destination" value={content.hero.secondaryHref} onChange={(secondaryHref) => updateHero({ secondaryHref })} />
            <TextInput label="Picks title" value={content.hero.picksTitle} onChange={(picksTitle) => updateHero({ picksTitle })} />
            <TextInput label="Rating label" value={content.hero.picksRating} onChange={(picksRating) => updateHero({ picksRating })} />
          </EditorGrid>
          <TextInput label="Builder proof" value={content.hero.buildersText} onChange={(buildersText) => updateHero({ buildersText })} />
          <TextArea label="Trust bullets" value={content.hero.bullets.join('\n')} onChange={(value) => updateHero({ bullets: value.split('\n').filter(Boolean) })} hint="One bullet per line" rows={3} />
          <TextArea label="Featured product IDs" value={content.hero.featuredProductIds.join('\n')} onChange={(value) => updateHero({ featuredProductIds: value.split('\n').filter(Boolean) })} hint="One existing product ID per line; the first three are shown." rows={3} />
        </div>
      </AdminCard>

      <AdminCard title="Marketplace assurances" description="Short trust statements shown directly below the hero.">
        <div className="flex flex-col gap-3">
          {content.assurances.map((item, index) => <InfoRow key={item.id} item={item} onChange={(patch) => updateInfo('assurances', index, patch)} onRemove={() => onChange({ ...content, assurances: content.assurances.filter((_, itemIndex) => itemIndex !== index) })} />)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, assurances: [...content.assurances, { id: id('assurance'), title: 'New assurance', detail: 'Supporting detail' }] })}><Plus data-icon="inline-start" />Add assurance</Button>
        </div>
      </AdminCard>

      <AdminCard title="Section introductions" description="Headings and supporting copy between major storefront sections.">
        <div className="flex flex-col gap-6">
          <SectionFields title="Categories" value={content.categorySection} onChange={(categorySection) => onChange({ ...content, categorySection })} />
          <SectionFields title="Products" value={content.productSection} onChange={(productSection) => onChange({ ...content, productSection })} includeEmpty />
          <div className="rounded-xl border bg-background p-4">
            <p className="mb-4 text-sm font-semibold">Why SkillScale</p>
            <div className="flex flex-col gap-4">
              <EditorGrid><TextInput label="Eyebrow" value={content.whySection.eyebrow} onChange={(eyebrow) => onChange({ ...content, whySection: { ...content.whySection, eyebrow } })} /><TextInput label="Title" value={content.whySection.title} onChange={(title) => onChange({ ...content, whySection: { ...content.whySection, title } })} /></EditorGrid>
              <TextArea label="Description" value={content.whySection.description} onChange={(description) => onChange({ ...content, whySection: { ...content.whySection, description } })} />
              <EditorGrid><TextInput label="Button" value={content.whySection.cta} onChange={(cta) => onChange({ ...content, whySection: { ...content.whySection, cta } })} /><TextInput label="Destination" value={content.whySection.ctaHref} onChange={(ctaHref) => onChange({ ...content, whySection: { ...content.whySection, ctaHref } })} /></EditorGrid>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Why-us benefits" description="Detailed value cards in the quality section.">
        <div className="flex flex-col gap-3">
          {content.benefits.map((item, index) => <InfoRow key={item.id} item={item} onChange={(patch) => updateInfo('benefits', index, patch)} onRemove={() => onChange({ ...content, benefits: content.benefits.filter((_, itemIndex) => itemIndex !== index) })} />)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, benefits: [...content.benefits, { id: id('benefit'), title: 'New benefit', detail: 'Supporting detail' }] })}><Plus data-icon="inline-start" />Add benefit</Button>
        </div>
      </AdminCard>

      <AdminCard title="Newsletter" description="The final call-to-action before the footer.">
        <div className="flex flex-col gap-4">
          <EditorGrid><TextInput label="Eyebrow" value={content.newsletter.eyebrow} onChange={(eyebrow) => onChange({ ...content, newsletter: { ...content.newsletter, eyebrow } })} /><TextInput label="Title" value={content.newsletter.title} onChange={(title) => onChange({ ...content, newsletter: { ...content.newsletter, title } })} /></EditorGrid>
          <TextArea label="Description" value={content.newsletter.description} onChange={(description) => onChange({ ...content, newsletter: { ...content.newsletter, description } })} rows={2} />
          <EditorGrid><TextInput label="Email placeholder" value={content.newsletter.placeholder} onChange={(placeholder) => onChange({ ...content, newsletter: { ...content.newsletter, placeholder } })} /><TextInput label="Button" value={content.newsletter.button} onChange={(button) => onChange({ ...content, newsletter: { ...content.newsletter, button } })} /><TextInput label="Success title" value={content.newsletter.successTitle} onChange={(successTitle) => onChange({ ...content, newsletter: { ...content.newsletter, successTitle } })} /><TextInput label="Success message" value={content.newsletter.successText} onChange={(successText) => onChange({ ...content, newsletter: { ...content.newsletter, successText } })} /></EditorGrid>
        </div>
      </AdminCard>
    </div>
  )
}

function SectionFields({ title, value, onChange, includeEmpty = false }: { title: string; value: { eyebrow: string; title: string; description: string; emptyTitle?: string; emptyDescription?: string }; onChange: (value: never) => void; includeEmpty?: boolean }) {
  const update = (patch: Record<string, string>) => onChange({ ...value, ...patch } as never)
  return <div className="rounded-xl border bg-background p-4"><p className="mb-4 text-sm font-semibold">{title}</p><div className="flex flex-col gap-4"><EditorGrid><TextInput label="Eyebrow" value={value.eyebrow} onChange={(eyebrow) => update({ eyebrow })} /><TextInput label="Title" value={value.title} onChange={(nextTitle) => update({ title: nextTitle })} /></EditorGrid><TextArea label="Description" value={value.description} onChange={(description) => update({ description })} rows={2} />{includeEmpty && <EditorGrid><TextInput label="Empty-state title" value={value.emptyTitle ?? ''} onChange={(emptyTitle) => update({ emptyTitle })} /><TextInput label="Empty-state message" value={value.emptyDescription ?? ''} onChange={(emptyDescription) => update({ emptyDescription })} /></EditorGrid>}</div></div>
}

function InfoRow({ item, onChange, onRemove }: { item: InfoItem; onChange: (patch: Partial<InfoItem>) => void; onRemove: () => void }) {
  return <div className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[0.8fr_1.5fr_auto] sm:items-end"><TextInput label="Title" value={item.title} onChange={(title) => onChange({ title })} /><TextInput label="Detail" value={item.detail} onChange={(detail) => onChange({ detail })} /><RemoveButton label={`Remove ${item.title}`} onClick={onRemove} /></div>
}

export function CollectionsEditor({ content, onChange }: Props) {
  const updateCategory = (index: number, patch: Partial<Category>) => onChange({ ...content, categories: content.categories.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })
  const updateStat = (index: number, patch: Partial<StatItem>) => onChange({ ...content, stats: content.stats.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })
  const updateReview = (index: number, patch: Partial<ReviewItem>) => onChange({ ...content, reviews: content.reviews.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })
  return (
    <div className="flex flex-col gap-5">
      <AdminCard title="Categories" description="Product category names must stay unique.">
        <div className="flex flex-col gap-3">
          {content.categories.map((category, index) => <div key={category.id} className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[0.7fr_0.8fr_1.4fr_auto] sm:items-end"><TextInput label="Name" value={category.name} onChange={(name) => updateCategory(index, { name })} /><TextInput label="Display label" value={category.label} onChange={(label) => updateCategory(index, { label })} /><TextInput label="Description" value={category.description} onChange={(description) => updateCategory(index, { description })} /><RemoveButton label={`Remove ${category.label}`} onClick={() => { if (window.confirm(`Remove ${category.label}? Products in this category must be reassigned.`)) onChange({ ...content, categories: content.categories.filter((_, itemIndex) => itemIndex !== index) }) }} /></div>)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, categories: [...content.categories, { id: id('category'), name: 'New category', label: 'New category', description: 'Category description' }] })}><Plus data-icon="inline-start" />Add category</Button>
        </div>
      </AdminCard>

      <AdminCard title="Impact stats" description="High-level proof points shown on the indigo band.">
        <div className="flex flex-col gap-3">
          {content.stats.map((stat, index) => <div key={stat.id} className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><TextInput label="Value" value={stat.value} onChange={(value) => updateStat(index, { value })} /><TextInput label="Label" value={stat.label} onChange={(label) => updateStat(index, { label })} /><RemoveButton label={`Remove ${stat.label}`} onClick={() => onChange({ ...content, stats: content.stats.filter((_, itemIndex) => itemIndex !== index) })} /></div>)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, stats: [...content.stats, { id: id('stat'), value: '100+', label: 'new metric' }] })}><Plus data-icon="inline-start" />Add stat</Button>
        </div>
      </AdminCard>

      <AdminCard title="Customer reviews" description="Edit the review section heading and individual quotes.">
        <div className="flex flex-col gap-5">
          <EditorGrid><TextInput label="Eyebrow" value={content.reviewSection.eyebrow} onChange={(eyebrow) => onChange({ ...content, reviewSection: { ...content.reviewSection, eyebrow } })} /><TextInput label="Title" value={content.reviewSection.title} onChange={(title) => onChange({ ...content, reviewSection: { ...content.reviewSection, title } })} /></EditorGrid>
          <TextArea label="Description" value={content.reviewSection.description} onChange={(description) => onChange({ ...content, reviewSection: { ...content.reviewSection, description } })} rows={2} />
          {content.reviews.map((review, index) => <div key={review.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">Review {index + 1}</p><RemoveButton label={`Remove review by ${review.name}`} onClick={() => onChange({ ...content, reviews: content.reviews.filter((_, itemIndex) => itemIndex !== index) })} /></div><TextArea label="Quote" value={review.quote} onChange={(quote) => updateReview(index, { quote })} rows={3} /><EditorGrid><TextInput label="Name" value={review.name} onChange={(name) => updateReview(index, { name })} /><TextInput label="Role" value={review.role} onChange={(role) => updateReview(index, { role })} /><TextInput label="Initials" value={review.initials} onChange={(initials) => updateReview(index, { initials })} /><TextInput label="Rating" value={review.rating} onChange={(rating) => updateReview(index, { rating: Number(rating) })} type="number" min={1} max={5} /></EditorGrid></div>)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, reviews: [...content.reviews, { id: id('review'), quote: 'Add a customer quote.', name: 'Customer name', role: 'Customer role', initials: 'CN', rating: 5 }] })}><Plus data-icon="inline-start" />Add review</Button>
        </div>
      </AdminCard>
    </div>
  )
}

export function FooterSettingsEditor({ content, onChange }: Props) {
  const updateColumn = (index: number, patch: Partial<FooterColumn>) => onChange({ ...content, footer: { ...content.footer, columns: content.footer.columns.map((column, columnIndex) => columnIndex === index ? { ...column, ...patch } : column) } })
  const updateFooterLink = (columnIndex: number, linkIndex: number, patch: Partial<LinkItem>) => updateColumn(columnIndex, { links: content.footer.columns[columnIndex].links.map((link, index) => index === linkIndex ? { ...link, ...patch } : link) })
  return (
    <div className="flex flex-col gap-5">
      <AdminCard title="Brand and SEO" description="SEO values apply to this browser session after content is published.">
        <div className="flex flex-col gap-4"><EditorGrid><TextInput label="Brand name" value={content.site.brandName} onChange={(brandName) => onChange({ ...content, site: { ...content.site, brandName } })} /><TextInput label="Logo initials" value={content.site.logoMark} onChange={(logoMark) => onChange({ ...content, site: { ...content.site, logoMark } })} /><TextInput label="Currency symbol" value={content.site.currency} onChange={(currency) => onChange({ ...content, site: { ...content.site, currency } })} /><TextInput label="Search placeholder" value={content.site.searchPlaceholder} onChange={(searchPlaceholder) => onChange({ ...content, site: { ...content.site, searchPlaceholder } })} /></EditorGrid><TextInput label="SEO title" value={content.site.seoTitle} onChange={(seoTitle) => onChange({ ...content, site: { ...content.site, seoTitle } })} /><TextArea label="SEO description" value={content.site.seoDescription} onChange={(seoDescription) => onChange({ ...content, site: { ...content.site, seoDescription } })} /></div>
      </AdminCard>

      <AdminCard title="Footer identity" description="Brand description, contact details, and legal copy.">
        <div className="flex flex-col gap-4"><TextArea label="Brand description" value={content.footer.description} onChange={(description) => onChange({ ...content, footer: { ...content.footer, description } })} /><EditorGrid><TextInput label="General email" value={content.footer.email} onChange={(email) => onChange({ ...content, footer: { ...content.footer, email } })} type="email" /><TextInput label="Support email" value={content.footer.supportEmail} onChange={(supportEmail) => onChange({ ...content, footer: { ...content.footer, supportEmail } })} type="email" /><TextInput label="Copyright" value={content.footer.copyright} onChange={(copyright) => onChange({ ...content, footer: { ...content.footer, copyright } })} /><TextInput label="Footer tagline" value={content.footer.tagline} onChange={(tagline) => onChange({ ...content, footer: { ...content.footer, tagline } })} /></EditorGrid><TextInput label="Legal demo note" value={content.footer.legalNote} onChange={(legalNote) => onChange({ ...content, footer: { ...content.footer, legalNote } })} /></div>
      </AdminCard>

      <AdminCard title="Social links" description="Footer icon links. Email destinations use the email icon; other destinations use the web icon.">
        <div className="flex flex-col gap-3">
          {content.footer.socialLinks.map((link, index) => <div key={link.id} className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><TextInput label="Accessible label" value={link.label} onChange={(label) => onChange({ ...content, footer: { ...content.footer, socialLinks: content.footer.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item) } })} /><TextInput label="Destination" value={link.href} onChange={(href) => onChange({ ...content, footer: { ...content.footer, socialLinks: content.footer.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, href } : item) } })} /><RemoveButton label={`Remove ${link.label}`} onClick={() => onChange({ ...content, footer: { ...content.footer, socialLinks: content.footer.socialLinks.filter((_, itemIndex) => itemIndex !== index) } })} /></div>)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, footer: { ...content.footer, socialLinks: [...content.footer.socialLinks, { id: id('social'), label: 'Social profile', href: 'https://' }] } })}><Plus data-icon="inline-start" />Add social link</Button>
        </div>
      </AdminCard>

      <AdminCard title="Footer columns" description="Manage link groups at the bottom of the storefront.">
        <div className="flex flex-col gap-5">
          {content.footer.columns.map((column, columnIndex) => <div key={column.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4"><div className="flex items-end gap-3"><TextInput label="Column title" value={column.title} onChange={(title) => updateColumn(columnIndex, { title })} className="flex-1" /><RemoveButton label={`Remove ${column.title} column`} onClick={() => onChange({ ...content, footer: { ...content.footer, columns: content.footer.columns.filter((_, index) => index !== columnIndex) } })} /></div>{column.links.map((link, linkIndex) => <div key={link.id} className="grid gap-3 pl-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><TextInput label="Link label" value={link.label} onChange={(label) => updateFooterLink(columnIndex, linkIndex, { label })} /><TextInput label="Destination" value={link.href} onChange={(href) => updateFooterLink(columnIndex, linkIndex, { href })} /><RemoveButton label={`Remove ${link.label}`} onClick={() => updateColumn(columnIndex, { links: column.links.filter((_, index) => index !== linkIndex) })} /></div>)}<Button type="button" size="sm" variant="outline" onClick={() => updateColumn(columnIndex, { links: [...column.links, { id: id('footer-link'), label: 'New link', href: '#' }] })}><Plus data-icon="inline-start" />Add link</Button></div>)}
          <Button type="button" variant="outline" onClick={() => onChange({ ...content, footer: { ...content.footer, columns: [...content.footer.columns, { id: id('footer-column'), title: 'New column', links: [] }] } })}><Plus data-icon="inline-start" />Add column</Button>
        </div>
      </AdminCard>
    </div>
  )
}
