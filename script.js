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

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

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
