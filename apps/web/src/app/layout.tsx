import type { Metadata, Viewport } from 'next';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Headings: rounded letters, close to the logo lettering
const nunito = Nunito({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-nunito', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#107434',
};

export const metadata: Metadata = {
  title: {
    default: 'Sen Biopest — Biopesticides naturels au Sénégal',
    template: '%s | Sen Biopest',
  },
  description:
    'Sen Biopest propose des biopesticides naturels à base de plantes locales pour protéger vos cultures. Solutions biologiques pour le maraîchage et le jardinage au Sénégal.',
  keywords: [
    'biopesticides',
    'Sénégal',
    'agriculture biologique',
    'protection des cultures',
    'pesticides naturels',
    'maraîchage',
    'AromaProtect',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'Sen Biopest',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${nunito.variable} font-sans`}>
        <Providers>
          <Header />
          <PageWrapper>
            <main className="min-h-screen">{children}</main>
          </PageWrapper>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
