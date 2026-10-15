export const categories = ['Weddings', 'Portraits', 'Events'] as const;
export type GalleryPhoto = { id: string; url: string; alt: string; title: string; description: string };
export type GalleryCollection = { id: string; title: string; category: string; summary: string; story: string; coverUrl: string; date: string; location: string; published: boolean; order: number; photos: GalleryPhoto[]; createdAt?: string; updatedAt: string };
export class InputError extends Error {}
function text(value: unknown, label: string, max: number, required = false): string {
  if (typeof value !== 'string' || value.length > max) throw new InputError(label + ' must be text, up to ' + max + ' characters.');
  const clean = value.trim();
  if (required && !clean) throw new InputError(label + ' is required.');
  return clean;
}
export function imageUrl(value: unknown): string {
  const result = text(value, 'Image URL', 2048, true);
  if (/^\/photos\/[a-zA-Z0-9_./-]+$/.test(result) && !result.includes('..')) return result;
  try {
    const url = new URL(result);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error();
    if (url.hostname === 'drive.google.com' || url.hostname === 'docs.google.com') {
      const id = url.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] || url.searchParams.get('id');
      if (id) return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w2000';
    }
    return url.href;
  } catch {}
  throw new InputError('Use an HTTPS image link, a Google Drive file link, or a local /photos/ image path. Drive files must be shared so anyone with the link can view them.');
}
export function validateCollection(input: unknown): Omit<GalleryCollection, 'id' | 'updatedAt'> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InputError('Invalid collection.');
  const v = input as Record<string, unknown>;
  if (!Array.isArray(v.photos) || v.photos.length < 1 || v.photos.length > 100) throw new InputError('Add between 1 and 100 photos.');
  const photos = v.photos.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new InputError('Invalid photo.');
    const p = raw as Record<string, unknown>;
    return { id: text(p.id, 'Photo ID', 100, true), url: imageUrl(p.url), alt: text(p.alt, 'Photo description', 300, true), title: text(p.title ?? '', 'Photo title', 160), description: text(p.description ?? '', 'Slide story', 3000) };
  });
  if (new Set(photos.map(photo => photo.id)).size !== photos.length) throw new InputError('Photo IDs must be unique.');
  if (typeof v.published !== 'boolean') throw new InputError('Choose draft or published.');
  if (typeof v.order !== 'number' || !Number.isInteger(v.order) || v.order < 0 || v.order > 10000) throw new InputError('Display order must be a whole number between 0 and 10000.');
  const date = text(v.date ?? '', 'Date', 10);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date)) throw new InputError('Enter a valid date.');
  return { title: text(v.title, 'Collection title', 160, true), category: text(v.category, 'Category', 60, true), summary: text(v.summary ?? '', 'Summary', 400), story: text(v.story ?? '', 'Story', 16000), coverUrl: imageUrl(v.coverUrl), date, location: text(v.location ?? '', 'Location', 160), published: v.published, order: v.order, photos };
}
export function validId(id: string) { return /^[a-zA-Z0-9_-]{1,100}$/.test(id); }
