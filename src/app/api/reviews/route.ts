import { createHash } from 'node:crypto';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { apiError, HttpError } from '@/lib/admin-access';
export const runtime='nodejs';
export async function GET() {
 try { const rows=await getAdminFirestore().collection('reviews').where('status','==','approved').limit(100).get();
 return Response.json({reviews:rows.docs.map(d=>{const r=d.data();return {id:d.id,name:r.name,text:r.text,rating:r.rating,createdAt:r.createdAt};}).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))},{headers:{'Cache-Control':'no-store'}}); }catch(e){return apiError(e);}
}
export async function POST(request:Request) {
 try {
 const raw=await request.text();if(raw.length>8000)throw new HttpError(413,'Please keep your review under 2,000 characters.');
 let data;try{data=JSON.parse(raw);}catch{throw new HttpError(400,'Invalid review.');}
 if(!data||typeof data!=='object'||typeof data.name!=='string'||typeof data.text!=='string'||!Number.isInteger(data.rating)||data.rating<1||data.rating>5)throw new HttpError(400,'Add your name, review and a rating from 1 to 5.');
 const name=data.name.trim(),text=data.text.trim();
 if(name.length<2||name.length>80||text.length<10||text.length>2000||data.website)throw new HttpError(400,'Use a name of 2–80 characters and a review of 10–2,000 characters.');
 const id=createHash('sha256').update(name.toLowerCase()+'\n'+text.toLowerCase()).digest('hex');
 const db=getAdminFirestore(),ref=db.collection('reviews').doc(id);
 await db.runTransaction(async tx=>{if((await tx.get(ref)).exists)throw new HttpError(409,'This review has already been submitted.');tx.create(ref,{name,text,rating:data.rating,status:'pending',createdAt:new Date().toISOString()});});
 return Response.json({message:'Thank you! Your review has been submitted for approval.'},{status:201});
 }catch(e){return apiError(e);}
}