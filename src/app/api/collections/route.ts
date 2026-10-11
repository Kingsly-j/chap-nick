import { listCollections } from '@/lib/gallery-store';
import { apiError } from '@/lib/admin-access';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return Response.json({ collections: await listCollections() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return apiError(error); }
}
