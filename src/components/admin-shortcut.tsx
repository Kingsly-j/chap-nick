'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {getAuth,signInWithEmailAndPassword,sendPasswordResetEmail} from 'firebase/auth';
import {getFirebaseApp} from '@/lib/firebase';
export default function AdminShortcut(){
 const dialog=useRef<HTMLDialogElement>(null),pathname=usePathname(),router=useRouter();
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(pathname.startsWith('/admin'))return;let buffer='',last=0;
 const key=(event:KeyboardEvent)=>{
 const target=event.target instanceof Element?event.target:null;
 if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing||event.repeat||target?.closest('form,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')||dialog.current?.open||document.querySelector('dialog[open]')){buffer='';return;}
 if(event.key.length!==1){buffer='';return;}
 const now=Date.now();if(now-last>1800)buffer='';last=now;buffer=(buffer+event.key.toLowerCase()).slice(-4);
 if(buffer==='nick'){buffer='';setMessage('');setPassword('');dialog.current?.showModal();}
 };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[pathname]);
 return <dialog ref={dialog} className="admin-login-popup" aria-labelledby="shortcut-title" onClose={()=>setPassword('')}><div className="shortcut-top"><span>CHAP NIC / PRIVATE STUDIO</span><button type="button" aria-label="Close admin login" onClick={()=>dialog.current?.close()}>Close &#215;</button></div><h2 id="shortcut-title">Welcome <em>back.</em></h2><p>Sign in to manage the studio.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{const credential=await signInWithEmailAndPassword(getAuth(getFirebaseApp()),email,password);const token=await credential.user.getIdToken(true);const response=await fetch('/api/admin/collections',{headers:{Authorization:'Bearer '+token}});if(!response.ok)throw Error('This account does not have access to the studio.');dialog.current?.close();router.push('/admin');}catch{setMessage('Unable to sign in. Check your credentials and administrator access, then try again.');}finally{setBusy(false);}}}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username" autoFocus/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label><button type="submit" disabled={busy}>{busy?'Signing in…':'Enter the studio'}</button><button type="button" disabled={busy} onClick={async()=>{if(!email){setMessage('Enter your email first.');return;}setBusy(true);try{await sendPasswordResetEmail(getAuth(getFirebaseApp()),email);setMessage('If the account exists, a password reset email will arrive shortly.');}catch{setMessage('Could not send a reset email. Check the address and try again.');}finally{setBusy(false);}}}>Reset password</button>{message&&<p role="status">{message}</p>}</form></dialog>;
}
