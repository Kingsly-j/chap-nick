import type { Metadata } from 'next';
import './globals.css';
import './gallery.css';
import FirebaseProvider from '@/components/firebase-provider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Chap Nic Pictures | Candid Photography & Film in Yaounde',
  description: 'The big feelings. The little things. Candid weddings, portraits, events, architecture, baby photography and films by Chap Nic Pictures in Yaounde, Cameroon.',
  openGraph: { title: 'Chap Nic Pictures - Life happens. Make it unforgettable.', description: 'Photography and film for the beautifully unscripted. Yaounde, Cameroon.', type: 'website', images: [{ url: '/photos/weddings-01.jpg', width: 1024, height: 683 }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<FirebaseProvider /></body></html>;
}
