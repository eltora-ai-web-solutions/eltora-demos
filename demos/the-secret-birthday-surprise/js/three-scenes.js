/* =========================================================
   THREE.JS SCENES
   1) Opening scene — moon, mountains silhouette, fireflies, petals
   2) Forever scene — interactive glowing glass heart
   ========================================================= */

/* ---------- Scene 1: The Secret ---------- */
function initSecretScene(canvas){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.4, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // Moon
  const moonGeo = new THREE.SphereGeometry(1.35, 48, 48);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xf3e6c2 });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(0.6, 2.6, -6);
  scene.add(moon);

  const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(243,224,170,0.9)', 'rgba(243,224,170,0)'),
    transparent:true, depthWrite:false
  }));
  moonGlow.scale.set(6.5, 6.5, 1);
  moonGlow.position.copy(moon.position);
  scene.add(moonGlow);

  // Mountain silhouettes (layered planes)
  function mountainLayer(y, z, color, amp){
    const pts = [];
    const w = 20;
    for(let x=-w; x<=w; x+=0.5){
      pts.push(new THREE.Vector2(x, y + Math.sin(x*0.3 + z) * amp + Math.sin(x*0.9)* (amp*0.3)));
    }
    pts.push(new THREE.Vector2(w, -6));
    pts.push(new THREE.Vector2(-w, -6));
    const shape = new THREE.Shape(pts);
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = z;
    return mesh;
  }
  scene.add(mountainLayer(-1.5, -4, 0x160a10, 0.8));
  scene.add(mountainLayer(-2.1, -2, 0x0d0609, 1.1));

  // Distant twinkling stars
  const starCount = 140;
  const starPos = new Float32Array(starCount * 3);
  const starPhase = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - 0.5) * 22;
    starPos[i*3+1] = Math.random() * 7 + 0.5;
    starPos[i*3+2] = -7 - Math.random() * 5;
    starPhase[i] = Math.random() * Math.PI * 2;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.045, color: 0xf3e6c2, transparent: true, opacity: 0.7, depthWrite:false
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Fireflies / floating particles
  const fireflyCount = 90;
  const fPos = new Float32Array(fireflyCount * 3);
  for(let i=0;i<fireflyCount;i++){
    fPos[i*3]   = (Math.random()-0.5) * 16;
    fPos[i*3+1] = (Math.random()-0.2) * 6 - 1;
    fPos[i*3+2] = (Math.random()-0.5) * 8;
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fMat = new THREE.PointsMaterial({
    size:0.06, color:0xf0cf8a, transparent:true, opacity:0.85,
    map: radialTexture('rgba(255,240,200,1)', 'rgba(255,240,200,0)'),
    depthWrite:false, blending: THREE.AdditiveBlending
  });
  const fireflies = new THREE.Points(fGeo, fMat);
  scene.add(fireflies);

  // Rose petals — small tinted planes falling slowly
  const petalCount = 26;
  const petals = [];
  const petalGeo = new THREE.PlaneGeometry(0.14, 0.2);
  const petalMat = new THREE.MeshBasicMaterial({ color:0x8f2233, transparent:true, opacity:0.85, side:THREE.DoubleSide });
  for(let i=0;i<petalCount;i++){
    const m = new THREE.Mesh(petalGeo, petalMat.clone());
    m.position.set((Math.random()-0.5)*14, Math.random()*10 - 2, (Math.random()-0.5)*6);
    m.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    m.userData.speed = 0.15 + Math.random()*0.2;
    m.userData.sway = Math.random()*Math.PI*2;
    scene.add(m);
    petals.push(m);
  }

  function radialTexture(inner, outer){
    const size = 128;
    const c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    g.addColorStop(0, inner); g.addColorStop(1, outer);
    ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(c);
  }

  let raf;
  const clock = new THREE.Clock();
  function animate(){
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    fireflies.rotation.y = t * 0.02;
    const posArr = fGeo.attributes.position.array;
    for(let i=0;i<fireflyCount;i++){
      posArr[i*3+1] += Math.sin(t + i) * 0.0008;
    }
    fGeo.attributes.position.needsUpdate = true;

    petals.forEach(p=>{
      p.position.y -= p.userData.speed * 0.01;
      p.position.x += Math.sin(t + p.userData.sway) * 0.003;
      p.rotation.z += 0.004;
      if(p.position.y < -3){ p.position.y = 7; }
    });

    moon.rotation.y = t * 0.01;
    starMat.opacity = 0.55 + Math.sin(t * 0.8) * 0.15;
    renderer.render(scene, camera);
  }
  animate();

  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);

  return { stop(){ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); } };
}

/* ---------- Scene 2: Forever heart ---------- */
function initForeverHeart(canvas){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.set(0, 0, 5.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function heartShape(){
    const s = new THREE.Shape();
    s.moveTo(0, -1.1);
    s.bezierCurveTo(-1.6, 0.4, -1.6, 1.5, -0.7, 1.7);
    s.bezierCurveTo(-0.1, 1.85, 0, 1.3, 0, 1.3);
    s.bezierCurveTo(0, 1.3, 0.1, 1.85, 0.7, 1.7);
    s.bezierCurveTo(1.6, 1.5, 1.6, 0.4, 0, -1.1);
    return s;
  }
  const extrude = { depth:0.5, bevelEnabled:true, bevelThickness:0.12, bevelSize:0.1, bevelSegments:6, curveSegments:24 };
  const heartGeo = new THREE.ExtrudeGeometry(heartShape(), extrude);
  heartGeo.center();
  const heartMat = new THREE.MeshPhysicalMaterial({
    color:0xb4222f, transparent:true, opacity:0.55, roughness:0.15, metalness:0,
    transmission:0.6, thickness:1.2, emissive:0x6e0f18, emissiveIntensity:0.4
  });
  const heart = new THREE.Mesh(heartGeo, heartMat);
  heart.scale.set(1.15,1.15,1.15);
  scene.add(heart);

  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: (function(){
      const size=256; const c=document.createElement('canvas'); c.width=c.height=size;
      const ctx=c.getContext('2d');
      const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
      g.addColorStop(0,'rgba(255,120,110,0.85)'); g.addColorStop(1,'rgba(255,120,110,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
      return new THREE.CanvasTexture(c);
    })(),
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
  }));
  glowSprite.scale.set(3.6,3.6,1);
  scene.add(glowSprite);

  const key = new THREE.PointLight(0xffcf9a, 2.2, 12);
  key.position.set(2,2,3); scene.add(key);
  const rim = new THREE.PointLight(0xff5566, 1.6, 12);
  rim.position.set(-2,-1,2); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x552233, 0.6));

  // Ambient halo — slow-orbiting gold/crimson particles around the heart, always on
  const haloCount = 46;
  const haloGeo = new THREE.BufferGeometry();
  const haloPos = new Float32Array(haloCount * 3);
  const haloAngle = []; const haloRadius = []; const haloSpeed = []; const haloYoff = [];
  for (let i = 0; i < haloCount; i++) {
    haloAngle.push(Math.random() * Math.PI * 2);
    haloRadius.push(1.9 + Math.random() * 0.9);
    haloSpeed.push(0.08 + Math.random() * 0.1);
    haloYoff.push((Math.random() - 0.5) * 2.4);
  }
  const haloMat = new THREE.PointsMaterial({
    size: 0.05, transparent: true, opacity: 0.75, depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xf0b06a,
    map: (function(){
      const size=64; const c=document.createElement('canvas'); c.width=c.height=size;
      const ctx=c.getContext('2d');
      const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
      g.addColorStop(0,'rgba(255,200,150,1)'); g.addColorStop(1,'rgba(255,200,150,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
      return new THREE.CanvasTexture(c);
    })()
  });
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
  const halo = new THREE.Points(haloGeo, haloMat);
  scene.add(halo);

  // burst particles (hidden until click)
  const burstCount = 60;
  const burstGeo = new THREE.BufferGeometry();
  const burstPos = new Float32Array(burstCount*3);
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos,3));
  const burstMat = new THREE.PointsMaterial({ size:0.09, color:0xffb3ba, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false });
  const burst = new THREE.Points(burstGeo, burstMat);
  scene.add(burst);
  let burstVelocities = [];

  function triggerBurst(){
    burstVelocities = [];
    const posArr = burstGeo.attributes.position.array;
    for(let i=0;i<burstCount;i++){
      posArr[i*3]=0; posArr[i*3+1]=0; posArr[i*3+2]=0;
      const theta = Math.random()*Math.PI*2, phi = Math.random()*Math.PI;
      burstVelocities.push([
        Math.sin(phi)*Math.cos(theta)*0.03,
        Math.sin(phi)*Math.sin(theta)*0.03,
        Math.cos(phi)*0.03
      ]);
    }
    burstGeo.attributes.position.needsUpdate = true;
    burstMat.opacity = 1;
    burstLife = 1;
  }
  let burstLife = 0;

  let pulse = 0, boosted = 0;
  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w,h,false);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let raf;
  function animate(){
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    pulse = 1 + Math.sin(t*1.6)*0.035 + boosted;
    heart.scale.setScalar(1.15 * pulse);
    heart.rotation.y = Math.sin(t*0.4)*0.35;
    glowSprite.material.opacity = 0.75 + Math.sin(t*1.6)*0.1 + boosted*0.6;
    boosted *= 0.92;

    const haloArr = haloGeo.attributes.position.array;
    for (let i = 0; i < haloCount; i++) {
      const a = haloAngle[i] + t * haloSpeed[i];
      haloArr[i*3]   = Math.cos(a) * haloRadius[i];
      haloArr[i*3+1] = haloYoff[i] + Math.sin(t*0.6 + i) * 0.15;
      haloArr[i*3+2] = Math.sin(a) * haloRadius[i] * 0.5;
    }
    haloGeo.attributes.position.needsUpdate = true;

    if(burstLife > 0){
      const posArr = burstGeo.attributes.position.array;
      for(let i=0;i<burstCount;i++){
        posArr[i*3]   += burstVelocities[i][0];
        posArr[i*3+1] += burstVelocities[i][1];
        posArr[i*3+2] += burstVelocities[i][2];
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstLife -= 0.012;
      burstMat.opacity = Math.max(burstLife, 0);
    }

    renderer.render(scene, camera);
  }
  animate();

  canvas.addEventListener('pointerdown', ()=>{
    boosted = 0.5;
    triggerBurst();
  });

  return { stop(){ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); }, resize };
}
