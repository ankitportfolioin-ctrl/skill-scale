import type { Product } from './cms/content'
import { formatGoogleDriveImageUrl } from './cms/drive'

export interface EbookGenreItem {
  id: string
  name: string
  description: string
  count: number
}

export type EbookGenre =
  | 'All'
  | 'Technical Guides'
  | 'AI & Prompting'
  | 'Design & Tokens'
  | 'Systems & DevOps'
  | 'Self-Help'
  | 'Speculative'

export const GENRES: EbookGenreItem[] = [
  {
    id: 'tech-guides',
    name: 'Technical Guides',
    description: 'Deep-dive architectural playbooks, database internals, and concurrency patterns.',
    count: 1,
  },
  {
    id: 'ai-prompting',
    name: 'AI & Prompting',
    description: 'Autonomous multi-agent orchestration, deterministic evals, and reasoning architectures.',
    count: 1,
  },
  {
    id: 'design-tokens',
    name: 'Design & Tokens',
    description: 'Mathematical design systems, typography scaling, and cross-platform token pipelines.',
    count: 1,
  },
  {
    id: 'systems-devops',
    name: 'Systems & DevOps',
    description: 'Zero-downtime databases, connection pooling, high-availability clusters, and incident runbooks.',
    count: 1,
  },
  {
    id: 'self-help',
    name: 'Self-Help',
    description: 'Deep work rituals, focus management, and career stamina for remote builders.',
    count: 1,
  },
  {
    id: 'speculative',
    name: 'Speculative',
    description: 'Thought-provoking speculative novellas exploring autonomous systems and humanity.',
    count: 1,
  },
]

export interface EbookItem {
  id: string
  slug: string
  title: string
  author: string
  authorBio?: string
  category: string
  shortDescription: string
  description: string
  price: number
  priceINR: number
  compareAtPrice?: number | null
  rating: number
  reviewsCount: number
  salesCount: number
  pages: number
  formats: string[]
  publishedYear: number
  image: string
  imageAlt: string
  badge?: string
  featured?: boolean
  tableOfContents: string[]
  keyTakeaways: string[]
}

export function ebookToProduct(book: EbookItem): Product {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    creator: book.author,
    category: book.category,
    shortDescription: book.shortDescription,
    description: book.description,
    price: book.price,
    compareAtPrice: book.compareAtPrice ?? null,
    rating: book.rating,
    reviews: book.reviewsCount,
    sales: book.salesCount,
    inventory: null,
    format: book.formats.join(', '),
    image: formatGoogleDriveImageUrl(book.image),
    imageAlt: book.imageAlt,
    badge: book.badge || '',
    portrait: true,
    featured: Boolean(book.featured),
    published: true,
    license: 'Personal & Commercial Use',
    requirements: 'PDF / ePub / Kindle Reader',
    features: book.keyTakeaways,
  }
}

export function productToEbook(prod: Product): EbookItem {
  return {
    id: prod.id,
    slug: prod.slug,
    title: prod.title,
    author: prod.creator,
    authorBio: `${prod.creator} is a verified technical practitioner and author at SkillScale.`,
    category: (prod.category as any) || 'Technical Guides',
    shortDescription: prod.shortDescription || prod.description,
    description: prod.description || prod.shortDescription,
    price: prod.price,
    priceINR: Math.round((prod.price * 95.5) / 50) * 50 - 1,
    compareAtPrice: prod.compareAtPrice,
    rating: prod.rating || 5.0,
    reviewsCount: prod.reviews || 0,
    salesCount: prod.sales || 0,
    pages: 180,
    formats: prod.format ? prod.format.split(',').map((f) => f.trim()) : ['PDF', 'ePub'],
    publishedYear: 2025,
    image: formatGoogleDriveImageUrl(prod.image) || '/products/multi-agent-ai.png',
    imageAlt: prod.imageAlt || `${prod.title} cover`,
    badge: prod.badge || undefined,
    featured: Boolean(prod.featured),
    tableOfContents: [
      '1. Architectural Foundations & Real-World Setup',
      '2. Core Frameworks, Data Pipelines & Implementation',
      '3. Scaling, Optimization & Failure Recovery',
      '4. Production Deployments & Operational Best Practices',
    ],
    keyTakeaways: Array.isArray(prod.features) && prod.features.length > 0 ? prod.features : [
      'Production-tested architecture patterns',
      'Instant digital download in PDF & ePub',
      '100% DRM-free with lifetime updates',
    ],
  }
}

export const EBOOKS_CATALOG: EbookItem[] = [
  {
    id: 'multi-agent-ai',
    slug: 'architecting-multi-agent-ai-systems',
    title: 'Architecting Multi-Agent AI Systems',
    author: 'Dr. Tariq Vance',
    authorBio: 'Dr. Tariq Vance is an AI research engineer specializing in distributed cognitive systems and multi-agent coordination frameworks.',
    category: 'AI & Prompting',
    shortDescription: 'Production-ready orchestration patterns, memory hierarchies, and eval loops for agentic workflows.',
    description: 'A deep-dive technical manual covering multi-agent task routing, consensus protocols, deterministic eval pipelines, context-window compression, and error-recovery trees.',
    price: 39,
    priceINR: 3699,
    compareAtPrice: 59,
    rating: 4.95,
    reviewsCount: 420,
    salesCount: 3200,
    pages: 284,
    formats: ['PDF', 'ePub', 'Kindle Mobi', 'Code Companion'],
    publishedYear: 2025,
    image: '/products/multi-agent-ai.png',
    imageAlt: 'Architecting Multi-Agent AI Systems Book Cover',
    badge: 'Best Seller',
    featured: true,
    tableOfContents: [
      '1. Foundational Topologies: Hierarchical, Swarm & Peer-to-Peer Networks',
      '2. Context Management & Hierarchical Vector Memory Retrieval',
      '3. Dynamic Tool Calling, Schema Contracts & Guardrails',
      '4. Human-in-the-Loop Arbitration & Safety Interventions',
      '5. Synthetic Test Benches & Automated Regression Benchmarking',
      '6. Production Incident Runbooks & Failure Modes',
    ],
    keyTakeaways: [
      'Understand when to use hierarchical supervisors vs decentralized voting swarms',
      'Implement deterministic memory schemas that prevent context poisoning',
      'Write reproducible eval fixtures testing multi-turn agent recovery',
      'Access full Python 3.11+ GitHub repository with working test fixtures',
    ],
  },
  {
    id: 'design-tokens-scale',
    slug: 'design-tokens-at-scale',
    title: 'Design Tokens at Scale',
    author: 'Clara Beaumont',
    authorBio: 'Clara Beaumont has spearheaded design systems for Fortune 100 brands and is an active contributor to the W3C Design Tokens Community Group.',
    category: 'Design & Tokens',
    shortDescription: 'Unify multi-brand design systems from Figma through Tailwind CSS and style dictionaries.',
    description: 'The definitive blueprint for organizing semantic color tokens, mathematical typography ratios, container nesting math, and cross-platform token pipelines without drift.',
    price: 29,
    priceINR: 2749,
    compareAtPrice: 45,
    rating: 4.9,
    reviewsCount: 280,
    salesCount: 2150,
    pages: 210,
    formats: ['PDF', 'ePub', 'Figma Token Studio', 'JSON Specs'],
    publishedYear: 2025,
    image: '/products/design-system.png',
    imageAlt: 'Design Tokens at Scale Book Cover',
    badge: 'Staff Pick',
    featured: true,
    tableOfContents: [
      '1. The Three Tiers: Primitive, Semantic, and Component Tokens',
      '2. Mathematical Color Harmonies & OKLCH Perceptual Consistency',
      '3. Optical Baseline Grids and Mathematical Scaling Curves',
      '4. Figma-to-Code Automated Git Pipelines via Actions',
      '5. Managing Multi-Brand Theming & High-Contrast Modes',
    ],
    keyTakeaways: [
      'Structure semantic token aliases that withstand major visual rebrands',
      'Eliminate color-contrast bugs automatically at build time',
      'Export production tokens directly to CSS Variables, Tailwind, and iOS/Android',
    ],
  },
  {
    id: 'zero-downtime-pg',
    slug: 'the-zero-downtime-postgresql-handbook',
    title: 'The Zero-Downtime PostgreSQL Handbook',
    author: 'Devon K. Miller',
    authorBio: 'Devon K. Miller is a principal database infrastructure architect who has managed terabyte-scale transactional databases across high-growth startups.',
    category: 'Systems & DevOps',
    shortDescription: 'Safe schema migrations, index concurrency, connection pool tuning, and failover runbooks.',
    description: 'Learn how to alter multi-gigabyte tables without locks, configure PgBouncer for high-concurrency bursts, and prevent catastrophic database downtime.',
    price: 34,
    priceINR: 3249,
    compareAtPrice: 49,
    rating: 4.98,
    reviewsCount: 510,
    salesCount: 4100,
    pages: 340,
    formats: ['PDF', 'ePub', 'SQL Snippets Library'],
    publishedYear: 2025,
    image: '/products/postgresql-guide.png',
    imageAlt: 'PostgreSQL Handbook Cover',
    badge: 'Engineering Classic',
    featured: true,
    tableOfContents: [
      '1. PostgreSQL Concurrency & Lock Topologies Unveiled',
      '2. Zero-Downtime Table Migrations & Online Column Alters',
      '3. Concurrent Index Creation & Index Maintenance Strategies',
      '4. Connection Management with PgBouncer & Transaction Pooling',
      '5. Query Analysis Mastery with EXPLAIN (ANALYZE, BUFFERS)',
      '6. High Availability, Failovers & Point-In-Time Disaster Recovery',
    ],
    keyTakeaways: [
      'Execute safe column additions and constraint validations without blocking table reads',
      'Tune connection poolers to handle 10x traffic spikes with minimal latency',
      'Set up proactive telemetry to spot lock contention before customers notice',
    ],
  },
  {
    id: 'pragmatic-ts',
    slug: 'pragmatic-typescript-patterns',
    title: 'Pragmatic TypeScript Patterns',
    author: 'Siddharth Nair',
    authorBio: 'Siddharth Nair is a staff engineer who writes extensively on compiler mechanics and maintainable TypeScript patterns for complex web applications.',
    category: 'Technical Guides',
    shortDescription: 'Write robust enterprise TypeScript without type acrobatics or performance overhead.',
    description: 'Bridge the gap between pure academic type theory and real production applications. Learn domain modeling with branded types, schema validation with Zod, and type narrowing.',
    price: 27,
    priceINR: 2599,
    compareAtPrice: 39,
    rating: 4.88,
    reviewsCount: 195,
    salesCount: 1800,
    pages: 230,
    formats: ['PDF', 'ePub', 'Interactive Code Sandbox'],
    publishedYear: 2025,
    image: '/products/typescript-patterns.png',
    imageAlt: 'TypeScript Patterns Book Cover',
    badge: 'Popular',
    featured: true,
    tableOfContents: [
      '1. Pragmatic Type Narrowing & Exhaustive Union Checks',
      '2. Branded Types for Secure Domain Modeling',
      '3. Effective Schema Validation & Safe Parsing Boundaries',
      '4. Generic Constraints Without Cognitive Overhead',
      '5. Compiler Optimization & Fast Incremental Builds',
    ],
    keyTakeaways: [
      'Prevent ID confusion bugs using lightweight compile-time branded types',
      'Build bulletproof state machines using discriminated unions',
      'Keep IDE auto-completion lightning fast by avoiding complex recursive types',
    ],
  },
  {
    id: 'deep-work-remote',
    slug: 'deep-work-for-remote-engineers',
    title: 'Deep Work for Remote Engineers',
    author: 'Hannah Lindqvist',
    authorBio: 'Hannah Lindqvist is an engineering director and author dedicated to humane workplace operations and asynchronous productivity systems.',
    category: 'Self-Help',
    shortDescription: 'Protect focus blocks, minimize Slack noise, and build sustainable creative momentum.',
    description: 'A practical, unsentimental manual for asynchronous communication, cognitive stamina preservation, and deep technical output in distributed engineering organizations.',
    price: 22,
    priceINR: 2099,
    compareAtPrice: 30,
    rating: 4.92,
    reviewsCount: 310,
    salesCount: 2900,
    pages: 186,
    formats: ['PDF', 'ePub', 'Audiobook (MP3)', 'Printable Templates'],
    publishedYear: 2025,
    image: '/products/deep-work.png',
    imageAlt: 'Deep Work Cover',
    badge: 'Essential',
    featured: false,
    tableOfContents: [
      '1. The Cognitive Tax of Real-Time Chat Tools',
      '2. Designing the Four-Hour Daily Protected Focus Window',
      '3. Asynchronous Write-Ups that Eliminate Status Meetings',
      '4. Energy Management Across Differing Time Zones',
      '5. Sustainable Career Longevity and Burnout Defenses',
    ],
    keyTakeaways: [
      'Draft clear proposal RFCs that reduce meeting volume by 60%',
      'Create rigid personal focus boundaries without alienating colleagues',
      'Structure daily coding sprints around biological peak performance rhythms',
    ],
  },
  {
    id: 'chronicles-silicon',
    slug: 'chronicles-of-the-silicon-veil',
    title: 'Chronicles of the Silicon Veil',
    author: 'A. I. Morales',
    authorBio: 'A. I. Morales is an award-winning speculative fiction author and former embedded systems programmer exploring the frontiers of artificial intelligence.',
    category: 'Speculative',
    shortDescription: 'Eight speculative novellas exploring sentient networks, algorithmic governance, and human longing.',
    description: 'Critically acclaimed speculative fiction set in the near future, where autonomous distributed systems arbitrate human memory and digital legacy.',
    price: 18,
    priceINR: 1699,
    compareAtPrice: 25,
    rating: 4.85,
    reviewsCount: 140,
    salesCount: 1200,
    pages: 296,
    formats: ['ePub', 'PDF', 'Full Cast Audiobook'],
    publishedYear: 2024,
    image: '/products/speculative-fiction.png',
    imageAlt: 'Speculative Fiction Book Cover',
    badge: 'Fiction Pick',
    featured: false,
    tableOfContents: [
      'I. The Ghost in the Validator Node',
      'II. Latency of the Soul',
      'III. Protocols of Forgetting',
      'IV. The Algorithmic Commons',
      'V. Echoes in Cold Storage',
      'VI. Synaptic Migration',
      'VII. The Last Human PR',
      'VIII. Silicon Horizons',
    ],
    keyTakeaways: [
      'Captivating speculative exploration of artificial intelligence and consciousness',
      'Philosophical depth grounded in real distributed systems architectures',
      'Includes exclusive author essays and speculative timeline illustrations',
    ],
  },
]

export interface PricingTier {
  id: string
  name: string
  description: string
  price: string
  period: string
  popular?: boolean
  badge?: string
  ctaText: string
  ctaHref: string
  features: string[]
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'single',
    name: 'A La Carte',
    description: 'Purchase individual e-books with lifetime updates and full companion code.',
    price: '₹1,499 - ₹3,699',
    period: 'one-time purchase',
    ctaText: 'Browse Catalog',
    ctaHref: '/ebooks',
    features: [
      'Instant download in PDF, ePub, and Kindle Mobi',
      '100% DRM-free format compatibility',
      'Lifetime errata and minor edition updates',
      'Companion code repositories and setup guides',
      '30-day money-back satisfaction guarantee',
    ],
  },
  {
    id: 'membership',
    name: 'All-Access Reader Pass',
    description: 'Unlock our complete current catalog plus every upcoming release for 12 months.',
    price: '₹9,999',
    period: 'annual pass',
    popular: true,
    badge: 'Most Popular',
    ctaText: 'Get All-Access Pass',
    ctaHref: '#',
    features: [
      'Immediate access to all 6+ existing publications',
      'All new technical titles released over the next 12 months',
      'Private Discord access to authors and engineering Q&As',
      'High-resolution printable cheat sheets and architecture posters',
      'Bonus video walkthroughs and author commentary tracks',
    ],
  },
  {
    id: 'team',
    name: 'Team & Organization Bundle',
    description: 'Equip your engineering or design team with multi-seat digital sovereignty.',
    price: '₹39,999',
    period: 'one-time team license',
    ctaText: 'Contact for Team Seats',
    ctaHref: 'mailto:support@skillscale.io?subject=SkillScale%20Team%20License',
    features: [
      'Up to 25 team member seats with unrestricted internal sharing',
      'Full source code licenses for company products and internal tools',
      'Consolidated invoicing and procurement vendor setup support',
      'Direct priority email support from book authors',
      'Lifetime team updates on all included titles',
    ],
  },
]

export interface BlogPostBlock {
  type: 'paragraph' | 'heading' | 'pullquote' | 'callout'
  text: string
}

export interface BlogPostItem {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  authorRole: string
  authorAvatar: string
  date: string
  readTime: string
  coverImage: string
  relatedEbookSlug: string
  content: BlogPostBlock[]
}

export const BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'post-1',
    slug: 'why-drm-free-technical-books-matter',
    title: 'Why DRM-Free Technical Books Matter More Than Ever in 2025',
    excerpt: 'Proprietary reader locks and walled-garden platforms are fundamentally hostile to engineering craft. Here is our case for digital sovereignty.',
    category: 'DRM-Free',
    tags: ['DRM-Free', 'Engineering', 'Learning'],
    author: 'Clara Beaumont',
    authorRole: 'Head of Publishing at SkillScale',
    authorAvatar: '/placeholder-user.jpg',
    date: 'February 18, 2025',
    readTime: '6 min read',
    coverImage: '/products/design-system.png',
    relatedEbookSlug: 'design-tokens-at-scale',
    content: [
      {
        type: 'paragraph',
        text: 'When you buy a physical technical book, you own it. You can mark it up, read it in the park, lend it to a junior colleague, and keep it on your shelf for twenty years. Yet in the digital world, modern readers have been conditioned to accept walled gardens where you merely rent a revocable license to view bytes.',
      },
      {
        type: 'heading',
        text: 'The False Promise of Platform Convenience',
      },
      {
        type: 'paragraph',
        text: 'Proprietary e-readers make copy-pasting code snippets painful, restrict export options, and lock annotations behind vendor silos. When an account is flagged or a service shuts down, an entire library of technical references can evaporate overnight.',
      },
      {
        type: 'pullquote',
        text: 'True digital craft requires digital sovereignty. If you cannot back up your manuals onto your own hard drive, you do not truly own them.',
      },
      {
        type: 'heading',
        text: 'Our Commitment to Open Formats',
      },
      {
        type: 'paragraph',
        text: 'At SkillScale, every purchase includes clean, standard PDF and ePub files. Transfer them to your Kindle Scribe, open them in Apple Books, view them in Calibre, or index them into your personal search tools. Knowledge should have zero barriers.',
      },
      {
        type: 'callout',
        text: 'All SkillScale files come watermark-free and DRM-free. You are free to read them across all your personal devices indefinitely.',
      },
    ],
  },
  {
    id: 'post-2',
    slug: 'anatomy-of-a-production-multi-agent-eval-pipeline',
    title: 'Anatomy of a Production Multi-Agent Evaluation Pipeline',
    excerpt: 'How to reliably test non-deterministic LLM agent swarms using deterministic state machines and reproducible test benches.',
    category: 'Engineering',
    tags: ['Engineering', 'Learning'],
    author: 'Dr. Tariq Vance',
    authorRole: 'Author & AI Systems Architect',
    authorAvatar: '/placeholder-user.jpg',
    date: 'January 29, 2025',
    readTime: '9 min read',
    coverImage: '/products/multi-agent-ai.png',
    relatedEbookSlug: 'architecting-multi-agent-ai-systems',
    content: [
      {
        type: 'paragraph',
        text: 'Building a prototype agent that calls two tools is trivial. Building an enterprise multi-agent topology that runs thousands of workflows daily without compounding hallucination errors requires rigorous evaluation pipelines.',
      },
      {
        type: 'heading',
        text: 'Deterministic State Verification in Non-Deterministic Systems',
      },
      {
        type: 'paragraph',
        text: 'Instead of evaluating agent responses with vague LLM-as-a-judge scores, top engineering teams evaluate the state mutations that agents produce. Did the agent execute the database transaction with the correct row constraints? Did the retry handler fire when the sandbox timed out?',
      },
      {
        type: 'pullquote',
        text: 'Never judge an agent by its eloquence; judge it by the mathematical invariants of the environment after its execution completes.',
      },
      {
        type: 'heading',
        text: 'The 3-Tier Multi-Turn Benchmark',
      },
      {
        type: 'paragraph',
        text: 'In chapter 5 of Architecting Multi-Agent AI Systems, we detail our 3-tier benchmark: Mock tool unit tests, sandbox end-to-end runs with real tool stubs, and canary traffic shadow evaluation.',
      },
      {
        type: 'callout',
        text: 'Download the companion repository included with the book to run the full pytest evaluation suite against local models.',
      },
    ],
  },
]

export interface TestimonialItem {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  avatarBg: string
  avatarColor: string
  quote: string
  rating: number
  verified?: boolean
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Elena Rostova',
    role: 'Staff ML Engineer',
    company: 'VectorCore AI',
    avatar: 'ER',
    avatarBg: 'bg-primary/10',
    avatarColor: 'text-primary',
    quote: 'Architecting Multi-Agent AI Systems saved our team at least two months of architectural false starts. Truly top-tier.',
    rating: 5,
    verified: true,
  },
  {
    id: 't-2',
    name: 'Marcus Chen',
    role: 'Principal Architect',
    company: 'FinStack Systems',
    avatar: 'MC',
    avatarBg: 'bg-success/15',
    avatarColor: 'text-success',
    quote: 'Zero DRM, beautiful typography on my Kindle Scribe, and the accompanying GitHub repo worked on the first try.',
    rating: 5,
    verified: true,
  },
  {
    id: 't-3',
    name: 'Sarah Jenkins',
    role: 'Head of Product Design',
    company: 'StudioNord',
    avatar: 'SJ',
    avatarBg: 'bg-primary/10',
    avatarColor: 'text-primary',
    quote: 'The design tokens guide gave our whole agency a shared vocabulary. Our design-to-code velocity doubled within weeks.',
    rating: 5,
    verified: true,
  },
  {
    id: 't-4',
    name: 'Alexandre Roy',
    role: 'Senior SRE',
    company: 'ScaleRoute Cloud',
    avatar: 'AR',
    avatarBg: 'bg-success/15',
    avatarColor: 'text-success',
    quote: 'The PostgreSQL handbook is now required reading for all our backend engineering hires. Thorough and practical.',
    rating: 5,
    verified: true,
  },
]

export interface AboutStat {
  value: string
  label: string
}

export const ABOUT_STATS: AboutStat[] = [
  { value: '42,000+', label: 'Books Downloaded' },
  { value: '99.4%', label: 'Reader Satisfaction' },
  { value: '100%', label: 'DRM-Free Files' },
  { value: '₹3.2Cr+', label: 'Paid to Writers' },
]

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'm-1',
    name: 'Clara Beaumont',
    role: 'Editorial Director & Founder',
    bio: 'Former technical writer and design systems architect passionate about open publishing standards.',
    image: '/placeholder-user.jpg',
  },
  {
    id: 'm-2',
    name: 'Dr. Tariq Vance',
    role: 'Head of Technical Curricula',
    bio: 'AI researcher and author focused on practical, testable autonomous software patterns.',
    image: '/placeholder-user.jpg',
  },
  {
    id: 'm-3',
    name: 'Siddharth Nair',
    role: 'Engineering Lead & Code Reviewer',
    bio: 'Typescript enthusiast and distributed systems veteran who validates all code companions.',
    image: '/placeholder-user.jpg',
  },
  {
    id: 'm-4',
    name: 'Maya Lin',
    role: 'Typography & E-Reader Craftsman',
    bio: 'Digital typographer obsessing over optical kerning, margins, and crisp e-ink rendering.',
    image: '/placeholder-user.jpg',
  },
]
