import {useState,useEffect,useMemo} from 'react';
import {Routes,Route,NavLink,Link,useNavigate,useSearchParams,useLocation} from 'react-router-dom';
import exams from './data/exams.json';import mats from './data/materials.json';
import quizzes from './data/quizzes.json';import centers from './data/centers.json';

const P={heart:'M12 21s-7-4.6-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9z',bookmark:'M6 3h12v18l-6-4-6 4z',check:'M5 12l5 5 9-10',cal:'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',book:'M4 4h7a3 3 0 0 1 1 .2V20a3 3 0 0 0-1-.2H4zM20 4h-7a3 3 0 0 0-1 .2V20a3 3 0 0 1 1-.2h7z',pin:'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z',menu:'M4 7h16M4 12h16M4 17h16',x:'M6 6l12 12M18 6L6 18',ext:'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',plus:'M12 5v14M5 12h14',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',bell:'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',users:'M16 20v-2a4 4 0 0 0-8 0v2M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'};
const Ic=({n,f})=><svg className="ic" viewBox="0 0 24 24" width="18" height="18" fill={f?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]}/></svg>;

const DEF={fav:[],bm:[],done:[],scores:{},rem:[],tasks:[],target:''};
function useLS(k,dv){const [v,s]=useState(()=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):dv}catch{return dv}});
 useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},[k,v]);return [v,s]}
const fmt=d=>new Date(d+'T00:00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
const left=d=>Math.ceil((new Date(d+'T23:59:59')-new Date())/864e5);
const status=e=>{const t=new Date().toISOString().slice(0,10);return t<e.opens?'Upcoming':t<=e.deadline?'Open':'Closed'};
const uniq=k=>[...new Set(mats.map(m=>m[k]))];
const has=(t,q)=>t.toLowerCase().includes(q.toLowerCase());
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Modal({onClose,children}){
 useEffect(()=>{const f=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onClose]);
 return <div className="ov" onClick={onClose}><div className="md" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><button className="x" onClick={onClose} aria-label="Close">×</button>{children}</div></div>}

function Quiz({id,onClose,s}){
 const qz=quizzes[id];const [a,setA]=useState({});const [sub,setSub]=useState(false);
 const score=qz.questions.filter((q,i)=>a[i]===q.answer).length;
 const submit=()=>{setSub(true);s.set('scores',o=>({...o,[id]:Math.max(o[id]??0,score)}));s.say('Quiz scored: '+score+'/'+qz.questions.length)};
 return <Modal onClose={onClose}><h2>{qz.title}</h2>
 {qz.questions.map((q,i)=><fieldset key={i}><legend>{i+1}. {q.q}</legend>
  {q.options.map((o,j)=><label key={j} className={sub?(j===q.answer?'ok':a[i]===j?'no':''):''}><input type="radio" name={'q'+i} disabled={sub} checked={a[i]===j} onChange={()=>setA({...a,[i]:j})}/> {o}</label>)}
  {sub&&<p className="ex">{q.explain}</p>}</fieldset>)}
 {sub?<p><b>Score: {score} / {qz.questions.length}</b></p>:<button className="btn" onClick={submit} disabled={Object.keys(a).length<qz.questions.length}>Submit answers</button>}</Modal>}

function ExamCard({e,s,onOpen}){
 const fav=s.d.fav.includes(e.id),tr=s.d.rem.includes(e.id);
 return <div className="card"><div className="split"><div><h3>{e.name}</h3><div className="meta">{e.uni}</div></div>
  <button className={'icobtn '+(fav?'on':'')} onClick={()=>s.tg('fav',e.id,'Favorite')} aria-pressed={fav} aria-label="Favorite university"><Ic n="heart" f={fav}/></button></div>
  <div><span className={'chip '+status(e)}>{status(e)}</span><span className="chip demo">Demo data</span></div>
  <div className="meta">Opens {fmt(e.opens)}<br/>Deadline {fmt(e.deadline)}<br/>Exam {fmt(e.exam)}</div>
  <div className="row"><button className="btn sm" onClick={()=>onOpen(e)}>Details</button>
  <button className={'btn sm '+(tr?'on':'ghost')} onClick={()=>s.tg('rem',e.id,'Deadline')}><Ic n="bell"/>{tr?'Tracking':'Track deadline'}</button>
  <a className="btn sm ghost" href={e.site} target="_blank" rel="noreferrer">Site <Ic n="ext"/></a></div></div>}

function ExamModal({e,onClose,s}){return <Modal onClose={onClose}>
 <h2>{e.name}</h2><p className="meta">{e.uni}</p>
 <p><span className={'chip '+status(e)}>{status(e)}</span><span className="chip demo">Demo data</span></p>
 <p><b>Applications open:</b> {fmt(e.opens)}<br/><b>Application deadline:</b> {fmt(e.deadline)} ({left(e.deadline)>=0?left(e.deadline)+' days left':'passed'})<br/><b>Examination date:</b> {fmt(e.exam)}</p>
 <p className="meta">These dates are demonstration data. Confirm all schedules and requirements on the official admissions page.</p>
 <div className="row"><a className="btn" href={e.site} target="_blank" rel="noreferrer">Official website <Ic n="ext"/></a>
 <button className="btn ghost" onClick={()=>s.tg('fav',e.id,'Favorite')}><Ic n="heart" f={s.d.fav.includes(e.id)}/>{s.d.fav.includes(e.id)?'Favorited':'Favorite'}</button>
 <button className="btn ghost" onClick={()=>s.tg('rem',e.id,'Deadline')}><Ic n="bell"/>{s.d.rem.includes(e.id)?'Tracking':'Track deadline'}</button></div></Modal>}

function Home({s}){
 const nav=useNavigate();const [q,setQ]=useState('');const [sel,setSel]=useState(null);
 const up=exams.filter(e=>status(e)!=='Closed').sort((a,b)=>a.deadline.localeCompare(b.deadline));
 const n=up[0];
 return <>
 <section className="hero"><div className="wrap"><div><span className="tag">College admission knowledge hub</span>
 <h1>Your Vision. Your University. Your Future.</h1>
 <p>AD-Vision brings exam schedules, reviewers, practice quizzes and review centers for Philippine college applicants into one organized place.</p>
 <form className="search" onSubmit={e=>{e.preventDefault();nav('/calendar?q='+encodeURIComponent(q))}}>
  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search a university or entrance exam" aria-label="Search"/><button className="btn gold">Search</button></form></div>
 {n&&<div className="glass"><div className="meta" style={{color:'#cfd5f5'}}>Nearest application deadline</div><b>{left(n.deadline)}</b>days left for {n.name}<br/><span style={{color:'#cfd5f5',fontSize:'.9rem'}}>{n.uni} · {fmt(n.deadline)} (demo)</span>
  <div className="row"><button className="btn gold sm" onClick={()=>setSel(n)}>View details</button></div></div>}</div></section>
 <div className="wrap"><div className="stats"><div><b>{exams.length}</b>Universities and exams</div><div><b>{mats.length}</b>Learning materials</div><div><b>{Object.keys(quizzes).length}</b>Scored quizzes</div><div><b>{centers.length}</b>Review center listings</div></div>
 <h2>Upcoming exams</h2><div className="grid">{up.slice(0,3).map(e=><ExamCard key={e.id} e={e} s={s} onOpen={setSel}/>)}</div>
 <h2>Quick access</h2>
 <div className="grid">{[['/reviewers','book','Reviewers and quizzes','Study guides, mock exams and scored practice quizzes.'],['/centers','pin','Review centers','Find online and face-to-face centers by city.'],['/dashboard','check','My dashboard','Favorites, tasks, deadlines and progress, saved on your device.']].map(([p,i,t,d])=>
  <Link key={p} to={p} className="card" style={{textDecoration:'none',color:'inherit'}}><div className="ico"><Ic n={i}/></div><h3>{t}</h3><div className="meta">{d}</div></Link>)}</div>
 <h2>Featured review centers</h2>
 <div className="grid">{centers.slice(1,4).map(c=><div className="card" key={c.id}><h3>{c.name}</h3><div><span className="chip">{c.mode}</span><span className="chip demo">Fictional demo</span></div><div className="meta">{c.city}, {c.region}</div><div className="row"><Link className="btn sm ghost" to="/centers">Browse directory</Link></div></div>)}</div></div>
 {sel&&<ExamModal e={sel} s={s} onClose={()=>setSel(null)}/>}</>}

function Calendar({s}){
 const [sp]=useSearchParams();
 const [q,setQ]=useState(sp.get('q')||'');const [st,setSt]=useState('');const [mo,setMo]=useState('');const [view,setView]=useState('list');const [sort,setSort]=useState('deadline');const [sel,setSel]=useState(null);
 const list=useMemo(()=>exams.filter(e=>has(e.uni+' '+e.name,q)&&(!st||status(e)===st)&&(mo===''||new Date(e.exam+'T00:00:00').getMonth()==mo)).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):a[sort].localeCompare(b[sort])),[q,st,mo,sort]);
 const months=[...new Set(list.map(e=>e.exam.slice(0,7)))].sort();
 return <section className="wrap" style={{paddingTop:28}}><h1>Admission calendar</h1>
 <div className="filters"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search university or exam" aria-label="Search exams"/>
 <select value={st} onChange={e=>setSt(e.target.value)} aria-label="Status"><option value="">All statuses</option><option>Upcoming</option><option>Open</option><option>Closed</option></select>
 <select value={mo} onChange={e=>setMo(e.target.value)} aria-label="Exam month"><option value="">All exam months</option>{MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}</select>
 <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort"><option value="deadline">Sort: nearest deadline</option><option value="exam">Sort: exam date</option><option value="name">Sort: name</option></select>
 <button className={'btn '+(view==='list'?'on':'ghost')} onClick={()=>setView('list')}>List</button><button className={'btn '+(view==='cal'?'on':'ghost')} onClick={()=>setView('cal')}>Calendar</button></div>
 <p className="meta">All dates are demonstration data. Confirm on the official site.</p>
 {!list.length?<div className="panel">No exams match your filters. <button className="btn sm ghost" onClick={()=>{setQ('');setSt('');setMo('')}}>Clear filters</button></div>:view==='list'?<div className="grid">{list.map(e=><ExamCard key={e.id} e={e} s={s} onOpen={setSel}/>)}</div>:
  months.map(m=><div key={m}><div className="month">{new Date(m+'-01T00:00:00').toLocaleDateString('en-PH',{month:'long',year:'numeric'})} (exam dates)</div><div className="grid">{list.filter(e=>e.exam.startsWith(m)).map(e=><ExamCard key={e.id} e={e} s={s} onOpen={setSel}/>)}</div></div>)}
 {sel&&<ExamModal e={sel} s={s} onClose={()=>setSel(null)}/>}</section>}

function Reviewers({s}){
 const [q,setQ]=useState('');const [sub,setSub]=useState('');const [ex,setEx]=useState('');const [df,setDf]=useState('');const [pv,setPv]=useState(null);const [qz,setQz]=useState(null);
 const {d,tg}=s;
 const list=mats.filter(m=>has(m.title+' '+m.content,q)&&(!sub||m.subject===sub)&&(!ex||m.exam===ex)&&(!df||m.difficulty===df));
 const sl=(v,f,all,o)=><select value={v} onChange={e=>f(e.target.value)} aria-label={all}><option value="">{all}</option>{o.map(x=><option key={x}>{x}</option>)}</select>;
 return <section className="wrap" style={{paddingTop:28}}><h1>Reviewers and learning materials</h1>
 <div className="filters"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search resources" aria-label="Search resources"/>
 {sl(sub,setSub,'All subjects',uniq('subject'))}{sl(ex,setEx,'All exams',uniq('exam'))}{sl(df,setDf,'All difficulties',['Easy','Medium','Hard'])}</div>
 {!list.length&&<div className="panel">No materials match. Clear a filter to see more.</div>}
 <div className="grid">{list.map(m=><div className="card" key={m.id}><div className="split"><h3>{m.title}</h3>
  <button className={'icobtn '+(d.bm.includes(m.id)?'on':'')} style={d.bm.includes(m.id)?{color:'#d4a63a'}:null} onClick={()=>tg('bm',m.id,'Bookmark')} aria-pressed={d.bm.includes(m.id)} aria-label="Bookmark"><Ic n="bookmark" f={d.bm.includes(m.id)}/></button></div>
  <div><span className="chip">{m.type}</span><span className="chip">{m.subject}</span><span className="chip">{m.exam}</span><span className="chip">{m.difficulty}</span></div>
  <div className="row"><button className="btn sm" onClick={()=>setPv(m)}>Preview</button>
  {m.quiz&&<button className="btn sm gold" onClick={()=>setQz(m.quiz)}>Take quiz{d.scores[m.quiz]!=null?` (best ${d.scores[m.quiz]}/${quizzes[m.quiz].questions.length})`:''}</button>}
  <button className={'btn sm '+(d.done.includes(m.id)?'on':'ghost')} onClick={()=>tg('done',m.id,'Completion')}><Ic n="check"/>{d.done.includes(m.id)?'Completed':'Mark complete'}</button></div></div>)}</div>
 {pv&&<Modal onClose={()=>setPv(null)}><h2>{pv.title}</h2><p className="meta">{pv.subject} · {pv.exam} · {pv.difficulty}</p><p>{pv.content}</p></Modal>}
 {qz&&<Quiz id={qz} s={s} onClose={()=>setQz(null)}/>}</section>}

function Centers(){
 const [q,setQ]=useState('');const [mode,setMode]=useState('');const [ex,setEx]=useState('');const [sel,setSel]=useState(null);
 const all=[...new Set(centers.flatMap(c=>c.exams))].sort();
 const list=centers.filter(c=>has(c.city+' '+c.region+' '+c.name,q)&&(!mode||c.mode===mode)&&(!ex||c.exams.includes(ex)));
 return <section className="wrap" style={{paddingTop:28}}><h1>Review center directory</h1>
 <p className="meta">All listings are fictional demonstration entries. None is a partner of AD-Vision.</p>
 <div className="filters"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by city or province" aria-label="Search by location"/>
 <select value={mode} onChange={e=>setMode(e.target.value)} aria-label="Mode"><option value="">Online and face-to-face</option><option>Online</option><option>Face-to-face</option></select>
 <select value={ex} onChange={e=>setEx(e.target.value)} aria-label="Specialization"><option value="">All exams</option>{all.map(x=><option key={x}>{x}</option>)}</select></div>
 {!list.length&&<div className="panel">No centers found. Try another city, or choose Online to see centers open to anyone.</div>}
 <div className="grid">{list.map(c=><div className="card" key={c.id}><h3>{c.name}</h3>
  <div><span className="chip">{c.mode}</span><span className="chip demo">Fictional demo</span></div><div className="meta">{c.city}, {c.region}</div><p className="meta">{c.desc}</p>
  <div className="row"><button className="btn sm" onClick={()=>setSel(c)}>View details</button></div></div>)}</div>
 {sel&&<Modal onClose={()=>setSel(null)}><h2>{sel.name}</h2><p><span className="chip">{sel.mode}</span><span className="chip demo">Fictional demo</span></p>
  <p>{sel.desc}</p><p><b>Location:</b> {sel.city}, {sel.region}<br/><b>Address:</b> {sel.address||'Not verified'}</p><p><b>Programs:</b> {sel.exams.join(', ')}</p>
  {sel.website?<a className="btn" href={sel.website} target="_blank" rel="noreferrer">Visit website <Ic n="ext"/></a>:<p className="meta">No website: this is a placeholder entry. Real listings can include a verified link in centers.json.</p>}</Modal>}</section>}

function Tasks({s}){
 const [t,setT]=useState('');const [due,setDue]=useState('');const [f,setF]=useState('all');
 const add=e=>{e.preventDefault();if(!t.trim())return;s.set('tasks',a=>[...a,{id:Date.now(),text:t.trim(),due,done:false}]);setT('');setDue('');s.say('Task added')};
 const list=s.d.tasks.filter(x=>f==='all'||(f==='done')===x.done);
 return <div className="panel"><h2>Study tasks</h2>
 <form className="filters" onSubmit={add}><input value={t} onChange={e=>setT(e.target.value)} placeholder="e.g. Finish algebra drills" aria-label="Task"/><input type="date" value={due} onChange={e=>setDue(e.target.value)} aria-label="Due date" style={{flex:'0 1 160px'}}/><button className="btn"><Ic n="plus"/>Add task</button></form>
 <div className="row" style={{paddingTop:0}}>{['all','active','done'].map(x=><button key={x} className={'btn sm '+(f===x?'on':'ghost')} onClick={()=>setF(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div>
 {!list.length&&<p className="meta">{s.d.tasks.length?'No tasks in this filter.':'No tasks yet. Add your first study task above.'}</p>}
 {list.map(x=><div key={x.id} className={'task '+(x.done?'done':'')}><input type="checkbox" checked={x.done} onChange={()=>s.set('tasks',a=>a.map(y=>y.id===x.id?{...y,done:!y.done}:y))} aria-label="Done"/><span>{x.text}{x.due&&<em className="meta"> · due {fmt(x.due)}</em>}</span>
  <button className="icobtn" onClick={()=>{s.set('tasks',a=>a.filter(y=>y.id!==x.id));s.say('Task deleted')}} aria-label="Delete task"><Ic n="trash"/></button></div>)}</div>}

function Dashboard({s,profiles,setProfiles,pid,setPid}){
 const {d,set,tg}=s;const [np,setNp]=useState('');const [pv,setPv]=useState(null);
 const prof=profiles.find(p=>p.id===pid);const pct=Math.round(d.done.length/mats.length*100);
 const addP=e=>{e.preventDefault();if(!np.trim())return;const id='p'+Date.now();setProfiles([...profiles,{id,name:np.trim()}]);setPid(id);setNp('')};
 const delP=()=>{if(profiles.length<2||!confirm('Delete profile “'+prof.name+'” and its saved data?'))return;try{localStorage.removeItem('adv_p_'+pid)}catch{}const r=profiles.filter(p=>p.id!==pid);setProfiles(r);setPid(r[0].id)};
 const E=id=>exams.find(x=>x.id===id);const tr=d.rem.map(E).sort((a,b)=>a.deadline.localeCompare(b.deadline));
 const tgt=d.target&&E(d.target);
 return <section className="wrap" style={{paddingTop:28}}><h1>My dashboard</h1>
 <p className="meta">Your data is saved in this browser only, so it stays after you close or refresh. No account needed.</p>
 <div className="panel"><h2><Ic n="users"/> Local profile</h2>
  <div className="filters"><select value={pid} onChange={e=>setPid(e.target.value)} aria-label="Switch profile">{profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
  <button className="btn ghost" onClick={delP} disabled={profiles.length<2}>Delete profile</button></div>
  <form className="filters" onSubmit={addP}><input value={np} onChange={e=>setNp(e.target.value)} placeholder="New profile name" aria-label="New profile name"/><button className="btn"><Ic n="plus"/>Create profile</button></form></div>
 <div className="panel"><h2>Study progress</h2><progress value={d.done.length} max={mats.length}/><p className="meta">{d.done.length} of {mats.length} resources completed ({pct}%) · {d.tasks.filter(t=>t.done).length} of {d.tasks.length} tasks done</p>
  <label>My target exam: <select value={d.target} onChange={e=>set('target',e.target.value)}><option value="">Not set</option>{exams.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
  {tgt&&<p className="meta">{tgt.uni}: deadline {fmt(tgt.deadline)} (demo). Related materials: {mats.filter(m=>m.exam===tgt.name).map(m=>m.title).join(', ')||'none yet'}.</p>}</div>
 <Tasks s={s}/>
 <div className="panel"><h2>Tracked deadlines</h2>{tr.length?tr.map(e=><div className="task" key={e.id}><span><b>{e.name}</b> · {fmt(e.deadline)} <em className="meta">({left(e.deadline)>=0?left(e.deadline)+' days left':'passed'})</em></span><button className="icobtn" onClick={()=>tg('rem',e.id,'Deadline')} aria-label="Stop tracking"><Ic n="x"/></button></div>):<p className="meta">No tracked deadlines. Use “Track deadline” in the <Link to="/calendar">calendar</Link>.</p>}</div>
 <div className="panel"><h2>Favorite universities</h2>{d.fav.length?<div className="row" style={{paddingTop:0}}>{d.fav.map(E).map(e=><span className="chip" key={e.id}>{e.uni} ({e.name})</span>)}</div>:<p className="meta">No favorites yet. Tap the heart on an exam in the <Link to="/calendar">calendar</Link>.</p>}</div>
 <div className="panel"><h2>Saved resources</h2>{d.bm.length?d.bm.map(id=>mats.find(m=>m.id===id)).map(m=><div className="task" key={m.id}><span>{m.title} <em className="meta">· {m.subject}</em></span>
  <button className="btn sm ghost" onClick={()=>setPv(m)}>Open</button><button className="btn sm ghost" onClick={()=>tg('done',m.id,'Completion')}><Ic n="check"/>{d.done.includes(m.id)?'Completed':'Complete'}</button><button className="icobtn" onClick={()=>tg('bm',m.id,'Bookmark')} aria-label="Remove bookmark"><Ic n="x"/></button></div>):<p className="meta">Nothing saved yet. Bookmark materials in <Link to="/reviewers">Reviewers</Link>.</p>}</div>
 <div className="panel"><h2>Quiz scores</h2>{Object.keys(d.scores).length?<ul>{Object.entries(d.scores).map(([k,v])=><li key={k}>{quizzes[k].title}: best {v} / {quizzes[k].questions.length}</li>)}</ul>:<p className="meta">No quizzes taken yet.</p>}</div>
 <button className="btn ghost" onClick={()=>{if(confirm('Clear all data for this profile?')){s.reset();s.say('Profile data cleared')}}}>Reset this profile’s data</button>
 {pv&&<Modal onClose={()=>setPv(null)}><h2>{pv.title}</h2><p className="meta">{pv.subject} · {pv.exam} · {pv.difficulty}</p><p>{pv.content}</p></Modal>}</section>}

function About(){
 const K=[['book','Centralized admission information','Exam schedules, deadlines and official links in one place instead of scattered across many university pages.'],['check','Organized educational resources','Materials are classified by subject, exam, type and difficulty so they are easy to browse.'],['bookmark','Knowledge storage and retrieval','Search, filters and sorting retrieve the right item fast; bookmarks and progress are stored for later.'],['bell','Distribution of information','Deadline tracking and a calendar view push the right dates to the right student.'],['users','Accessible learning materials','Free, static and mobile-friendly, so any student with a browser can use it.'],['pin','Support for students and review organizations','Students discover review centers by location while organizations gain a clear directory presence.']];
 return <section className="wrap" style={{paddingTop:28}}><h1>About AD-Vision</h1>
 <p style={{maxWidth:'70ch'}}>AD-Vision is a Knowledge Management System for Philippine college admission. It helps incoming college applicants find when to apply, what to study and where to review, and it gives review organizations a place to be discovered.</p>
 <h2>Objectives</h2><ul><li>Gather admission information from many universities into one searchable platform.</li><li>Provide organized reviewers and practice quizzes for major entrance exams.</li><li>Help students track deadlines, tasks and study progress.</li><li>Connect students with local and online review centers.</li></ul>
 <h2>How AD-Vision works as a KMS</h2><div className="grid">{K.map(([i,t,d])=><div className="card" key={t}><div className="ico"><Ic n={i}/></div><h3>{t}</h3><div className="meta">{d}</div></div>)}</div>
 <div className="panel"><b>Demonstration notice.</b> Exam dates and review centers in this prototype are sample data. Always verify details on each university’s official admissions page.</div></section>}

function Shell({pid,setPid,profiles,setProfiles}){
 const [d,setD]=useLS('adv_p_'+pid,DEF);const [msg,setMsg]=useState('');const [open,setOpen]=useState(false);const loc=useLocation();
 useEffect(()=>{setOpen(false);window.scrollTo(0,0)},[loc.pathname]);
 const say=m=>{setMsg(m);clearTimeout(window.__t);window.__t=setTimeout(()=>setMsg(''),1800)};
 const set=(k,v)=>setD(p=>({...p,[k]:typeof v==='function'?v(p[k]):v}));
 const tg=(k,id,l)=>{const on=d[k].includes(id);set(k,a=>on?a.filter(x=>x!==id):[...a,id]);say(l+(on?' removed':' saved'))};
 const s={d:{...DEF,...d},set,tg,say,reset:()=>setD(DEF)};
 const links=[['/','Home'],['/calendar','Calendar'],['/reviewers','Reviewers'],['/centers','Review centers'],['/dashboard','Dashboard'],['/about','About']];
 return <>
 <header className="top"><div className="wrap bar"><Link to="/" className="logo">AD<b>Vision</b></Link>
 <nav className={open?'open':''}>{links.map(([p,l])=><NavLink key={p} to={p} end={p==='/'}>{l}</NavLink>)}</nav>
 <button className="burger" onClick={()=>setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}><Ic n={open?'x':'menu'}/></button></div></header>
 <main><Routes><Route path="/" element={<Home s={s}/>}/><Route path="/calendar" element={<Calendar s={s}/>}/><Route path="/reviewers" element={<Reviewers s={s}/>}/><Route path="/centers" element={<Centers/>}/>
 <Route path="/dashboard" element={<Dashboard s={s} profiles={profiles} setProfiles={setProfiles} pid={pid} setPid={setPid}/>}/><Route path="/about" element={<About/>}/><Route path="*" element={<section className="wrap" style={{paddingTop:40}}><h1>Page not found</h1><Link className="btn" to="/">Go home</Link></section>}/></Routes></main>
 <footer><div className="wrap"><b>AD-Vision</b> · Your Vision. Your University. Your Future.<br/>Contact: hello@ad-vision.example (placeholder). Exam dates and review centers are demonstration data, not official information.</div></footer>
 {msg&&<div className="toast" role="status">{msg}</div>}</>}

export default function App(){
 const [profiles,setProfiles]=useLS('adv_profiles',[{id:'p1',name:'Student 1'}]);const [active,setPid]=useLS('adv_active','p1');
 const pid=profiles.some(p=>p.id===active)?active:profiles[0].id;
 return <Shell key={pid} pid={pid} setPid={setPid} profiles={profiles} setProfiles={setProfiles}/>}
