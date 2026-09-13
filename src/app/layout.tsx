import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'HugCoach',
  description: 'Local-first learning loops for relationship growth.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
        </ThemeProvider>
        <script
          src="https://cdn.jsdelivr.net/gh/joshualparris/JoshHub@main/public/podcast-dock.js"
          data-topics="relationships"
          data-label="🎧 Listen to a different relationship-growth podcast"
          defer
        />
      </body>
    </html>
  );
}
