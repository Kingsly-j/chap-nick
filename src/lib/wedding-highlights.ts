import 'server-only';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { imageUrl, InputError, type GalleryPhoto } from '@/lib/collection-schema';

const highlightsRef = () => getAdminFirestore().collection('portfolioSettings').doc('weddingHighlights');

export async function getWeddingHighlights(): Promise<{photos:GalleryPhoto[];configured:boolean}> {
  const snapshot = await highlightsRef().get();
  const photos = snapshot.data()?.photos;
  return {photos:Array.isArray(photos) ? photos as GalleryPhoto[] : [],configured:snapshot.exists};
}

export async function saveWeddingHighlights(input: unknown, uid: string): Promise<GalleryPhoto[]> {
  if (!Array.isArray(input) || input.length > 40) throw new InputError('Add up to 40 wedding highlight photos.');
  const photos = input.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InputError('Invalid highlight photo.');
    const photo = raw as Record<string, unknown>;
    if (typeof photo.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(photo.id)) throw new InputError('Invalid photo ID.');
    if (typeof photo.alt !== 'string' || !photo.alt.trim() || photo.alt.length > 300) throw new InputError('Each photo needs an accessible description (up to 300 characters).');
    const title = typeof photo.title === 'string' ? photo.title.trim() : '';
    if (title.length > 160) throw new InputError('Photo titles must be 160 characters or fewer.');
    return {id:photo.id,url:imageUrl(photo.url),alt:photo.alt.trim(),title,description:''};
  });
  if (new Set(photos.map(photo=>photo.id)).size !== photos.length) throw new InputError('Photo IDs must be unique.');
  await highlightsRef().set({photos,updatedAt:new Date().toISOString(),updatedBy:uid});
  return photos;
}
