/* ============================================================
   VALENTINA PARAGUAY – Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVIGATION – sticky + mobile toggle
  ---------------------------------------------------------- */
  const header    = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const navLinks  = document.querySelectorAll('.nav-link');

  // Sticky header on scroll
  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  navToggle.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ----------------------------------------------------------
     2. ACTIVE NAV LINK – highlight current section
  ---------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector('.nav-link[href="#' + id + '"]');
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      }
    });
  }

  // Add active style
  const style = document.createElement('style');
  style.textContent = '.nav-link.active { color: var(--gold) !important; }';
  document.head.appendChild(style);

  /* ----------------------------------------------------------
     3. SMOOTH SCROLL for anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     4. FADE-IN on scroll (Intersection Observer)
  ---------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // Stagger siblings in the same grid
            const siblings = entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)');
            let delay = 0;
            siblings.forEach(function (el, idx) {
              if (el === entry.target) delay = idx * 80;
            });
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ----------------------------------------------------------
     5. FAQ ACCORDION
  ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').classList.remove('open');
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open', !isOpen);
    });
  });

  /* ----------------------------------------------------------
     6. CONTACT FORM – WhatsApp redirect + modal
  ---------------------------------------------------------- */
  const form         = document.getElementById('contact-form');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      const nombre  = document.getElementById('nombre').value.trim();
      const email   = document.getElementById('email').value.trim();
      const telefono= document.getElementById('telefono').value.trim();
      const interes = document.getElementById('interes');
      const interesText = interes.options[interes.selectedIndex].text;
      const mensaje = document.getElementById('mensaje').value.trim();

      const waText = encodeURIComponent(
        'Hola Valentina, me comunico desde tu sitio web.\n\n' +
        '👤 Nombre: ' + nombre + '\n' +
        '📧 Email: ' + email + '\n' +
        (telefono ? '📱 Teléfono: ' + telefono + '\n' : '') +
        '🔎 Servicio de interés: ' + interesText + '\n\n' +
        '💬 Mensaje:\n' + mensaje
      );

      // Open WhatsApp with the message
      window.open('https://wa.me/595994763352?text=' + waText, '_blank', 'noopener');

      // Show success modal
      showModal();
      form.reset();
    });
  }

  function validateForm() {
    let valid = true;
    const required = form.querySelectorAll('[required]');

    required.forEach(function (field) {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#E53E3E';
        valid = false;
      }
    });

    const emailField = document.getElementById('email');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
      emailField.style.borderColor = '#E53E3E';
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[style*="E53E3E"]');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return valid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', hideModal);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) hideModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) hideModal();
  });

  /* ----------------------------------------------------------
     7. FOOTER YEAR
  ---------------------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     8. WHATSAPP FLOAT – pulse animation after delay
  ---------------------------------------------------------- */
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    setTimeout(function () {
      waFloat.style.animation = 'waPulse 2s ease-in-out 3';
    }, 3000);

    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
      @keyframes waPulse {
        0%   { box-shadow: 0 6px 24px rgba(37,211,102,0.45); }
        50%  { box-shadow: 0 6px 40px rgba(37,211,102,0.75), 0 0 0 12px rgba(37,211,102,0.12); }
        100% { box-shadow: 0 6px 24px rgba(37,211,102,0.45); }
      }
    `;
    document.head.appendChild(pulseStyle);
  }

  /* ----------------------------------------------------------
     9. HERO BG PARALLAX (subtle, desktop only)
  ---------------------------------------------------------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      heroBg.style.transform = 'translateY(' + scrolled * 0.25 + 'px)';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     10. INPUT FIELD – remove error highlight on input
  ---------------------------------------------------------- */
  if (form) {
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.style.borderColor = '';
      });
    });
  }

  // Init scroll state
  onScroll();

})();
