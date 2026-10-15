import { requireAdmin, apiError, readJson, HttpError, privateHeaders } from '@/lib/admin-access';
import { validateCollection, validId } from '@/lib/collection-schema';
import { COLLECTION_PATH } from '@/lib/gallery-store';
import { getAdminFirestore } from '@/lib/firebase-admin';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await context.params;
    if (!validId(id)) throw new HttpError(400, 'Invalid collection ID.');
    const data = validateCollection(await readJson(request));
    const ref = getAdminFirestore().collection(COLLECTION_PATH).doc(id);
    const updatedAt = new Date().toISOString();
    let collection = { ...data, id, createdAt: updatedAt, updatedAt };
    await getAdminFirestore().runTransaction(async transaction => {
      const old = await transaction.get(ref);
      if (!old.exists) throw new HttpError(404, 'Collection not found.');
      collection = { ...collection, createdAt: old.data()?.createdAt || old.data()?.updatedAt || updatedAt };
      transaction.set(ref, { ...collection, updatedBy: admin.uid });
    });
    return Response.json({ collection }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    if (!validId(id)) throw new HttpError(400, 'Invalid collection ID.');
    await getAdminFirestore().collection(COLLECTION_PATH).doc(id).delete();
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
