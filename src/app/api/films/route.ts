import { apiError } from '@/lib/admin-access';
import { listFilms } from '@/lib/film-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try { return Response.json({ films: await listFilms() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return apiError(error); }
}
