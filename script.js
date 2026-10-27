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