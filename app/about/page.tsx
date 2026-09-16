import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
  Globe2,
  Award,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ABOUT_STATS, TEAM_MEMBERS, TESTIMONIALS } from '@/lib/ebooks-data'

export const metadata = {
  title: 'About Us — SkillScale E-Book Store',
  description:
    'The story behind SkillScale: our passion for reader-first digital publishing, curated technical mastery, and 100% DRM-free digital sovereignty.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Navbar */}
      <SiteHeader />

      <main className="flex-1">
        {/* 2. Header Section: Company's Mission & Story Overview */}
        <section className="relative overflow-hidden border-b border-border bg-soft py-16 sm:py-24">
          <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                <Sparkles className="size-3.5 text-highlight" />
                Our Mission & Purpose
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
                Democratizing Practical Knowledge, One DRM-Free E-Book at a Time.
              </h1>
              <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                We started SkillScale with a simple, defiant belief: readers should truly own their digital libraries, and independent authors should be rewarded generously for high-leverage craftsmanship.
              </p>
            </div>
          </div>
        </section>

        {/* 3. About Section: Detailed Narrative about Founding, Passion, and Digital Library */}
        <section id="mission" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  The Origin Story
                </span>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Born from the Frustration of Proprietary Walled Gardens
                </h2>
                <div className="space-y-4 text-sm sm:text-base leading-7 text-muted-foreground">
                  <p>
                    In 2020, our founders Clara and Marcus were deep in the weeds of engineering leadership. Whenever they bought technical manuals or architecture guides from major monolithic digital bookstores, they ran into the same frustrating walls: broken syntax formatting, closed reader apps that refused to export to e-ink tablets, and license agreements that meant you never truly owned what you bought.
                  </p>
                  <p>
                    Even worse, the brilliant engineers and thinkers writing these books were receiving meager 10% royalties while waiting 18 months for legacy publishers to approve simple errata fixes.
                  </p>
                  <p>
                    We built SkillScale as an antidote. A curated home where every e-book is independently verified, formatted meticulously for real-world devices, and delivered instantly in open EPUB, PDF, and MOBI standards.
                  </p>
                </div>
              </div>

              {/* Founding Highlights Box */}
              <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 border-b border-border pb-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
                    <Heart className="size-6 text-rose-300" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-primary">
                      The SkillScale Manifesto
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Pillars that guide every title we publish
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: 'Pragmatic Over Academic',
                      desc: 'Every book must deliver immediately applicable code, systems, or cognitive frameworks.',
                    },
                    {
                      title: 'Digital Sovereignty',
                      desc: 'Zero DRM, zero tracking. Your files are yours to keep, annotate, and back up forever.',
                    },
                    {
                      title: 'Author-First Economics',
                      desc: 'We pay authors 80%+ royalties, empowering the best minds to write without corporate censorship.',
                    },
                    {
                      title: 'Continuous Freshness',
                      desc: 'Authors can push errata and code updates anytime; readers receive updated editions for life.',
                    },
                  ].map((pillar) => (
                    <div key={pillar.title} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                          {pillar.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-5 mt-0.5">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Stats Section: Key Statistics (E-books sold, active readers, years in business) */}
        <section className="border-y border-border bg-primary py-12 text-primary-foreground">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4 lg:px-8">
            {ABOUT_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-indigo-200 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Benefits Section: Core Values & Advantages (Curated selections, Author partnerships) */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Core Advantages
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Built Around the Needs of Real Readers
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                We do not believe in massive catalogs full of AI-generated filler. Every single title on our storefront undergoes human editorial review and practical code testing.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Award,
                  title: 'Rigorous Curation',
                  desc: 'Only 1 out of every 8 submitted manuscripts is accepted. We prioritize depth, voice, and tangible outcomes over volume.',
                },
                {
                  icon: Users,
                  title: 'Direct Author Partnerships',
                  desc: 'Our writers interact directly with their readers through live chapter AMAs, bonus repositories, and reader clubs.',
                },
                {
                  icon: Zap,
                  title: 'Production-Verified Code',
                  desc: 'Every code snippet in our technical books is executed against continuous integration tests before release.',
                },
              ].map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {benefit.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 6. Feature Section: Supporting Independent Authors & Publishers */}
        <section className="border-y border-border bg-soft py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-primary">
                  <Globe2 className="size-3.5" />
                  Independent Publishing
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  A Fairer Ecosystem for Independent Authors
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-7 text-muted-foreground">
                  The greatest technical and creative insights rarely come from massive corporate publishing houses. They come from practitioners in the trenches. By giving creators 80%+ royalties, transparent sales data, and complete creative freedom, we attract the most respected experts in the industry.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-primary">
                  <span className="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                    ✓ 80%+ Royalty Payouts
                  </span>
                  <span className="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                    ✓ Author Retains 100% Copyright
                  </span>
                  <span className="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                    ✓ Zero Exclusivity Locks
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <blockquote className="text-sm sm:text-base leading-7 text-foreground italic">
                  “Publishing through SkillScale allowed me to reach 2,000+ senior engineers within 60 days of finishing my manuscript. Knowing that my readers get free updates whenever I improve the code gives me ultimate pride in my work.”
                </blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    TV
                  </span>
                  <div>
                    <strong className="block text-sm font-semibold">Dr. Tariq Vance</strong>
                    <span className="text-xs text-muted-foreground">
                      Author of <em>Autonomous AI Agents in Practice</em>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Feature Section: Focus on Reader Experience & Recommendations */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1 rounded-3xl border border-border bg-card p-6 shadow-md">
                <h3 className="font-heading text-lg font-bold text-primary">
                  Reader-Centric Reading Experience
                </h3>
                <ul className="mt-4 space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant high-speed CDN delivery worldwide</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Validated typography that displays beautifully on Kindle, Kobo & iPads</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Personalized genre matching without creepy tracking or advertising cookies</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Dedicated human support for any downloading or device formatting help</span>
                  </li>
                </ul>
              </div>

              <div className="order-1 lg:order-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Reader Experience
                </span>
                <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Crafted for the Joy of Reading & Building
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-7 text-muted-foreground">
                  We obsess over font pairing, margin mathematics, code block contrast, and ereader pagination. Whether reading on a smartphone during your commute, an e-ink display before bed, or a multi-monitor desktop workstation, your e-books look immaculate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Team Section: Photos, Names, Roles to Build Trust */}
        <section id="team" className="scroll-mt-20 border-t border-border bg-soft py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Meet the Team
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                The Curators Behind SkillScale
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Engineers, editors, designers, and passionate lifelong readers dedicated to advancing independent publishing.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 260px"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="font-heading text-base font-bold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary/80 mt-0.5">
                      {member.role}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground flex-1">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Testimonial Section: Authors & Readers */}
        <section id="testimonials" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                What People Say
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Loved by Authors and Readers Alike
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Real feedback from our growing global community of makers and learners.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    {item.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                  <blockquote className="mt-4 flex-1 text-xs sm:text-sm leading-6 text-foreground">
                    “{item.quote}”
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${item.avatarBg} ${item.avatarColor}`}
                    >
                      {item.avatar}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-xs font-semibold text-foreground truncate">{item.name}</strong>
                      <span className="text-[11px] text-muted-foreground block truncate">{item.role}</span>
                      <span className="text-[10px] font-medium text-primary block truncate">{item.company}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. CTA Section: Standardized to #1e1b4b brand dark color */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#1e1b4b] px-6 py-12 text-white sm:px-12 sm:py-16 text-center lg:text-left lg:flex lg:items-center lg:justify-between shadow-xl">
            <div className="max-w-xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl text-white">
                Ready to Expand Your Digital Library?
              </h2>
              <p className="mt-3 text-sm leading-6 text-indigo-200">
                Browse our curated collection of DRM-free e-books or get in touch with our editorial curation team.
              </p>
            </div>

            <div className="mt-8 shrink-0 lg:mt-0 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/ebooks"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-success px-6 text-sm font-semibold text-success-foreground shadow hover:bg-success/90 transition"
              >
                Browse Catalog
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="mailto:support@skillscale.dev"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                <Mail className="size-4" />
                Contact Team
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
