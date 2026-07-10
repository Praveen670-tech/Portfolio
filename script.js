(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const hamburger = $('#hamburger');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');

  function setMenu(open) {
    if (!hamburger || !navMenu) return;
    if (open) {
      navMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    } else {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
    navLinks.forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('open')) return;
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) setMenu(false);
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) setMenu(false);
    });
  }

  const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('a[href^="#"]').forEach((a) => {
    const hash = a.getAttribute('href');
    if (!hash || hash === '#' || hash === '#!') return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    a.addEventListener('click', (ev) => {
      if (a.hasAttribute('download') || a.target === '_blank') return;
      ev.preventDefault();
      setMenu(false);
      const top = target.getBoundingClientRect().top + window.pageYOffset - 16;
      if (supportsSmooth && !reduced) window.scrollTo({ top, behavior: 'smooth' });
      else window.scrollTo(0, top);
      try { history.replaceState(null, '', '#' + id); } catch (err) { }
    });
  });

  const sections = navLinks.map((a) => a.hash && document.getElementById(a.hash.slice(1))).filter(Boolean);
  function updateActive() {
    if (!sections.length) return;
    const scroll = window.pageYOffset;
    const offset = Math.round(window.innerHeight * 0.18);
    let current = sections[0];
    for (const section of sections) {
      const top = section.getBoundingClientRect().top + window.pageYOffset;
      if (scroll + offset >= top) current = section;
    }
    navLinks.forEach((a) => {
      const id = a.hash ? a.hash.slice(1) : null;
      if (id === current.id) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  }

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', updateActive);

  const revealItems = $$('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  revealItems.forEach((item) => revealObserver.observe(item));

  const roles = ['full-stack web applications', 'AI-powered products', 'clean backend systems', 'modern user experiences'];
  const typingText = $('#typing-text');
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    if (!typingText) return;
    const current = roles[roleIndex];
    typingText.textContent = current.slice(0, charIndex);
    if (!deleting && charIndex < current.length) {
      charIndex += 1;
      setTimeout(typeLoop, 70);
    } else if (!deleting && charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1200);
    } else if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(typeLoop, 40);
    } else {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeLoop, 320);
    }
  }

  if (typingText && !reduced) typeLoop();
  else if (typingText) typingText.textContent = roles[0];

  const track = $('#cert-track');
  const viewport = $('#carousel-viewport');
  const prevBtn = $('#cert-prev');
  const nextBtn = $('#cert-next');
  const dotsContainer = $('#carousel-dots');

  const certificateData = Array.isArray(window.CERTIFICATE_DATA) ? window.CERTIFICATE_DATA : [];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderCertificates() {
    if (!track) return;
    if (!certificateData.length) {
      track.innerHTML = '<div class="certificate-empty" role="status">No certificates detected yet. Add files to the certificate folder and refresh.</div>';
      return;
    }

    track.innerHTML = certificateData.map((certificate) => {
      const thumbnailMarkup = certificate.type === 'image'
        ? `<img src="${escapeHtml(certificate.file)}" alt="${escapeHtml(certificate.title)}" loading="lazy" />`
        : `<div class="media-fallback">PDF</div>`;

      return `
        <article class="certificate-card" data-file="${escapeHtml(certificate.file)}">
          <div class="certificate-media">
            ${thumbnailMarkup}
            <span class="media-label">${escapeHtml(certificate.type === 'image' ? 'Image' : 'PDF')}</span>
          </div>
          <div class="certificate-content">
            <div class="certificate-top">
              <p class="certificate-org">${escapeHtml(certificate.organization)}</p>
              <span class="verified-badge">Verified</span>
            </div>
            <h3>${escapeHtml(certificate.title)}</h3>
            <p>${escapeHtml(certificate.description)}</p>
            <div class="certificate-actions">
              <a class="action-btn preview-btn" href="${escapeHtml(certificate.file)}" target="_blank" rel="noopener noreferrer">Preview</a>
              <a class="action-btn download-btn" href="${escapeHtml(certificate.file)}" download>Download</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  if (track && viewport) {
    let currentIndex = 0;
    let autoPlay;

    function getVisibleCards() {
      if (window.innerWidth <= 680) return 1;
      if (window.innerWidth <= 800) return 2;
      if (window.innerWidth <= 1100) return 3;
      return 4;
    }

    function updateCarousel() {
      const cards = Array.from(track.children).filter((child) => child.classList.contains('certificate-card'));
      const totalCards = cards.length;
      if (!totalCards) return;
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      currentIndex = Math.min(currentIndex, maxIndex);
      const shift = currentIndex * (100 / visibleCards);
      track.style.transform = `translateX(-${shift}%)`;
      dotsContainer?.querySelectorAll('button').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const cards = Array.from(track.children).filter((child) => child.classList.contains('certificate-card'));
      const totalCards = cards.length;
      if (!totalCards) return;
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      for (let i = 0; i <= maxIndex; i += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }
      updateCarousel();
    }

    function startAutoPlay() {
      clearInterval(autoPlay);
      const cards = Array.from(track.children).filter((child) => child.classList.contains('certificate-card'));
      const totalCards = cards.length;
      if (!totalCards) return;
      autoPlay = setInterval(() => {
        const visibleCards = getVisibleCards();
        const maxIndex = Math.max(0, totalCards - visibleCards);
        currentIndex = (currentIndex + 1) > maxIndex ? 0 : currentIndex + 1;
        updateCarousel();
      }, 4500);
    }

    function initializeCarousel() {
      renderCertificates();
      createDots();
      startAutoPlay();
    }

    prevBtn?.addEventListener('click', () => {
      const cards = Array.from(track.children).filter((child) => child.classList.contains('certificate-card'));
      const totalCards = cards.length;
      if (!totalCards) return;
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      updateCarousel();
    });
    nextBtn?.addEventListener('click', () => {
      const cards = Array.from(track.children).filter((child) => child.classList.contains('certificate-card'));
      const totalCards = cards.length;
      if (!totalCards) return;
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
      updateCarousel();
    });

    viewport?.addEventListener('mouseenter', () => clearInterval(autoPlay));
    viewport?.addEventListener('mouseleave', startAutoPlay);

    let touchStartX = 0;
    viewport?.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    viewport?.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (delta < -50) nextBtn?.click();
      if (delta > 50) prevBtn?.click();
    }, { passive: true });

    window.addEventListener('resize', () => {
      initializeCarousel();
    });

    initializeCarousel();
  }
})();
