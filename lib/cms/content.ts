export interface Product {
  id: string
  slug: string
  title: string
  creator: string
  category: string
  shortDescription: string
  description: string
  price: number
  compareAtPrice: number | null
  rating: number
  reviews: number
  sales: number
  inventory: number | null
  format: string
  image: string
  imageAlt: string
  badge: string
  portrait: boolean
  featured: boolean
  published: boolean
  license: string
  requirements: string
  features: string[]
}

export interface Category {
  id: string
  name: string
  label: string
  description: string
}

export interface StatItem {
  id: string
  value: string
  label: string
}

export interface ReviewItem {
  id: string
  quote: string
  name: string
  role: string
  initials: string
  rating: number
}

export interface LinkItem {
  id: string
  label: string
  href: string
}

export interface InfoItem {
  id: string
  title: string
  detail: string
}

export interface FooterColumn {
  id: string
  title: string
  links: LinkItem[]
}

export interface SiteContent {
  site: {
    brandName: string
    logoMark: string
    currency: string
    searchPlaceholder: string
    seoTitle: string
    seoDescription: string
  }
  announcement: {
    enabled: boolean
    text: string
  }
  navigation: LinkItem[]
  hero: {
    eyebrow: string
    title: string
    accent: string
    picksEyebrow: string
    description: string
    primaryCta: string
    primaryHref: string
    secondaryCta: string
    secondaryHref: string
    picksTitle: string
    picksRating: string
    buildersText: string
    bullets: string[]
    featuredProductIds: string[]
  }
  assurances: InfoItem[]
  categorySection: {
    eyebrow: string
    title: string
    description: string
  }
  productSection: {
    eyebrow: string
    title: string
    description: string
    emptyTitle?: string
    emptyDescription?: string
  }
  whySection: {
    eyebrow: string
    title: string
    description: string
    cta: string
    ctaHref: string
  }
  benefits: InfoItem[]
  newsletter: {
    eyebrow: string
    title: string
    description: string
    placeholder: string
    button: string
    successTitle: string
    successText: string
  }
  categories: Category[]
  stats: StatItem[]
  reviewSection: {
    eyebrow: string
    title: string
    description: string
  }
  reviews: ReviewItem[]
  products: Product[]
  footer: {
    description: string
    email: string
    supportEmail: string
    copyright: string
    tagline: string
    legalNote: string
    socialLinks: LinkItem[]
    columns: FooterColumn[]
  }
}

export const defaultContent: SiteContent = {
  site: {
    brandName: 'SkillScale',
    logoMark: 'SS',
    currency: '₹',
    searchPlaceholder: 'Search e-books, topics, authors...',
    seoTitle: 'SkillScale — Curated E-Book Library & Practical Digital Guides',
    seoDescription: 'Instant download, 100% DRM-free technical e-books, AI architectures, design tokens, self-help manuals, and speculative fiction with lifetime updates.',
  },
  announcement: {
    enabled: true,
    text: '⚡ All e-books are 100% DRM-free with lifetime updates included. Enjoy reading on any device.',
  },
  navigation: [
    { id: 'nav-1', label: 'E-Books', href: '/ebooks' },
    { id: 'nav-2', label: 'Blog', href: '/blog' },
    { id: 'nav-3', label: 'About', href: '/about' },
  ],
  hero: {
    eyebrow: 'DRM-Free Technical & Creative Knowledge',
    title: 'Practical Books for Makers,',
    accent: 'Engineers & Thinkers',
    picksEyebrow: 'Staff Pick',
    description: 'Master autonomous AI agent orchestration, scalable design tokens, production database tuning, and high-leverage software craft without fluff.',
    primaryCta: 'Explore Library',
    primaryHref: '/ebooks',
    secondaryCta: 'Read the Blog',
    secondaryHref: '/blog',
    picksTitle: 'Top Guides of 2025',
    picksRating: '4.9/5 from 3,400+ verified readers',
    buildersText: 'Trusted by engineers at top startups and independent labs worldwide.',
    bullets: [
      'Instant download in PDF, ePub, and Kindle Mobi formats',
      'Production-tested architectures and reproducible code repos',
      'Free lifetime errata and edition revisions included',
    ],
    featuredProductIds: ['multi-agent-ai', 'design-tokens-scale', 'zero-downtime-pg'],
  },
  assurances: [
    { id: 'assure-1', title: '100% DRM-Free', detail: 'Read on Kindle, iPad, Kobo, or Remarkable with zero lock-in.' },
    { id: 'assure-2', title: 'Lifetime Updates', detail: 'Get free edition upgrades and code bugfixes delivered automatically.' },
    { id: 'assure-3', title: '30-Day Guarantee', detail: 'No-questions-asked refund policy if a title does not meet your standards.' },
    { id: 'assure-4', title: 'Direct Author Royalties', detail: '80%+ proceeds go directly to independent writers and technical creators.' },
  ],
  categorySection: {
    eyebrow: 'Curated Categories',
    title: 'Explore Knowledge by Discipline',
    description: 'Find battle-tested playbooks, architecture patterns, and foundational guides curated by senior practitioners.',
  },
  productSection: {
    eyebrow: 'Featured Releases',
    title: 'Staff Picks & Best Sellers',
    description: 'Our most read and highest-rated technical publications and manuals.',
    emptyTitle: 'No e-books found',
    emptyDescription: 'Try changing your search keywords or filter selection.',
  },
  whySection: {
    eyebrow: 'The SkillScale Difference',
    title: 'Why Readers Choose Our Independent Imprint',
    description: 'We reject bloated 600-page textbooks filled with generic theory. Every guide delivers razor-sharp clarity and practical application.',
    cta: 'Learn Our Story',
    ctaHref: '/about',
  },
  benefits: [
    { id: 'ben-1', title: 'Actionable From Page One', detail: 'Real architectures, configuration recipes, and verified case studies without fluff.' },
    { id: 'ben-2', title: 'Code-Companion Repos', detail: 'Every technical book includes GitHub repositories with passing CI workflows.' },
    { id: 'ben-3', title: 'Reader-First Typography', detail: 'Meticulously crafted font pairings, optical baseline alignment, and e-ink optimizations.' },
  ],
  newsletter: {
    eyebrow: 'Stay Ahead of the Curve',
    title: 'Get Free Sample Chapters & Weekly Release Notes',
    description: 'Join 18,000+ engineers, product architects, and designers receiving our monthly book recommendations.',
    placeholder: 'Enter your work email...',
    button: 'Subscribe Free',
    successTitle: 'You are subscribed!',
    successText: 'Check your inbox for a free preview bundle of our top three releases.',
  },
  categories: [
    { id: 'cat-1', name: 'Technical Guides', label: 'Technical Guides', description: 'Deep-dive engineering, architecture, and systems handbooks.' },
    { id: 'cat-2', name: 'AI & Prompting', label: 'AI & Prompting', description: 'Autonomous agent design, LLM orchestration, and prompt systems.' },
    { id: 'cat-3', name: 'Design & Tokens', label: 'Design & Tokens', description: 'Design system tokens, typography scales, and UI precision.' },
    { id: 'cat-4', name: 'Self-Help', label: 'Self-Help', description: 'Focus, deep work rituals, and career strategy for technical minds.' },
    { id: 'cat-5', name: 'Speculative', label: 'Speculative', description: 'Thought-provoking speculative fiction and techno-philosophies.' },
  ],
  stats: [
    { id: 'stat-1', value: '42,000+', label: 'E-Books Downloaded' },
    { id: 'stat-2', value: '99.4%', label: 'Reader Satisfaction' },
    { id: 'stat-3', value: '100%', label: 'DRM-Free Sovereignty' },
    { id: 'stat-4', value: '₹3.2Cr+', label: 'Paid to Indie Writers' },
  ],
  reviewSection: {
    eyebrow: 'Reader Testimonials',
    title: 'Loved by Technical Teams & Solo Builders',
    description: 'See why staff engineers, tech leads, and curious creators read SkillScale publications.',
  },
  reviews: [
    {
      id: 'rev-1',
      quote: 'Architecting Multi-Agent AI Systems saved our team at least two months of architectural false starts. Truly top-tier.',
      name: 'Elena Rostova',
      role: 'Staff ML Engineer at VectorCore',
      initials: 'ER',
      rating: 5,
    },
    {
      id: 'rev-2',
      quote: 'Zero DRM, beautiful typography on my Kindle Scribe, and the accompanying GitHub repo worked on the first try.',
      name: 'Marcus Chen',
      role: 'Principal Architect at FinStack',
      initials: 'MC',
      rating: 5,
    },
    {
      id: 'rev-3',
      quote: 'The design tokens guide gave our whole agency a shared vocabulary. Our design-to-code velocity doubled within weeks.',
      name: 'Sarah Jenkins',
      role: 'Head of Product Design at StudioNord',
      initials: 'SJ',
      rating: 5,
    },
  ],
  products: [],
  footer: {
    description: 'SkillScale is an independent digital imprint dedicated to 100% DRM-free e-books, actionable engineering manuals, and craft mastery.',
    email: 'hello@skillscale.io',
    supportEmail: 'support@skillscale.io',
    copyright: '© 2025 SkillScale Media Inc. All rights reserved.',
    tagline: 'Crafted with precision for sovereign readers.',
    legalNote: 'DRM-free files may be copied freely onto your personal devices for personal use.',
    socialLinks: [
      { id: 'soc-1', label: 'GitHub', href: 'https://github.com' },
      { id: 'soc-2', label: 'X (Twitter)', href: 'https://x.com' },
      { id: 'soc-3', label: 'RSS Feed', href: '/feed.xml' },
    ],
    columns: [
      {
        id: 'col-1',
        title: 'Catalog',
        links: [
          { id: 'cl-1', label: 'All E-Books', href: '/ebooks' },
          { id: 'cl-2', label: 'Technical Guides', href: '/ebooks?genre=Technical+Guides' },
          { id: 'cl-3', label: 'AI & Prompting', href: '/ebooks?genre=AI+%26+Prompting' },
          { id: 'cl-4', label: 'Design Tokens', href: '/ebooks?genre=Design+%26+Tokens' },
        ],
      },
      {
        id: 'col-2',
        title: 'Resources',
        links: [
          { id: 'cl-5', label: 'Author Journal & Blog', href: '/blog' },
          { id: 'cl-6', label: 'About Our Imprint', href: '/about' },
          { id: 'cl-7', label: 'DRM-Free Manifesto', href: '/about#drm-free' },
          { id: 'cl-8', label: 'Reader Support', href: 'mailto:support@skillscale.io' },
        ],
      },
      {
        id: 'col-3',
        title: 'Publishing',
        links: [
          { id: 'cl-9', label: 'Write for SkillScale', href: '/about#authors' },
          { id: 'cl-10', label: 'Editorial Guidelines', href: '/about' },
          { id: 'cl-11', label: 'Admin Workspace', href: '/admin' },
        ],
      },
    ],
  },
}

export function cloneContent<T>(content: T): T {
  return JSON.parse(JSON.stringify(content))
}

export function validateContent(content: SiteContent): string[] {
  const errors: string[] = []
  if (!content.site.brandName) errors.push('Brand name is required.')
  if (!content.products.length) errors.push('At least one product is required.')
  return errors
}
