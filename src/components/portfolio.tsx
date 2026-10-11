'use client';

import { useEffect, useRef, useState } from 'react';
import { collections } from '@/lib/collections';
import films from '@/lib/films.json';
import StoryGallery from '@/components/story-gallery';
import Link from 'next/link';

const slides = ['weddings', 'portraits', 'events'].map(id => collections.find(c => c.id === id)!);
const email = 'chapnicpictures@gmail.com';

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

export default function Portfolio() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [motion, setMotion] = useState(true);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeFilm, setActiveFilm] = useState<number | null>(null);
  const [inquiry, setInquiry] = useState('Wedding');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryStory, setInquiryStory] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const weddingPhoto = collections[0].photos[1] ?? collections[0].photos[0];
  const portraitPhoto = collections[1].photos[1] ?? collections[1].photos[0];

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
  }, [motion, filter]);

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


  return <div ref={root} className={motion ? 'portfolio motion-enabled' : 'portfolio motion-disabled'}>
    <div ref={progress} className="reading-progress" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#" aria-label="Chap Nic Pictures home">chap nic<span>PICTURES</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#stories">The stories <sup>06</sup></a><a href="#about">Behind the lens</a><a href="#contact" className="nav-cta">Let&apos;s make memories <Arrow diagonal /></a>
      </nav>
      <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? 'Close ×' : 'Menu +'}</button>
    </header>
    {menu && <nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation" onKeyDown={event => { if (event.key === 'Escape') setMenu(false); }}>
      {['stories', 'archive', 'about', 'contact'].map((id, index) => <a key={id} href={'#' + id} onClick={() => setMenu(false)}><small>0{index + 1}</small>{['The stories', 'The collection', 'Behind the lens', 'Get in touch'][index]}<Arrow diagonal /></a>)}
    </nav>}
    <main id="main">
      <section className="hero" aria-label="Featured photography">
        <div className="hero-images" aria-hidden="true">
          {slides.map((slide, index) => <div key={slide.id} className={'hero-slide ' + (index === activeSlide ? 'is-active' : '')}>{slide.photos[0] && <img src={slide.photos[0].src} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} />}</div>)}
        </div>
        <div className="hero-shade" />
        <div className="hero-topline"><span>PHOTOGRAPHY & FILM</span><span>YAOUNDÉ, CAMEROON <i className="status-dot" /></span></div>
        <div className="hero-copy"><p className="eyebrow">For the beautifully unscripted.</p><h1>Life happens.<br /><em>Make it</em><span className="hero-last">unforgettable.</span></h1><div className="hero-caption"><span className="tiny-star">✦</span><p>The big feelings. The little things.<br />The moments that become your story.</p></div></div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#intro"><span>↓</span>SCROLL TO FEEL SOMETHING</a>
          <div className="slide-picker" aria-label="Featured collection"><button className="hero-motion-toggle" onClick={() => setMotion(!motion)} aria-label={motion ? 'Pause motion' : 'Enable motion'}>{motion ? 'PAUSE' : 'PLAY'}</button>{slides.map((slide, index) => <button key={slide.id} onClick={() => setActiveSlide(index)} aria-label={'Show ' + slide.title} aria-pressed={activeSlide === index} className={activeSlide === index ? 'active' : ''}>0{index + 1}<span /></button>)}</div>
          <span className="hero-credit">{slides[activeSlide].title} / CHAP NIC PICTURES</span>
        </div>
      </section>

      <section className="spotlight" aria-labelledby="spotlight-title"><div className="spotlight-copy"><p className="eyebrow">IN THE SPOTLIGHT / ARTISTS & CULTURE</p><h2 id="spotlight-title">Mic<br /><em>Monsta.</em></h2><p>A presence beyond the frame. A portrait of the Cameroonian artist, photographed by Chap Nic Pictures.</p><Link className="text-link" href="/gallery/mic-monsta">Explore the portrait story <Arrow diagonal /></Link></div><Link href="/gallery/mic-monsta" className="spotlight-photo" aria-label="View the Mic Monsta collection"><img src="/photos/mic16_1.jpg" alt="Mic Monsta posing against a white backdrop, photographed by Chap Nic Pictures" loading="eager"/><span>MIC MONSTA / CHAP NIC PICTURES</span></Link></section>

      <section id="intro" className="intro section-pad">
        <div className="section-label" data-reveal><span>01 / A WAY OF SEEING</span><span className="tiny-star">✦</span></div>
        <div className="intro-layout"><p className="side-note" data-reveal>Not just how it looked.<br />How it <em>felt.</em></p><div><h2 className="statement" data-reveal>Someday, these<br />will be the <em>days</em><br />you come back to.</h2><div className="intro-description" data-reveal><span className="line" /><p>A photograph can bring you right back. To the warmth of a hand, the noise of a room, a version of yourself you almost forgot. That is what we&apos;re here to keep.</p></div></div></div>
      </section>

      <section id="stories" className="stories section-pad">
        <div className="section-heading" data-reveal><div><p className="eyebrow">SIX CHAPTERS. ENDLESS STORIES.</p><h2>The art of<br /><em>paying attention.</em></h2></div><p>Follow what moves you.<br />Explore the collections below.</p></div>
        <div className="story-grid">
          {collections.map((collection, index) => <a key={collection.id} className={'story-card story-' + collection.id} href={collection.id === 'videos' ? '#films' : '#archive'} onClick={() => { if (collection.id !== 'videos') { setFilter(collection.id); } }} data-reveal>
            <div className="story-image">{collection.photos[0] ? <img src={collection.photos[0].src} alt={collection.photos[0].alt} loading="lazy" /> : <div className="collection-fallback"><span>{collection.title}</span></div>}<span className="image-overlay" /><span className="story-index">CHAPTER {collection.number}</span><span className="image-cta">{collection.id === 'videos' ? 'WATCH' : 'EXPLORE'} <Arrow diagonal /></span><h3>{collection.phrase.split('\n').map((line, i) => <span key={line}>{i === 1 ? <em>{line}</em> : line}<br /></span>)}</h3>{index === 5 && <span className="film-play" aria-hidden="true">▷</span>}</div>
            <div className="story-caption"><div><span>{collection.title}</span><p>{collection.description}</p></div><Arrow diagonal /></div>
          </a>)}
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>Unplanned. <em>Unposed.</em> Unforgettable. <b>✦</b> </span>)}</div></div>

      <section className="interlude" aria-label="A moment to remember">
        {weddingPhoto && <img className="interlude-image" src={weddingPhoto.src} alt={weddingPhoto.alt} loading="lazy" />}
        <div className="interlude-shade" /><div className="interlude-copy" data-reveal><p className="eyebrow">THERE IS NO SECOND TAKE OF A FIRST FEELING.</p><h2>Let the moment<br /><em>be the moment.</em></h2><a className="pill-link light" href={collections[0].url} target="_blank" rel="noreferrer">Step inside a love story <Arrow diagonal /></a></div><span className="interlude-foot">OBSERVE CLOSELY. FEEL DEEPLY. REMEMBER ALWAYS.</span>
      </section>

      <StoryGallery category={filter} onCategoryChange={setFilter} />

      <section id="films" className="films section-pad">
        <div className="section-heading" data-reveal><div><p className="eyebrow">THE WORLD DOES NOT STAND STILL.</p><h2>Neither do<br /><em>all our stories.</em></h2></div><p>{films.length} films from the collection.<br />Press play. Be there again.</p></div>
        <div className="film-stage">
          {activeFilm === null ? <button className="film-poster" onClick={() => setActiveFilm(0)} aria-label="Play the first portfolio film"><img src={collections[5].photos[0]?.src} alt="Preview of the Chap Nic Pictures film collection" loading="lazy" /><span className="film-play">&#9655;</span><span className="film-poster-label">PRESS PLAY / FEEL THE MOMENT</span></button> : <iframe key={films[activeFilm].id} src={films[activeFilm].embedUrl + '&autoplay=1'} title={films[activeFilm].title + ' by Chap Nic Pictures'} allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        </div>
        <div className="film-selector" role="group" aria-label="Choose a film">{films.map((film,index) => <button key={film.id} aria-pressed={activeFilm === index} className={activeFilm === index ? 'active' : ''} onClick={() => setActiveFilm(index)}><span>FILM {String(index+1).padStart(2,'0')}</span><span>&#8599;</span></button>)}</div>
        <a className="text-link" href={collections[5].url} target="_blank" rel="noreferrer">Explore films on Pixieset <Arrow diagonal /></a>
      </section>

      <section id="about" className="about section-pad">
        <div className="about-visual" data-reveal>{portraitPhoto ? <img src={portraitPhoto.src} alt={portraitPhoto.alt} loading="lazy" /> : <div className="collection-fallback"><span>Light. Life. Legacy.</span></div>}<div className="photo-stamp">IT STARTED<br />WITH A<br /><em>feeling.</em></div><span className="photo-note">FROM THE PORTRAIT COLLECTION / CHAP NIC PICTURES</span></div>
        <div className="about-copy" data-reveal><p className="eyebrow">BEHIND THE LENS</p><h2>A camera.<br />A connection.<br /><em>A calling.</em></h2><p className="about-lead">Before the profession, there was a father&apos;s Konica film camera.</p><p>At boarding school in Fontem, school dances became the first stories. Even while pursuing a career in medicine, the pull of photography remained.</p><p>That curiosity grew into Chap Nic Pictures. Today, the same belief guides every wedding, gathering, and portrait: the most meaningful photographs happen when people are free to be themselves.</p><div className="signature">Chap Nic<span>PHOTOGRAPHER & STORYTELLER</span></div><a className="text-link" href="#contact">Tell me your story <Arrow diagonal /></a></div>
      </section>

      <section id="contact" className="contact section-pad">
        <div className="contact-heading" data-reveal><p className="eyebrow">THE NEXT CHAPTER COULD BE YOURS.</p><h2>Let&apos;s make<br /><em>something</em><br />worth keeping<span className="accent">.</span></h2></div>
        <div className="contact-details" data-reveal><p>A celebration. A new beginning.<br />An idea you can&apos;t stop thinking about.<br />I&apos;d love to hear it.</p>
          <form onSubmit={event => {event.preventDefault();const body = 'Hello Chap Nic,\n\nMy name is ' + inquiryName + '. I am interested in ' + inquiry.toLowerCase() + ' photography.\nPreferred date: ' + (inquiryDate || 'To be discussed') + '\n\n' + inquiryStory;window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(inquiry + ' enquiry - ' + inquiryName) + '&body=' + encodeURIComponent(body);}}>
            <label htmlFor="inquiry-type">WHAT ARE WE CREATING?</label><select id="inquiry-type" value={inquiry} onChange={event => setInquiry(event.target.value)}>{['Wedding','Portrait','Event','Architecture','Baby & family','Film','Something else'].map(item => <option key={item}>{item}</option>)}</select>
            <div className="form-row"><div><label htmlFor="inquiry-name">YOUR NAME</label><input id="inquiry-name" value={inquiryName} onChange={event => setInquiryName(event.target.value)} autoComplete="name" required placeholder="Your name" maxLength={100} /></div><div><label htmlFor="inquiry-date">A DATE IN MIND?</label><input id="inquiry-date" type="date" value={inquiryDate} onChange={event => setInquiryDate(event.target.value)} /></div></div>
            <label htmlFor="inquiry-story">A LITTLE ABOUT YOUR STORY</label><textarea id="inquiry-story" value={inquiryStory} onChange={event => setInquiryStory(event.target.value)} placeholder="The occasion, the place, the feeling..." rows={3} maxLength={3000} />
            <button className="inquiry-submit" type="submit">Start the conversation <Arrow diagonal /></button><p className="form-note">Opens your email app with your enquiry ready to send.</p>
          </form>
          <div className="direct-contact"><a href={'mailto:' + email}>{email} <Arrow diagonal /></a><a href="tel:+237693049990">+237 693 049 990 <Arrow diagonal /></a><span>SIMBOCK, YAOUNDÉ / CAMEROON</span></div>
        </div>
      </section>
    </main>
    <footer className="site-footer"><a href="#" className="footer-wordmark">chap nic<span>pictures.</span></a><div className="footer-bottom"><span>© {new Date().getFullYear()} CHAP NIC PICTURES</span><button onClick={() => setMotion(!motion)} aria-pressed={motion}>MOTION {motion ? 'ON' : 'OFF'} <span aria-hidden="true">{motion ? '●' : '○'}</span></button><a href="https://chapnicpictures.pixieset.com/" target="_blank" rel="noreferrer">CLIENT GALLERIES <Arrow diagonal /></a><a href="#">BACK TO TOP ↑</a></div></footer>
  </div>;
}
