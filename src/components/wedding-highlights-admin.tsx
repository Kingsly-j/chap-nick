'use client';
import { useEffect, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import type { GalleryPhoto } from '@/lib/collection-schema';

const blank=():GalleryPhoto=>({id:crypto.randomUUID(),url:'',alt:'',title:'',description:''});

export default function WeddingHighlightsAdmin({user}:{user:User}){
  const [photos,setPhotos]=useState<GalleryPhoto[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('Loading wedding highlights…');
  useEffect(()=>{
    let active=true;
    user.getIdToken().then(token=>fetch('/api/wedding-highlights',{headers:{Authorization:'Bearer '+token}}))
      .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Could not load highlights.');if(active){setPhotos(data.photos);setMessage(data.photos.length?'':'Add photos to feature them above the wedding collections.');}})
      .catch(error=>{if(active)setMessage(error instanceof Error?error.message:'Could not load highlights.');});
    return()=>{active=false;};
  },[user]);
  async function save(event:FormEvent){
    event.preventDefault();setBusy(true);setMessage('');
    try{
      const response=await fetch('/api/wedding-highlights',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify({photos})});
      const data=await response.json();if(!response.ok)throw Error(data.error||'Could not save highlights.');
      setPhotos(data.photos);setMessage('Wedding highlights saved.');
    }catch(error){setMessage(error instanceof Error?error.message:'Could not save highlights.');}finally{setBusy(false);}
  }
  function move(index:number,step:number){const next=index+step;if(next<0||next>=photos.length)return;setPhotos(items=>{const reordered=[...items];[reordered[index],reordered[next]]=[reordered[next],reordered[index]];return reordered;});}
  return <section className="highlight-admin"><h2>Wedding photo carousel</h2><p>These photos appear before the wedding collections. Add images from different weddings, then save your changes.</p>
    <form onSubmit={save}><div className="highlight-admin-list">{photos.map((photo,index)=><article key={photo.id}><img src={photo.url||'/photos/weddings-01.jpg'} alt=""/><div><strong>Photo {index+1}</strong><label>Image URL<input value={photo.url} required onChange={event=>setPhotos(items=>items.map(item=>item.id===photo.id?{...item,url:event.target.value}:item))} placeholder="https://... or /photos/image.jpg"/></label><label>Image description<input value={photo.alt} required maxLength={300} onChange={event=>setPhotos(items=>items.map(item=>item.id===photo.id?{...item,alt:event.target.value}:item))} placeholder="Describe the wedding photo"/></label><label>Short caption <small>(optional)</small><input value={photo.title} maxLength={160} onChange={event=>setPhotos(items=>items.map(item=>item.id===photo.id?{...item,title:event.target.value}:item))}/></label><button type="button" className="secondary" disabled={busy||index===0} onClick={()=>move(index,-1)} aria-label={'Move photo '+(index+1)+' earlier'}>Move earlier</button><button type="button" className="secondary" disabled={busy||index===photos.length-1} onClick={()=>move(index,1)} aria-label={'Move photo '+(index+1)+' later'}>Move later</button><button type="button" className="danger-text" disabled={busy} onClick={()=>setPhotos(items=>items.filter(item=>item.id!==photo.id))}>Remove photo</button></div></article>)}</div>
    {photos.length<40&&<button type="button" className="secondary" disabled={busy} onClick={()=>setPhotos(items=>[blank(),...items])}>+ Add wedding photo</button>}
    <div className="highlight-admin-save"><button type="submit" disabled={busy}>{busy?'Saving…':'Save carousel'}</button><button type="button" className="secondary" disabled={busy||!photos.length} onClick={()=>{if(confirm('Remove all photos from the wedding carousel?'))setPhotos([]);}}>Clear all</button></div>
    {message&&<p role="status">{message}</p>}</form>
  </section>;
}
