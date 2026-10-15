import { apiError, privateHeaders, readJson, requireAdmin, HttpError } from '@/lib/admin-access';
import { getWeddingHighlights, saveWeddingHighlights } from '@/lib/wedding-highlights';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
  try{return Response.json(await getWeddingHighlights(),{headers:{'Cache-Control':'no-store'}});}
  catch(error){return apiError(error);}
}

export async function PUT(request:Request){
  try{
    const admin=await requireAdmin(request);
    const body=await readJson(request) as {photos?:unknown};
    if(!body||!Array.isArray(body.photos))throw new HttpError(400,'Invalid wedding highlights.');
    const photos=await saveWeddingHighlights(body.photos,admin.uid);
    return Response.json({photos},{headers:privateHeaders});
  }catch(error){return apiError(error);}
}
