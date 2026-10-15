'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import media from '@/lib/media.json';
export default function PortraitGallery(){
 const track=useRef<HTMLDivElement>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const [current,setCurrent]=useState(0);
 const photos=media.portraits.slice(0,6);
 function move(direction:number){const el=track.current;if(el)el.scrollBy({left:direction*((el.firstElementChild?.getBoundingClientRect().width||250)+16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 function step(direction:number){setCurrent(value=>(value+direction+photos.length)%photos.length);}
 return <section className="compact-portraits section-pad" aria-labelledby="portrait-gallery-title"><div className="section-heading"><div><h2 id="portrait-gallery-title">A FEW PORTRAITS</h2></div><Link className="text-link" href="/contact#contact-form">Book a portrait session &#8599;</Link></div><div className="portrait-track" ref={track} tabIndex={0} role="region" aria-label="Portrait photo gallery">{photos.map((photo,i)=><figure key={photo.src}><button type="button" onClick={()=>{setCurrent(i);dialog.current?.showModal();}} aria-label={'Expand portrait '+(i+1)}><img src={photo.src} alt={photo.alt} loading="lazy"/></button><figcaption>PORTRAIT / {String(i+1).padStart(2,'0')}</figcaption></figure>)}</div><div className="portrait-controls"><span>Swipe to explore the portraits</span><div><button onClick={()=>move(-1)} aria-label="Previous portraits">&#8592;</button><button onClick={()=>move(1)} aria-label="Next portraits">&#8594;</button></div></div><dialog className="highlight-viewer portrait-viewer" ref={dialog} aria-label="Portrait photo viewer" onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}}><header><span>PORTRAIT / {current+1} OF {photos.length}</span><button type="button" onClick={()=>dialog.current?.close()}>Close &#215;</button></header><div className="highlight-viewer-photo"><button type="button" onClick={()=>step(-1)} aria-label="Previous portrait">&#8592;</button><img src={photos[current].src} alt={photos[current].alt}/><button type="button" onClick={()=>step(1)} aria-label="Next portrait">&#8594;</button></div></dialog></section>;
}
