import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'UpNext — Where College Builders Connect',
    template: '%s | UpNext',
  },
  description:
    'The social network for college founders and builders. Discover who is building on your campus, find teammates, and ship together.',
  keywords: [
    'college startups',
    'student founders',
    'campus builders',
    'find cofounders',
    'student entrepreneurs',
  ],
  openGraph: {
    type: 'website',
    siteName: 'UpNext',
    title: 'UpNext — Where College Builders Connect',
    description:
      'The social network for college founders and builders.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpNext',
    description: 'The social network for college founders and builders.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
