import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Nya-tet - Aplikasi Keuangan Pintar',
  description:
    'Catat keuangan secepat bicara. Nya-tet menggunakan AI untuk entri otomatis via suara dan scan nota - tanpa kerumitan input manual.',
  keywords: ['keuangan', 'pencatat keuangan', 'AI finance', 'voice to record', 'scan nota'],
  authors: [{ name: 'Ryan Wardiana' }],
  openGraph: {
    title: 'Nya-tet - Aplikasi Keuangan Pintar',
    description: 'Pencatatan keuangan otomatis dengan Voice & Vision AI.',
    type: 'website',
  },
  // Aktifkan PWA agar bisa di-install dan loading lebih cepat
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nya-tet',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
