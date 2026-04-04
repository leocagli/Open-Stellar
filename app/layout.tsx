import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, VT323 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from '@/components/wallet/wallet-provider'
import './globals.css'

const pressStart2P = Press_Start_2P({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-pixel'
});

const vt323 = VT323({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-vt323'
});

export const metadata: Metadata = {
  title: 'Open Stellar - Ciudad de Agentes IA',
  description: 'Open Stellar - plataforma multi-chain con agentes IA y protocolos Web3',
  generator: 'v0.app',
}

export const viewport: Viewport = {
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
    <html lang="es" className="bg-background">
      <body className={`${pressStart2P.variable} ${vt323.variable} font-sans antialiased`}>
        <WalletProvider>
          {children}
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
