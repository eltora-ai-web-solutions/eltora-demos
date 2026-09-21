const Q=new URLSearchParams(location.search);
const F={cat:Q.get('cat')||'',q:(Q.get('q')||'').toLowerCase(),max:1500,rt:0,org:0,off:+Q.get('offers')||0,wish:+Q.get('wish')||0,sort:'f'};
const $=id=>document.getElementById(id);
function shop(){
 let l=PRODUCTS.filter(p=>(!F.cat||p.cat==F.cat)&&(!F.q||(p.name+p.desc+p.cat).toLowerCase().includes(F.q))&&cur(p)<=F.max&&p.rating>=F.rt&&(!F.org||p.org)&&(!F.off||p.off)&&(!F.wish||Cart.wish[p.slug]));
 if(F.sort=='pl')l.sort((a,b)=>cur(a)-cur(b));if(F.sort=='ph')l.sort((a,b)=>cur(b)-cur(a));if(F.sort=='tr')l.sort((a,b)=>b.rating-a.rating);
 $('cnt').textContent=l.length+' products';
 $('sg').innerHTML=l.map(card).join('')||'<p class="empty">No products match. Clear a filter or try another search.</p>';rv();
}
if($('sg')){
 $('fc').innerHTML='<option value="">All categories</option>'+CATS.map(c=>`<option ${c[0]==F.cat?'selected':''}>${c[0]}</option>`).join('');
 $('fq').value=Q.get('q')||'';$('fo').checked=!!F.off;
 const bind=(id,k,fn=v=>v,ev='input')=>$(id).addEventListener(ev,e=>{F[k]=fn(e.target.type=='checkbox'?e.target.checked:e.target.value);if(id=='fp')$('pv').textContent='₹'+F.max;shop()});
 bind('fc','cat');bind('fq','q',v=>v.toLowerCase());bind('fp','max',Number);bind('fr','rt',Number);bind('fo','org',Number);bind('fd','off',Number);bind('fs','sort');
 shop();
}
if($('pd')){
 const p=PRODUCTS.find(x=>x.slug==Q.get('p'))||PRODUCTS[0];let n=1;
 document.title=p.name+' — ELTORA MARKET';
 $('pd').innerHTML=`<div class="pimg">${IMG('products',p.slug,p.name)}</div><div class="pinfo"><h1>${p.name}</h1><div class="rt">${stars(p.rating)} ${p.rating}</div><div class="pr big"><strong>₹${cur(p)}</strong>${p.off?`<s>₹${p.price}</s><b class="tag st">-${p.off}%</b>`:''}<small>/ ${p.unit}</small></div><p>${p.desc} Selected for quality, packed with care and delivered to your door. Demo product — prices are illustrative.</p><div class="q big"><button id="mn">−</button><span id="qn">1</span><button id="pl">+</button></div><div class="cta"><button class="btn" id="pa" data-add="${p.slug}" data-n="1">ADD TO CART</button><button class="btn ghost dk wish2 ${Cart.wish[p.slug]?'on':''}" data-w="${p.slug}">♥ Wishlist</button></div></div>`;
 const up=d=>{n=Math.max(1,n+d);$('qn').textContent=n;$('pa').dataset.n=n};
 $('mn').onclick=()=>up(-1);$('pl').onclick=()=>up(1);
 $('rel').innerHTML=PRODUCTS.filter(x=>x.cat==p.cat&&x.slug!=p.slug).slice(0,4).map(card).join('');rv();
}
