/**
 * Lina Khalid - Personal Portfolio Script
 * Pure Vanilla JavaScript (ES6+)
 * Sections: Theme Manager, Mobile Nav, Scroll Reveal, Canvas Orbit Simulation, Modal, Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. THEME MANAGER (Dark / Light with LocalStorage persistence)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;
  const themeMetaTag = document.querySelector('meta[name="theme-color"]');
  const THEME_STORAGE_KEY = 'lina_portfolio_theme';

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (themeMetaTag) {
      themeMetaTag.setAttribute('content', theme === 'light' ? '#F8F9FA' : '#09090B');
    }

    // Trigger canvas redraw with updated color palette
    if (window.redrawHeroCanvas) {
      window.redrawHeroCanvas();
    }
  }

  // Initialize theme from storage or system preference (defaults to dark)
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Default to dark as requested in specification
    applyTheme('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // =========================================================================
  // 2. MOBILE NAVIGATION DRAWER
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    mobileMenuBtn?.classList.add('is-active');
    mobileMenuBtn?.setAttribute('aria-expanded', 'true');
    mobileNavDrawer?.classList.add('is-open');
    mobileNavOverlay?.classList.add('is-open');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    mobileMenuBtn?.classList.remove('is-active');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
    mobileNavDrawer?.classList.remove('is-open');
    mobileNavOverlay?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  mobileMenuBtn?.addEventListener('click', () => {
    const isOpen = mobileNavDrawer?.classList.contains('is-open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileNavOverlay?.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavDrawer?.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });

  // =========================================================================
  // 3. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  // =========================================================================
  const revealElements = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // =========================================================================
  // 4. ACTIVE NAVIGATION LINK SPY
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        desktopNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
        mobileNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  // =========================================================================
  // 5. AEROSPACE ORBITAL CANVAS VISUALIZER
  // =========================================================================
  const canvas = document.getElementById('orbitCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let isCanvasVisible = true;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    // Set initial size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Orbital configuration
    const orbits = [
      { radiusX: 240, radiusY: 90, tilt: -0.25, speed: 0.007, angle: 0, nodeRadius: 3.5, dash: [4, 6] },
      { radiusX: 380, radiusY: 150, tilt: 0.18, speed: 0.004, angle: 2.1, nodeRadius: 4.5, dash: [6, 8] },
      { radiusX: 520, radiusY: 210, tilt: -0.12, speed: -0.0025, angle: 4.3, nodeRadius: 4, dash: [3, 9] }
    ];

    // Background drifting cosmic nodes (stars / telemetry coordinates)
    const backgroundStars = Array.from({ length: 35 }, () => ({
      xRatio: Math.random(),
      yRatio: Math.random(),
      size: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2
    }));

    let frameCount = 0;

    function renderScene() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const isLight = htmlRoot.getAttribute('data-theme') === 'light';

      ctx.clearRect(0, 0, width, height);

      // Center point coordinates (offset slightly towards right for visual balance)
      const centerX = width > 1024 ? width * 0.72 : width * 0.5;
      const centerY = height * 0.48;

      // Color tokens
      const orbitStrokeColor = isLight ? 'rgba(153, 15, 33, 0.18)' : 'rgba(214, 31, 58, 0.22)';
      const nodeGlowColor = isLight ? 'rgba(177, 18, 38, 0.35)' : 'rgba(214, 31, 58, 0.5)';
      const nodeFillColor = isLight ? '#990F21' : '#D61F3A';
      const starColor = isLight ? 'rgba(71, 85, 105, ' : 'rgba(245, 245, 247, ';

      // 1. Draw subtle drifting telemetry star points
      backgroundStars.forEach(star => {
        const x = star.xRatio * width;
        const y = star.yRatio * height;
        const pulse = Math.sin(frameCount * star.pulseSpeed + star.pulseOffset);
        const currentAlpha = Math.max(0.1, star.alpha + pulse * 0.2);

        ctx.fillStyle = `${starColor}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Center Core Pulse
      const corePulse = Math.sin(frameCount * 0.04) * 3;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 + corePulse);
      gradient.addColorStop(0, isLight ? 'rgba(177, 18, 38, 0.12)' : 'rgba(214, 31, 58, 0.15)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Elliptical Orbits & Satellites
      orbits.forEach(orbit => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(orbit.tilt);

        // Draw orbital track
        ctx.beginPath();
        ctx.ellipse(0, 0, orbit.radiusX, orbit.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = orbitStrokeColor;
        ctx.lineWidth = 1;
        ctx.setLineDash(orbit.dash);
        ctx.stroke();

        // Calculate satellite position along ellipse
        const nodeX = Math.cos(orbit.angle) * orbit.radiusX;
        const nodeY = Math.sin(orbit.angle) * orbit.radiusY;

        // Satellite Glow
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, orbit.nodeRadius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = nodeGlowColor;
        ctx.fill();

        // Satellite Solid Node
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, orbit.nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeFillColor;
        ctx.fill();

        ctx.restore();

        // Advance orbital angle if reduced motion is disabled
        if (!reducedMotionQuery.matches) {
          orbit.angle += orbit.speed;
        }
      });

      frameCount++;

      if (isCanvasVisible && !reducedMotionQuery.matches) {
        animationFrameId = requestAnimationFrame(renderScene);
      }
    }

    // Expose redraw function for theme switch
    window.redrawHeroCanvas = () => {
      if (reducedMotionQuery.matches) {
        renderScene();
      }
    };

    // Observer to pause canvas rendering when off-screen
    if ('IntersectionObserver' in window) {
      const heroSection = document.getElementById('hero');
      const canvasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isCanvasVisible = entry.isIntersecting;
          if (isCanvasVisible && !reducedMotionQuery.matches) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(renderScene);
          } else {
            cancelAnimationFrame(animationFrameId);
          }
        });
      }, { threshold: 0.05 });

      if (heroSection) canvasObserver.observe(heroSection);
    }

    // Start render
    renderScene();
  }

  // =========================================================================
  // 6. RESUME PREVIEW MODAL
  // =========================================================================
  const openResumeBtn = document.getElementById('open-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCloseAction = document.getElementById('modal-close-action');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalConnectAction = document.getElementById('modal-connect-action');

  function openModal() {
    resumeModal?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    resumeModal?.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  openResumeBtn?.addEventListener('click', openModal);
  modalCloseBtn?.addEventListener('click', closeModal);
  modalCloseAction?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  modalConnectAction?.addEventListener('click', () => {
    closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal?.classList.contains('is-active')) {
      closeModal();
    }
  });

  // =========================================================================
  // 7. CONTACT FORM SUBMISSION (Front-end only with validation & toast)
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const contactToast = document.getElementById('contact-toast');
  const submitBtn = document.getElementById('btn-submit-contact');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {


      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      // Basic client-side validation
      if (!nameInput?.value.trim() || !emailInput?.value.trim() || !messageInput?.value.trim()) {
        alert('Please fill out all required fields.');
        return;
      }

      // Simple email pattern check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
      }

      // Disable button temporarily to provide tactile feedback
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Transmitting...</span>';
      }

      setTimeout(() => {
        if (contactToast) {
          contactToast.classList.add('is-success');
        }

        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Message Sent</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          `;
        }

        // Hide toast after 6 seconds
        setTimeout(() => {
          contactToast?.classList.remove('is-success');
          if (submitBtn) {
            submitBtn.innerHTML = `
              <span>Send Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            `;
          }
        }, 6000);
      }, 650);
    });
  }

  // =========================================================================
  // 8. DYNAMIC COPYRIGHT YEAR & BACK TO TOP
  // =========================================================================
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const backToTopBtn = document.getElementById('back-to-top-btn');
  backToTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Log portfolio initialization
  console.log('%c[LK. Aerospace Portfolio] Initialized successfully. Dreaming beyond the skies.', 'color: #D61F3A; font-weight: bold;');
});
