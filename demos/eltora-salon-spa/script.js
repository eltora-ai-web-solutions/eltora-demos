/* ============================================================
   ELTORA SALON & SPA — script.js
   Vanilla JS + Three.js. No build step required.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initMagnetic();
  initParallax();
  initMenuTabs();
  initBookingForm();
  initBackToTop();
  initLeafParticles();
  initHeroScene();
  initBeautyScene();
});

/* ---------------------------------------------------------
   NAVIGATION
--------------------------------------------------------- */
function initNav(){
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-panel');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      panel.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---------------------------------------------------------
   SCROLL REVEAL (IntersectionObserver)
--------------------------------------------------------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal, .reveal-img');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  items.forEach(el => io.observe(el));
}

/* ---------------------------------------------------------
   MAGNETIC BUTTONS
--------------------------------------------------------- */
function initMagnetic(){
  const buttons = document.querySelectorAll('.magnetic');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
}

/* ---------------------------------------------------------
   PARALLAX (banner + bridal images)
--------------------------------------------------------- */
function initParallax(){
  const els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;
  const onScroll = () => {
    const vh = window.innerHeight;
    els.forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      const progress = (rect.top) / vh; // -1..1 roughly
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const y = progress * -60 * speed * 4;
      el.style.transform = `translateY(${y}px) scale(1.15)`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------
   SERVICE MENU TABS
--------------------------------------------------------- */
function initMenuTabs(){
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

/* ---------------------------------------------------------
   BOOKING FORM — front-end validation + confirmation
--------------------------------------------------------- */
function initBookingForm(){
  const form = document.getElementById('booking-form');
  if (!form) return;
  const confirmBox = document.getElementById('booking-confirm');

  const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
    phone: v => /^[0-9+\-\s()]{7,15}$/.test(v) || 'Please enter a valid phone number.',
    service: v => v !== '' || 'Please choose a service.',
    date: v => v !== '' || 'Please choose a preferred date.',
    time: v => v !== '' || 'Please choose a preferred time.'
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(validators).forEach(key => {
      const field = form.elements[key];
      const errorEl = document.getElementById('err-' + key);
      if (!field || !errorEl) return;
      const result = validators[key](field.value);
      if (result !== true){
        errorEl.textContent = result;
        valid = false;
      } else {
        errorEl.textContent = '';
      }
    });

    if (valid){
      confirmBox.classList.add('show');
      confirmBox.innerHTML = `<strong>Thank you, ${escapeHtml(form.elements.name.value)}.</strong>&nbsp; Your request for ${escapeHtml(form.elements.service.options[form.elements.service.selectedIndex].text)} on ${escapeHtml(form.elements.date.value)} has been received. Our studio will confirm your appointment shortly.`;
      form.reset();
      confirmBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      confirmBox.classList.remove('show');
    }
  });
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   BACK TO TOP
--------------------------------------------------------- */
function initBackToTop(){
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 900);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------------------------------------------------------
   AMBIENT BOTANICAL PARTICLES (subtle, CSS-driven, JS-generated)
--------------------------------------------------------- */
function initLeafParticles(){
  const layer = document.getElementById('leaf-layer');
  if (!layer) return;
  const COUNT = 14;
  for (let i = 0; i < COUNT; i++){
    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leaf.setAttribute('viewBox', '0 0 24 24');
    leaf.setAttribute('width', 14 + Math.random() * 14);
    leaf.setAttribute('height', 14 + Math.random() * 14);
    leaf.classList.add('leaf');
    leaf.innerHTML = '<path d="M12 2C7 6 4 11 4 15a8 8 0 0 0 16 0c0-4-3-9-8-13z" fill="#6B7A59" opacity="0.5"/>';
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.top = (Math.random() * 100) + 'vh';
    const duration = 18 + Math.random() * 20;
    const delay = Math.random() * -30;
    leaf.style.animation = `leafFloat ${duration}s ease-in-out ${delay}s infinite`;
    layer.appendChild(leaf);
  }

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes leafFloat {
      0%   { transform: translate(0,0) rotate(0deg); }
      25%  { transform: translate(20px,-30px) rotate(45deg); }
      50%  { transform: translate(-10px,-60px) rotate(90deg); }
      75%  { transform: translate(15px,-90px) rotate(135deg); }
      100% { transform: translate(0,-130px) rotate(180deg); opacity:0; }
    }`;
  document.head.appendChild(styleTag);
}

/* ============================================================
   3D — CINEMATIC HERO SCENE
   Perfume bottle + glass bottle + botanical leaves + stone + particles
   ============================================================ */
function initHeroScene(){
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xEFE4CE, 0.045);

  const camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.1, 8.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // ---- Lighting ----
  const key = new THREE.DirectionalLight(0xfff3df, 2.1);
  key.position.set(4, 6, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xd9c08f, 1.4);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const fill = new THREE.AmbientLight(0x8fa584, 0.55);
  scene.add(fill);

  const spot = new THREE.PointLight(0xffe9c2, 1.4, 20, 2);
  spot.position.set(0, 4, 3);
  scene.add(spot);

  // ---- Environment reflection (procedural cube render target) ----
  const cubeCam = new THREE.CubeCamera(0.1, 50, new THREE.WebGLCubeRenderTarget(256, {
    generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter
  }));
  scene.add(cubeCam);

  const bgGrad = createGradientTexture('#f4ead2', '#ddcda3');
  scene.background = bgGrad;

  // ---- Group holding everything (for gentle idle rotation) ----
  const rig = new THREE.Group();
  scene.add(rig);

  // ---- Perfume bottle (glass cylinder + cap) ----
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xcfe0cf, transparent: true, opacity: 0.55, roughness: 0.05,
    metalness: 0, transmission: 0.9, thickness: 1.2, ior: 1.4, envMap: cubeCam.renderTarget.texture
  });

  const perfumeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.7, 48), glassMat);
  perfumeBody.position.set(-1.9, -0.2, 0.4);
  rig.add(perfumeBody);

  const perfumeCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.55, 32),
    new THREE.MeshStandardMaterial({ color: 0xB8965B, metalness: 0.85, roughness: 0.28 })
  );
  perfumeCap.position.set(-1.9, 0.98, 0.4);
  rig.add(perfumeCap);

  const perfumeCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1.3, 32),
    new THREE.MeshPhysicalMaterial({ color: 0xC9A66B, transparent: true, opacity: 0.65, roughness: 0.1, transmission: 0.4 })
  );
  perfumeCore.position.set(-1.9, -0.28, 0.4);
  rig.add(perfumeCore);

  // ---- Cosmetic glass jar ----
  const jarMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.08,
    transmission: 0.92, thickness: 1, ior: 1.45, envMap: cubeCam.renderTarget.texture
  });
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.9, 48), jarMat);
  jar.position.set(1.7, -0.55, -0.6);
  rig.add(jar);

  const jarLid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.28, 48),
    new THREE.MeshStandardMaterial({ color: 0x3E4A3B, metalness: 0.3, roughness: 0.4 })
  );
  jarLid.position.set(1.7, 0.04, -0.6);
  rig.add(jarLid);

  // ---- Sculptural stone (icosahedron, rounded look via subdivisions) ----
  const stoneGeo = new THREE.IcosahedronGeometry(0.9, 2);
  distortGeometry(stoneGeo, 0.09);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xEDE6D8, roughness: 0.75, metalness: 0.05 });
  const stone = new THREE.Mesh(stoneGeo, stoneMat);
  stone.position.set(0.1, -1.05, 1.4);
  stone.scale.set(1, 0.62, 1);
  rig.add(stone);

  // ---- Floating botanical leaves (custom shape) ----
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.4, 0.2, 0.5, 0.9, 0, 1.5);
  leafShape.bezierCurveTo(-0.5, 0.9, -0.4, 0.2, 0, 0);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.02, bevelEnabled: false });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4F6B45, roughness: 0.5, side: THREE.DoubleSide });

  const leaves = [];
  for (let i = 0; i < 6; i++){
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.setScalar(0.45 + Math.random() * 0.3);
    leaf.position.set(
      (Math.random() - 0.5) * 5,
      Math.random() * 2.6 - 0.4,
      (Math.random() - 0.5) * 3
    );
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    leaf.userData.speed = 0.2 + Math.random() * 0.3;
    leaf.userData.offset = Math.random() * Math.PI * 2;
    rig.add(leaf);
    leaves.push(leaf);
  }

  // ---- Particles ----
  const particleCount = 140;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++){
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 5 - 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xD9C08F, size: 0.02, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---- Soft ground shadow plane ----
  const groundGeo = new THREE.CircleGeometry(4.2, 48);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xE7DCC5, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.65;
  scene.add(ground);

  // ---- Mouse interaction ----
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Cinematic camera drift on scroll ----
  let scrollT = 0;
  window.addEventListener('scroll', () => {
    scrollT = Math.min(window.scrollY / window.innerHeight, 1);
  }, { passive: true });

  function createGradientTexture(c1, c2){
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function distortGeometry(geo, amt){
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++){
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      v.multiplyScalar(1 + (Math.random() - 0.5) * amt);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
  }

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    rig.rotation.y = t * 0.08 + mouse.x * 0.35;
    rig.rotation.x = mouse.y * 0.08;

    perfumeBody.position.y = -0.2 + Math.sin(t * 0.6) * 0.06;
    perfumeCap.position.y = 0.98 + Math.sin(t * 0.6) * 0.06;
    perfumeCore.position.y = -0.28 + Math.sin(t * 0.6) * 0.06;
    jar.position.y = -0.55 + Math.cos(t * 0.5 + 1) * 0.05;
    jarLid.position.y = 0.04 + Math.cos(t * 0.5 + 1) * 0.05;
    stone.rotation.y = t * 0.15;

    leaves.forEach(leaf => {
      leaf.position.y += Math.sin(t * leaf.userData.speed + leaf.userData.offset) * 0.0025;
      leaf.rotation.z += 0.002;
      leaf.rotation.x += 0.0012;
    });

    particles.rotation.y = t * 0.02;

    camera.position.x = mouse.x * 0.5;
    camera.position.y = 1.1 - mouse.y * 0.2 - scrollT * 1.4;
    camera.position.z = 8.5 - scrollT * 2.2;
    camera.lookAt(0, 0.1, 0);

    cubeCam.position.copy(rig.position);
    cubeCam.update(renderer, scene);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/* ============================================================
   3D — INTERACTIVE BEAUTY OBJECT (drag / zoom / rotate)
   ============================================================ */
function initBeautyScene(){
  const canvas = document.getElementById('beauty-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.4, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const key = new THREE.DirectionalLight(0xffe9c2, 2);
  key.position.set(3, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xB8965B, 1.2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const cubeCam = new THREE.CubeCamera(0.1, 50, new THREE.WebGLCubeRenderTarget(256));
  scene.add(cubeCam);

  const group = new THREE.Group();
  scene.add(group);

  // Bottle body
  const bottleMat = new THREE.MeshPhysicalMaterial({
    color: 0xEDE6D8, transparent: true, opacity: 0.6, roughness: 0.06,
    transmission: 0.85, thickness: 1.3, ior: 1.4, envMap: cubeCam.renderTarget.texture
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.4, 48, 1, false), bottleMat);
  group.add(body);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.5, 32), bottleMat);
  neck.position.y = 1.45;
  group.add(neck);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0xB8965B, metalness: 0.9, roughness: 0.2 })
  );
  cap.position.y = 1.95;
  group.add(cap);

  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.0, 1.7, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x9CAE7C, transparent: true, opacity: 0.55, transmission: 0.5, roughness: 0.15 })
  );
  liquid.position.y = -0.35;
  group.add(liquid);

  // Base disc
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.12, 64),
    new THREE.MeshStandardMaterial({ color: 0x3E4A3B, roughness: 0.6 })
  );
  base.position.y = -1.3;
  group.add(base);

  // --- Interaction: drag to rotate, wheel/pinch to zoom ---
  let isDragging = false, prevX = 0, prevY = 0;
  let rotY = 0.4, rotX = 0.1, targetRotY = 0.4, targetRotX = 0.1;
  let zoom = 6, targetZoom = 6;

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('pointerup', () => isDragging = false);
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX, dy = e.clientY - prevY;
    targetRotY += dx * 0.006;
    targetRotX += dy * 0.004;
    targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
    prevX = e.clientX; prevY = e.clientY;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetZoom = Math.max(3.5, Math.min(9, targetZoom + e.deltaY * 0.003));
  }, { passive: false });

  let lastTouchDist = null;
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist){
        targetZoom = Math.max(3.5, Math.min(9, targetZoom - (dist - lastTouchDist) * 0.01));
      }
      lastTouchDist = dist;
    }
  }, { passive: true });
  canvas.addEventListener('touchend', () => lastTouchDist = null);

  // Floating labels toggle
  const labels = document.querySelectorAll('.floating-label');
  setTimeout(() => labels.forEach((l, i) => setTimeout(() => l.classList.add('show'), i * 400)), 600);

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!isDragging) targetRotY += 0.0025; // slow auto rotation

    rotY += (targetRotY - rotY) * 0.08;
    rotX += (targetRotX - rotX) * 0.08;
    zoom += (targetZoom - zoom) * 0.08;

    group.rotation.y = rotY;
    group.rotation.x = rotX;
    group.position.y = Math.sin(t * 0.6) * 0.08;

    camera.position.set(0, 0.3, zoom);
    camera.lookAt(0, 0, 0);

    cubeCam.update(renderer, scene);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
