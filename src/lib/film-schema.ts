import { InputError } from './collection-schema';

export type Film = { id: string; title: string; poster: string; embedUrl: string };

function httpsUrl(value: unknown, label: string) {
  if (typeof value !== 'string' || value.length > 2048) throw new InputError(label + ' must be a valid HTTPS URL.');
  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {}
  throw new InputError(label + ' must be a valid HTTPS URL.');
}

export function validateFilmList(value: unknown): Film[] {
  if (!Array.isArray(value) || value.length > 100) throw new InputError('Add up to 100 films.');
  const films = value.map((item): Film => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new InputError('Invalid film details.');
    const film = item as Record<string, unknown>;
    const id = typeof film.id === 'string' ? film.id.trim() : '';
    const title = typeof film.title === 'string' ? film.title.trim() : '';
    if (!/^[a-zA-Z0-9_-]{3,80}$/.test(id)) throw new InputError('Enter a valid YouTube video ID for each film.');
    if (!title || title.length > 160) throw new InputError('Film titles must be between 1 and 160 characters.');
    return { id, title, poster: httpsUrl(film.poster, 'Poster URL'), embedUrl: httpsUrl(film.embedUrl, 'Embed URL') };
  });
  if (new Set(films.map(film => film.id)).size !== films.length) throw new InputError('Each film must use a different YouTube video ID.');
  return films;
}
