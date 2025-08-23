import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import AIChatbot from '@/components/AIChatbot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Blood Bridge Management System',
  description: 'AI-powered blood donation coordination and emergency response platform',
  keywords: 'blood donation, emergency response, healthcare, donors, recipients',
  authors: [{ name: 'Blood Bridge Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <AIChatbot />
        </Providers>
      </body>
    </html>
  )
}
