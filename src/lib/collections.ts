import media from './media.json';

export type Photo = { src: string; alt: string; width: number; height: number };
export type Collection = { id: string; number: string; title: string; phrase: string; description: string; url: string; photos: Photo[] };
const base = 'https://chapnicpictures.pixieset.com/chapnicpicturesportfolio';
const definitions = [
  { id: 'weddings', title: 'Weddings', phrase: 'Before forever,\na moment.', description: 'The anticipation. The quiet looks. The joy that refuses to stay still.' },
  { id: 'portraits', title: 'Portraits', phrase: 'Come as\nyou are.', description: 'A little light, a little trust. And something unmistakably you.' },
  { id: 'events', title: 'Events', phrase: 'You had\nto be there.', description: 'The energy of a room. The people who give a gathering its soul.' },
  { id: 'architecture', title: 'Architecture', phrase: 'Spaces with\nsomething to say.', description: 'Following the conversation between light, form, and the spaces we inhabit.' },
  { id: 'baby', title: 'Little beginnings', phrase: 'Small hands.\nWhole worlds.', description: 'The first chapters of a story that is only just beginning.' },
  { id: 'videos', title: 'Motion pictures', phrase: 'Some stories\nneed to move.', description: 'For the voices, the movement, and everything a single frame cannot hold.' },
];
export const collections: Collection[] = definitions.map((item, index) => ({
  ...item, number: String(index + 1).padStart(2, '0'), url: base + '/' + item.id + '/',
  photos: (media as Record<string, Photo[]>)[item.id] ?? [],
}));
export const allPhotos = collections.filter(c => c.id !== 'videos').flatMap(c => c.photos.slice(0, 10).map(p => ({ ...p, category: c.id, categoryTitle: c.title })));
