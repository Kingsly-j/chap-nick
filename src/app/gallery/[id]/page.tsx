import { notFound } from 'next/navigation';
import { findCollection } from '@/lib/gallery-store';
import CollectionStory from '@/components/collection-story';
import '../../gallery.css';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await findCollection(id);
  if (!collection) notFound();
  return <CollectionStory collection={collection} />;
}
