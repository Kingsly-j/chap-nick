'use client';

import { useEffect, useRef, useState } from 'react';
import { collections } from '@/lib/collections';
import films from '@/lib/films.json';
import StoryGallery from '@/components/story-gallery';
import Reviews from '@/components/reviews';
import Link from 'next/link';

const slides = [collections[0].photos[0],collections[0].photos[3],collections[0].photos[7]].map((photo,index)=>({id:String(index),title:'Wedding stories',photos:[photo]}));
const pages=[{href:'/',label:'Home'},{href:'/weddings',label:'Recent weddings'},{href:'/videos',label:'Films'},{href:'/giveaway',label:'Giveaway'},{href:'/contact',label:'Contact'}];
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
  const [inquiry, setInquiry] = useState('Wedding');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryStory, setInquiryStory] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const weddingPhoto = collections[0].photos[4];

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


  return <div ref={root} className={motion ? 'portfolio motion-enabled' : 'portfolio motion-disabled'}>
    <div ref={progress} className="reading-progress" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={'site-header '+(page!=='home'?'inner-header':'')}>
      <Link className="wordmark" href="/" aria-label="Chap Nic Pictures home">chap nic<span>PICTURES</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{pages.map(item=><Link key={item.href} href={item.href} className={item.href==='/contact'?'nav-booking-button':undefined} aria-current={(page==='home'?'/':'/'+page)===item.href?'page':undefined}>{item.href==='/contact'?'Book a session':item.label}</Link>)}</nav>
      <button className="menu-toggle" aria-expanded={menu} aria-controls="mobile-navigation" onClick={()=>setMenu(!menu)}>{menu?'Close':'Menu +'}</button>
    </header>
    {menu&&<nav id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation" onKeyDown={event=>{if(event.key==='Escape')setMenu(false);}}>{pages.map((item,index)=><Link key={item.href} href={item.href} onClick={()=>setMenu(false)}><small>0{index+1}</small>{item.label}<Arrow diagonal/></Link>)}</nav>}
    <main id="main" className={page!=='home'?'inner-page':undefined}>
      {page!=='home'&&<section className="page-intro"><p className="eyebrow">CHAP NIC PICTURES / {page==='weddings'?'THE WEDDING JOURNAL':page==='videos'?'IN MOTION':'YOUR NEXT CHAPTER'}</p><h1>{page==='weddings'?<>Recent <em>weddings.</em></>:page==='videos'?<>Feel it <em>again.</em></>:<>It begins with <em>hello.</em></>}</h1><p>{page==='weddings'?'The people, the promises, the beautifully unscripted. Open a collection to see the day unfold.':page==='videos'?'A place for the moments a photograph cannot hold. Press play and step back inside.':'Tell me about your day, your people, and what you want to remember.'}</p></section>}
      {page==='home'&&(<section className="hero" aria-label="Featured photography">
        <div className="hero-images" aria-hidden="true">
          {slides.map((slide, index) => <div key={slide.id} className={'hero-slide ' + (index === activeSlide ? 'is-active' : '')}>{slide.photos[0] && <img src={slide.photos[0].src} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} />}</div>)}
        </div>
        <div className="hero-shade" />
        <div className="hero-topline"><span>WEDDINGS / PORTRAITS / FILM</span><span>YAOUNDÉ, CAMEROON <i className="status-dot" /></span></div>
        <div className="hero-copy"><p className="eyebrow">For the beautifully unscripted.</p><h1>Love happens.<br /><em>Make it</em><span className="hero-last">unforgettable.</span></h1><div className="hero-caption"><span className="tiny-star">✦</span><p>The big feelings. The little things.<br />The moments that become your story.</p><Link className="hero-booking-button" href="/contact">Book a session <Arrow diagonal/></Link></div></div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#intro"><span>↓</span>SCROLL TO FEEL SOMETHING</a>
          <div className="slide-picker" aria-label="Featured collection"><button className="hero-motion-toggle" onClick={() => setMotion(!motion)} aria-label={motion ? 'Pause motion' : 'Enable motion'}>{motion ? 'PAUSE' : 'PLAY'}</button>{slides.map((slide, index) => <button key={slide.id} onClick={() => setActiveSlide(index)} aria-label={'Show ' + slide.title} aria-pressed={activeSlide === index} className={activeSlide === index ? 'active' : ''}>0{index + 1}<span /></button>)}</div>
          <span className="hero-credit">{slides[activeSlide].title} / CHAP NIC PICTURES</span>
        </div>
      </section>)}





      {page==='home'&&<section className="featured-film section-pad" aria-labelledby="featured-film-title"><div className="section-heading"><div><p className="eyebrow">THE FEATURED FILM</p><h2 id="featured-film-title">Some moments<br/><em>deserve motion.</em></h2><p className="film-booking-caption">Watch this before you book</p></div><Link className="text-link" href="/videos">Explore the films <Arrow diagonal/></Link></div><div className="film-stage">{featuredPlaying?<iframe src="https://www.youtube-nocookie.com/embed/WR7Sz3T-Qr0?autoplay=1&rel=0&playsinline=1" title="Featured wedding film by Chap Nic Pictures" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button className="film-poster" onClick={()=>setFeaturedPlaying(true)} aria-label="Play the featured wedding film"><img src="https://i.ytimg.com/vi/WR7Sz3T-Qr0/hqdefault.jpg" alt="Preview of the featured Chap Nic Pictures film" loading="lazy"/><span className="film-play">&#9655;</span><span className="film-poster-label">PLAY THE FEATURED FILM</span></button>}</div><a className="featured-film-external" href="https://youtu.be/WR7Sz3T-Qr0" target="_blank" rel="noreferrer">Watch on YouTube &#8599;</a></section>}

      {page==='home'&&(<section id="intro" className="intro section-pad">
        <div className="section-label" data-reveal><span>01 / A WAY OF SEEING</span><span className="tiny-star">✦</span></div>
        <div className="intro-layout"><p className="side-note" data-reveal>Not just how it looked.<br />How it <em>felt.</em></p><div><h2 className="statement" data-reveal>Someday, these<br />will be the <em>days</em><br />you come back to.</h2><div className="intro-description" data-reveal><span className="line" /><p>A photograph can bring you right back. To the warmth of a hand, the noise of a room, a version of yourself you almost forgot. That is what we&apos;re here to keep.</p></div></div></div>
      </section>)}

      {page==='home'&&<section className="home-weddings section-pad" data-reveal><div className="section-heading"><div><p className="eyebrow">YOUR PEOPLE. YOUR DAY. YOUR STORY.</p><h2>Love, in its<br/><em>own words.</em></h2></div><Link className="text-link" href="/weddings">Explore recent weddings <Arrow diagonal/></Link></div><Link href="/weddings" className="wedding-preview"><img src="/photos/weddings-06.jpg" alt="A wedding party dressed in white outside a grand entrance" loading="lazy"/><span>THE WEDDING STORIES &#8599;</span></Link></section>}

      {page==='home'&&<section className="giveaway-banner section-pad"><div><p className="eyebrow">MONTHLY WEDDING SHOOT GIVEAWAY</p><h2>Your love story.<br/><em>A beautiful gift.</em></h2><p>Enter for your chance to win a Wedding Photo Coverage (VALUED AT 300k).</p></div><div><span className="giveaway-value">300k<small>FCFA / FULL SINGLE-DAY PHOTO COVERAGE</small></span><Link className="pill-link" href="/giveaway">Enter the wedding giveaway &#8599;</Link><p>Share your story. Register your wedding.<br/>Give your next chapter a little possibility.</p></div></section>}

      {page==='home'&&<section className="experience section-pad" aria-labelledby="experience-title"><div className="experience-copy" data-reveal><p className="eyebrow">THE DAY IS YOURS. BE IN IT.</p><h2 id="experience-title">Less posing.<br/><em>More living.</em></h2><p>A wedding is more than the ceremony. It is the quiet anticipation before you step outside, the hands that help you get ready, and the friends who turn a gathering into a celebration.</p><p>My approach makes room for all of it: a little direction when you need it, and the space to be yourselves when you do not. The aim is a collection that brings you back to the people and the feeling, as well as the way everything looked.</p><Link className="text-link" href="/contact">Let us talk about your day <Arrow diagonal/></Link></div><div className="experience-photos"><figure data-reveal><img src="/photos/weddings-02.jpg" alt="A wedding couple standing together at an ornate entrance" loading="lazy"/><figcaption>The people at the heart of it.</figcaption></figure><figure data-reveal><img src="/photos/weddings-03.jpg" alt="A couple beneath a palm-framed entrance" loading="lazy"/><figcaption>A place. A feeling. A memory.</figcaption></figure></div></section>}
      {page==='home'&&<section className="working-together section-pad"><div className="section-heading" data-reveal><div><p className="eyebrow">FROM FIRST HELLO TO THE FINAL FRAME</p><h2>A little guidance.<br/><em>A lot of heart.</em></h2></div><p>Photography begins with getting to know<br/>what matters most to you.</p></div><div className="process-grid"><article data-reveal><span>01 / BEFORE</span><h3>Tell me your story.</h3><p>Share your date, location, plans and the people you want to remember. We can talk through the atmosphere you love and the photographs that matter to you.</p></article><article data-reveal><span>02 / ON THE DAY</span><h3>Make room for the moment.</h3><p>Enjoy your celebration. Between the big milestones, there is room for a quiet portrait, an unexpected laugh and the small gestures that make the day your own.</p></article><article data-reveal><span>03 / AFTER</span><h3>Return to the feeling.</h3><p>Discover the day as a story: photographs that belong together, from the setting and the faces to the moments you may have missed along the way.</p></article></div></section>}
      {page==='home'&&<div className="marquee"  aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>Unplanned. <em>Unposed.</em> Unforgettable. <b>✦</b> </span>)}</div></div>}

      {page==='home'&&(<section className="interlude" aria-label="A moment to remember">
        {weddingPhoto && <img className="interlude-image" src={weddingPhoto.src} alt={weddingPhoto.alt} loading="lazy" />}
        <div className="interlude-shade" /><div className="interlude-copy" data-reveal><p className="eyebrow">THERE IS NO SECOND TAKE OF A FIRST FEELING.</p><h2>Let the moment<br /><em>be the moment.</em></h2><Link className="pill-link light" href="/weddings">Step inside a love story <Arrow diagonal /></Link></div><span className="interlude-foot">OBSERVE CLOSELY. FEEL DEEPLY. REMEMBER ALWAYS.</span>
      </section>)}

      {page==='weddings'&&<StoryGallery/>}

      {page==='videos'&&(<section id="films" className="films section-pad">
        <div className="section-heading" data-reveal><div><p className="eyebrow">THE WORLD DOES NOT STAND STILL.</p><h2>Neither do<br /><em>all our stories.</em></h2></div><p>{films.length} films from the collection.<br />Press play. Be there again.</p></div>
        <div className="film-stage">
          {activeFilm === null ? <button className="film-poster" onClick={() => setActiveFilm(0)} aria-label="Play the first portfolio film"><img src={collections[5].photos[0]?.src} alt="Preview of the Chap Nic Pictures film collection" loading="lazy" /><span className="film-play">&#9655;</span><span className="film-poster-label">PRESS PLAY / FEEL THE MOMENT</span></button> : <iframe key={films[activeFilm].id} src={films[activeFilm].embedUrl + '&autoplay=1'} title={films[activeFilm].title + ' by Chap Nic Pictures'} allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        </div>
        <div className="film-selector" role="group" aria-label="Choose a film">{films.map((film,index) => <button key={film.id} aria-pressed={activeFilm === index} className={activeFilm === index ? 'active' : ''} onClick={() => setActiveFilm(index)}><span>FILM {String(index+1).padStart(2,'0')}</span><span>&#8599;</span></button>)}</div>
        <a className="text-link" href={collections[5].url} target="_blank" rel="noreferrer">Explore films on Pixieset <Arrow diagonal /></a>
      </section>)}



      {page==='contact'&&(<section id="contact" className="contact section-pad">
        <div className="contact-heading" data-reveal><p className="eyebrow">THE NEXT CHAPTER COULD BE YOURS.</p><h2>Let&apos;s make<br /><em>something</em><br />worth keeping<span className="accent">.</span></h2></div>
        <div className="contact-details" data-reveal><p>A celebration. A new beginning.<br />An idea you can&apos;t stop thinking about.<br />I&apos;d love to hear it.</p>
          <form onSubmit={event => {event.preventDefault();const body = 'Hello Chap Nic,\n\nMy name is ' + inquiryName + '. I am interested in ' + inquiry.toLowerCase() + ' photography.\nPreferred date: ' + (inquiryDate || 'To be discussed') + '\n\n' + inquiryStory;window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(inquiry + ' enquiry - ' + inquiryName) + '&body=' + encodeURIComponent(body);}}>
            <label htmlFor="inquiry-type">WHAT ARE WE CREATING?</label><select id="inquiry-type" value={inquiry} onChange={event => setInquiry(event.target.value)}>{['Wedding','Portrait','Wedding film'].map(item => <option key={item}>{item}</option>)}</select>
            <div className="form-row"><div><label htmlFor="inquiry-name">YOUR NAME</label><input id="inquiry-name" value={inquiryName} onChange={event => setInquiryName(event.target.value)} autoComplete="name" required placeholder="Your name" maxLength={100} /></div><div><label htmlFor="inquiry-date">A DATE IN MIND?</label><input id="inquiry-date" type="date" value={inquiryDate} onChange={event => setInquiryDate(event.target.value)} /></div></div>
            <label htmlFor="inquiry-story">A LITTLE ABOUT YOUR STORY</label><textarea id="inquiry-story" value={inquiryStory} onChange={event => setInquiryStory(event.target.value)} placeholder="The occasion, the place, the feeling..." rows={3} maxLength={3000} />
            <button className="inquiry-submit" type="submit">Start the conversation <Arrow diagonal /></button><p className="form-note">Opens your email app with your enquiry ready to send.</p>
          </form>
          <div className="direct-contact"><a href={'mailto:' + email}>{email} <Arrow diagonal /></a><a href="tel:+237693049990">+237 693 049 990 <Arrow diagonal /></a><span>SIMBOCK, YAOUNDÉ / CAMEROON</span></div>
        </div>
      </section>)}
      {page==='home'&&<>      <section className="spotlight" aria-labelledby="spotlight-title"><div className="spotlight-copy"><p className="eyebrow">A FEW PORTRAITS / IN THE SPOTLIGHT</p><h2 id="spotlight-title">Mic<br /><em>Monsta.</em></h2><p>A presence beyond the frame. A portrait of the Cameroonian artist, photographed by Chap Nic Pictures.</p><Link className="text-link" href="/gallery/mic-monsta">Explore the portrait story <Arrow diagonal /></Link></div><Link href="/gallery/mic-monsta" className="spotlight-photo" aria-label="View the Mic Monsta collection"><img src="/photos/mic16_1.jpg" alt="Mic Monsta posing against a white backdrop, photographed by Chap Nic Pictures" loading="eager"/><span>MIC MONSTA / CHAP NIC PICTURES</span></Link></section><section className="portrait-selection section-pad" aria-label="Selected portraits"><div><p className="eyebrow">A SMALL PORTRAIT SELECTION</p><h2>Simply <em>you.</em></h2><Link className="text-link" href="/contact">Enquire about a portrait &#8599;</Link></div><img src="/photos/portraits-01.jpg" alt="Selected portrait from Chap Nic Pictures" loading="lazy"/><img src="/photos/portraits-02.jpg" alt="A second photograph from the portrait collection" loading="lazy"/></section><section className="home-invitation section-pad" data-reveal><p className="eyebrow">WEDDINGS WITH FEELING. PORTRAITS WITH PRESENCE.</p><h2>Your story.<br/><em>Beautifully remembered.</em></h2><div><Link className="pill-link" href="/contact">Tell me about your day &#8599;</Link><Link className="text-link" href="/videos">Watch the films &#8599;</Link></div></section></>}
      {page==='home'&&<section className="photographer-story section-pad" aria-labelledby="photographer-story-title"><div className="story-portrait-column" data-reveal><div className="story-section-number" aria-hidden="true">01 / THE HUMAN SIDE</div><p className="eyebrow">THE PERSON BEHIND THE CAMERA</p><h2 id="photographer-story-title">Hello, I&apos;m<br/><em>Chap Nic.</em></h2><p className="photographer-story-note">Candid. Fun. Artistic.</p><figure className="story-editorial-photo"><img src="/photos/weddings-07.jpg" alt="A guest in an elegant black dress and wide-brimmed hat, from the wedding portfolio" loading="lazy"/><figcaption>A STUDY IN PRESENCE / FROM THE WEDDING COLLECTION</figcaption><span className="story-photo-stamp" aria-hidden="true">Light.<br/>Life.<br/><em>Legacy.</em></span></figure><Link className="text-link" href="/contact">I would love to chat <Arrow diagonal/></Link></div><div className="photographer-story-copy" data-reveal><div className="story-chapters"><span>FONTEM</span><i aria-hidden="true">&#8594;</i><span>A KONICA CAMERA</span><i aria-hidden="true">&#8594;</i><span>CHAP NIC PICTURES</span></div><p className="story-lead">Welcome to Chap Nic Pictures, where moments become timeless memories.</p><p>My journey into the world of photography began in a boarding school (OLSWC) in Fontem. Despite pursuing a career in medicine, my passion for photography was kindled during school dances, capturing moments with my late father&apos;s Konica film camera.</p><p>This passion blossomed, evolving into a professional venture specializing in candid weddings and event photography.</p><blockquote>I believe the essence of the best wedding or event photography lies in candid moments—unplanned, unposed, and authentically you.</blockquote><p>I evolved into a team offering hybrid coverage at weddings—shooting photo + video at the same time—and this is still one of my most popular packages.</p><p>If you&apos;re looking for a photographer whose approach is candid, fun, and artistic, I&apos;d love to chat.</p><div className="story-signoff"><span>Chap Nic</span><small>PHOTOGRAPHER &amp; STORYTELLER</small></div><div className="hybrid-note"><span>PHOTO<br/>+ VIDEO</span><p>One team. Two ways to remember.<br/>Discover hybrid wedding coverage.</p><Link href="/contact" aria-label="Enquire about hybrid wedding coverage">&#8599;</Link></div></div></section>}

      {page==='home'&&<Reviews/>}
    </main>
    <footer className="site-footer expanded-footer"><div className="footer-top"><div><Link href="/" className="footer-wordmark">chap nic<span>pictures.</span></Link><p>Wedding stories with feeling.<br/>Portraits with presence.<br/>Based in Yaounde, Cameroon.</p></div><nav aria-label="Footer navigation"><p className="eyebrow">EXPLORE</p>{pages.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/#reviews">Reviews</Link></nav><div className="footer-contact"><p className="eyebrow">LET US MAKE SOMETHING MEANINGFUL</p><a href="mailto:chapnicpictures@gmail.com">chapnicpictures@gmail.com</a><a href="tel:+237693049990">+237 693 049 990</a><span>Simbock, Yaounde / Cameroon</span><Link className="text-link" href="/contact">Tell me about your day <Arrow diagonal/></Link></div></div><div className="footer-bottom"><span>&copy; {new Date().getFullYear()} CHAP NIC PICTURES</span><button onClick={()=>setMotion(!motion)} aria-pressed={motion}>MOTION {motion?'ON':'OFF'}</button><Link href="/admin">STUDIO ACCESS</Link><a href="https://chapnicpictures.pixieset.com/" target="_blank" rel="noreferrer">CLIENT GALLERIES <Arrow diagonal/></a><a href="#main">BACK TO TOP &#8593;</a></div></footer>
  </div>;
}
