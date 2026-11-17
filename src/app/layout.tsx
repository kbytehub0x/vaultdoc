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
      <body className="min-h-full flex flex-col bg-[#140f0c] text-[#fdfbf7] font-sans selection:bg-orange-500/30 selection:text-orange-200">{children}</body>
    </html>
  );
}
