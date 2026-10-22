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


export interface AboutStat {
  value: string
  label: string
}


export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
}

