'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, type User } from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';
import { categories, type GalleryCollection, type GalleryPhoto } from '@/lib/collection-schema';

type Member = { uid: string; email: string; disabled: boolean };
const empty = (): GalleryCollection => ({ id:'', title:'', category:'Weddings', summary:'', story:'', coverUrl:'', date:'', location:'', published:false, order:10, updatedAt:'', photos:[] });
const errorMessage = (error: unknown) => error instanceof Error ? error.message.replace('Firebase: ', '') : 'Something went wrong. Please try again.';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'collections' | 'admins'>('collections');
  const [items, setItems] = useState<GalleryCollection[]>([]);
  const [draft, setDraft] = useState<GalleryCollection | null>(null);
  const [dirty, setDirty] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [setupLink, setSetupLink] = useState('');

  async function api(path: string, options: RequestInit = {}, current = user) {
    if (!current) throw new Error('Please sign in.');
    const token = await current.getIdToken();
    const response = await fetch(path, { ...options, headers: { 'Content-Type':'application/json', Authorization:'Bearer ' + token, ...options.headers } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());
    return onAuthStateChanged(auth, async current => {
      setUser(current); setAllowed(false); setError(''); setDraft(null);
      if (current) {
        try {
          const token = await current.getIdToken(true);
          const response = await fetch('/api/admin/collections', { headers: { Authorization: 'Bearer ' + token } });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          setItems(data.collections); setAllowed(true);
        } catch (err) { setError(errorMessage(err)); }
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update(patch: Partial<GalleryCollection>) { setDraft(value => value ? { ...value, ...patch } : value); setDirty(true); }
  function openCollection(collection: GalleryCollection) {
    if (dirty && !confirm('Discard your unsaved changes?')) return;
    setDraft(structuredClone(collection)); setDirty(false);setBulkUrls('');setNotice('');setError('');
  }
  function updatePhoto(index: number, patch: Partial<GalleryPhoto>) {
    if (!draft) return;
    update({photos: draft.photos.map((photo,i) => i === index ? {...photo,...patch} : photo)});
  }
  function movePhoto(index: number, step: number) {
    if (!draft || index + step < 0 || index + step >= draft.photos.length) return;
    const photos = [...draft.photos]; [photos[index],photos[index+step]]=[photos[index+step],photos[index]];update({photos});
  }
  function addPhotos() {
    if (!draft) return;
    const urls = bulkUrls.split(/\r?\n/).map(url => url.trim()).filter(Boolean);
    if (!urls.length) return;
    if (draft.photos.length + urls.length > 100) {setError('A collection can contain up to 100 photos.');return;}
    const photos = urls.map((url,index)=>({id:crypto.randomUUID(),url,alt:(draft.title || 'Collection') + ' - photo ' + (draft.photos.length + index + 1),title:'',description:''}));
    update({photos:[...draft.photos,...photos],coverUrl:draft.coverUrl || photos[0].url});setBulkUrls('');
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!draft) return;
    setBusy(true);setError('');setNotice('');
    try {
      const data = await api('/api/admin/collections' + (draft.id ? '/' + draft.id : ''), {method:draft.id ? 'PUT' : 'POST',body:JSON.stringify(draft)});
      setDraft(data.collection);setDirty(false);
      setItems(list=>[...list.filter(item=>item.id!==data.collection.id),data.collection].sort((a,b)=>a.order-b.order));
      setNotice(data.collection.published ? 'Collection published. It is now visible in the public gallery.' : 'Draft saved. It is only visible to admins.');
    } catch(err) {setError(errorMessage(err));} finally {setBusy(false);}
  }
  async function deleteCollection() {
    if (!draft?.id || !confirm('Delete "' + draft.title + '"? This removes the collection, but not the original photo files.')) return;
    setBusy(true);setError('');
    try {await api('/api/admin/collections/'+draft.id,{method:'DELETE'});setItems(list=>list.filter(item=>item.id!==draft.id));setDraft(null);setDirty(false);setNotice('Collection deleted.');}
    catch(err){setError(errorMessage(err));}finally{setBusy(false);}
  }
  async function showAdmins() {
    if (dirty && !confirm('Discard your unsaved collection changes?')) return;
    setDraft(null);setDirty(false);setTab('admins');setError('');setNotice('');
    try {setMembers((await api('/api/admin/members')).admins);}catch(err){setError(errorMessage(err));}
  }
  async function addAdmin(event: React.FormEvent) {
    event.preventDefault();setBusy(true);setError('');setNotice('');setSetupLink('');
    try {const data=await api('/api/admin/members',{method:'POST',body:JSON.stringify({email:newEmail})});setNotice(data.message);setSetupLink(data.setupLink || '');setNewEmail('');setMembers((await api('/api/admin/members')).admins);}
    catch(err){setError(errorMessage(err));}finally{setBusy(false);}
  }

  if (!ready) return <main className="admin-auth"><p>Opening the studio...</p></main>;
  if (!user || !allowed) return <main className="admin-auth"><Link href="/" className="admin-brand">chap nic <i>studio.</i></Link><section className="login-card"><p className="admin-kicker">PRIVATE WORKSPACE</p><h1>Behind every<br /><em>great story.</em></h1><p>Sign in to curate your collections and manage the studio.</p>
    {error && <p role="alert" className="admin-error">{error}</p>}{notice && <p role="status" className="admin-notice">{notice}</p>}
    {user ? <button onClick={()=>signOut(getAuth(getFirebaseApp()))}>Sign out and use another account</button> : <form onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');try{await signInWithEmailAndPassword(getAuth(getFirebaseApp()),email,password);}catch(err){setError(errorMessage(err));}finally{setBusy(false);}}}>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={event=>setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} required /></label>
      <button disabled={busy} type="submit">{busy?'Signing in...':'Enter the studio'}</button>
      <button disabled={busy} type="button" className="secondary" onClick={async()=>{if(!email){setError('Enter your admin email first.');return;}setBusy(true);setError('');try{await sendPasswordResetEmail(getAuth(getFirebaseApp()),email);setNotice('If this account exists, a password setup/reset email will arrive shortly.');}catch(err){setError(errorMessage(err));}finally{setBusy(false);}}}>Set or reset password</button>
    </form>}<Link href="/">Back to the portfolio</Link></section></main>;

  return <div className="studio"><aside className="studio-sidebar"><Link href="/" className="admin-brand">chap nic <i>studio.</i></Link><p className="admin-kicker">YOUR STORIES, YOUR WAY</p><nav aria-label="Admin navigation"><button className={tab==='collections'?'active':''} onClick={()=>setTab('collections')}>Collections <span>{items.length}</span></button><button className={tab==='admins'?'active':''} onClick={showAdmins}>Administrators</button><Link href="/admin/giveaway">Wedding giveaway</Link><Link href="/admin/reviews">Customer reviews</Link><Link href="/weddings" target="_blank">View portfolio &#8599;</Link></nav><div className="studio-account"><span>{user.email}</span><button onClick={()=>{if(!dirty||confirm('Discard unsaved changes and sign out?'))void signOut(getAuth(getFirebaseApp()));}}>Sign out</button></div></aside>
    <main className="studio-main"><header className="studio-heading"><div><p className="admin-kicker">CHAP NIC PICTURES / ADMIN</p><h1>{tab==='collections'?'The collection room.':'The people behind it.'}</h1></div>{tab==='collections'&&<button onClick={()=>openCollection(empty())}>+ New collection</button>}</header>
      {error&&<p role="alert" className="admin-error">{error}</p>}{notice&&<p role="status" className="admin-notice">{notice}</p>}
      {tab==='collections' ? <><div className="studio-stats"><div><strong>{items.length}</strong><span>Collections</span></div><div><strong>{items.filter(item=>item.published).length}</strong><span>Published</span></div><div><strong>{items.reduce((sum,item)=>sum+item.photos.length,0)}</strong><span>Photographs</span></div></div>
        {draft ? <form className="collection-editor" onSubmit={save}><div className="editor-heading"><h2>{draft.id?'Edit the story':'Start a new story'}</h2><button type="button" className="secondary" onClick={()=>{if(!dirty||confirm('Discard unsaved changes?')){setDraft(null);setDirty(false);}}}>Back to collections</button></div>
          <div className="editor-grid"><label>Collection title<input value={draft.title} onChange={e=>update({title:e.target.value})} required maxLength={160} placeholder="An evening with Mic Monsta" /></label><label>Category<select value={draft.category} onChange={e=>update({category:e.target.value})}>{!categories.some(c=>c===draft.category)&&<option value={draft.category}>{draft.category} (archived category)</option>}{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label><label>Date <small>(optional)</small><input type="date" value={draft.date} onChange={e=>update({date:e.target.value})}/></label><label>Location <small>(optional)</small><input value={draft.location} onChange={e=>update({location:e.target.value})} maxLength={160}/></label></div>
          <label>Short introduction<textarea rows={2} maxLength={400} value={draft.summary} onChange={e=>update({summary:e.target.value})} placeholder="A few words to draw people into this collection."/></label>
          <p className="admin-kicker">Wedding collections appear on Recent Weddings. Older categories are kept here for reference and are hidden from the public portfolio.</p><label>The full story<textarea rows={7} maxLength={16000} value={draft.story} onChange={e=>update({story:e.target.value})} placeholder="The people, the atmosphere, the moments worth remembering. Use paragraphs to tell the story."/></label>
          <div className="editor-grid"><label>Cover image URL<input value={draft.coverUrl} onChange={e=>update({coverUrl:e.target.value})} required placeholder="https://... or /photos/mic16_1.jpg"/></label><label>Display order <small>(lower appears first)</small><input type="number" min={0} max={10000} value={draft.order} onChange={e=>update({order:Number(e.target.value)})} required/></label></div>
          <section className="photo-editor"><h2>The frames <span>{draft.photos.length}/100</span></h2><p>Add direct HTTPS photo URLs, one per line. Local photos can use /photos/filename.jpg.</p><label>Photo URLs<textarea rows={3} value={bulkUrls} onChange={e=>setBulkUrls(e.target.value)} placeholder="https://images.example.com/photo.jpg"/></label><button type="button" className="secondary" onClick={addPhotos}>Add photos to collection</button>
            <div className="photo-editor-list">{draft.photos.map((photo,index)=><article key={photo.id} className="photo-edit-card"><div className="photo-edit-preview"><img src={photo.url} alt={photo.alt} loading="lazy" onError={e=>{e.currentTarget.style.opacity='.15';}} onLoad={e=>{e.currentTarget.style.opacity='1';}}/><span>FRAME {String(index+1).padStart(2,'0')}</span></div><div className="photo-edit-fields"><label>Photo URL<input value={photo.url} onChange={e=>updatePhoto(index,{url:e.target.value})} required/></label><label>Slide title<input value={photo.title} onChange={e=>updatePhoto(index,{title:e.target.value})} maxLength={160}/></label><label>Image description <small>(accessibility)</small><input value={photo.alt} onChange={e=>updatePhoto(index,{alt:e.target.value})} required maxLength={300}/></label><label>Slide story / caption<textarea value={photo.description} onChange={e=>updatePhoto(index,{description:e.target.value})} rows={2} maxLength={3000}/></label><div className="photo-actions"><button type="button" className="secondary" disabled={index===0} onClick={()=>movePhoto(index,-1)}>Move up</button><button type="button" className="secondary" disabled={index===draft.photos.length-1} onClick={()=>movePhoto(index,1)}>Move down</button><button type="button" className="secondary" onClick={()=>update({coverUrl:photo.url})}>{draft.coverUrl===photo.url?'Cover selected':'Use as cover'}</button><button type="button" className="danger-text" onClick={()=>update({photos:draft.photos.filter(p=>p.id!==photo.id)})}>Remove</button></div></div></article>)}</div>
          </section>
          <div className="editor-save"><label className="publish-choice"><input type="checkbox" checked={draft.published} onChange={e=>update({published:e.target.checked})}/>Publish in the public gallery</label><div><button type="submit" disabled={busy}>{busy?'Saving...':draft.published?'Save & publish':'Save draft'}</button>{draft.id&&draft.published&&<Link href={'/gallery/'+draft.id} target="_blank" className="secondary">View collection &#8599;</Link>}{draft.id&&<button type="button" disabled={busy} className="danger-text" onClick={deleteCollection}>Delete collection</button>}</div><small>{dirty?'Unsaved changes':'All changes saved'}</small></div>
        </form> : <div className="admin-collection-grid">{items.map(item=><button key={item.id} className="admin-collection-card" onClick={()=>openCollection(item)}><img src={item.coverUrl} alt={item.title}/><div><span className={item.published?'badge published':'badge'}>{item.published?'Published':'Draft'}</span><h2>{item.title}</h2><p>{item.category} / {item.photos.length} photos</p></div></button>)}{items.length===0&&<p>No collections yet. Create your first story.</p>}</div>}
      </> : <section className="admin-members"><h2>Invite another storyteller.</h2><p>Admins can manage all collections and add other administrators. New accounts get a private password setup link; existing accounts keep their current password.</p><form onSubmit={addAdmin}><label>New administrator email<input type="email" required value={newEmail} onChange={e=>setNewEmail(e.target.value)}/></label><button disabled={busy}>{busy?'Adding...':'Grant admin access'}</button></form>{setupLink&&<div className="setup-link"><label>Private password setup link<textarea readOnly value={setupLink} rows={4}/></label><button className="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(setupLink);setNotice('Setup link copied. Share it privately with the new admin.');}catch{setNotice('Select and copy the setup link manually.');}}}>Copy setup link</button><small>No email has been sent automatically.</small></div>}<ul>{members.map(member=><li key={member.uid}><span>{member.email}</span><span>{member.disabled?'Disabled':'Administrator'}</span></li>)}</ul></section>}
    </main>
  </div>;
}
