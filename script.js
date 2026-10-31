// Canvas Particle Backdrop Animation
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 50;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    const isLight = document.documentElement.classList.contains('light');
    ctx.fillStyle = isLight ? `rgba(2, 132, 199, ${this.opacity})` : `rgba(56, 189, 248, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Scroll Reveal Observer
const revealElements = document.querySelectorAll('.animated-reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => observer.observe(el));

// Theme Switcher Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlElem = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
  if (htmlElem.classList.contains('dark')) {
    htmlElem.classList.remove('dark');
    htmlElem.classList.add('light');
    themeIcon.className = 'fa-solid fa-sun text-amber-500';
    showToast('Switched to Light Mode');
  } else {
    htmlElem.classList.remove('light');
    htmlElem.classList.add('dark');
    themeIcon.className = 'fa-solid fa-moon text-slate-200';
    showToast('Switched to Dark Mode');
  }
});

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');

mobileBtn.addEventListener('click', () => {
  const isHidden = mobileMenu.classList.contains('hidden');
  if (isHidden) {
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('flex');
    menuIcon.className = 'fa-solid fa-xmark text-base';
  } else {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    menuIcon.className = 'fa-solid fa-bars text-base';
  }
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    menuIcon.className = 'fa-solid fa-bars text-base';
  });
});

// Toast Helper
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

function downloadResume() {
  showToast('Downloading Resume PDF...');
}

function downloadCoverLetter() {
  showToast('Downloading Cover Letter PDF...');
}

// =====================================================
// 3D EXTENSION
// =====================================================
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
});

// ---- 1) Three.js scene: wireframe shapes + particles; scrolling flies the camera through them ----
(function initScene() {
  const cv = document.getElementById('gl3d');
  if (!cv || !window.THREE) return;
  let R;
  try { R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { return; }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.z = 9;

  const wire = (geo) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.38 }));
    scene.add(m);
    return m;
  };
  // [mesh, x, y] - spaced down the page so scrolling passes each one
  const shapes = [
    [wire(new THREE.TorusKnotGeometry(1.6, 0.45, 120, 16)), 3.4, 0],
    [wire(new THREE.IcosahedronGeometry(2, 1)), -3.8, -5],
    [wire(new THREE.TorusGeometry(1.8, 0.5, 16, 40)), 3.4, -10],
    [wire(new THREE.OctahedronGeometry(2.1, 1)), -3.6, -15],
    [wire(new THREE.TorusKnotGeometry(1.4, 0.4, 120, 16, 3, 5)), 3.2, -20]
  ];

  const N = 600, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 32;
    pos[i * 3 + 1] = 6 - Math.random() * 32;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ size: 0.07, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(pg, pm);
  scene.add(points);

  // floating code tokens (sprites) drifting in 3D space
  const tokenTex = (txt) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128;
    const g = c.getContext('2d');
    g.font = '700 58px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 14; g.fillText(txt, 128, 64);
    return new THREE.CanvasTexture(c);
  };
  const TOKENS = ['</>', '{ }', 'JS', 'SQL', 'HTML', 'CSS', 'Node', 'API', 'Git', 'Mongo', '( )', '=>', 'npm', 'JSON'];
  const sprites = [];
  for (let i = 0; i < 30; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tokenTex(TOKENS[i % TOKENS.length]), transparent: true, opacity: 0.5, depthWrite: false }));
    const k = 1.4 + Math.random() * 1.6;
    sp.scale.set(k * 2, k, 1);
    sp.userData = { bx: (Math.random() - 0.5) * 26, by: 5 - Math.random() * 30, ph: Math.random() * 6.28, sp: 0.3 + Math.random() * 0.6 };
    sp.position.set(sp.userData.bx, sp.userData.by, -7 + Math.random() * 9);
    scene.add(sp); sprites.push(sp);
  }

  // match the light / dark theme
  function applyTheme() {
    const light = document.documentElement.classList.contains('light');
    const a = light ? 0x0284c7 : 0x38bdf8, b = light ? 0x7c3aed : 0xa855f7;
    shapes.forEach((s, i) => s[0].material.color.set(i % 2 ? b : a));
    pm.color.set(a);
    if (typeof sprites !== "undefined") sprites.forEach((sp, i) => sp.material.color.set(i % 2 ? b : a));
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  function resize() {
    R.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
    const narrow = innerWidth < 820;
    shapes.forEach(s => { s[0].position.x = s[1] * (narrow ? 0.45 : 1); s[0].scale.setScalar(narrow ? 0.7 : 1); });
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0, camY = 0;
  function frame() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, scrollY / max);
    t += 0.01;
    camY += ((-p * 20) - camY) * 0.06;
    cam.position.y = camY;
    cam.position.x += (mouse.x * 1.2 - cam.position.x) * 0.05;
    cam.lookAt(0, camY, 0);
    shapes.forEach((s, i) => {
      s[0].position.y = s[2];
      s[0].rotation.x = t * 0.4 + i;
      s[0].rotation.y = t * 0.6 + p * 8;
    });
    points.rotation.y = t * 0.05;
    sprites.forEach(sp => {
      const u = sp.userData;
      sp.position.x = u.bx + Math.sin(t * u.sp + u.ph) * 0.8 + mouse.x * 0.4;
      sp.position.y = u.by + Math.cos(t * u.sp * 0.8 + u.ph) * 0.6;
    });
    R.render(scene, cam);
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
  if (reduceMotion) window.addEventListener('scroll', frame, { passive: true });
})();

// ---- 2) 3D tilt + glare on every card ----
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.glass-card:not(.animate-float-slow):not(.animate-float-delayed):not(#mobile-menu)').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const max = r.width > 700 ? 3 : 11;           // big cards tilt less
      el.style.transition = 'transform 0.1s ease-out, border-color 0.3s, box-shadow 0.3s';
      el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * max * 2}deg) rotateX(${-(y - 0.5) * max * 2}deg) translateZ(10px)`;
      el.style.setProperty('--gx', x * 100 + '%');
      el.style.setProperty('--gy', y * 100 + '%');
      el.style.setProperty('--go', 1);
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.setProperty('--go', 0);
    });
  });
}

// ---- 3) Hero photo: tilts with the mouse; badges and photo sit at different depths ----
(function heroPhoto() {
  const box = document.getElementById('hero-photo');
  if (!box) return;
  const layers = box.querySelectorAll('.glass-card');         // [node badge, database badge]
  if (layers[0]) layers[0].style.translate = '0 0 80px';
  if (layers[1]) layers[1].style.translate = '0 0 60px';
  const main = box.querySelector('.rounded-full.overflow-hidden');
  if (main) main.style.translate = '0 0 25px';
  if (!finePointer || reduceMotion) return;
  window.addEventListener('mousemove', () => {
    box.style.transform = `perspective(900px) rotateY(${mouse.x * 16}deg) rotateX(${-mouse.y * 12}deg)`;
  });
})();