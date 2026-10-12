import {createHash} from 'node:crypto';
import {getAdminFirestore} from '@/lib/firebase-admin';
import {apiError,HttpError} from '@/lib/admin-access';
import {giveawayMonth,validateEntry} from '@/lib/giveaway';
export const runtime='nodejs';
export async function GET(){try{const month=giveawayMonth();const doc=await getAdminFirestore().collection('giveawayMonths').doc(month).get();return Response.json({month,closed:doc.data()?.closed===true},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>14000)throw new HttpError(413,'Your entry is too long.');
 let entry;try{entry=validateEntry(JSON.parse(raw));}catch(e){throw new HttpError(400,e instanceof Error?e.message:'Invalid entry.');}
 const month=giveawayMonth(),db=getAdminFirestore(),id=createHash('sha256').update(month+':'+entry.email).digest('hex'),ref=db.collection('giveawayEntries').doc(id);
 await db.runTransaction(async tx=>{const round=await tx.get(db.collection('giveawayMonths').doc(month));const existing=await tx.get(ref);if(round.data()?.closed)throw new HttpError(409,'Entries for this month are closed. Please return next month.');if(existing.exists)throw new HttpError(409,'An entry with this email has already been received this month.');tx.create(ref,{...entry,month,status:'new',notes:'',createdAt:new Date().toISOString()});});
 return Response.json({message:'Your wedding is registered for '+month+'. Chap Nic will contact you about your entry. Please check your spam folder if you have not heard within a week.'},{status:201});
 }catch(e){return apiError(e);}}
