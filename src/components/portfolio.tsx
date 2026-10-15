'use client';

import { useEffect, useRef, useState } from 'react';
import { collections } from '@/lib/collections';
import type { Film } from '@/lib/film-schema';
import StoryGallery from '@/components/story-gallery';
import Reviews from '@/components/reviews';
import PortraitGallery from '@/components/portrait-gallery';
import RecentWeddingStrip from '@/components/recent-wedding-strip';
import WeddingVideos from '@/components/wedding-videos';
import WeddingHighlights from '@/components/wedding-highlights';
import Link from 'next/link';

const slides = [
  {id:'first-wedding',title:'Wedding stories',photo:collections[0].photos[0]},
  {id:'second-wedding',title:'A wedding story',photo:{src:'/photos/c2.jpg',alt:'A wedding couple in formal attire outside a garden pavilion'}},
  {id:'third-wedding',title:'A wedding story',photo:{src:'/photos/c4.jpg',alt:'A wedding couple sharing a portrait beneath palm trees'}},
];
const pages=[{href:'/',label:'Home'},{href:'/weddings',label:'Recent weddings'},{href:'/portfolio',label:'Portfolio'},{href:'/videos',label:'Films'},{href:'/giveaway',label:'Giveaway'},{href:'/contact',label:'Contact'}];
const destination=(href:string)=>href==='/videos'?'/videos#films':href==='/contact'?'/contact#contact-form':href==='/giveaway'?'/giveaway#entry':href;
const email = 'chapnicpictures@gmail.com';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

export default function Portfolio({ page = 'home' }: { page?: 'home' | 'weddings' | 'videos' | 'contact' }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [motion, setMotion] = useState(true);
  const [menu, setMenu] = useState(false);
  const [featuredPlaying, setFeaturedPlaying] = useState(false);
  const [activeFilm, setActiveFilm] = useState<number | null>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [inquiry, setInquiry] = useState('Wedding');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryStory, setInquiryStory] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const weddingPhoto = collections[0].photos[4];
  const firstCollectionHref = collections[0].url;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setMotion(!preference.matches);
    apply();
    preference.addEventListener('change', apply);
    return () => preference.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!motion) return;
    const timer = setInterval(() => {
      if (!document.hidden) setActiveSlide(index => (index + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [motion]);

  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!elements) return;
    if (!motion) { elements.forEach(el => el.classList.add('revealed')); return; }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    elements.forEach(el => { if (!el.classList.contains('revealed')) observer.observe(el); });
    return () => observer.disconnect();
  }, [motion, page]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = 'scaleX(' + (total > 0 ? scrollY / total : 0) + ')';
      if (motion && root.current) {
        root.current.style.setProperty('--hero-shift', Math.min(scrollY * 0.22, 240) + 'px');
      }
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [motion]);

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menu);
    return () => document.body.classList.remove('menu-is-open');
  }, [menu]);

  useEffect(() => {
    if (page !== 'videos' && page !== 'contact') return;
    const targetId = page === 'videos' ? 'films' : 'contact-form';
    const frame = requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({block:'start'}));
    return () => cancelAnimationFrame(frame);
  }, [page]);

  useEffect(() => {
    if (page !== 'videos') return;
    setFilms([]);
    const controller = new AbortController();
    fetch('/api/films', {cache:'no-store',signal:controller.signal}).then(async response => {
      if (!response.ok) throw new Error('Could not load films.');
      const data = await response.json();
      setFilms(data.films);
    }).catch(() => setFilms([]));
    return () => controller.abort();
  }, [page]);



  useEffect(() => {
    const element = header.current;
    if (!element) return;
    let previous = window.scrollY;
    let timer: ReturnType<typeof setTimeout>;
    const hideLater = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { element.dataset.scrollVisible = 'false'; }, 1800);
    };
    const onScroll = () => {
      const next = Math.max(0, window.scrollY);
      if (Math.abs(next - previous) < 3) return;
      element.dataset.scrollVisible = next < previous ? 'true' : 'false';
      previous = next;
      hideLater();
    };
    hideLater();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, []);

  return <div ref={root} className={motion ? 'portfolio motion-enabled' : 'portfolio motion-disabled'}>
    <div ref={progress} className="reading-progress" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header ref={header} data-scroll-visible="true" className={'site-header '+(page!=='home'?'inner-header':'')}>
      <Link className="wordmark" href="/" aria-label="Chap Nic Pictures home">chap nic<span>PICTURES</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{pages.map(item=><Link key={item.href} href={destination(item.href)} className={item.href==='/contact'?'nav-booking-button':undefined} aria-current={(page==='home'?'/':'/'+page)===item.href?'page':undefined}>{item.href==='/contact'?'Book a session':item.label}</Link>)}</nav>
      <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-navigation" onClick={()=>setMenu(!menu)}>{menu?'Close':'Menu +'}</button>
    </header>
    {menu&&<nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation" onKeyDown={event=>{if(event.key==='Escape')setMenu(false);}}>{pages.map((item,index)=><Link key={item.href} href={destination(item.href)} onClick={()=>setMenu(false)}><small>0{index+1}</small>{item.label}<Arrow diagonal/></Link>)}</nav>}
    <main id="main" className={page!=='home'?'inner-page':undefined}>
      {page!=='home'&&<section className="page-intro"><p className="eyebrow">CHAP NIC PICTURES / {page==='weddings'?'THE WEDDING JOURNAL':page==='videos'?'IN MOTION':'YOUR NEXT CHAPTER'}</p><h1>{page==='weddings'?<>Recent <em>weddings.</em></>:page==='videos'?<>Feel it <em>again.</em></>:<>It begins with <em>hello.</em></>}</h1><p>{page==='weddings'?'The people, the promises, the beautifully unscripted. Open a collection to see the day unfold.':page==='videos'?'A place for the moments a photograph cannot hold. Press play and step back inside.':'Tell me about your day, your people, and what you want to remember.'}</p></section>}
      {page==='home'&&(<section className="hero" aria-label="Featured photography">
        <div className="hero-images" aria-hidden="true">
          {slides.map((slide, index) => <div key={slide.id} className={'hero-slide ' + (index === activeSlide ? 'is-active' : '')}><img src={slide.photo.src} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} /></div>)}
        </div>
        <div className="hero-shade" />
        <div className="hero-topline"><span>WEDDING / PHOTOGRAPHY / VIDEO / PORTRAITS</span><span>YAOUNDÉ, CAMEROON <i className="status-dot" /></span></div>
        <div className="hero-copy"><h1>Weddings.<br/><em>Photography.</em><br/><span className="hero-last">Video &amp; Portraits.</span></h1><div className="hero-caption"><Link className="hero-booking-button" href="/contact#contact-form">Book a session <Arrow diagonal/></Link><Link className="hero-giveaway-button" href="/giveaway#entry">Enter the wedding giveaway <Arrow diagonal/></Link></div></div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#featured-film-title"><span>↓</span>SCROLL TO FEEL SOMETHING</a>
          <div className="slide-picker" aria-label="Featured collection"><button className="hero-motion-toggle" onClick={() => setMotion(!motion)} aria-label={motion ? 'Pause motion' : 'Enable motion'}>{motion ? 'PAUSE' : 'PLAY'}</button>{slides.map((slide, index) => <button key={slide.id} onClick={() => setActiveSlide(index)} aria-label={'Show ' + slide.title} aria-pressed={activeSlide === index} className={activeSlide === index ? 'active' : ''}>0{index + 1}<span /></button>)}</div>
          <span className="hero-credit">{slides[activeSlide].title} / CHAP NIC PICTURES</span>
        </div>
      </section>)}





      {page==='home'&&<section className="featured-film section-pad" aria-labelledby="featured-film-title"><div className="section-heading"><div><h2 id="featured-film-title">Watch this<br/><em>before you book.</em></h2><p className="film-booking-caption">Some moments deserve motion.</p></div><Link className="text-link" href="/videos#films">Explore the films <Arrow diagonal/></Link></div><div className="film-stage">{featuredPlaying?<iframe src="https://www.youtube-nocookie.com/embed/WR7Sz3T-Qr0?autoplay=1&rel=0&playsinline=1" title="Featured wedding film by Chap Nic Pictures" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button className="film-poster" onClick={()=>setFeaturedPlaying(true)} aria-label="Play the featured wedding film"><img src="https://i.ytimg.com/vi/WR7Sz3T-Qr0/hqdefault.jpg" alt="Preview of the featured Chap Nic Pictures film" loading="lazy"/><span className="film-play">&#9655;</span><span className="film-poster-label">PLAY THE FEATURED FILM</span></button>}</div><a className="featured-film-external" href="https://youtu.be/WR7Sz3T-Qr0" target="_blank" rel="noreferrer">Watch on YouTube &#8599;</a></section>}

      {page==='home'&&<section className="photographer-story section-pad" aria-labelledby="photographer-story-title"><div className="story-portrait-column" data-reveal><div className="story-section-number" aria-hidden="true">01 / THE HUMAN SIDE</div><h2 id="photographer-story-title">Hello, I&apos;m<br/><em>Chap Nic.</em></h2><p className="photographer-story-note">Candid. Fun. Artistic.</p><figure className="story-editorial-photo"><img src="/photos/nick.jpeg" alt="Chap Nic holding his camera and flash" loading="lazy"/><figcaption>CHAP NIC</figcaption></figure><Link className="text-link" href="/contact#contact-form">I would love to chat <Arrow diagonal/></Link></div><div className="photographer-story-copy" data-reveal><div className="story-chapters"><span>FONTEM</span><i aria-hidden="true">&#8594;</i><span>A KONICA CAMERA</span><i aria-hidden="true">&#8594;</i><span>CHAP NIC PICTURES</span></div><p className="story-lead">Welcome to Chap Nic Pictures, where moments become timeless memories.</p><p>My journey into photography began at Our Lady of Seven Sorrows (OLSWC) boarding school in Fontem. While pursuing a career in medicine, my passion for photography grew as I captured school dances with my late father&apos;s Konica film camera.</p><p>This passion blossomed into a professional venture specializing in candid wedding and event photography.</p><blockquote>I believe the best wedding and event photographs are candid moments—unplanned, unposed, and authentically you.</blockquote><p>I later built a team offering hybrid wedding coverage, capturing photo and video at the same time. It remains one of my most popular packages.</p><p>If you&apos;re looking for a photographer with a candid, fun, and artistic approach, I&apos;d love to chat.</p><div className="story-signoff"><span>Chap Nic</span><small>PHOTOGRAPHER &amp; STORYTELLER</small></div><div className="hybrid-note"><span>PHOTO<br/>+ VIDEO</span><p>One team. Two ways to remember.<br/>Discover hybrid wedding coverage.</p><Link href="/contact#contact-form" aria-label="Enquire about hybrid wedding coverage">&#8599;</Link></div></div></section>}

      {page==='home'&&<section className="giveaway-banner section-pad"><div><p className="eyebrow">WEDDING SHOOT GIVEAWAY</p><h2 className="giveaway-offer">Enter for your chance to win <em>Wedding Photo Coverage.</em></h2></div><div><span className="giveaway-value"><small>VALUED AT</small>300k</span><Link className="pill-link" href={firstCollectionHref}>Explore the first collection &#8599;</Link></div></section>}



      {page==='home'&&<section className="home-weddings section-pad" data-reveal><div className="section-heading"><div><p className="eyebrow">YOUR PEOPLE. YOUR DAY. YOUR STORY.</p><h2>Recent<br/><em>Weddings.</em></h2><p className="section-subheading">Love, in its own words.</p></div><Link className="text-link" href="/weddings">Explore recent weddings <Arrow diagonal/></Link></div><WeddingHighlights/><RecentWeddingStrip/></section>}
      {page==='home'&&<WeddingVideos/>}

      {page==='home'&&<Reviews/>}




      {page==='home'&&<div className="marquee"  aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>Unplanned. <em>Unposed.</em> Unforgettable. <b>✦</b> </span>)}</div></div>}

      {page==='home'&&(<section className="interlude" aria-label="A moment to remember">
        {weddingPhoto && <img className="interlude-image" src={weddingPhoto.src} alt={weddingPhoto.alt} loading="lazy" />}
        <div className="interlude-shade" /><div className="interlude-copy" data-reveal><p className="eyebrow">THERE IS NO SECOND TAKE OF A FIRST FEELING.</p><h2>Less posing.<br /><em>More living.</em></h2><Link className="pill-link light" href="/weddings">Step inside a love story <Arrow diagonal /></Link></div><span className="interlude-foot">OBSERVE CLOSELY. FEEL DEEPLY. REMEMBER ALWAYS.</span>
      </section>)}

      {page==='weddings'&&<StoryGallery/>}

      {page==='videos'&&(<section id="films" className="films section-pad">
        <div className="section-heading" data-reveal><div><p className="eyebrow">THE WORLD DOES NOT STAND STILL.</p><h2>Neither do<br /><em>all our stories.</em></h2></div><p>{films.length} films from the collection.<br />Press play. Be there again.</p></div>
        <div className="film-stage">
          {films.length===0?<p className="gallery-status">Films are loading or are temporarily unavailable.</p>:activeFilm === null ? <button className="film-poster" onClick={() => setActiveFilm(0)} aria-label={'Play '+films[0].title}><img src={films[0].poster} alt="Preview of the Chap Nic Pictures film collection" loading="lazy" /><span className="film-play">&#9655;</span><span className="film-poster-label">{films[0].title} / PRESS PLAY</span></button> : <iframe key={films[activeFilm]?.id} src={films[activeFilm]?.embedUrl + '&autoplay=1'} title={films[activeFilm]?.title + ' by Chap Nic Pictures'} allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        </div>
        <div className="film-selector" role="group" aria-label="Choose a film">{films.map((film,index) => <button key={film.id} aria-pressed={activeFilm === index} className={activeFilm === index ? 'active' : ''} onClick={() => setActiveFilm(index)}><span>{film.title}</span><span>&#8599;</span></button>)}</div>
        <a className="text-link" href={collections[5].url} target="_blank" rel="noreferrer">Explore films on Pixieset <Arrow diagonal /></a>
      </section>)}



      {page==='contact'&&(<section id="contact" className="contact section-pad">
        <div className="contact-heading" data-reveal><p className="eyebrow">THE NEXT CHAPTER COULD BE YOURS.</p><h2>Let&apos;s make<br /><em>something</em><br />worth keeping<span className="accent">.</span></h2></div>
        <div className="contact-details" data-reveal><p className="contact-form-intro">A celebration. A new beginning.<br />An idea you can&apos;t stop thinking about.<br />I&apos;d love to hear it.</p>
          <form id="contact-form" onSubmit={event => {event.preventDefault();const body = 'Hello Chap Nic,\n\nMy name is ' + inquiryName + '. I am interested in ' + inquiry.toLowerCase() + ' photography.\nPreferred date: ' + (inquiryDate || 'To be discussed') + '\n\n' + inquiryStory;window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(inquiry + ' enquiry - ' + inquiryName) + '&body=' + encodeURIComponent(body);}}>
            <label htmlFor="inquiry-type">WHAT ARE WE CREATING?</label><select id="inquiry-type" value={inquiry} onChange={event => setInquiry(event.target.value)}>{['Wedding','Portrait','Wedding film'].map(item => <option key={item}>{item}</option>)}</select>
            <div className="form-row"><div><label htmlFor="inquiry-name">YOUR NAME</label><input id="inquiry-name" value={inquiryName} onChange={event => setInquiryName(event.target.value)} autoComplete="name" required placeholder="Your name" maxLength={100} /></div><div><label htmlFor="inquiry-date">A DATE IN MIND?</label><input id="inquiry-date" type="date" value={inquiryDate} onChange={event => setInquiryDate(event.target.value)} /></div></div>
            <label htmlFor="inquiry-story">A LITTLE ABOUT YOUR STORY</label><textarea id="inquiry-story" value={inquiryStory} onChange={event => setInquiryStory(event.target.value)} placeholder="The occasion, the place, the feeling..." rows={3} maxLength={3000} />
            <button className="inquiry-submit" type="submit">Start the conversation <Arrow diagonal /></button><p className="form-note">Opens your email app with your enquiry ready to send.</p>
          </form>
          <div className="direct-contact"><a href={'mailto:' + email}>{email} <Arrow diagonal /></a><a href="tel:+237693049990">+237 693 049 990 <Arrow diagonal /></a><span>SIMBOCK, YAOUNDÉ / CAMEROON</span></div>
        </div>
      </section>)}
      {page==='home'&&<><PortraitGallery/><section className="home-invitation section-pad" data-reveal><p className="eyebrow">WEDDINGS WITH FEELING. PORTRAITS WITH PRESENCE.</p><h2>Your story.<br/><em>Beautifully remembered.</em></h2><div><Link className="pill-link" href="/contact#contact-form">Book a session &#8599;</Link><Link className="text-link" href="/videos#films">Watch the films &#8599;</Link></div></section></>}



    </main>
    <footer className="site-footer expanded-footer"><div className="footer-top"><div><Link href="/" className="footer-wordmark">chap nic<span>pictures.</span></Link><p>Wedding stories with feeling.<br/>Portraits with presence.<br/>Based in Yaounde, Cameroon.</p></div><nav aria-label="Footer navigation"><p className="eyebrow">EXPLORE</p>{pages.map(item=><Link key={item.href} href={destination(item.href)}>{item.label}</Link>)}<Link href="/#reviews">Reviews</Link></nav><div className="footer-contact"><p className="eyebrow">LET US MAKE SOMETHING MEANINGFUL</p><a href="mailto:chapnicpictures@gmail.com">chapnicpictures@gmail.com</a><a href="tel:+237693049990">+237 693 049 990</a><span>Simbock, Yaounde / Cameroon</span><Link className="text-link" href="/contact#contact-form">Tell me about your day <Arrow diagonal/></Link></div></div><div className="footer-bottom"><span>&copy; {new Date().getFullYear()} CHAP NIC PICTURES</span><button onClick={()=>setMotion(!motion)} aria-pressed={motion}>MOTION {motion?'ON':'OFF'}</button><a href="https://chapnicpictures.pixieset.com/" target="_blank" rel="noreferrer">CLIENT GALLERIES <Arrow diagonal/></a><a href="#main">BACK TO TOP &#8593;</a></div></footer>
  </div>;
}
