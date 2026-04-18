/* ================================================================
   FIGURE.JS — 3D Scroll-Reactive Human Figure
   Built with Three.js r128
   A low-poly stylized human sitting at a glowing desk,
   head turns and posture shifts based on scroll position.
   ================================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('figureCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── SCENE SETUP ── */
  const W = canvas.offsetWidth  || 460;
  const H = canvas.offsetHeight || 520;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 1.8, 6);
  camera.lookAt(0, 0.8, 0);

  /* ── MATERIALS ── */
  const MAT_BODY   = new THREE.MeshStandardMaterial({ color: 0x1e2d3d, roughness: .5, metalness: .1 });
  const MAT_SKIN   = new THREE.MeshStandardMaterial({ color: 0xc99b7a, roughness: .7, metalness: 0 });
  const MAT_SHIRT  = new THREE.MeshStandardMaterial({ color: 0x0a1a2e, roughness: .6 });
  const MAT_HAIR   = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: .9 });
  const MAT_SCREEN = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: .8, roughness: 1 });
  const MAT_DESK   = new THREE.MeshStandardMaterial({ color: 0x1c1408, roughness: .8, metalness: .05 });
  const MAT_METAL  = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .3, metalness: .8 });
  const MAT_GLOW   = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.5, roughness: 1 });
  const MAT_CHAIR  = new THREE.MeshStandardMaterial({ color: 0x111820, roughness: .7 });

  function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, seg, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  }
  function sph(r, seg, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  }

  /* ── DESK ── */
  const deskGrp = new THREE.Group();
  scene.add(deskGrp);

  // desk surface
  const desk = box(3.2, .08, 1.4, MAT_DESK, 0, 0, 0);
  deskGrp.add(desk);
  // legs
  [-1.4, 1.4].forEach(x => [-0.55, 0.55].forEach(z => {
    deskGrp.add(box(.07,.9,.07, MAT_METAL, x, -.48, z));
  }));
  // crossbar
  deskGrp.add(box(2.8,.05,.05, MAT_METAL, 0, -.5, 0));
  deskGrp.position.set(0, -.2, 0);

  /* ── MONITOR ── */
  const monGrp = new THREE.Group();
  deskGrp.add(monGrp);
  monGrp.position.set(-.3, .08, -.3);

  const monBack = box(.9, .6, .05, MAT_METAL, 0, .36, 0);
  monGrp.add(monBack);

  // glowing screen
  const screen = box(.82, .52, .02, MAT_SCREEN, 0, .36, .035);
  monGrp.add(screen);

  // stand
  monGrp.add(box(.05, .25, .05, MAT_METAL, 0, .02, 0));
  monGrp.add(box(.25, .03, .18, MAT_METAL, 0, -.1, 0));

  // screen glow lines
  const linesMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: .5 });
  for (let i = 0; i < 5; i++) {
    const line = box(.55 * Math.random() + .1, .02, .01, linesMat, (.4 * Math.random()) - .2, .2 + i * .07, .05);
    monGrp.add(line);
  }

  /* ── KEYBOARD ── */
  const kb = box(.5, .025, .18, MAT_METAL, .3, .04, .15);
  deskGrp.add(kb);
  // keycap glow dots
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const kd = box(.04, .01, .04, MAT_GLOW, .05 + c * .07, .055, .07 + r * .05);
    kd.material = new THREE.MeshStandardMaterial({ color: 0x0090ff, emissive: 0x0090ff, emissiveIntensity: .3 });
    kb.add(kd);
  }

  /* ── COFFEE MUG ── */
  const mugGrp = new THREE.Group();
  deskGrp.add(mugGrp);
  mugGrp.position.set(1.1, .04, .1);
  mugGrp.add(cyl(.07, .075, .16, 12, MAT_BODY, 0, .08, 0));
  // handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(.06, .015, 8, 12, Math.PI),
    MAT_METAL
  );
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(.095, .08, 0);
  mugGrp.add(handle);

  /* ── CHAIR ── */
  const chairGrp = new THREE.Group();
  scene.add(chairGrp);
  chairGrp.position.set(0, -.75, .9);
  // seat
  chairGrp.add(box(1.1, .1, .9, MAT_CHAIR, 0, 0, 0));
  // back
  chairGrp.add(box(1.1, .9, .08, MAT_CHAIR, 0, .5, -.42));
  // legs
  [-.48, .48].forEach(x => [-.4, .4].forEach(z => {
    chairGrp.add(cyl(.03, .03, .6, 6, MAT_METAL, x, -.35, z));
  }));

  /* ── HUMAN FIGURE ── */
  const figureGrp = new THREE.Group();
  scene.add(figureGrp);
  figureGrp.position.set(0, -.1, .4);

  // Torso
  const torsoGrp = new THREE.Group();
  figureGrp.add(torsoGrp);
  torsoGrp.position.set(0, .5, 0);

  const torso = box(.46, .5, .24, MAT_SHIRT, 0, 0, 0);
  torsoGrp.add(torso);

  // Neck
  const neck = cyl(.07, .07, .15, 8, MAT_SKIN, 0, .33, 0);
  torsoGrp.add(neck);

  // HEAD GROUP — will be animated
  const headGrp = new THREE.Group();
  torsoGrp.add(headGrp);
  headGrp.position.set(0, .46, 0);

  const head = box(.3, .3, .26, MAT_SKIN, 0, 0, 0);
  headGrp.add(head);

  // Hair
  const hair = box(.32, .1, .28, MAT_HAIR, 0, .16, 0);
  headGrp.add(hair);

  // Eyes
  const eyeMatL = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: .5 });
  const eyeMatR = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: .5 });
  const eyeL = box(.05, .04, .03, eyeMatL, -.09, .02, .13);
  const eyeR = box(.05, .04, .03, eyeMatR, .09, .02, .13);
  headGrp.add(eyeL); headGrp.add(eyeR);

  // Glasses
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .3, metalness: .8 });
  const g1 = new THREE.Mesh(new THREE.TorusGeometry(.07, .012, 8, 16), glassMat);
  g1.position.set(-.09, .02, .14); g1.rotation.y = Math.PI / 2;
  headGrp.add(g1);
  const g2 = new THREE.Mesh(new THREE.TorusGeometry(.07, .012, 8, 16), glassMat);
  g2.position.set(.09, .02, .14); g2.rotation.y = Math.PI / 2;
  headGrp.add(g2);
  const bridge = box(.1, .01, .01, glassMat, 0, .02, .14);
  headGrp.add(bridge);

  // Ears
  headGrp.add(box(.04, .08, .06, MAT_SKIN, -.16, 0, 0));
  headGrp.add(box(.04, .08, .06, MAT_SKIN, .16, 0, 0));

  // LEFT ARM (reaching forward to keyboard)
  const leftArmGrp = new THREE.Group();
  torsoGrp.add(leftArmGrp);
  leftArmGrp.position.set(-.28, .1, 0);

  const lUpper = box(.1, .32, .1, MAT_SHIRT, 0, -.16, 0);
  leftArmGrp.add(lUpper);
  leftArmGrp.rotation.z = .3;
  leftArmGrp.rotation.x = -.6;

  const lForeGrp = new THREE.Group();
  lForeGrp.position.set(0, -.32, 0);
  leftArmGrp.add(lForeGrp);
  lForeGrp.rotation.x = .5;

  const lFore = box(.09, .28, .09, MAT_SKIN, 0, -.14, 0);
  lForeGrp.add(lFore);

  const lHand = sph(.07, 8, MAT_SKIN, 0, -.32, 0);
  lForeGrp.add(lHand);

  // RIGHT ARM
  const rightArmGrp = new THREE.Group();
  torsoGrp.add(rightArmGrp);
  rightArmGrp.position.set(.28, .1, 0);

  const rUpper = box(.1, .32, .1, MAT_SHIRT, 0, -.16, 0);
  rightArmGrp.add(rUpper);
  rightArmGrp.rotation.z = -.3;
  rightArmGrp.rotation.x = -.6;

  const rForeGrp = new THREE.Group();
  rForeGrp.position.set(0, -.32, 0);
  rightArmGrp.add(rForeGrp);
  rForeGrp.rotation.x = .5;

  const rFore = box(.09, .28, .09, MAT_SKIN, 0, -.14, 0);
  rForeGrp.add(rFore);
  const rHand = sph(.07, 8, MAT_SKIN, 0, -.32, 0);
  rForeGrp.add(rHand);

  // HIPS
  const hips = box(.44, .22, .22, MAT_BODY, 0, .1, 0);
  figureGrp.add(hips);

  // LEGS (sitting — bent forward)
  const legMat = MAT_BODY;

  // left leg
  const lThighGrp = new THREE.Group();
  figureGrp.add(lThighGrp);
  lThighGrp.position.set(-.14, .12, .05);
  lThighGrp.rotation.x = Math.PI / 2.1;
  const lThigh = box(.14, .38, .13, legMat, 0, -.19, 0);
  lThighGrp.add(lThigh);
  const lShinGrp = new THREE.Group();
  lShinGrp.position.set(0, -.38, 0);
  lThighGrp.add(lShinGrp);
  lShinGrp.rotation.x = -Math.PI / 1.9;
  const lShin = box(.13, .36, .12, legMat, 0, -.18, 0);
  lShinGrp.add(lShin);
  const lFoot = box(.12, .08, .18, legMat, 0, -.38, .05);
  lShinGrp.add(lFoot);

  // right leg
  const rThighGrp = new THREE.Group();
  figureGrp.add(rThighGrp);
  rThighGrp.position.set(.14, .12, .05);
  rThighGrp.rotation.x = Math.PI / 2.1;
  const rThigh = box(.14, .38, .13, legMat, 0, -.19, 0);
  rThighGrp.add(rThigh);
  const rShinGrp = new THREE.Group();
  rShinGrp.position.set(0, -.38, 0);
  rThighGrp.add(rShinGrp);
  rShinGrp.rotation.x = -Math.PI / 1.9;
  const rShin = box(.13, .36, .12, legMat, 0, -.18, 0);
  rShinGrp.add(rShin);
  const rFoot = box(.12, .08, .18, legMat, 0, -.38, .05);
  rShinGrp.add(rFoot);

  /* ── PARTICLES ── */
  const partGeo = new THREE.BufferGeometry();
  const partCount = 120;
  const pPos = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount * 3; i++) pPos[i] = (Math.random() - .5) * 5;
  partGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const partMat = new THREE.PointsMaterial({ color: 0x00e5ff, size: .025, transparent: true, opacity: .5 });
  const particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);

  /* ── LIGHTS ── */
  scene.add(new THREE.AmbientLight(0x112244, 1.2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(3, 5, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00e5ff, .8);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x0090ff, .6);
  rimLight.position.set(0, 3, -4);
  scene.add(rimLight);

  // screen glow point light
  const screenLight = new THREE.PointLight(0x00e5ff, 2.5, 3);
  screenLight.position.set(-.3, .55, 0);
  scene.add(screenLight);

  /* ── GROUND PLANE ── */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid lines on ground
  const gridHelper = new THREE.GridHelper(6, 20, 0x00e5ff, 0x0d1520);
  gridHelper.position.y = -1.19;
  gridHelper.material.opacity = .25;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  /* ── SCROLL REACTIVE ── */
  let scrollProgress = 0; // 0–1
  let targetScrollProgress = 0;

  function updateScroll() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetScrollProgress = Math.min(window.scrollY / Math.max(maxScroll, 1), 1);
  }
  window.addEventListener('scroll', updateScroll, { passive: true });

  /* ── ANIMATION LOOP ── */
  const clock = new THREE.Clock();
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;

    // smooth scroll progress
    scrollProgress += (targetScrollProgress - scrollProgress) * .06;
    const sp = scrollProgress;

    // HEAD rotation — looks up on scroll up, looks down (at screen) on scroll down
    // At sp=0 → looks at screen (forward, slight down)
    // At sp=0.5 → looks up/around
    // At sp=1 → turns sideways (looking at something off-screen)
    headGrp.rotation.y = Math.sin(sp * Math.PI) * .6;
    headGrp.rotation.x = -.2 + sp * .4 - Math.sin(time * .5) * .04;

    // Torso breathing + lean
    torsoGrp.rotation.x = -.12 + Math.sin(time * .4) * .02 + sp * .08;
    torsoGrp.rotation.y = Math.sin(sp * Math.PI * 1.5) * .15;

    // Arms typing motion
    lForeGrp.rotation.x = .5 + Math.sin(time * 3 + 0) * .06;
    rForeGrp.rotation.x = .5 + Math.sin(time * 3 + 1) * .06;
    lArmTyping: leftArmGrp.rotation.x = -.6 + Math.sin(time * 2.8) * .04;
    rightArmGrp.rotation.x = -.6 + Math.sin(time * 2.8 + .5) * .04;

    // Figure subtle float
    figureGrp.position.y = -.1 + Math.sin(time * .6) * .015;

    // Camera orbit slightly based on scroll
    const camAngle = sp * .6 - .3;
    camera.position.x = Math.sin(camAngle) * 6;
    camera.position.z = Math.cos(camAngle) * 6;
    camera.position.y = 1.8 + sp * .5;
    camera.lookAt(0, .8, 0);

    // Particles slow drift
    particles.rotation.y += delta * .04;
    particles.rotation.x += delta * .015;

    // Screen light pulse
    screenLight.intensity = 2 + Math.sin(time * 1.5) * .4;

    // eye blink
    const blink = (Math.sin(time * 1.3) > .97) ? .01 : .04;
    eyeMatL.emissiveIntensity = blink > .02 ? .5 : 0;
    eyeMatR.emissiveIntensity = blink > .02 ? .5 : 0;

    renderer.render(scene, camera);
  }

  animate();

  /* ── RESIZE ── */
  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth || 460;
    const h = canvas.offsetHeight || 520;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }, { passive: true });

  // dummy label for the lArmTyping goto (JS doesn't need it)
  function lArmTyping() {}

})();
