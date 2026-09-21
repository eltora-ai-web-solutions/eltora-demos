const NAV=[['Home','index.html'],['Shop','shop.html'],['Categories','categories.html'],['Deals','shop.html?offers=1'],['Fresh Picks','index.html#fresh'],['About','about.html'],['Contact','contact.html']];
const h=document.getElementById('hdr');
if(h)h.innerHTML=`<a class="logo" href="index.html">ELTORA <i>MARKET</i></a><nav id="nv">${NAV.map(n=>`<a href="${n[1]}">${n[0]}</a>`).join('')}</nav><div class="ic"><form action="shop.html" class="sf"><input name="q" placeholder="Search milk, rice, apple…" aria-label="Search"><button aria-label="Search">⌕</button></form><button data-acc aria-label="Account">☺</button><a href="shop.html?wish=1" aria-label="Wishlist">♡<span class="cnt wc">0</span></a><button class="cartbtn" aria-label="Cart">🛒<span class="cnt">0</span></button><button class="burger" data-menu aria-label="Menu">☰</button></div>`;
const f=document.getElementById('ftr');
if(f)f.innerHTML=`<div class="fg"><div><a class="logo" href="index.html">ELTORA <i>MARKET</i></a><p>Freshness, Delivered Beautifully.</p><div class="soc"><a href="#">IG</a><a href="#">FB</a><a href="#">X</a><a href="#">YT</a></div></div><div><h4>Shop</h4><a href="shop.html">Shop</a><a href="categories.html">Categories</a><a href="shop.html?offers=1">Deals</a><a href="index.html#fresh">Fresh Picks</a></div><div><h4>Company</h4><a href="about.html">About</a><a href="contact.html">Contact</a><a href="#">Privacy</a><a href="#">Terms</a></div></div><p class="cr">© ELTORA MARKET — demo project. Prices are illustrative.</p>`;
document.body.insertAdjacentHTML('beforeend',`<aside id="dr"><div class="dh"><h3>Your cart</h3><button data-x aria-label="Close">✕</button></div><div id="dri"></div><div class="df"><p>Subtotal <b id="ds"></b></p><p>Delivery <b id="dd"></b></p><p class="tot">Total <b id="dt"></b></p><button class="btn" data-co>CHECKOUT (DEMO)</button><button class="btn ghost dk" data-clr>Clear cart</button></div></aside><div id="ov" data-x></div>`);
document.addEventListener('click',e=>{const t=e.target.closest('[data-add],[data-w],[data-inc],[data-dec],[data-rm],[data-x],[data-clr],[data-co],[data-acc],[data-menu],.cartbtn');if(!t)return;const d=t.dataset;
 if(d.add)Cart.add(d.add,+d.n||1);
 else if(d.w){if(Cart.wish[d.w])delete Cart.wish[d.w];else Cart.wish[d.w]=1;Cart.save();document.querySelectorAll(`[data-w="${d.w}"]`).forEach(b=>b.classList.toggle('on',!!Cart.wish[d.w]))}
 else if(d.inc)Cart.set(d.inc,Cart.items[d.inc]+1);
 else if(d.dec)Cart.set(d.dec,Cart.items[d.dec]-1);
 else if(d.rm)Cart.set(d.rm,0);
 else if(t.hasAttribute('data-clr'))Cart.clear();
 else if(t.hasAttribute('data-co'))toast('Demo checkout — no payment is taken.');
 else if(t.hasAttribute('data-acc'))toast('Accounts are not part of this demo.');
 else if(t.hasAttribute('data-menu'))document.body.classList.toggle('menu');
 else if(t.hasAttribute('data-x'))document.body.classList.remove('open');
 else document.body.classList.add('open');
});
document.querySelectorAll('[data-g]').forEach(el=>el.innerHTML=PRODUCTS.filter(p=>p.g==el.dataset.g).map(card).join(''));
document.querySelectorAll('[data-cats]').forEach(el=>el.innerHTML=CATS.map(c=>`<a class="cc reveal" href="shop.html?cat=${encodeURIComponent(c[0])}">${IMG('categories',c[1],c[0])}<span>${c[0]}</span></a>`).join(''));
document.querySelectorAll('[data-show]').forEach(el=>el.innerHTML=LIFE.map(s=>`<div class="sh reveal">${IMG('lifestyle',s,s.replace('-',' '))}</div>`).join(''));
Cart.render();
const io='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12}):null;
window.rv=()=>document.querySelectorAll('.reveal:not(.in)').forEach(e=>io?io.observe(e):e.classList.add('in'));rv();
addEventListener('scroll',()=>document.querySelectorAll('[data-par]').forEach(e=>{const r=e.parentNode.getBoundingClientRect();e.style.transform=`translateY(${r.top*-.12}px) scale(1.15)`}),{passive:true});
/* 3D */
function scene(cv,hero){
 const T=THREE,small=innerWidth<700,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,small?1.5:2));r.shadowMap.enabled=true;
 const s=new T.Scene(),c=new T.PerspectiveCamera(35,1,.1,100);c.position.set(0,1.4,small?13:10);c.lookAt(0,-.3,0);
 s.add(new T.HemisphereLight(0xfff4e0,0x1a3a2a,.9));
 const d=new T.DirectionalLight(0xffffff,1.7);d.position.set(4,8,5);d.castShadow=true;s.add(d);
 const rim=new T.PointLight(0xb8964a,1.2,30);rim.position.set(-6,2,-3);s.add(rim);
 const g=new T.Group();g.position.x=hero&&!small?2.4:0;s.add(g);
 const M=(col,rg=.35,mt=0)=>new T.MeshStandardMaterial({color:col,roughness:rg,metalness:mt,side:T.DoubleSide});
 const add=(geo,m,x,y,z,sc=[1,1,1])=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(...sc);o.castShadow=true;g.add(o);return o};
 const S=new T.SphereGeometry(1,48,32);
 add(new T.CylinderGeometry(1.9,1.4,1.2,48,1,true),M(0xb98a52,.85),0,-1.3,0);
 add(new T.TorusGeometry(1.9,.08,12,64),M(0xb8964a,.3,.8),0,-.7,0).rotation.x=Math.PI/2;
 add(new T.TorusGeometry(1.7,.07,12,48,Math.PI),M(0xb8964a,.3,.8),0,-.7,0);
 add(S,M(0xf28c1c,.45),-.7,-.3,.2,[.62,.62,.62]);
 add(S,M(0xc62828,.3),.6,-.25,.5,[.58,.58,.58]);
 add(S,M(0x3d5a2a,.55),.1,-.2,-.6,[.5,.68,.5]);
 add(S,M(0xd94a2b,.3),.9,-.35,-.5,[.5,.5,.5]);
 const fl=[];
 if(!small||!hero){
  const milk=new T.Group();
  const gl=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.05,metalness:0,transparent:true,opacity:.88,clearcoat:1});
  [[new T.CylinderGeometry(.45,.45,1.3,32),gl,0],[new T.CylinderGeometry(.2,.4,.4,32),gl,.85],[new T.CylinderGeometry(.22,.22,.12,32),M(0x4aa35a),1.1]].forEach(([a,b,y])=>{const o=new T.Mesh(a,b);o.position.y=y;o.castShadow=true;milk.add(o)});
  milk.position.set(-2.8,.8,0);g.add(milk);fl.push(milk);
  const o2=add(S,M(0xf28c1c,.45),2.7,1.4,.4,[.5,.5,.5]);fl.push(o2);
  const a2=add(S,M(0x7cb342,.3),-1.6,2.1,.6,[.45,.45,.45]);fl.push(a2);
 }
 const gr=new T.Mesh(new T.PlaneGeometry(30,30),new T.ShadowMaterial({opacity:.25}));gr.rotation.x=-Math.PI/2;gr.position.y=-1.95;gr.receiveShadow=true;g.add(gr);d.shadow.mapSize.set(1024,1024);
 let mx=0,my=0,vis=true;
 if(hero)addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
 const rs=()=>{const w=cv.clientWidth,hh=cv.clientHeight;r.setSize(w,hh,false);c.aspect=w/hh;c.updateProjectionMatrix()};rs();addEventListener('resize',rs);
 new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
 const y0=fl.map(o=>o.position.y);
 (function loop(t){requestAnimationFrame(loop);if(!vis&&t>100)return;t*=.001;
  if(!still){g.rotation.y+=.004+mx*.01;fl.forEach((o,i)=>{o.position.y=y0[i]+Math.sin(t*1.2+i*2)*.18})}
  g.rotation.x+=((my*.25)-g.rotation.x)*.05;r.render(s,c)})(0);
}
function load3d(){
 const a=document.getElementById('hero3d'),b=document.getElementById('fresh3d');if(!a&&!b)return;
 const go=()=>{try{a&&scene(a,true);b&&scene(b,false)}catch(e){[a,b].forEach(x=>x&&(x.style.display='none'))}};
 const s=document.createElement('script');s.src='assets/3d/three.min.js';
 s.onload=go;s.onerror=()=>{const c=document.createElement('script');c.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';c.onload=go;document.head.appendChild(c)};
 document.head.appendChild(s);
}
load3d();
