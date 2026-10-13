import type { Metadata } from 'next';
import './globals.css';
import './gallery.css';
import './pages.css';
import './giveaway.css';
import FirebaseProvider from '@/components/firebase-provider';
import WhatsAppButton from '@/components/whatsapp-button';
import AdminShortcut from '@/components/admin-shortcut';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Chap Nic Pictures | Wedding Photography & Portraits in Yaounde',
  description: 'The big feelings. The little things. Wedding photography, selected portraits and films by Chap Nic Pictures in Yaounde, Cameroon.',
  openGraph: { title: 'Chap Nic Pictures - Love happens. Make it unforgettable.', description: 'Photography and film for the beautifully unscripted. Yaounde, Cameroon.', type: 'website', images: [{ url: '/photos/weddings-01.jpg', width: 1024, height: 683 }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<WhatsAppButton /><AdminShortcut /><FirebaseProvider /></body></html>;
}
