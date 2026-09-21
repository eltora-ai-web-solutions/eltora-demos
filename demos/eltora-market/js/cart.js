const rd=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}};
const Cart={
 items:rd('etm_cart',{avocado:1,strawberries:2}),wish:rd('etm_wish',{}),
 save(){try{localStorage.setItem('etm_cart',JSON.stringify(this.items));localStorage.setItem('etm_wish',JSON.stringify(this.wish))}catch(e){}this.render()},
 add(s,n=1){this.items[s]=(this.items[s]||0)+n;this.save();toast('Added to cart');const b=document.querySelector('.cartbtn');if(b){b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),400)}},
 set(s,n){if(n<=0)delete this.items[s];else this.items[s]=n;this.save()},
 clear(){this.items={};this.save()},
 count(){return Object.values(this.items).reduce((a,b)=>a+b,0)},
 sub(){return Object.entries(this.items).reduce((t,[s,q])=>t+cur(PRODUCTS.find(p=>p.slug==s))*q,0)},
 fee(){const s=this.sub();return s&&s<500?40:0},
 render(){
  document.querySelectorAll('.cnt').forEach(e=>e.textContent=this.count());
  document.querySelectorAll('.wc').forEach(e=>e.textContent=Object.keys(this.wish).length);
  const box=document.getElementById('dri');if(!box)return;
  const rows=Object.entries(this.items).map(([s,q])=>{const p=PRODUCTS.find(x=>x.slug==s);return `<div class="row"><div class="th">${IMG('products',s,p.name)}</div><div><b>${p.name}</b><small>₹${cur(p)} × ${q}</small><div class="q"><button data-dec="${s}">−</button><span>${q}</span><button data-inc="${s}">+</button><button data-rm="${s}">Remove</button></div></div><b>₹${cur(p)*q}</b></div>`}).join('');
  box.innerHTML=rows||'<p class="empty">Your cart is empty. Add something fresh from the shop.</p>';
  const f=this.fee();
  document.getElementById('ds').textContent='₹'+this.sub();
  document.getElementById('dd').textContent=f?'₹'+f:'Free';
  document.getElementById('dt').textContent='₹'+(this.sub()+f);
 }
};
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.classList.add('in'),10);setTimeout(()=>{t.classList.remove('in');setTimeout(()=>t.remove(),300)},1800)}
