const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.classList.toggle('active', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.classList.remove('active');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

// Anima o cabeçalho diretamente pelo scroll, sem depender da transição CSS.
const headerLogo = header.querySelector('.logo img');
let headerProgress = window.scrollY > 40 ? 1 : 0;
let headerTarget = headerProgress;
let headerFrame = null;

function headerSizes() {
  if (window.innerWidth <= 700) return { openHeight: 94, closedHeight: 72, openLogo: 250, closedLogo: 195 };
  if (window.innerWidth <= 1000) return { openHeight: 104, closedHeight: 76, openLogo: 280, closedLogo: 215 };
  return { openHeight: 112, closedHeight: 76, openLogo: 330, closedLogo: 250 };
}

function renderHeader() {
  const size = headerSizes();
  headerProgress += (headerTarget - headerProgress) * 0.14;
  if (Math.abs(headerTarget - headerProgress) < 0.002) headerProgress = headerTarget;
  header.style.height = (size.openHeight + (size.closedHeight - size.openHeight) * headerProgress) + 'px';
  headerLogo.style.width = (size.openLogo + (size.closedLogo - size.openLogo) * headerProgress) + 'px';
  if (headerProgress !== headerTarget) headerFrame = requestAnimationFrame(renderHeader);
  else headerFrame = null;
}

function updateHeaderTarget() {
  headerTarget = window.scrollY > 40 ? 1 : 0;
  header.classList.toggle('scrolled', headerTarget === 1);
  if (!headerFrame) headerFrame = requestAnimationFrame(renderHeader);
}

header.style.transitionProperty = 'background-color, backdrop-filter';
headerLogo.style.transitionProperty = 'filter';
window.addEventListener('scroll', updateHeaderTarget, { passive: true });
window.addEventListener('resize', updateHeaderTarget, { passive: true });
updateHeaderTarget();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const sectionLinks = [...document.querySelectorAll('.nav > a:not(.nav-cta)')];
const trackedSections = sectionLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setActiveSection(sectionId) {
  sectionLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

sectionLinks.forEach(link => link.addEventListener('click', () => {
  setActiveSection(link.getAttribute('href').slice(1));
}));

const sectionObserver = new IntersectionObserver(entries => {
  const current = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (current) setActiveSection(current.target.id);
}, { threshold: [0.35, 0.55, 0.75] });

trackedSections.forEach(section => sectionObserver.observe(section));

if (window.location.hash && trackedSections.some(section => `#${section.id}` === window.location.hash)) {
  setActiveSection(window.location.hash.slice(1));
}

document.querySelectorAll('.filters button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.filters button.active')?.classList.remove('active');
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

const fileInput = document.querySelector('.file-input input');
fileInput.addEventListener('change', () => {
  const label = document.querySelector('.file-input b');
  label.textContent = fileInput.files.length ? fileInput.files[0].name : 'Anexar desenho ou projeto';
});

document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  status.textContent = 'Solicitação preparada. Em breve nossa equipe entrará em contato.';
  event.currentTarget.reset();
  document.querySelector('.file-input b').textContent = 'Anexar desenho ou projeto';
});
