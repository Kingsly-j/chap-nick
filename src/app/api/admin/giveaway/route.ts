import {getAdminFirestore} from '@/lib/firebase-admin';
import {requireAdmin,apiError,HttpError,privateHeaders,readJson} from '@/lib/admin-access';
import {giveawayMonth} from '@/lib/giveaway';
export const runtime='nodejs';
export async function GET(request:Request){try{await requireAdmin(request);const month=new URL(request.url).searchParams.get('month')||giveawayMonth();if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new HttpError(400,'Invalid month.');const db=getAdminFirestore();const [rows,round]=await Promise.all([db.collection('giveawayEntries').where('month','==',month).get(),db.collection('giveawayMonths').doc(month).get()]);return Response.json({month,winnerId:round.data()?.winnerId||'',entries:rows.docs.map(d=>({...d.data(),id:d.id}))},{headers:privateHeaders});}catch(e){return apiError(e);}}
export async function PATCH(request:Request){try{const admin=await requireAdmin(request),d=await readJson(request);if(!d||typeof d.id!=='string'||!/^[a-f0-9]{64}$/.test(d.id)||!['new','contacted','shortlisted','runner-up','winner','not-selected'].includes(d.status)||typeof d.notes!=='string'||d.notes.length>4000)throw new HttpError(400,'Invalid entry update.');
 const db=getAdminFirestore(),ref=db.collection('giveawayEntries').doc(d.id);
 await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)throw new HttpError(404,'Entry not found.');const roundRef=db.collection('giveawayMonths').doc(snap.data()!.month),round=await tx.get(roundRef),previousId=round.data()?.winnerId;const previous=d.status==='winner'&&previousId&&previousId!==d.id?await tx.get(db.collection('giveawayEntries').doc(previousId)):null;
 if(previous?.exists)tx.update(previous.ref,{status:'shortlisted'});
 if(d.status==='winner')tx.set(roundRef,{winnerId:d.id,closed:true,selectedAt:new Date().toISOString(),selectedBy:admin.uid},{merge:true});
 else if(previousId===d.id)throw new HttpError(400,'Choose a different winner to replace the current winner.');
 tx.update(ref,{status:d.status,notes:d.notes,updatedBy:admin.uid});
 });return Response.json({ok:true},{headers:privateHeaders});}catch(e){return apiError(e);}}
