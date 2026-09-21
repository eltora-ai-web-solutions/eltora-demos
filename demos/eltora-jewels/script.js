/* =========================================================
   ELTORA JEWELS — script.js
   Vanilla JS core UI (runs unconditionally) + Three.js 3D
   scenes loaded separately via dynamic import so that a
   blocked/offline CDN never breaks navigation, forms, or
   scroll reveals — only the 3D visuals degrade gracefully.
   ========================================================= */

(function(){
  "use strict";

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     PRELOADER
  --------------------------------------------------------- */
  window.addEventListener('load', () => {
    const pre = document.querySelector('.preloader');
    setTimeout(() => {
      pre.classList.add('is-hidden');
      document.body.classList.remove('no-scroll');
      playHeroIntro();
    }, 650);
  });
  document.body.classList.add('no-scroll');

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav-burger');
  const mobilePanel = document.querySelector('.mobile-panel');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive:true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    mobilePanel.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
  });
  mobilePanel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('is-open');
      mobilePanel.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
    });
  });

  /* ---------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------------------------------------------------------
     MAGNETIC BUTTONS
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        el.style.transform = `translate(${x*0.25}px, ${y*0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------------------------------------------------------
     CURSOR GLOW
  --------------------------------------------------------- */
  const glow = document.querySelector('.cursor-glow');
  if (glow) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive:true });
  }

  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */
  const searchToggle = document.getElementById('search-toggle');
  if (searchToggle){
    searchToggle.addEventListener('click', () => {
      document.getElementById('shopby').scrollIntoView({ behavior:'smooth' });
    });
  }

  const toast = document.querySelector('.toast');
  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  /* ---------------------------------------------------------
     WISHLIST + BAG (demo, in-memory)
  --------------------------------------------------------- */
  let bagCount = 0;
  const bagCountEl = document.querySelector('.bag-count');
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.classList.toggle('active');
      const name = btn.dataset.name || 'Piece';
      showToast(active ? `${name} added to wishlist` : `${name} removed from wishlist`);
    });
  });
  document.querySelectorAll('[data-add-bag]').forEach(btn => {
    btn.addEventListener('click', () => {
      bagCount++;
      if (bagCountEl) bagCountEl.textContent = bagCount;
      showToast(`${btn.dataset.addBag || 'Item'} added to bag`);
    });
  });

  /* ---------------------------------------------------------
     TESTIMONIAL SLIDER
  --------------------------------------------------------- */
  const slides = document.querySelectorAll('.t-slide');
  const dots = document.querySelectorAll('.t-dots button');
  let tIndex = 0, tTimer;
  function showSlide(i){
    slides.forEach((s,idx) => s.classList.toggle('is-active', idx===i));
    dots.forEach((d,idx) => d.classList.toggle('is-active', idx===i));
    tIndex = i;
  }
  function nextSlide(){ showSlide((tIndex+1) % slides.length); }
  if (slides.length){
    showSlide(0);
    tTimer = setInterval(nextSlide, 5500);
    dots.forEach((d,idx) => d.addEventListener('click', () => {
      showSlide(idx);
      clearInterval(tTimer);
      tTimer = setInterval(nextSlide, 5500);
    }));
  }

  /* ---------------------------------------------------------
     FORM VALIDATION — Private Consultation
  --------------------------------------------------------- */
  const consultForm = document.getElementById('consult-form');
  if (consultForm){
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const fields = consultForm.querySelectorAll('[required]');
      fields.forEach(f => {
        const errEl = f.closest('.field').querySelector('.err');
        let msg = '';
        if (!f.value.trim()){
          msg = 'This field is required';
        } else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) {
          msg = 'Enter a valid email address';
        } else if (f.type === 'tel' && !/^[0-9+\-\s()]{7,}$/.test(f.value)) {
          msg = 'Enter a valid phone number';
        }
        if (errEl) errEl.textContent = msg;
        if (msg) valid = false;
      });
      if (valid){
        consultForm.style.display = 'none';
        document.querySelector('.form-success').classList.add('is-visible');
      }
    });
  }

  /* ---------------------------------------------------------
     NEWSLETTER FORM
  --------------------------------------------------------- */
  const newsForm = document.querySelector('.newsletter-form');
  if (newsForm){
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsForm.querySelector('input');
      const msg = newsForm.parentElement.querySelector('.newsletter-msg');
      if (input.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        msg.textContent = 'Welcome to ELTORA. Please check your inbox to confirm.';
        input.value = '';
      } else {
        msg.textContent = 'Please enter a valid email address.';
      }
    });
  }

  /* ---------------------------------------------------------
     PARALLAX — cinematic showcase background
  --------------------------------------------------------- */
  const showcaseImg = document.querySelector('.showcase-bg img');
  if (showcaseImg && !prefersReducedMotion){
    window.addEventListener('scroll', () => {
      const section = document.querySelector('.showcase');
      const r = section.getBoundingClientRect();
      const progress = 1 - (r.top + r.height/2) / (window.innerHeight + r.height/2);
      const shift = (progress - 0.5) * 90;
      showcaseImg.style.transform = `translateY(${shift}px)`;
    }, { passive:true });
  }

  /* =========================================================
     HERO INTRO TIMELINE (GSAP if present, else CSS fallback)
  ========================================================= */
  function playHeroIntro(){
    const lines = document.querySelectorAll('.hero-title .line span');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const tag = document.querySelector('.hero-tag');
    const cta = document.querySelector('.hero-cta');
    const scroll = document.querySelector('.hero-scroll');

    if (window.gsap){
      const tl = gsap.timeline({ defaults:{ ease:'power4.out' } });
      tl.to(eyebrow, { opacity:1, duration:.8 })
        .to(lines, { y:0, duration:1.1, stagger:.12 }, '-=.4')
        .to(tag, { opacity:1, duration:.9 }, '-=.6')
        .to(cta, { opacity:1, duration:.9 }, '-=.7')
        .to(scroll, { opacity:1, duration:.8 }, '-=.5');
    } else {
      eyebrow.style.transition = 'opacity .8s ease';
      eyebrow.style.opacity = 1;
      lines.forEach((l,i) => {
        setTimeout(() => { l.style.transition='transform 1s cubic-bezier(.22,1,.36,1)'; l.style.transform='translateY(0)'; }, 200 + i*120);
      });
      setTimeout(() => { tag.style.transition='opacity .9s'; tag.style.opacity=1; }, 700);
      setTimeout(() => { cta.style.transition='opacity .9s'; cta.style.opacity=1; }, 900);
      setTimeout(() => { scroll.style.transition='opacity .8s'; scroll.style.opacity=1; }, 1100);
    }
  }

  /* =========================================================
     THREE.js — HERO SCENE
     A faceted gemstone (dodecahedron-based) with physical
     material, floating and rotating, with particles and
     mouse-reactive camera drift.
  ========================================================= */
  function initHeroScene(THREE){
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    let width = canvas.clientWidth, height = canvas.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0908, 0.045);

    const camera = new THREE.PerspectiveCamera(42, width/height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Lighting
    const ambient = new THREE.AmbientLight(0x6b5636, 0.55);
    scene.add(ambient);

    const key = new THREE.PointLight(0xffe3b0, 40, 30, 2);
    key.position.set(4, 5, 6);
    scene.add(key);

    const rim = new THREE.PointLight(0xc9a467, 26, 30, 2);
    rim.position.set(-5, -3, -4);
    scene.add(rim);

    const fill = new THREE.PointLight(0xfff3d8, 14, 25, 2);
    fill.position.set(-3, 4, 4);
    scene.add(fill);

    // Environment for reflections (simple gradient render target)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(20, 32, 32);
    const envMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top:    { value: new THREE.Color(0x3a2f1c) },
        bottom: { value: new THREE.Color(0x030302) },
      },
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vPos; uniform vec3 top; uniform vec3 bottom;
        void main(){ float h = normalize(vPos).y * 0.5 + 0.5; gl_FragColor = vec4(mix(bottom, top, h), 1.0); }`
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));
    const envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;

    // Gem geometry — faceted diamond-like form
    const gemGeo = new THREE.OctahedronGeometry(2.05, 0);
    gemGeo.scale(1, 1.35, 1);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff6e6,
      metalness: 0.05,
      roughness: 0.04,
      transmission: 0.94,
      thickness: 2.2,
      ior: 2.4,
      envMapIntensity: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(0xd9b98a),
      attenuationDistance: 2.4,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    scene.add(gem);

    // Thin gold band beneath gem for a "ring" suggestion
    const bandGeo = new THREE.TorusGeometry(1.35, 0.085, 32, 100);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xc9a467, metalness: 1, roughness: 0.28, envMapIntensity: 1.4
    });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = Math.PI/2;
    band.position.y = -2.35;
    scene.add(band);

    // Particles
    const particleCount = width < 700 ? 140 : 320;
    const positions = new Float32Array(particleCount*3);
    for (let i=0;i<particleCount;i++){
      const r = 6 + Math.random()*9;
      const theta = Math.random()*Math.PI*2;
      const phi = Math.acos((Math.random()*2)-1);
      positions[i*3]   = r*Math.sin(phi)*Math.cos(theta);
      positions[i*3+1] = r*Math.cos(phi)*0.6;
      positions[i*3+2] = r*Math.sin(phi)*Math.sin(theta) - 4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xd9b98a, size: 0.028, transparent:true, opacity:0.55, sizeAttenuation:true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Pointer interaction
    const pointer = { x:0, y:0 };
    const target = { x:0, y:0 };
    window.addEventListener('mousemove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive:true });

    let scrollFactor = 0;
    window.addEventListener('scroll', () => {
      scrollFactor = Math.min(window.scrollY / window.innerHeight, 1.4);
    }, { passive:true });

    const clock = new THREE.Clock();
    let raf;
    function animate(){
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      target.x += (pointer.x - target.x) * 0.04;
      target.y += (pointer.y - target.y) * 0.04;

      gem.rotation.y = t * 0.22 + target.x * 0.5;
      gem.rotation.x = Math.sin(t*0.3)*0.08 + target.y * 0.25;
      gem.position.y = Math.sin(t*0.6) * 0.18 - scrollFactor*1.6;
      band.rotation.z = t * 0.15;
      band.position.y = -2.35 - scrollFactor*1.6 + Math.sin(t*0.6)*0.06;

      particles.rotation.y = t * 0.015;

      camera.position.x += ((target.x*0.6) - camera.position.x) * 0.04;
      camera.position.y += ((-target.y*0.35) - camera.position.y) * 0.04;
      camera.lookAt(0, -scrollFactor*1.6*0.3, 0);

      renderer.render(scene, camera);
    }
    animate();

    function onResize(){
      width = canvas.clientWidth; height = canvas.clientHeight;
      camera.aspect = width/height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); } else { animate(); }
    });
  }

  /* =========================================================
     THREE.js — SHOWROOM / CONFIGURATOR SCENE (Section 6)
     Drag to rotate, wheel to zoom, slow auto-rotate.
  ========================================================= */
  function initShowroomScene(THREE){
    const canvas = document.getElementById('exp-canvas');
    const stage = document.querySelector('.experience-stage');
    if (!canvas) return;
    if (!THREE) return;

    let width = canvas.clientWidth, height = canvas.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width/height, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    scene.add(new THREE.AmbientLight(0x7a664a, 0.6));
    const l1 = new THREE.PointLight(0xffe6b8, 34, 20, 2); l1.position.set(3,4,4); scene.add(l1);
    const l2 = new THREE.PointLight(0xc9a467, 22, 20, 2); l2.position.set(-4,-2,3); scene.add(l2);
    const l3 = new THREE.PointLight(0xfff3d8, 16, 20, 2); l3.position.set(0,-3,-3); scene.add(l3);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const envMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { top:{value:new THREE.Color(0x362c19)}, bottom:{value:new THREE.Color(0x020202)} },
      vertexShader:`varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`varying vec3 vPos; uniform vec3 top; uniform vec3 bottom; void main(){ float h=normalize(vPos).y*0.5+0.5; gl_FragColor=vec4(mix(bottom,top,h),1.0);}`
    });
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20,32,32), envMat));
    scene.environment = pmrem.fromScene(envScene, 0.05).texture;

    // Ring group: band + faceted stone
    const ringGroup = new THREE.Group();

    const bandGeo = new THREE.TorusGeometry(1.5, 0.16, 48, 128);
    const bandMat = new THREE.MeshStandardMaterial({ color:0xc9a467, metalness:1, roughness:0.22, envMapIntensity:1.5 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    ringGroup.add(band);

    const stoneGeo = new THREE.OctahedronGeometry(0.95, 0);
    stoneGeo.scale(1,1.25,1);
    const stoneMat = new THREE.MeshPhysicalMaterial({
      color:0xffffff, metalness:0, roughness:0.03, transmission:0.95,
      thickness:1.6, ior:2.42, clearcoat:1, clearcoatRoughness:0.03, envMapIntensity:1.8
    });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.y = 1.55;
    ringGroup.add(stone);

    // small prong details
    const prongMat = new THREE.MeshStandardMaterial({ color:0xc9a467, metalness:1, roughness:0.3 });
    for (let i=0;i<4;i++){
      const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.5,10), prongMat);
      const ang = (i/4) * Math.PI*2;
      prong.position.set(Math.cos(ang)*0.55, 1.1, Math.sin(ang)*0.55);
      ringGroup.add(prong);
    }

    ringGroup.rotation.x = 0.35;
    scene.add(ringGroup);

    // Drag rotation
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let velX = 0, velY = 0;
    let autoRotate = true;

    function pointerDown(x,y){ isDragging = true; autoRotate = false; lastX = x; lastY = y; canvas.style.cursor='grabbing'; }
    function pointerMove(x,y){
      if (!isDragging) return;
      const dx = x - lastX, dy = y - lastY;
      ringGroup.rotation.y += dx * 0.008;
      ringGroup.rotation.x += dy * 0.006;
      ringGroup.rotation.x = Math.max(-1.1, Math.min(1.1, ringGroup.rotation.x));
      velX = dx * 0.0008; velY = dy * 0.0006;
      lastX = x; lastY = y;
    }
    function pointerUp(){ isDragging = false; canvas.style.cursor='grab'; }

    canvas.addEventListener('mousedown', e => pointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => pointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', pointerUp);

    canvas.addEventListener('touchstart', e => { const t=e.touches[0]; pointerDown(t.clientX,t.clientY); }, {passive:true});
    canvas.addEventListener('touchmove', e => { const t=e.touches[0]; pointerMove(t.clientX,t.clientY); }, {passive:true});
    canvas.addEventListener('touchend', pointerUp);

    // Zoom
    let zoom = 6.2;
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom += e.deltaY * 0.0025;
      zoom = Math.max(4.2, Math.min(9, zoom));
    }, { passive:false });

    let resumeTimer;
    canvas.addEventListener('mouseleave', () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { autoRotate = true; }, 1400);
    });

    const clock = new THREE.Clock();
    let raf;
    function animate(){
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (autoRotate) ringGroup.rotation.y += dt * 0.28;
      else if (!isDragging){
        ringGroup.rotation.y += velX;
        ringGroup.rotation.x += velY;
        velX *= 0.94; velY *= 0.94;
      }

      camera.position.z += (zoom - camera.position.z) * 0.08;
      camera.lookAt(0,0.2,0);

      renderer.render(scene, camera);
    }
    animate();

    function onResize(){
      width = canvas.clientWidth; height = canvas.clientHeight;
      camera.aspect = width/height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else animate();
    });
  }

  /* ---------------------------------------------------------
     INIT — core UI above runs immediately and unconditionally.
     Three.js is fetched separately (dynamic import via the
     page's import map) so a blocked/offline CDN only disables
     the 3D visuals, never the rest of the site.
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    import('three').then((THREE) => {
      initHeroScene(THREE);
      initShowroomScene(THREE);
    }).catch((err) => {
      console.warn('ELTORA: Three.js failed to load — 3D visuals disabled, rest of the site is unaffected.', err);
      document.querySelectorAll('.hero, .experience-stage').forEach(el => el.classList.add('no-3d'));
    });
  });

})();
