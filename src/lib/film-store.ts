import 'server-only';
import films from './films.json';
import { getAdminFirestore } from './firebase-admin';
import { validateFilmList, type Film } from './film-schema';

const CONFIG_PATH = 'studioSettings';
const FILM_DOC = 'films';

export async function listFilms(): Promise<Film[]> {
  const snapshot = await getAdminFirestore().collection(CONFIG_PATH).doc(FILM_DOC).get();
  if (!snapshot.exists) return validateFilmList(films);
  return validateFilmList(snapshot.data()?.items);
}

export async function saveFilms(items: unknown, updatedBy: string): Promise<Film[]> {
  const cleaned = validateFilmList(items);
  await getAdminFirestore().collection(CONFIG_PATH).doc(FILM_DOC).set({ items: cleaned, updatedBy, updatedAt: new Date().toISOString() });
  return cleaned;
}
