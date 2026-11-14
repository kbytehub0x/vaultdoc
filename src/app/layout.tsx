import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VaultDoc — Privacy-First Hybrid AI Document Copilot',
  description:
    'Built for #BuildHybridAI with Firebase AI Logic & Chrome Gemini Nano. Zero-egress local processing with user-authorized cloud escalation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">{children}</body>
    </html>
  );
}
