document.addEventListener('DOMContentLoaded',()=>{
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener('click',e=>{
e.preventDefault();
const href=a.getAttribute('href');
try{window.open(href,'_blank')}catch(_){}
const mt=document.createElement('div');
mt.textContent='Opening your email app…';
mt.style.cssText='position:fixed;left:50%;bottom:32px;transform:translateX(-50%);background:#1a1a1a;color:#f1c467;padding:10px 20px;border-radius:8px;font:500 14px/1.4 Inter,Arial,sans-serif;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.35);opacity:0;transition:opacity .25s ease;pointer-events:none';
document.body.appendChild(mt);
requestAnimationFrame(()=>{mt.style.opacity='1'});
setTimeout(()=>{mt.style.opacity='0';setTimeout(()=>{if(mt.parentNode)mt.parentNode.removeChild(mt)},300)},2200)
}));
document.querySelectorAll('.hd').forEach(h=>{const b=h.querySelector('.ham'),m=h.querySelector('.mn');
if(b&&m){b.addEventListener('click',e=>{e.stopPropagation();m.classList.toggle('open')});document.addEventListener('click',()=>m.classList.remove('open'))}});
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
const id=a.getAttribute('href').slice(1),t=document.getElementById(id);if(!t)return;e.preventDefault();
if(a.dataset.service){const s=document.querySelector('#enq select');if(s)s.value=decodeURIComponent(a.dataset.service.replace(/\+/g,' '))}
const mn=a.closest('.mn');if(mn)mn.classList.remove('open');
t.scrollIntoView({behavior:calm?'auto':'smooth',block:'start'});
try{history.replaceState(null,'','#'+id)}catch(_){}}));
const chips=document.querySelectorAll('.chip');
chips.forEach(c=>c.addEventListener('click',()=>{chips.forEach(x=>x.classList.remove('on'));c.classList.add('on');const f=c.dataset.f;
document.querySelectorAll('.wc').forEach(w=>w.classList.toggle('hide',f!=='all'&&!w.dataset.tags.split(' ').includes(f)))}));
const form=document.getElementById('enq');
if(form){
const btn=form.querySelector('.sub'),idle=btn.innerHTML;let busy=false,tm;
const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
toast.innerHTML='<button type="button" aria-label="Close">×</button><h4></h4><p></p>';document.body.appendChild(toast);
toast.querySelector('button').addEventListener('click',()=>toast.classList.remove('show'));
const show=(err,title,msg)=>{clearTimeout(tm);toast.classList.toggle('err',err);toast.querySelector('h4').textContent=title;toast.querySelector('p').textContent=msg;toast.classList.add('show');tm=setTimeout(()=>toast.classList.remove('show'),err?9000:10000)};
form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('')});
form.addEventListener('submit',async e=>{
e.preventDefault();if(busy)return;
for(const el of form.querySelectorAll('[required]')){if(!el.value.trim()){el.setCustomValidity('Please fill out this field.');el.reportValidity();return}}
busy=true;btn.disabled=true;btn.setAttribute('aria-busy','true');btn.innerHTML='<span class="spin"></span>Sending…';
const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),20000);
try{
const r=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:ctl.signal});
const j=await r.json().catch(()=>({}));
if(r.ok&&j.ok){form.reset();show(false,'✅ Project Enquiry Submitted!','Thank you for contacting ELTORA. We’ve received your project details and will get back to you soon.')}
else show(true,'Enquiry not sent',(r.status===400||r.status===429)&&j.error?j.error:'We couldn’t send your enquiry. Please try again, or contact us on WhatsApp 9843983376.');
}catch(_){show(true,'Enquiry not sent','We couldn’t send your enquiry. Please check your connection and try again, or contact us on WhatsApp 9843983376.')}
finally{clearTimeout(to);busy=false;btn.disabled=false;btn.removeAttribute('aria-busy');btn.innerHTML=idle}
})}});
