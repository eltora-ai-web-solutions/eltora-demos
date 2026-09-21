/* ELTORA RESTAURANT — vanilla JS + Three.js (r128 from cdnjs) */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ---------- IMAGES: swap any ID for a file in assets/images/ (e.g. 'assets/images/steak.jpg') ---------- */
const U=(id,w=1400)=>id.includes('/')?id:`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const IMG={
  bar4:'assets/images/bar4.jpg',
  fish:'assets/images/fish.jpg',
  lounge:'assets/images/lounge.jpg',
  lamb2:'assets/images/lamb2.jpg',
  steak:'assets/images/steak.jpg',
  cocktail:'assets/images/cocktail.jpg',
  lamb:'assets/images/lamb.jpg',
  bar3:'assets/images/bar3.jpg',
  burrata:'assets/images/burrata.jpg',
  dessert:'assets/images/dessert.jpg',
  dining:'assets/images/dining.jpg',
  scallops:'assets/images/scallops.jpg',
  table:'assets/images/table.jpg',
  pasta:'assets/images/pasta.jpg',
  bar:'assets/images/bar.jpg',
  bar2:'assets/images/bar2.jpg',
  flambe:'assets/images/flambe.jpg',
  interior:'assets/images/interior.jpg',
  exterior:'assets/images/exterior.jpg',
  chef:'assets/images/chef.jpg',
  kitchen:'assets/images/flambe.jpg',
  private:'assets/images/dining.jpg',
  interior2:'assets/images/exterior.jpg'
};
const FALLBACK='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1c1613"/><text x="200" y="160" font-size="28" fill="#c8843c" text-anchor="middle" font-family="Georgia,serif" letter-spacing="8">ELTORA</text></svg>');
function pic(key,alt){const i=new Image();i.alt=alt;i.loading='lazy';i.onerror=()=>{i.onerror=null;i.src=FALLBACK};i.src=U(IMG[key]);return i}
$$('img[data-i]').forEach(el=>{el.loading='lazy';el.onerror=()=>{el.onerror=null;el.src=FALLBACK};el.src=U(IMG[el.dataset.i])});
function fig(key,title,cls='rv'){const f=document.createElement('figure');f.className=cls;f.append(pic(key,title));const c=document.createElement('figcaption');c.textContent=title;f.append(c);return f}
const card=(k,t,d)=>{const f=document.createElement('figure');f.className='rv';f.append(pic(k,t));const c=document.createElement('figcaption');c.innerHTML=`<b>${t}</b>${d}`;f.append(c);return f};
$('#showGrid').append(...[['steak','Prime Steak','Fillet charred over embers with thyme and a dark reduction.'],['pasta','Handmade Pasta','Fresh tagliatelle, aged parmesan and shaved black truffle.'],['burrata','Charred Burrata','Slow-roasted tomatoes, basil and cold-pressed olive oil.'],['fish','Charred Sea Bass','Crisp skin, sweet asparagus and a light herb butter.'],['scallops','Seared Scallops','Golden scallops on silky cauliflower with parmesan crisps.'],['dessert','Dark Chocolate Sphere','Glossy chocolate, gold leaf, berries and cocoa crumb.']].map(a=>card(...a)));
$('#expGrid').append(...[['table','The Table'],['bar4','Evening Ambience'],['interior','The Dining Room'],['bar3','Warm Light'],['flambe','Open Kitchen']].map(a=>fig(...a)));
$('#masonry').append(...[['lamb2','Signature Dish'],['lounge','Cocktails'],['dessert','Desserts'],['burrata','Ingredients'],['fish','Charred Sea Bass'],['table','The Table'],['chef','Chef Plating'],['flambe','Open Kitchen'],['bar2','Evening Ambience'],['steak','Close-up']].map(a=>fig(...a)));

/* ---------- MENU (DEMO — edit here) ---------- */
const MENU={
  Starters:[['Charred Burrata','₹650'],['Truffle Mushroom Crostini','₹580'],['Smoked Corn & Herb Salad','₹520']],
  Mains:[['Fire-Roasted Chicken','₹1,250'],['Wild Mushroom Risotto','₹980'],['Charred Sea Bass','₹1,450']],
  Signatures:[['ELTORA Signature Steak','₹1,850'],['Ember Lamb','₹1,650'],["Chef's Seasonal Plate",'₹1,400']],
  Desserts:[['Dark Chocolate Sphere','₹550'],['Caramel Mille-Feuille','₹480'],['Vanilla Bean Panna Cotta','₹450']],
  Beverages:[['Smoked Old Fashioned','₹750'],['Amber Citrus Spritz','₹450'],['House Cold Brew','₹320']]
};
const tabs=$('#tabs'),list=$('#dishes');
function showCat(c){$$('button',tabs).forEach(b=>b.setAttribute('aria-selected',b.textContent===c));list.innerHTML='';MENU[c].forEach(([n,p],i)=>{const li=document.createElement('li');li.style.animationDelay=i*.08+'s';li.innerHTML=`${n}<span>${p}</span>`;list.append(li)})}
Object.keys(MENU).forEach(c=>{const b=document.createElement('button');b.textContent=c;b.setAttribute('role','tab');b.onclick=()=>showCat(c);tabs.append(b)});
showCat('Starters');

/* ---------- TESTIMONIALS (DEMO) ---------- */
$('#quotes').innerHTML=[['The food, atmosphere and attention to detail made the evening unforgettable.','Demo guest'],['Every course felt beautifully considered.','Demo guest'],['ELTORA feels like an experience rather than simply a restaurant.','Demo guest']].map(q=>`<blockquote class="rv">“${q[0]}”<cite>${q[1]}</cite></blockquote>`).join('');

/* ---------- NAV ---------- */
const nav=$('#nav'),mn=$('#menuNav'),bg=$('#burger');
addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>40),{passive:true});
function setMenu(o){mn.classList.toggle('open',o);bg.setAttribute('aria-expanded',o);const[a,b]=$$('i',bg);a.style.transform=o?'translateY(4.5px) rotate(45deg)':'';b.style.transform=o?'translateY(-4.5px) rotate(-45deg)':'';document.body.style.overflow=o?'hidden':''}
bg.onclick=()=>setMenu(!mn.classList.contains('open'));
$$('a',mn).forEach(a=>a.onclick=()=>setMenu(false));

/* ---------- REVEAL, PARALLAX, MAGNETIC ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));
const par=$$('img[data-p]');
function parallax(){const h=innerHeight;par.forEach(im=>{const r=im.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>h)return;im.style.translate=`0 ${((r.top+r.height/2-h/2)*-parseFloat(im.dataset.p)).toFixed(1)}px`})}
addEventListener('scroll',parallax,{passive:true});parallax();
$$('.mag').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.2}px ${(e.clientY-r.top-r.height/2)*.3}px`});b.addEventListener('mouseleave',()=>b.style.translate='')});

/* ---------- FORMS ---------- */
const bad=(f,names)=>{$$('.bad',f).forEach(x=>x.classList.remove('bad'));names.forEach(n=>f.elements[n].classList.add('bad'))};
$('#resForm').addEventListener('submit',e=>{
  e.preventDefault();const f=e.target,v=n=>f.elements[n].value.trim(),miss=[];
  ['name','email','phone','date','time','guests'].forEach(n=>{if(!v(n))miss.push(n)});
  if(v('email')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')))miss.push('email');
  if(v('phone')&&v('phone').replace(/\D/g,'').length<7)miss.push('phone');
  if(v('date')&&v('date')<new Date().toISOString().slice(0,10))miss.push('date');
  bad(f,miss);const err=$('#formErr'),ok=$('#formOk');ok.textContent='';
  if(miss.length){err.textContent='Please check the highlighted fields: '+[...new Set(miss)].join(', ')+'.';return}
  err.textContent='';ok.textContent='Thank you. Your reservation request has been received.';f.reset();
});
$('#newsForm').addEventListener('submit',e=>{e.preventDefault();const i=e.target.elements[0],m=$('#newsMsg'),good=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value);m.textContent=good?'Thank you. You are on the list.':'Enter a valid email address.';if(good)i.value=''});

/* ---------- THREE.JS ---------- */
function stage(cv,o){
  if(!window.THREE){cv.style.display='none';return}
  let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){cv.style.display='none';return}
  R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.2;
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(38,1,.1,60),G=new THREE.Group();S.add(G);
  const V=a=>a.map(p=>new THREE.Vector2(p[0],p[1])),L=(p,m)=>{const x=new THREE.Mesh(new THREE.LatheGeometry(V(p),72),m);x.castShadow=true;return x};
  const M=(c,r,extra={})=>new THREE.MeshPhysicalMaterial(Object.assign({color:c,roughness:r,side:THREE.DoubleSide},extra));
  const plate=L([[0,.1],[1.1,.1],[1.55,.2],[2,.42],[2.1,.44],[2.1,.4],[1.6,.12],[1.1,.02],[0,.02]],M(0xf1e8d6,.22,{clearcoat:1,clearcoatRoughness:.08}));
  G.add(plate);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.75,64,48),M(0x2b140b,.28,{clearcoat:1,clearcoatRoughness:.15}));ball.position.y=.85;ball.castShadow=true;G.add(ball);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.035,16,80),M(0xb4703f,.25,{metalness:1}));ring.rotation.x=Math.PI/2;ring.position.y=.14;G.add(ring);
  const orbit=new THREE.Group();G.add(orbit);
  [0x5d7d3a,0xc8843c,0x8c2f1b,0x5d7d3a,0xe9c46a,0x8c2f1b].forEach((c,i)=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.13+.04*(i%3),24,16),M(c,.4));const a=i/6*Math.PI*2;s.position.set(Math.cos(a)*2.6,1.1+Math.sin(i*2)*.5,Math.sin(a)*2.6);s.castShadow=true;orbit.add(s)});
  if(o.hero){const gl=L([[0,0],[.6,0],[.6,.04],[.05,.12],[.05,1.5],[.5,1.9],[.85,2.6],[.8,3.3],[.78,3.3],[.8,2.6],[.5,1.9],[.02,1.5],[.02,.14],[0,.14]],M(0xffffff,.02,{transparent:true,opacity:.28,clearcoat:1,metalness:0}));gl.scale.setScalar(.62);gl.position.set(-3.4,0,-1.4);G.add(gl)}
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.45}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;S.add(fl);
  S.add(new THREE.HemisphereLight(0xffe2bd,0x1a0f08,.7));
  const sp=new THREE.SpotLight(0xffc98a,1.8,40,.6,.5);sp.position.set(4,9,5);sp.castShadow=true;sp.shadow.mapSize.set(1024,1024);S.add(sp);
  const pl=new THREE.PointLight(0xc8843c,1.1,25);pl.position.set(-5,2.5,4);S.add(pl);
  const rim=new THREE.PointLight(0xb4703f,1.4,25);rim.position.set(0,3,-6);S.add(rim);
  const N=160,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*14;pos[i*3+1]=Math.random()*7;pos[i*3+2]=(Math.random()-.5)*8}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  S.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xffb45e,size:.05,transparent:true,opacity:.65,depthWrite:false})));
  let baseY=0,dist=9,mx=0,my=0,drag=false,lx=0,ly=0,vis=true;
  function fit(){const w=cv.clientWidth||1,h=cv.clientHeight||1;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix();if(o.hero){const wide=w>860;G.position.x=wide?2.7:0;baseY=wide?.2:1.6}}
  addEventListener('resize',fit);fit();
  if(o.hero)addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
  else{
    cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId)});
    cv.addEventListener('pointermove',e=>{if(!drag)return;G.rotation.y+=(e.clientX-lx)*.01;G.rotation.x=Math.max(-.3,Math.min(.6,G.rotation.x+(e.clientY-ly)*.006));lx=e.clientX;ly=e.clientY});
    ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>drag=false));
    cv.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();dist=Math.max(6,Math.min(13,dist+e.deltaY*.01))},{passive:false});
  }
  new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
  (function loop(){requestAnimationFrame(loop);if(!vis)return;const t=performance.now()*.001;
    if(!drag)G.rotation.y+=o.hero?.0025:.005;
    G.position.y=baseY+Math.sin(t*.9)*.12;orbit.rotation.y=t*.25;ball.rotation.y=t*.3;
    const p=pg.attributes.position;for(let i=0;i<N;i++){let y=p.array[i*3+1]+.004;if(y>7)y=0;p.array[i*3+1]=y}p.needsUpdate=true;
    C.position.set(mx*1.6,3.2-my*.7,dist);C.lookAt(o.hero?G.position.x*.4:0,1,0);R.render(S,C)})();
}
stage($('#heroCanvas'),{hero:true});
stage($('#craftCanvas'),{hero:false});

/* ---------- LOADER ---------- */
const hide=()=>$('#loader').classList.add('off');
addEventListener('load',()=>setTimeout(hide,500));setTimeout(hide,3500);
