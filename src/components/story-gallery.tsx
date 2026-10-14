'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { GalleryCollection } from '@/lib/collection-schema';

export default function StoryGallery() {
  const [items,setItems]=useState<GalleryCollection[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  const archive=useRef<HTMLElement>(null);
  const visible=items.filter(item=>item.category==='Weddings').sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.order-b.order);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/collections',{signal:controller.signal,cache:'no-store'}).then(async response=>{
      const data=await response.json();
      if(!response.ok)throw new Error(data.error || 'Could not load the collections.');
      setItems(data.collections);
    }).catch(error=>{if(error.name!=='AbortError')setError(error instanceof Error&&error.message?error.message:'The collections could not be loaded. Please try again.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[attempt]);
  useEffect(()=>{
    if(loading||error||!visible.length)return;
    const frame=requestAnimationFrame(()=>{
      const element=archive.current;
      if(!element)return;
      const top=element.getBoundingClientRect().top+window.scrollY;
      const firstCard=element.querySelector<HTMLElement>('.collection-story-card');
      const target=firstCard?top+firstCard.offsetTop+firstCard.offsetHeight*.3:top;
      window.scrollTo({top:Math.max(0,target-window.innerHeight*.7),behavior:'instant'});
    });
    return()=>cancelAnimationFrame(frame);
  },[loading,error,items]);
  return <section ref={archive} id="archive" className="archive section-pad">
    <div className="section-heading"><div><p className="eyebrow">THE STORIES BEHIND THE FRAMES</p><h2>Every wedding.<br /><em>A story of its own.</em></h2></div><p>Choose a story. Step inside.<br />Stay for the moments in between.</p></div>
    {loading&&<p role="status" className="gallery-status">Opening the collection room...</p>}
    {error&&<div role="alert" className="gallery-status"><p>{error}</p><button onClick={()=>{setLoading(true);setError('');setAttempt(value=>value+1);}}>Try again</button></div>}
    {!loading&&!error&&<><div className="collection-grid">{visible.map((collection,index)=><Link key={collection.id} className="collection-story-card" href={'/gallery/'+collection.id}><div className="collection-cover"><img src={collection.coverUrl} alt={collection.title} loading="lazy"/><span className="collection-category">{collection.category}</span><span className="collection-open">OPEN THE STORY &#8599;</span></div><div className="collection-card-copy"><small>{String(index+1).padStart(2,'0')} / {collection.photos.length} FRAMES</small><h3>{collection.title}</h3><p>{collection.summary}</p>{collection.location&&<span>{collection.location}</span>}</div></Link>)}</div>{visible.length===0&&<p className="gallery-status">Wedding stories are being prepared. Come back soon.</p>}</>}
    <div className="archive-bottom"><span>MORE THAN PHOTOGRAPHS. STORIES WORTH KEEPING.</span></div>
  </section>;
}
