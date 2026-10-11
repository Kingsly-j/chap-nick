import type { Metadata } from 'next';
import Portfolio from '@/components/portfolio';
export const metadata: Metadata = { title: 'Recent Weddings | Chap Nic Pictures' };
export default function Page() { return <Portfolio page="weddings" />; }
