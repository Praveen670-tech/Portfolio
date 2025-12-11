// script.js — mobile nav, smooth scroll, active link highlight
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const hamburger = $('#hamburger');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');

  if (!hamburger || !navMenu) return;

  function setMenu(open) {
    if (open) {
      navMenu.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
    } else {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  hamburger.addEventListener('click', () => {
    setMenu(!navMenu.classList.contains('open'));
  });

  // Close when clicking a nav link (mobile)
  navLinks.forEach(a => {
    a.addEventListener('click', () => setMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navMenu.classList.contains('open')) return;
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) setMenu(false);
  }, true);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) setMenu(false);
  });

  // Smooth scroll for same-page anchors (respect reduced motion)
  const supports = 'scrollBehavior' in document.documentElement.style;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('a[href^="#"]').forEach(a => {
    const hash = a.getAttribute('href');
    if (!hash || hash === '#' || hash === '#!') return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    a.addEventListener('click', (ev) => {
      // allow normal behavior for downloads/external links
      if (a.hasAttribute('download') || a.target === '_blank') return;
      ev.preventDefault();
      setMenu(false);
      const top = target.getBoundingClientRect().top + window.pageYOffset - 12;
      if (supports && !reduced) window.scrollTo({ top, behavior: 'smooth' });
      else window.scrollTo(0, top);
      try { history.replaceState(null, '', '#' + id); } catch (err) {}
    });
  });

  // Active nav link highlighting on scroll
  const sections = navLinks.map(a => a.hash && document.getElementById(a.hash.slice(1))).filter(Boolean);
  function updateActive() {
    if (!sections.length) return;
    const scroll = window.pageYOffset;
    const offset = Math.round(window.innerHeight * 0.18);
    let current = sections[0];
    for (const s of sections) {
      const top = s.getBoundingClientRect().top + window.pageYOffset;
      if (scroll + offset >= top) current = s;
    }
    navLinks.forEach(a => {
      const id = a.hash ? a.hash.slice(1) : null;
      if (id === current.id) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
      else { a.classList.remove('active'); a.removeAttribute('aria-current'); }
    });
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { updateActive(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('load', updateActive);
})();
