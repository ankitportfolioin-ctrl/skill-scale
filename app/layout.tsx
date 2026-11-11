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
  title: 'SkillScale — Practical E-Books on AI, Careers and Freelancing',
  description: 'Practical DRM-free e-books on building with AI and getting paid for it. Download straight after checkout.',
  generator: 'v0.app',
  keywords: ['e-books', 'AI guides', 'job search', 'freelancing India', 'SQL', 'Excel', 'prompting', 'small business', 'DRM-free PDF'],
  openGraph: {
    title: 'SkillScale — Practical E-Books on AI, Careers and Freelancing',
    description: 'Practical DRM-free e-books on building with AI and getting paid for it.',
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
