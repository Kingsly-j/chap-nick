'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { GalleryCollection } from '@/lib/collection-schema';

const aliases: Record<string,string> = {weddings:'Weddings',portraits:'Portraits',events:'Events',architecture:'Architecture',baby:'Baby & family'};
export default function StoryGallery({ category = 'all', onCategoryChange }: { category?: string; onCategoryChange: (category: string) => void }) {
  const [items,setItems]=useState<GalleryCollection[]>([]);
  const selected = aliases[category] || category;
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/collections',{signal:controller.signal,cache:'no-store'}).then(async response=>{
      const data=await response.json();
      if(!response.ok)throw new Error(data.error || 'Could not load the collections.');
      setItems(data.collections);
    }).catch(error=>{if(error.name!=='AbortError')setError('The collections could not be loaded. Please try again.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[attempt]);
  const categories=[...new Set(items.map(item=>item.category))];
  const visible=items.filter(item=>selected==='all'||item.category===selected);
  return <section id="archive" className="archive section-pad">
    <div className="section-heading"><div><p className="eyebrow">THE STORIES BEHIND THE FRAMES</p><h2>Every collection.<br /><em>A world of its own.</em></h2></div><p>Choose a story. Step inside.<br />Stay for the moments in between.</p></div>
    <div className="archive-filters" role="group" aria-label="Filter collections"><button aria-pressed={selected==='all'} className={selected==='all'?'selected':''} onClick={()=>onCategoryChange('all')}>All stories <sup>{items.length}</sup></button>{categories.map(name=><button key={name} aria-pressed={selected===name} className={selected===name?'selected':''} onClick={()=>onCategoryChange(name)}>{name}</button>)}</div>
    {loading&&<p role="status" className="gallery-status">Opening the collection room...</p>}
    {error&&<div role="alert" className="gallery-status"><p>{error}</p><button onClick={()=>{setLoading(true);setError('');setAttempt(value=>value+1);}}>Try again</button></div>}
    {!loading&&!error&&<><div className="collection-grid">{visible.map((collection,index)=><Link key={collection.id} className="collection-story-card" href={'/gallery/'+collection.id}><div className="collection-cover"><img src={collection.coverUrl} alt={collection.title} loading="lazy"/><span className="collection-category">{collection.category}</span><span className="collection-open">OPEN THE STORY &#8599;</span></div><div className="collection-card-copy"><small>{String(index+1).padStart(2,'0')} / {collection.photos.length} FRAMES</small><h3>{collection.title}</h3><p>{collection.summary}</p>{collection.location&&<span>{collection.location}</span>}</div></Link>)}</div>{visible.length===0&&<p className="gallery-status">No published stories in this category yet.</p>}</>}
    <div className="archive-bottom"><span>MORE THAN PHOTOGRAPHS. STORIES WORTH KEEPING.</span><Link className="text-link" href="/admin">Studio access &#8599;</Link></div>
  </section>;
}
