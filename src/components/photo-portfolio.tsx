'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { GalleryCollection, GalleryPhoto } from '@/lib/collection-schema';

type PortfolioPhoto=GalleryPhoto&{collectionTitle:string;category:string};

export default function PhotoPortfolio(){
  const [photos,setPhotos]=useState<PortfolioPhoto[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [current,setCurrent]=useState(0);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const controller=new AbortController();fetch('/api/collections',{signal:controller.signal,cache:'no-store'}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Could not load the portfolio.');const collections=(data.collections as GalleryCollection[]).filter(collection=>collection.category!=='Weddings');setPhotos(collections.flatMap(collection=>collection.photos.map(photo=>({...photo,collectionTitle:collection.title,category:collection.category}))));}).catch(error=>{if(error.name!=='AbortError')setError(error instanceof Error?error.message:'Could not load the portfolio.');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[]);
  function step(direction:number){setCurrent(value=>(value+direction+photos.length)%photos.length);}
  const photo=photos[current];
  return <main className="photo-portfolio"><header className="collection-nav"><Link href="/" className="wordmark">chap nic<span>PICTURES</span></Link><Link href="/admin" className="portfolio-manage">Manage portfolio &#8599;</Link></header><section className="portfolio-intro"><p className="eyebrow">CHAP NIC PICTURES / PORTRAITS &amp; EVENTS</p><h1>Beyond the<br/><em>wedding day.</em></h1><p>Portraits, celebrations and moments worth keeping.</p></section>{loading&&<p className="gallery-status">Loading portfolio photos…</p>}{error&&<p role="alert" className="gallery-status">{error}</p>}{!loading&&!error&&photos.length===0&&<p className="gallery-status">Portfolio photos are being prepared.</p>}{photos.length>0&&<section className="portfolio-photo-grid" aria-label="Portrait and event photographs">{photos.map((item,index)=><button type="button" key={item.id+'-'+index} onClick={()=>{setCurrent(index);dialog.current?.showModal();}} aria-label={'View '+item.alt}><img src={item.url} alt={item.alt} loading="lazy"/><span>{item.collectionTitle} / {item.category}</span></button>)}</section>}
  {photo&&<dialog className="portfolio-viewer" ref={dialog} aria-label="Portfolio photo viewer" onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}}><header><div><span>{photo.collectionTitle}</span><small>{photo.category} / {current+1} OF {photos.length}</small></div><button type="button" onClick={()=>dialog.current?.close()}>Close &#215;</button></header><div className="portfolio-viewer-main"><button type="button" onClick={()=>step(-1)} aria-label="Previous photo">&#8592;</button><img src={photo.url} alt={photo.alt}/><button type="button" onClick={()=>step(1)} aria-label="Next photo">&#8594;</button></div>{photo.title&&<h2>{photo.title}</h2>}{photo.description&&<p>{photo.description}</p>}</dialog>}
  </main>;
}
