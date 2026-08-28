import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NALAKARA · Studio & Foundry',
  description: 'A studio and foundry that turns ideas into useful things across software, physical instruments, and digital systems.',
  metadataBase: new URL('https://nalakara.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'NALAKARA · Studio & Foundry',
    description: 'A studio and foundry that turns ideas into useful things across software, physical instruments, and digital systems.',
    url: 'https://nalakara.com',
    siteName: 'NALAKARA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NALAKARA · Studio & Foundry',
    description: 'A studio and foundry that turns ideas into useful things.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NALAKARA',
  url: 'https://nalakara.com',
  description: 'A studio and foundry that turns ideas into useful things across software, physical instruments, and digital systems.',
  foundingDate: '2026',
  email: 'contact@nalakara.com',
  sameAs: [
    'https://github.com/nalakara'
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
