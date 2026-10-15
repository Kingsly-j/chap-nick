import { requireAdmin, apiError, readJson, privateHeaders } from '@/lib/admin-access';
import { validateCollection } from '@/lib/collection-schema';
import { listCollections, COLLECTION_PATH } from '@/lib/gallery-store';
import { getAdminFirestore } from '@/lib/firebase-admin';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try { await requireAdmin(request); return Response.json({ collections: await listCollections(true) }, { headers: privateHeaders }); } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const data = validateCollection(await readJson(request));
    const ref = getAdminFirestore().collection(COLLECTION_PATH).doc();
    const createdAt = new Date().toISOString();
    const collection = { ...data, id: ref.id, createdAt, updatedAt: createdAt };
    await ref.create({ ...collection, updatedBy: admin.uid });
    return Response.json({ collection }, { status: 201, headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
