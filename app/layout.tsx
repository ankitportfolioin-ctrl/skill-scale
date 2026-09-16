// import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { TopProgressBar } from '@/components/top-progress-bar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkillScale — Curated E-Book Library & Practical Digital Guides',
  description: 'Instant download, 100% DRM-free technical e-books, AI architectures, design tokens, self-help manuals, and speculative fiction with lifetime updates.',
  generator: 'v0.app',
  keywords: ['e-books', 'technical guides', 'AI architecture', 'design systems', 'self-help', 'sci-fi', 'DRM-free EPUB', 'PDF books'],
  openGraph: {
    title: 'SkillScale — Curated E-Book Library & Practical Digital Guides',
    description: 'Instant download, 100% DRM-free technical e-books with lifetime updates.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e1b4b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <TopProgressBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
