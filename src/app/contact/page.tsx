import type { Metadata } from 'next';
import Portfolio from '@/components/portfolio';
export const metadata: Metadata = { title: 'Contact | Chap Nic Pictures' };
export default function Page() { return <Portfolio page="contact" />; }
