/* =========================================================
   ELTORA CARE — script.js
========================================================= */
(function(){
  "use strict";

  /* ---------- Icon injection (Lucide) ---------- */
  function injectIcons(){
    document.querySelectorAll('[data-icon]').forEach(function(el){
      if (el.querySelector('i[data-lucide]')) return;
      var i = document.createElement('i');
      i.setAttribute('data-lucide', el.getAttribute('data-icon'));
      if (el.classList.contains('s-icon')){
        el.appendChild(i);
      } else {
        // photo-panel: wrap icon in a decorative layer, keep any tag element after it
        var wrap = document.createElement('span');
        wrap.className = 'photo-panel-icon';
        wrap.style.width = '38%';
        wrap.style.height = '38%';
        wrap.style.left = '8%';
        wrap.style.top = '8%';
        wrap.appendChild(i);
        el.insertBefore(wrap, el.firstChild);
      }
    });
    if (window.lucide && typeof window.lucide.createIcons === 'function'){
      window.lucide.createIcons();
    }
  }

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function(){
    var pre = document.getElementById('preloader');
    if (pre){ setTimeout(function(){ pre.classList.add('done'); }, 350); }
  });

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader(){
    if (window.scrollY > 40){ header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScrollHeader, { passive:true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var primaryNav = document.getElementById('primaryNav');
  if (menuToggle){
    menuToggle.addEventListener('click', function(){
      var open = primaryNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    primaryNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ primaryNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); });
    });
  }

  /* ---------- Search panel ---------- */
  var searchToggle = document.getElementById('searchToggle');
  var searchPanel = document.getElementById('searchPanel');
  var searchClose = document.getElementById('searchClose');
  function toggleSearch(force){
    var open = force !== undefined ? force : !searchPanel.classList.contains('open');
    searchPanel.classList.toggle('open', open);
    searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open){ var input = searchPanel.querySelector('input'); if(input) setTimeout(function(){ input.focus(); }, 200); }
  }
  if (searchToggle){ searchToggle.addEventListener('click', function(){ toggleSearch(); }); }
  if (searchClose){ searchClose.addEventListener('click', function(){ toggleSearch(false); }); }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl){ yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target){
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top:y, behavior:'smooth' });
      }
    });
  });

  /* ---------- Stat counters ---------- */
  function animateCount(el){
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var numEl = el.querySelector('.stat-num');
    var dur = 1400, start = null;
    function step(ts){
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        var el = entry.target;
        if (el.dataset.count){ animateCount(el); }
        statObserver.unobserve(el);
      }
    });
  }, { threshold:.5 });
  document.querySelectorAll('.stat').forEach(function(el){ statObserver.observe(el); });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    '.dept-card, .showcase-card, .doctor-card, .service-item, .pc-item, .insight-card, .testi-card, .facility-slide'
  );
  revealTargets.forEach(function(el, i){
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
  });
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold:.12 });
  revealTargets.forEach(function(el){ revealObserver.observe(el); });

  /* ---------- Testimonials carousel ---------- */
  var track = document.getElementById('testiTrack');
  var dotsWrap = document.getElementById('testiDots');
  if (track && dotsWrap){
    var cards = Array.prototype.slice.call(track.children);
    cards.forEach(function(_, i){
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to testimonial ' + (i+1));
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', function(){
        cards[i].scrollIntoView({ behavior:'smooth', inline:'start', block:'nearest' });
      });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);
    var trackObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var idx = cards.indexOf(entry.target);
        if (entry.isIntersecting && idx > -1){
          dots.forEach(function(d){ d.classList.remove('active'); });
          dots[idx].classList.add('active');
        }
      });
    }, { root:track, threshold:.6 });
    cards.forEach(function(c){ trackObserver.observe(c); });
  }

  /* ---------- Appointment form (frontend demo) ---------- */
  var form = document.getElementById('appointmentForm');
  var status = document.getElementById('formStatus');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.checkValidity()){
        form.reportValidity();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Confirming…';
      btn.disabled = true;
      setTimeout(function(){
        btn.textContent = original;
        btn.disabled = false;
        status.textContent = 'This is a demo form — no appointment has actually been booked.';
        form.reset();
      }, 900);
    });
  }

  /* ---------- Watch Our Story (no real video — cinematic motion instead) ---------- */
  var watchBtn = document.getElementById('watchStory');
  if (watchBtn){
    watchBtn.addEventListener('click', function(){
      var media = document.querySelector('.cinematic-media');
      if (media && window.gsap){
        gsap.fromTo(media, { scale:1 }, { scale:1.08, duration:2.4, ease:'power2.out', yoyo:true, repeat:1 });
      }
      watchBtn.textContent = 'Playing our story…';
      setTimeout(function(){ watchBtn.innerHTML = '<span class="play-dot" aria-hidden="true"></span> Watch Our Story'; }, 2600);
    });
  }

  /* =========================================================
     GSAP — hero intro + scroll pinned effects
  ========================================================= */
  if (window.gsap){
    gsap.registerPlugin(window.ScrollTrigger);

    var tl = gsap.timeline({ delay:.4 });
    tl.to('.hero-eyebrow', { opacity:1, y:0, duration:.7, ease:'power2.out' })
      .to('.hero-title .line span', { y:'0%', duration:1, ease:'power3.out', stagger:.12 }, '-=.4')
      .to('.hero-sub', { opacity:1, duration:.8, ease:'power2.out' }, '-=.5')
      .to('.hero-actions', { opacity:1, duration:.8, ease:'power2.out' }, '-=.55')
      .to('.hero-scroll-cue', { opacity:1, duration:.8, ease:'power2.out' }, '-=.5');

    gsap.to('.hero-scene', {
      yPercent: 14,
      ease:'none',
      scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true }
    });
  }

  /* =========================================================
     THREE.js — Hero 3D scene
     Elegant floating "medical cross" core with orbiting nodes
     and soft particle field. No cartoon geometry.
  ========================================================= */
  function initHeroScene(){
    var container = document.getElementById('heroScene');
    if (!container || !window.THREE) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    var renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    var group = new THREE.Group();
    group.position.set(2.4, 0.2, 0);
    scene.add(group);

    // Central glass-like cross core
    var coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
    var coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x123249,
      transparent:true, opacity:.55,
      roughness:.15, metalness:.1,
      transmission: 0.4, thickness: 1,
      emissive: 0x0d5c66, emissiveIntensity:.25
    });
    var core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    var wireGeo = new THREE.IcosahedronGeometry(1.15, 1);
    var wireMat = new THREE.MeshBasicMaterial({ color:0x21C7C0, wireframe:true, transparent:true, opacity:.35 });
    var wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    // Orbit rings
    var ringGeo1 = new THREE.TorusGeometry(2.1, 0.006, 8, 120);
    var ringMat1 = new THREE.MeshBasicMaterial({ color:0x8FE9E4, transparent:true, opacity:.5 });
    var ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI/2.4;
    group.add(ring1);

    var ringGeo2 = new THREE.TorusGeometry(2.7, 0.005, 8, 120);
    var ring2 = new THREE.Mesh(ringGeo2, ringMat1.clone());
    ring2.material.opacity = .3;
    ring2.rotation.x = Math.PI/1.7;
    ring2.rotation.y = .6;
    group.add(ring2);

    // Orbiting nodes (small spheres representing medical data points)
    var nodes = [];
    var nodeGeo = new THREE.SphereGeometry(0.045, 16, 16);
    var nodeMat = new THREE.MeshBasicMaterial({ color:0xFFFFFF });
    for (var i=0;i<10;i++){
      var m = new THREE.Mesh(nodeGeo, nodeMat.clone());
      m.material.color.set(i % 3 === 0 ? 0x21C7C0 : 0x8FE9E4);
      var radius = 2.1 + (i % 2) * 0.6;
      var angle = (i / 10) * Math.PI * 2;
      nodes.push({ mesh:m, radius:radius, angle:angle, speed: 0.15 + (i % 3) * 0.05, tiltX: (i%2? .5: -.4) });
      group.add(m);
    }

    // Soft particle field
    var particleCount = 220;
    var positions = new Float32Array(particleCount * 3);
    for (var p=0;p<particleCount;p++){
      positions[p*3]   = (Math.random()-0.5) * 14;
      positions[p*3+1] = (Math.random()-0.5) * 9;
      positions[p*3+2] = (Math.random()-0.5) * 8 - 2;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var pMat = new THREE.PointsMaterial({ color:0x8FE9E4, size:0.03, transparent:true, opacity:.45 });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    var ambient = new THREE.AmbientLight(0x88aacc, .9);
    scene.add(ambient);
    var pointLight = new THREE.PointLight(0x21C7C0, 1.4, 20);
    pointLight.position.set(3, 2, 5);
    scene.add(pointLight);

    var clock = new THREE.Clock();
    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function(e){
      mouseX = (e.clientX / window.innerWidth - .5);
      mouseY = (e.clientY / window.innerHeight - .5);
    });

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(){
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      if (!reduceMotion){
        group.rotation.y = t * 0.12 + mouseX * 0.3;
        group.rotation.x = Math.sin(t*0.2) * 0.08 + mouseY * 0.15;
        core.rotation.y -= 0.003;
        wire.rotation.y -= 0.003;
        ring1.rotation.z = t * 0.15;
        ring2.rotation.z = -t * 0.1;
        particles.rotation.y = t * 0.01;

        nodes.forEach(function(n){
          var a = n.angle + t * n.speed;
          n.mesh.position.set(
            Math.cos(a) * n.radius,
            Math.sin(a) * n.radius * 0.4,
            Math.sin(a * 1.3) * n.radius * 0.5
          );
          n.mesh.rotation.z += 0.02;
        });
      }

      renderer.render(scene, camera);
    }
    animate();

    function onResize(){
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
  }

  /* =========================================================
     THREE.js — "Inside Eltora Care" tech section
     Floating DNA-like helix + data plane, subtle and abstract.
  ========================================================= */
  function initTechScene(){
    var container = document.getElementById('techScene');
    if (!container || !window.THREE) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, .1, 100);
    camera.position.set(0, 0, 8);

    var renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    var helix = new THREE.Group();
    scene.add(helix);
    var strandCount = 48;
    var geo = new THREE.SphereGeometry(0.05, 10, 10);
    var matA = new THREE.MeshBasicMaterial({ color:0x21C7C0 });
    var matB = new THREE.MeshBasicMaterial({ color:0x8FE9E4 });

    for (var i=0;i<strandCount;i++){
      var y = (i - strandCount/2) * 0.14;
      var angle = i * 0.35;
      var r = 1.3;

      var a = new THREE.Mesh(geo, matA);
      a.position.set(Math.cos(angle)*r, y, Math.sin(angle)*r);
      helix.add(a);

      var b = new THREE.Mesh(geo, matB);
      b.position.set(Math.cos(angle+Math.PI)*r, y, Math.sin(angle+Math.PI)*r);
      helix.add(b);

      if (i % 4 === 0){
        var rungGeo = new THREE.CylinderGeometry(0.006, 0.006, r*2, 6);
        var rungMat = new THREE.MeshBasicMaterial({ color:0x2874C9, transparent:true, opacity:.35 });
        var rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI/2;
        rung.rotation.y = angle;
        helix.add(rung);
      }
    }
    helix.rotation.z = 0.25;

    var ambient = new THREE.AmbientLight(0xffffff, .8);
    scene.add(ambient);

    var clock = new THREE.Clock();
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(){
      requestAnimationFrame(animate);
      if (!reduceMotion){
        var t = clock.getElapsedTime();
        helix.rotation.y = t * 0.25;
      }
      renderer.render(scene, camera);
    }
    animate();

    function onResize(){
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function(){
    injectIcons();
    initHeroScene();
    initTechScene();
  });

})();
