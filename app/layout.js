import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Link from 'next/link';
import Nav from '../components/Nav';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], weight: ['600', '700'], variable: '--ff-display' });
const body = IBM_Plex_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '600'], variable: '--ff-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], variable: '--ff-mono' });

export const metadata = {
  title: { default: 'ALife', template: '%s · ALife' },
  description: 'Plac zabaw z systemami sztucznego życia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <Link className="brand" href="/">ALife</Link>
          <Nav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
