'use client';
import {useRef} from 'react';
import Link from 'next/link';
import media from '@/lib/media.json';
export default function PortraitGallery(){
 const track=useRef<HTMLDivElement>(null);
 function move(direction:number){const el=track.current;if(el)el.scrollBy({left:direction*((el.firstElementChild?.getBoundingClientRect().width||250)+16),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 return <section className="compact-portraits section-pad" aria-labelledby="portrait-gallery-title"><div className="section-heading"><div><p className="eyebrow">A FEW PORTRAITS</p><h2 id="portrait-gallery-title">Simply <em>you.</em></h2></div><Link className="text-link" href="/contact">Book a portrait session &#8599;</Link></div><div className="portrait-track" ref={track} tabIndex={0} role="region" aria-label="Portrait photo gallery">{media.portraits.slice(0,6).map((photo,i)=><figure key={photo.src}><img src={photo.src} alt={photo.alt} loading="lazy"/><figcaption>PORTRAIT / {String(i+1).padStart(2,'0')}</figcaption></figure>)}</div><div className="portrait-controls"><span>Swipe to explore the portraits</span><div><button onClick={()=>move(-1)} aria-label="Previous portraits">&#8592;</button><button onClick={()=>move(1)} aria-label="Next portraits">&#8594;</button></div></div></section>;
}