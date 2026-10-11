'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {getAuth,onAuthStateChanged,type User} from 'firebase/auth';
import {getFirebaseApp} from '@/lib/firebase';
type Review={id:string;name:string;text:string;rating:number;status:string};
export default function ReviewModeration(){
 const [user,setUser]=useState<User|null>(null),[rows,setRows]=useState<Review[]>([]),[message,setMessage]=useState('Loading reviews…'),[busy,setBusy]=useState(false);
 useEffect(()=>onAuthStateChanged(getAuth(getFirebaseApp()),async u=>{setUser(u);if(!u){setMessage('Sign in to the studio to moderate reviews.');return;}try{const r=await fetch('/api/admin/reviews',{headers:{Authorization:'Bearer '+await u.getIdToken()}});const d=await r.json();if(!r.ok)throw Error(d.error);setRows(d.reviews);setMessage(d.reviews.length?'':'No reviews yet.');}catch(e){setMessage(e instanceof Error?e.message:'Unable to load reviews.');}}),[]);
 async function moderate(id:string,status:string){if(!user)return;setBusy(true);try{const r=await fetch('/api/admin/reviews',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify({id,status})});const d=await r.json();if(!r.ok)throw Error(d.error);setRows(items=>items.map(item=>item.id===id?{...item,status}:item));setMessage('Review '+status+'.');}catch(e){setMessage(e instanceof Error?e.message:'Update failed.');}finally{setBusy(false);}}
 return <main className="section-pad review-admin"><Link href="/admin">← Back to studio</Link><h1>Customer reviews</h1><p>Approve customer feedback to display it publicly, or hide it from the portfolio.</p><p role="status">{message}</p><div className="review-grid">{rows.map(r=><article className="review-card" key={r.id}><p>{r.status.toUpperCase()} · {r.rating}/5 stars</p><h2>{r.name}</h2><p>{r.text}</p><div className="moderation-actions"><button disabled={busy||r.status==='approved'} onClick={()=>moderate(r.id,'approved')}>Approve</button><button disabled={busy||r.status==='rejected'} onClick={()=>moderate(r.id,'rejected')}>Hide review</button></div></article>)}</div></main>;
}