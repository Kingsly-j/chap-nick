'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import type {GalleryCollection} from '@/lib/collection-schema';
export default function RecentWeddingStrip(){
 const [items,setItems]=useState<GalleryCollection[]>([]);
 const track=useRef<HTMLDivElement>(null);
 useEffect(()=>{const c=new AbortController();async function refresh(){try{const r=await fetch('/api/collections',{cache:'no-store',signal:c.signal});if(!r.ok)return;const d=await r.json();setItems(d.collections.filter((x:GalleryCollection)=>x.category==='Weddings'&&x.published));}catch{ /* Keep the fallback or last successfully loaded collections. */ }}void refresh();const onFocus=()=>{void refresh();};window.addEventListener('focus',onFocus);return()=>{c.abort();window.removeEventListener('focus',onFocus);};},[]);
 function move(direction:number){const el=track.current;if(el)el.scrollBy({left:direction*((el.firstElementChild?.getBoundingClientRect().width||300)+24),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 if(!items.length)return <Link href="/weddings" className="wedding-preview"><img src="/photos/weddings-06.jpg" alt="A wedding party dressed in white outside a grand entrance" loading="lazy"/><span>THE WEDDING STORIES &#8599;</span></Link>;
 return <><div className="recent-wedding-track" ref={track} role="region" aria-label="Recent wedding collections" tabIndex={0}>{items.map(item=><Link href={'/gallery/'+item.id} className="recent-wedding-card" key={item.id}><div><img src={item.coverUrl} alt={item.title} loading="lazy"/><span>OPEN THE STORY &#8599;</span></div><small>{item.photos.length} PHOTOGRAPHS{item.location?' / '+item.location:''}</small><h3>{item.title}</h3><p>{item.summary}</p></Link>)}</div>{items.length>1&&<div className="portrait-controls"><span>Swipe through the wedding stories</span><div><button aria-label="Previous wedding collections" onClick={()=>move(-1)}>&#8592;</button><button aria-label="Next wedding collections" onClick={()=>move(1)}>&#8594;</button></div></div>}</>;
}
