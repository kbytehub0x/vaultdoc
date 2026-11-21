import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#140f0c',
};

export const metadata: Metadata = {
  title: 'VaultDoc — Privacy-First Hybrid AI Document Copilot',
  description:
    'Built for #BuildHybridAI with Firebase AI Logic & Chrome Gemini Nano. Zero-egress local processing with user-authorized cloud escalation.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VaultDoc',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#140f0c] text-[#fdfbf7] font-sans selection:bg-orange-500/30 selection:text-orange-200">{children}</body>
    </html>
  );
}
