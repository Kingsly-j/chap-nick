'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { GalleryCollection } from '@/lib/collection-schema';

export default function CollectionStory({ collection }: { collection: GalleryCollection }) {
  const [current,setCurrent]=useState(0);
  const [playing,setPlaying]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const photo=collection.photos[current];
  useEffect(()=>{
    if(!playing)return;
    const timer=setInterval(()=>{if(!document.hidden)setCurrent(value=>(value+1)%collection.photos.length);},5000);
    return()=>clearInterval(timer);
  },[playing,collection.photos.length]);
  function step(direction:number){setCurrent(value=>(value+direction+collection.photos.length)%collection.photos.length);}
  function open(index:number,play=false){setCurrent(index);setPlaying(play);dialog.current?.showModal();}
  return <main className="collection-page">
    <header className="collection-nav"><Link href="/" className="wordmark">chap nic<span>PICTURES</span></Link><Link href="/weddings">Recent weddings &#8599;</Link></header>
    <section className="collection-hero"><img src={collection.coverUrl} alt={collection.title} fetchPriority="high"/><div className="collection-hero-shade"/><div className="collection-hero-copy"><p className="eyebrow">{collection.category} / {collection.photos.length} FRAMES</p><h1>{collection.title}</h1><p>{collection.summary}</p><button onClick={()=>open(0,true)}>Play the collection &#9655;</button></div></section>
    <section className="collection-narrative"><aside><p className="eyebrow">THE STORY</p>{collection.date&&<p>{new Date(collection.date+'T12:00:00Z').toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</p>}{collection.location&&<p>{collection.location}</p>}<span>{collection.category}</span></aside><div><h2>More than<br /><em>a moment.</em></h2>{collection.story?collection.story.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>):<p>{collection.summary}</p>}</div></section>
    <section className="collection-frames"><div className="section-heading"><h2>The <em>frames.</em></h2><p>Click a photograph to step inside.<br />Use the arrow keys to explore.</p></div><div className="collection-photo-grid">{collection.photos.map((item,index)=><figure key={item.id}><button onClick={()=>open(index)} aria-label={'View '+(item.title||'photo '+(index+1))}><img src={item.url} alt={item.alt} loading="lazy"/><span>VIEW FRAME &#8599;</span></button><figcaption><small>{String(index+1).padStart(2,'0')}</small><div>{item.title&&<h3>{item.title}</h3>}{item.description&&<p>{item.description}</p>}</div></figcaption></figure>)}</div></section>
    <footer className="collection-end"><p className="eyebrow">THE STORY CONTINUES.</p><h2>What will yours<br /><em>look like?</em></h2><Link className="pill-link" href="/contact#contact-form">Let&apos;s make something meaningful &#8599;</Link><Link href="/weddings">Explore recent weddings &#8594;</Link></footer>
    <dialog className="story-viewer" ref={dialog} aria-label={collection.title+' slideshow'} onClose={()=>setPlaying(false)} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}}>
      <div className="story-viewer-header"><span>{collection.title}</span><div><button onClick={()=>setPlaying(!playing)} aria-pressed={playing}>{playing?'Pause slideshow':'Play slideshow'}</button><button autoFocus onClick={()=>dialog.current?.close()} aria-label="Close slideshow">Close &#215;</button></div></div>
      <div className="story-viewer-main"><img src={photo.url} alt={photo.alt}/><aside><p className="eyebrow">{collection.category}</p><h2>{photo.title||collection.title}</h2><p>{photo.description||photo.alt}</p></aside></div>
      <div className="story-viewer-controls"><button onClick={()=>step(-1)} aria-label="Previous photo">&#8592; Previous</button><span aria-live={playing?'off':'polite'}>{current+1} / {collection.photos.length}</span><button onClick={()=>step(1)} aria-label="Next photo">Next &#8594;</button></div>
    </dialog>
  </main>;
}
