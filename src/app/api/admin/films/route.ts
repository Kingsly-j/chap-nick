import { apiError, privateHeaders, readJson, requireAdmin } from '@/lib/admin-access';
import { listFilms, saveFilms } from '@/lib/film-store';
import { InputError } from '@/lib/collection-schema';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try { await requireAdmin(request); return Response.json({ films: await listFilms() }, { headers: privateHeaders }); }
  catch (error) { return apiError(error); }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const body = await readJson(request) as { films?: unknown };
    const films = await saveFilms(body?.films, admin.uid);
    return Response.json({ films }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const body = await readJson(request) as { film?: { id?: unknown; title?: unknown } };
    if (typeof body?.film?.id !== 'string') throw new InputError('Enter a valid YouTube link or video ID.');
    const rawId = body.film.id.trim();
    let id = rawId;
    try {
      const url = new URL(rawId);
      if (url.protocol !== 'https:') throw new Error();
      if (url.hostname === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
      else if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com' || url.hostname === 'm.youtube.com' || url.hostname === 'youtube-nocookie.com' || url.hostname === 'www.youtube-nocookie.com') {
        if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
        else if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2] || '';
        else if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2] || '';
      }
    } catch {}
    if (!/^[a-zA-Z0-9_-]{3,80}$/.test(id)) throw new InputError('Paste a YouTube video URL or video ID.');
    const current = await listFilms();
    const films = await saveFilms([...current, { id, title: body.film.title, poster: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg', embedUrl: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0' }], admin.uid);
    return Response.json({ films }, { status: 201, headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
