import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LevelUp Backend - Solo Leveling System API',
  description: 'Next.js App Router Backend for LevelUp EdTech Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=Orbitron:wght@600;800;900&display=swap"
        />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #06080d;
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
          }
          h1, h2, h3, .system-title {
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 0.05em;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
