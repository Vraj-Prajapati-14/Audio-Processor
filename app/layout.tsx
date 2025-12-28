import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AudioFX Pro - Free Online Audio Effects Processor | Lofi, Reverb, Delay & More',
  description: 'Transform your audio files with professional effects. Add lofi, reverb, delay, distortion, and more. Fast, free, and completely private - all processing happens in your browser.',
  keywords: 'audio processor, audio effects, lofi audio, reverb effect, delay effect, audio editor, online audio effects, audio processing, free audio effects, audio filter, bitcrush, pitch shift',
  openGraph: {
    title: 'AudioFX Pro - Free Online Audio Effects Processor',
    description: 'Transform your audio files with professional effects. Lofi, reverb, delay, and more.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AudioFX Pro - Free Online Audio Effects Processor',
    description: 'Transform your audio files with professional effects.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.audiofxpro.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main className="container" style={{ flex: 1, padding: '40px 20px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

