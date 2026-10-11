"use client";

import {useEffect,useMemo,useRef,useState} from 'react';
import {BookOpen, BriefcaseBusiness, GraduationCap, ImagePlus, LogOut, Newspaper, Plus, Save, Settings, ShieldCheck, Trash2, Users, Award, Menu, X, ExternalLink, Pencil, ArrowLeft, ArrowUpRight} from 'lucide-react';
import type {PortfolioContent} from '../lib/content-types';

type Section=keyof PortfolioContent;
type Entry=Record<string,string>;
const sections: {id:Section;label:string;desc:string;icon:typeof Settings}[] = [
 {id:'site',label:'Profile',desc:'Name, introduction and LinkedIn',icon:Settings},
 {id:'projects',label:'Projects',desc:'Portfolio and impact stories',icon:BriefcaseBusiness},
 {id:'publications',label:'Publications',desc:'Press and written articles',icon:Newspaper},
 {id:'areas',label:'Expertise',desc:'What Cecil works on',icon:BookOpen},
 {id:'education',label:'Education',desc:'Studies and qualifications',icon:GraduationCap},
 {id:'volunteering',label:'Volunteering',desc:'Community and leadership',icon:Users},
 {id:'certifications',label:'Certifications',desc:'Courses and credentials',icon:Award},
 {id:'affiliations',label:'Organisations',desc:'Memberships and affiliations',icon:ShieldCheck}
];
const labels: Record<string,string>={name:'Name',linkedin:'LinkedIn profile URL',headline:'Main headline',intro:'Short introduction',no:'Display number',number:'Display number',slug:'Page address (slug)',category:'Category',title:'Title',subtitle:'Short description',image:'Cover photograph',status:'Label / status',description:'Description',tag:'Short label',details:'Full details',school:'Institution',degree:'Degree / qualification',date:'Date or period',notes:'Additional information',role:'Position / role',org:'Organisation',year:'Year / period',publisher:'Newspaper / publisher',byline:'Byline',summary:'Article summary',issuer:'Issued by'};
const longFields=new Set(['intro','description','details','subtitle','summary','notes']);
const defaults:Record<Exclude<Section,'site'>,Entry>={
 areas:{number:'',slug:'',title:'',description:'',tag:'',details:''},
 projects:{no:'',slug:'',category:'',title:'',subtitle:'',image:'',status:''},
 education:{school:'',degree:'',date:'',notes:''},
 volunteering:{role:'',org:'',year:'',notes:''},
 affiliations:{name:'',role:'',date:''},
 publications:{title:'',date:'',publisher:'',byline:'',image:'',summary:''},
 certifications:{name:'',issuer:''}
};
function titleFor(section:Section,row:Entry,index:number){return row.title||row.school||row.name||row.role||`${sections.find(s=>s.id===section)?.label} ${index+1}`}
function detailsFor(row:Entry){return row.subtitle||row.degree||row.org||row.publisher||row.description||row.issuer||row.date||''}

export default function Admin(){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [data,setData]=useState<PortfolioContent|null>(null);
 const [saved,setSaved]=useState<PortfolioContent|null>(null);const [tab,setTab]=useState<Section>('site');
 const [index,setIndex]=useState<number|null>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const [menuOpen,setMenuOpen]=useState(false);const [search,setSearch]=useState('');
 const fileInput=useRef<HTMLInputElement>(null);const [uploading,setUploading]=useState(false);
 const changed=Boolean(data&&saved&&JSON.stringify(data)!==JSON.stringify(saved));
 const selection=sections.find(s=>s.id===tab)!;
 const rows=data && tab!=='site'?data[tab] as Entry[]:[];
 const filtered=useMemo(()=>rows.map((row,i)=>({row,i})).filter(({row})=>Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())),[rows,search]);
 async function load(){const response=await fetch('/api/admin/content',{cache:'no-store'});if(response.ok){const content:PortfolioContent=await response.json();setData(content);setSaved(structuredClone(content));return;}if(response.status!==401)setMessage('Could not load content. Please refresh the page.')}
 useEffect(()=>{void load()},[]);
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const body=await response.json();if(!response.ok)throw Error(body.error||'Could not sign in');setPassword('');await load();}catch(error){setMessage(error instanceof Error?error.message:'Login failed')}finally{setBusy(false)}}
 async function persist(){if(!data)return;setBusy(true);setMessage('');try{const response=await fetch('/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const body=await response.json();if(!response.ok)throw Error(body.error||'Unable to save');setSaved(structuredClone(data));setMessage('Changes saved successfully. They are now available on the website.')}catch(error){setMessage(error instanceof Error?error.message:'Unable to save changes')}finally{setBusy(false)}}
 function navigate(next:Section){if(changed&&!window.confirm('You have unsaved changes. Leave without saving?'))return;setData(saved?structuredClone(saved):data);setTab(next);setIndex(null);setSearch('');setMessage('');setMenuOpen(false)}
 function editField(key:string,value:string){if(!data)return;if(tab==='site'){setData({...data,site:{...data.site,[key]:value}});return;}if(index===null)return;const updated=[...(data[tab] as Entry[])];updated[index]={...updated[index],[key]:value};setData({...data,[tab]:updated});}
 function add(){if(!data||tab==='site')return;const updated=[...(data[tab] as Entry[]),{...defaults[tab]}];setData({...data,[tab]:updated});setIndex(updated.length-1);setMessage('New entry: fill in the fields, then click Save changes.');}
 function remove(){if(!data||tab==='site'||index===null||!window.confirm('Delete this entry? Click Save changes to confirm the deletion on the website.'))return;setData({...data,[tab]:(data[tab] as Entry[]).filter((_,i)=>i!==index)});setIndex(null);}
 async function upload(file:File){if(!data)return;setUploading(true);setMessage('');try{const fd=new FormData();fd.append('image',file);const response=await fetch('/api/admin/upload',{method:'POST',body:fd});const body=await response.json();if(!response.ok)throw Error(body.error||'Upload failed');editField('image',body.url);setMessage('Photograph uploaded. Click Save changes to use it on the website.')}catch(error){setMessage(error instanceof Error?error.message:'Upload failed')}finally{setUploading(false);if(fileInput.current)fileInput.current.value=''}}
 async function signout(){if(changed&&!window.confirm('Sign out and discard unsaved changes?'))return;await fetch('/api/admin/logout',{method:'POST'});setData(null);setSaved(null);setPassword('');setEmail('');}
 function renderField(key:string,value:string){const id=`edit-${key}`;return <div key={key} className="cms-field"><label htmlFor={id}>{labels[key]||key}</label>{longFields.has(key)?<textarea id={id} rows={key==='details'?6:3} value={value} onChange={e=>editField(key,e.target.value)}/>:<input id={id} type={key==='linkedin'?'url':'text'} value={value} onChange={e=>editField(key,e.target.value)} placeholder={labels[key]||key}/>}{key==='slug'&&<small>Use short words separated by hyphens, such as youth-advocacy.</small>}{key==='image'&&<><div className="cms-image-field">{value&&<img src={value} alt="Current cover"/>}<div><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose photo to upload" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file)}}/><small>Choose JPG, PNG or WebP, up to 5 MB. You can also paste a media path above.</small>{uploading&&<span>Uploading photograph…</span>}</div></div></>}</div>}
 return <main className="cms-shell">
 {!data?<div className="cms-login-wrap"><div className="cms-login"><span className="cms-logo">CD.</span><span className="cms-eyebrow">PERSONAL WEBSITE ADMINISTRATION</span><h1>Welcome back.</h1><p>Sign in to manage Cecil's portfolio, photographs, articles and career history.</p><form onSubmit={login}><label htmlFor="admin-email">Email address</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="cecil@example.com"/><label htmlFor="admin-password">Password</label><input autoFocus id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/><button className="cms-primary" disabled={busy}>{busy?'Signing in…':'Sign in to dashboard'}</button></form>{message&&<p className="cms-alert" role="alert">{message}</p>}<a href="/"><ArrowLeft size={16} aria-hidden="true"/> Return to website</a></div></div>:
 <div className="cms-app">
 <aside className={'cms-sidebar'+(menuOpen?' open':'')}><div className="cms-brand"><strong>CD.</strong><div><b>Cecil Dadzie</b><small>Portfolio Studio</small></div><button className="cms-mobile-close" onClick={()=>setMenuOpen(false)} aria-label="Close menu"><X size={21}/></button></div><div className="cms-side-label">MANAGE WEBSITE</div><nav aria-label="Content management sections">{sections.map(s=>{const Icon=s.icon;return <button key={s.id} className={tab===s.id?'active':''} onClick={()=>navigate(s.id)}><Icon size={18}/><span>{s.label}</span><span className="cms-nav-count">{s.id==='site'?'':(data[s.id] as Entry[]).length}</span></button>})}</nav><div className="cms-side-bottom"><a target="_blank" rel="noopener noreferrer" href="/"><ExternalLink size={16}/> View website</a><button onClick={signout}><LogOut size={16}/> Sign out</button></div></aside>
 {menuOpen&&<button className="cms-backdrop" onClick={()=>setMenuOpen(false)} aria-label="Close navigation"/>}
 <div className="cms-workspace"><header className="cms-topbar"><button className="cms-menu-toggle" onClick={()=>setMenuOpen(true)} aria-label="Open menu"><Menu size={22}/></button><div><span className="cms-eyebrow">CONTENT MANAGER</span><strong>{index===null?selection.label:'Edit entry'}</strong></div><div className="cms-header-actions"><a className="cms-website-link" href="/" target="_blank" rel="noopener noreferrer">View website <ExternalLink size={14}/></a><button className="cms-primary" onClick={persist} disabled={busy||!changed}><Save size={16}/>{busy?'Saving…':'Save changes'}</button></div></header>
 <section className="cms-main"><div className="cms-main-head"><div><span className="cms-eyebrow">{index===null?'WEBSITE CONTENT':'EDIT CONTENT'}</span><h1>{index===null?selection.label:titleFor(tab,rows[index]||{},index)}</h1><p>{index===null?selection.desc:'Make your changes below, then save to update the website.'}</p></div>{tab!=='site'&&index===null&&<button className="cms-primary" onClick={add}><Plus size={17}/> Add new</button>}</div>
 {message&&<div className="cms-alert" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss"><X size={17} aria-hidden="true"/></button></div>}
 {changed&&<div className="cms-unsaved">You have unsaved changes. Select <b>Save changes</b> when you are ready.</div>}
 {tab==='site'?<div className="cms-editor"><div className="cms-editor-title"><Settings size={19}/><div><h2>Personal profile</h2><p>These details appear in the homepage and contact links.</p></div></div><div className="cms-form-grid">{Object.entries(data.site).map(([key,value])=>renderField(key,value))}</div></div>:
 index===null?<><div className="cms-listbar"><div><strong>{rows.length} {rows.length===1?'entry':'entries'}</strong><span>Choose an entry to make changes</span></div><input aria-label="Search entries" placeholder="Search this section…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="cms-entry-list">{filtered.map(({row,i})=><button className="cms-entry" key={`${tab}-${i}`} onClick={()=>setIndex(i)}><span className="cms-entry-icon">{row.image?<img src={row.image} alt=""/>:<Pencil size={18}/>}</span><span className="cms-entry-text"><strong>{titleFor(tab,row,i)}</strong><small>{detailsFor(row)||'Click to edit details'}</small></span><span className="cms-entry-action">Edit <ArrowUpRight size={15} aria-hidden="true"/></span></button>)}{filtered.length===0&&<div className="cms-empty">No entries found. {search?'Try another search.':'Click Add new to create your first entry.'}</div>}</div></>:
 <div className="cms-editor"><div className="cms-editor-title"><button className="cms-back" onClick={()=>setIndex(null)} aria-label="Back to entries"><ArrowLeft size={20}/></button><div><h2>Edit {selection.label.toLowerCase()}</h2><p>Update this entry using the fields below.</p></div></div><div className="cms-form-grid">{Object.entries({...defaults[tab],...rows[index]}).map(([key,value])=>renderField(key,String(value??'')))}</div><div className="cms-editor-actions"><button className="cms-danger" onClick={remove}><Trash2 size={16}/> Delete entry</button><button className="cms-primary" disabled={!changed||busy} onClick={persist}><Save size={16}/> Save changes</button></div></div>}
 <div className="cms-help"><strong>Need to update the website?</strong><p>Make your edits, upload images where needed, then choose Save changes. Your existing content stays available until you save.</p></div>
 </section></div></div>}
 </main>
}
