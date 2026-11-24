document.addEventListener('DOMContentLoaded',()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const hd=$('.hd'),nav=$('#nav'),ham=$('#ham');
const setOpen=o=>{nav.classList.toggle('open',o);ham.setAttribute('aria-expanded',o)};
ham.addEventListener('click',e=>{e.stopPropagation();setOpen(!nav.classList.contains('open'))});
document.addEventListener('click',()=>setOpen(false));
const onScroll=()=>hd.classList.toggle('sc',scrollY>20);onScroll();addEventListener('scroll',onScroll,{passive:true});
// smooth anchors + service preselect
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const id=a.getAttribute('href').slice(1),t=id&&document.getElementById(id);if(!t)return;e.preventDefault();
 if(a.dataset.service){const s=$('#enq select');if(s)s.value=decodeURIComponent(a.dataset.service.replace(/\+/g,' '))}
 setOpen(false);t.scrollIntoView({behavior:calm?'auto':'smooth',block:'start'});
 try{history.replaceState(null,'','#'+id)}catch(_){}}));
// scroll-spy + header theme
const links=$$('.nv a[href^="#"]:not(.nv-cta)');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
 links.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id));
 document.body.dataset.theme=e.target.dataset.theme||'light'}),{rootMargin:'-40% 0px -55% 0px'});
$$('main section[id]').forEach(s=>io.observe(s));
if(calm)document.querySelectorAll('.orb').forEach(s=>{try{s.pauseAnimations()}catch(_){}});
// pause hero animation when off-screen
const hero=$('#home');if(hero&&'IntersectionObserver' in window)new IntersectionObserver(es=>hero.classList.toggle('off',!es[0].isIntersecting)).observe(hero);
// work filter + carousel
const track=$('#track'),dotsEl=$('#dots'),cards=track?$$('.pc',track):[],feat=$('.feat');
if(track){
const gap=24,per=()=>innerWidth<700?1:innerWidth<1100?2:3,vis=()=>cards.filter(c=>!c.hidden);
const step=()=>{const c=vis()[0];return c?c.offsetWidth+gap:0};
const pages=()=>Math.max(1,Math.ceil(vis().length/per()));
const page=()=>Math.round(track.scrollLeft/(step()*per()||1));
function dots(){dotsEl.innerHTML='';for(let i=0;i<pages();i++){const b=document.createElement('button');b.setAttribute('aria-label','Page '+(i+1));b.onclick=()=>go(i);dotsEl.appendChild(b)}mark()}
function mark(){$$('button',dotsEl).forEach((b,i)=>b.classList.toggle('on',i===Math.min(page(),pages()-1)))}
function go(i){i=Math.max(0,Math.min(pages()-1,i));track.scrollTo({left:i*step()*per(),behavior:calm?'auto':'smooth'})}
$('#prev').onclick=()=>go(page()-1);$('#next').onclick=()=>go(page()+1);
track.addEventListener('scroll',()=>requestAnimationFrame(mark),{passive:true});addEventListener('resize',dots);
$$('.chip').forEach(c=>c.addEventListener('click',()=>{$$('.chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');const f=c.dataset.f;
 const ok=el=>f==='all'||el.dataset.tags.split(' ').includes(f);
 cards.forEach(p=>p.hidden=!ok(p));feat.hidden=!ok(feat);track.scrollLeft=0;dots()}));
dots();
}
// preselect service from /services?service=...
try{const sv=new URLSearchParams(location.search).get('service'),sel=$('#enq select');if(sv&&sel)sel.value=sv}catch(_){}
// enquiry form
const form=$('#enq');
if(form){
const btn=$('.sub',form),idle=btn.innerHTML;let busy=false,tm;
const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
toast.innerHTML='<button type="button" aria-label="Close">×</button><h4></h4><p></p>';document.body.appendChild(toast);
$('button',toast).addEventListener('click',()=>toast.classList.remove('show'));
const show=(err,t,m)=>{clearTimeout(tm);toast.classList.toggle('err',err);$('h4',toast).textContent=t;$('p',toast).textContent=m;toast.classList.add('show');tm=setTimeout(()=>toast.classList.remove('show'),err?9000:10000)};
form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('')});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 for(const el of $$('[required]',form)){if(!el.value.trim()){el.setCustomValidity('Please fill out this field.');el.reportValidity();return}
  if(el.type==='email'&&!el.checkValidity()){el.reportValidity();return}}
 busy=true;btn.disabled=true;btn.setAttribute('aria-busy','true');btn.innerHTML='<span class="spin"></span>Sending…';
 const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),20000);
 try{
  const r=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:ctl.signal});
  const j=await r.json().catch(()=>({}));
  if(r.ok&&j.ok){form.reset();show(false,'Project enquiry submitted!','Thank you for contacting ELTORA. We’ve received your project details and will get back to you soon.')}
  else show(true,'Enquiry not sent',(r.status===400||r.status===429)&&j.error?j.error:'We couldn’t send your enquiry. Please try again, or contact us on WhatsApp +91 98439 83376.');
 }catch(_){show(true,'Enquiry not sent','We couldn’t send your enquiry. Please check your connection and try again, or contact us on WhatsApp +91 98439 83376.')}
 finally{clearTimeout(to);busy=false;btn.disabled=false;btn.removeAttribute('aria-busy');btn.innerHTML=idle}
})}});
