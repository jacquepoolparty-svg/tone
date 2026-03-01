import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TONE — Content that sounds like you.',
  description: 'The social media platform that learns your brand voice — and never forgets it.',
  openGraph: {
    title: 'TONE',
    description: 'Content that sounds like you.',
    siteName: 'TONE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0D0D0D', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
