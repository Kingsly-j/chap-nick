import 'server-only';
import { getAdminFirestore } from './firebase-admin';
import { validId, type GalleryCollection } from './collection-schema';

export const COLLECTION_PATH = 'portfolioCollections';
export async function listCollections(includeDrafts = false): Promise<GalleryCollection[]> {
  const ref = getAdminFirestore().collection(COLLECTION_PATH);
  const snapshot = await (includeDrafts ? ref : ref.where('published', '==', true)).get();
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GalleryCollection)).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
export async function findCollection(id: string): Promise<GalleryCollection | null> {
  if (!validId(id)) return null;
  const document = await getAdminFirestore().collection(COLLECTION_PATH).doc(id).get();
  if (!document.exists || document.data()?.published !== true) return null;
  return { ...document.data(), id: document.id } as GalleryCollection;
}
