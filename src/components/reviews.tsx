'use client';
import {useEffect,useState} from 'react';
type Review={id:string;name:string;text:string;rating:number};
const demos:Review[]=[
{id:'demo1',name:'Sample wedding review',rating:5,text:'The photographs bring back the laughter, the little glances, and the feeling of being surrounded by our favourite people.'},
{id:'demo2',name:'Sample portrait review',rating:5,text:'A relaxed portrait session and photographs that feel natural, personal, and full of character.'},
{id:'demo3',name:'Sample wedding film review',rating:4,text:'Being able to revisit the movement and emotion of the day makes the film something we would return to again and again.'}];
export default function Reviews(){
 const [reviews,setReviews]=useState<Review[]>([]),[rating,setRating]=useState(5),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState(''),[loadError,setLoadError]=useState(false);
 useEffect(()=>{const c=new AbortController();fetch('/api/reviews',{signal:c.signal}).then(async r=>{if(!r.ok)throw Error();setReviews((await r.json()).reviews);}).catch(e=>{if(e.name!=='AbortError')setLoadError(true);});return()=>c.abort();},[]);
 return <section className="reviews-section section-pad" id="reviews"><div className="section-heading"><div><p className="eyebrow">WORDS AFTER THE MOMENT</p><h2>The experience,<br/><em>in your words.</em></h2></div><p>Your story matters before,<br/>during, and after the photograph.</p></div>
 {loadError&&<p role="status">Customer reviews could not load right now.</p>}
 <div className="review-grid">{(reviews.length?reviews:demos).map(r=><article className="review-card" key={r.id}>{!reviews.length&&<span className="demo-label">DEMO REVIEW · NOT A CUSTOMER TESTIMONIAL</span>}<p className="review-stars" aria-label={r.rating+' out of 5 stars'}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</p><blockquote>{r.text}</blockquote><p>{r.name}</p></article>)}</div>
 <div className="review-form-layout"><div><p className="eyebrow">BEEN IN FRONT OF THE LENS?</p><h3>Leave a little<br/><em>of your story.</em></h3><p>Share how the experience felt. Your name, stars and words will appear here after approval. Please leave private contact details out of your review.</p></div>
 <form className="customer-review-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');setNotice('');const form=e.currentTarget;const data=new FormData(form);try{const r=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),text:data.get('text'),website:data.get('website'),rating})});const result=await r.json();if(!r.ok)throw Error(result.error);setNotice(result.message);form.reset();setRating(5);}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}}>
 <label>Your name<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label>
 <fieldset><legend>Your rating</legend><div className="rating-options">{[1,2,3,4,5].map(n=><label key={n}><input type="radio" name="rating" value={n} checked={rating===n} onChange={()=>setRating(n)}/><span>{n} ★</span></label>)}</div></fieldset>
 <label>Your review<textarea name="text" required minLength={10} maxLength={2000} rows={5} placeholder="What will you remember about the experience?"/></label>
 <div className="review-trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
 <button disabled={busy} type="submit">{busy?'Submitting…':'Submit your review ↗'}</button>{notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
 </form></div></section>;
}