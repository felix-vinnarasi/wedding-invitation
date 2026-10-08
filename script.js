/* =========================================================
   Lourdu Felix & Vinnarasi — wedding invitation
   GSAP + ScrollTrigger (vendored in /vendor), no build step needed.
========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  // If animations can't (or shouldn't) run, show everything instead of leaving content hidden.
  const animate = hasGsap && !reduceMotion;
  if (!animate) root.classList.add('no-motion');

  // ==========================================
  // NAVBAR + MOBILE MENU
  // ==========================================
  // ==========================================
  // WEDDING MUSIC
  // ==========================================
  const weddingAudio = document.getElementById('weddingAudio');
  const musicToggle = document.getElementById('musicToggle');
  let musicUserPaused = false;
  let musicStarted = false;
  let musicUnlocked = false;

  function setMusicState(playing) {
    if (!musicToggle) return;
    musicToggle.classList.toggle('is-playing', playing);
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Pause wedding music' : 'Play wedding music');
  }

  async function primeMusicMuted() {
    if (!weddingAudio || musicUserPaused || musicStarted) return false;
    try {
      weddingAudio.muted = true;
      weddingAudio.volume = 0;
      await weddingAudio.play();
      musicStarted = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  async function startWeddingMusic() {
    if (!weddingAudio || musicUserPaused) return false;
    try {
      if (weddingAudio.readyState === HTMLMediaElement.HAVE_NOTHING) weddingAudio.load();
      weddingAudio.muted = false;
      weddingAudio.volume = 0.55;
      if (weddingAudio.paused) await weddingAudio.play();
      musicStarted = true;
      musicUnlocked = true;
      setMusicState(true);
      return true;
    } catch (error) {
      setMusicState(false);
      return false;
    }
  }

  if (weddingAudio) {
    weddingAudio.addEventListener('play', () => {
      musicStarted = true;
      setMusicState(!weddingAudio.muted && weddingAudio.volume > 0);
    });
    weddingAudio.addEventListener('pause', () => setMusicState(false));
    weddingAudio.addEventListener('ended', () => setMusicState(false));

    // Muted autoplay is allowed by browsers. This primes the audio so the
    // first scroll can make it audible without requiring a button click.
    primeMusicMuted();

    let scrollActivationAttempted = false;
    const makeAudibleFromScroll = () => {
      if (musicUserPaused || scrollActivationAttempted) return;
      scrollActivationAttempted = true;
      startWeddingMusic();
    };

    // Desktop wheel: scrolling down should make the already-playing muted
    // audio audible. Browsers may reject audible autoplay from wheel alone,
    // so the muted priming above is what makes this reliable where supported.
    window.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) makeAudibleFromScroll();
    }, { passive: true });

    // Touch/pointer: first downward gesture is also used as the activation.
    let touchStartY = null;
    window.addEventListener('touchstart', (event) => {
      if (musicToggle?.contains(event.target)) return;
      touchStartY = event.touches?.[0]?.clientY ?? null;
    }, { passive: true, capture: true });

    window.addEventListener('touchmove', (event) => {
      if (musicToggle?.contains(event.target) || touchStartY === null) return;
      const currentY = event.touches?.[0]?.clientY;
      if (typeof currentY === 'number' && touchStartY - currentY > 2) makeAudibleFromScroll();
    }, { passive: true, capture: true });

    window.addEventListener('pointerdown', (event) => {
      if (musicToggle?.contains(event.target)) return;
      // A real pointer gesture is a stronger browser user-activation signal.
      if (!musicUserPaused && weddingAudio.muted) startWeddingMusic();
    }, { passive: true, capture: true });

    window.addEventListener('keydown', () => {
      if (!musicUserPaused && weddingAudio.muted) startWeddingMusic();
    }, { passive: true });

    if (musicToggle) {
      musicToggle.addEventListener('click', async () => {
        if (weddingAudio.paused || weddingAudio.muted) {
          musicUserPaused = false;
          scrollActivationAttempted = true;
          await startWeddingMusic();
        } else {
          musicUserPaused = true;
          weddingAudio.pause();
          weddingAudio.muted = false;
          setMusicState(false);
        }
      });
    }
  }

  const navbar = $('#navbar');
  const menuBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');
  const menuBars = [$('#menuBar1'), $('#menuBar2'), $('#menuBar3')];
  const mobileSpans = $$('.mobile-link span');
  const mobileOrnament = $('#mobileOrnament');
  let menuOpen = false;
  let menuScrollY = 0;

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    if (open) {
      menuScrollY = window.scrollY;
      document.documentElement.classList.add('menu-lock');
      document.body.classList.add('menu-lock');
      document.body.style.top = `-${menuScrollY}px`;
    } else {
      document.documentElement.classList.remove('menu-lock');
      document.body.classList.remove('menu-lock');
      document.body.style.top = '';
      window.scrollTo(0, menuScrollY);
    }
    navbar.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBars[0].classList.toggle('rotate-45', open);
    menuBars[0].classList.toggle('translate-y-[8px]', open);
    menuBars[1].classList.toggle('opacity-0', open);
    menuBars[2].classList.toggle('-rotate-45', open);
    menuBars[2].classList.toggle('-translate-y-[8px]', open);
    mobileMenu.classList.toggle('opacity-0', !open);
    mobileMenu.classList.toggle('pointer-events-none', !open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.inert = !open; // keeps hidden links out of the tab order
    mobileSpans.forEach((s) => s.classList.toggle('translate-y-full', !open));
    mobileOrnament.classList.toggle('opacity-0', !open);
    if (open) $('.mobile-link', mobileMenu).focus();
    else if (document.activeElement && mobileMenu.contains(document.activeElement)) menuBtn.focus();
  }

  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  $$('.mobile-link').forEach((l) => l.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) setMenu(false);
  });
  // rotating a phone / resizing past the breakpoint must not leave the page scroll-locked
  window
    .matchMedia('(min-width: 1024px)')
    .addEventListener('change', (e) => e.matches && setMenu(false));

  // highlight the current section in the desktop nav
  const navLinks = $$('.nav-links a');
  if ('IntersectionObserver' in window) {
    const map = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          const link = map.get(en.target.id);
          if (link && en.isIntersecting) {
            navLinks.forEach((a) => a.classList.remove('active'));
            link.classList.add('active');
          }
        }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    map.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  // ==========================================
  // COUNTDOWN  (wedding is in India — fixed to IST so every guest sees the same moment)
  // ==========================================
  const weddingDate = new Date('2026-10-25T06:00:00+05:30').getTime();
  const cd = {
    d: $('#cd-days'),
    h: $('#cd-hours'),
    m: $('#cd-minutes'),
    s: $('#cd-seconds'),
  };
  const pad = (n) => String(n).padStart(2, '0');
  let timer = null;

  function updateCountdown() {
    const distance = Math.max(0, weddingDate - Date.now());
    const day = 86400000,
      hour = 3600000,
      min = 60000;
    cd.d.textContent = pad(Math.floor(distance / day));
    cd.h.textContent = pad(Math.floor((distance % day) / hour));
    cd.m.textContent = pad(Math.floor((distance % hour) / min));
    cd.s.textContent = pad(Math.floor((distance % min) / 1000));
    if (distance === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  updateCountdown();
  timer = setInterval(updateCountdown, 1000);

  if (!animate) return; // everything below is motion

  // ==========================================
  // GSAP SETUP
  // ==========================================
  gsap.registerPlugin(ScrollTrigger);
  const isSmall = window.matchMedia('(max-width: 767px)').matches;

  // ==========================================
  // LANTERNS  (fewer on phones: less clutter over the names, less GPU work)
  // ==========================================
  const lanternContainer = $('#lantern-container');
  const counts = isSmall ? { left: 3, right: 3, top: 2 } : { left: 7, right: 7, top: 4 };
  const lanterns = [];

  function createLantern(x, y, size) {
    const el = document.createElement('img');
    el.src = 'assets/img/lantern.webp';
    el.alt = '';
    el.decoding = 'async';
    el.draggable = false;
    el.className = 'lantern';
    el.width = 160;
    el.height = 240;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.width = `${size}px`;
    const rotation = -5 + Math.random() * 10;
    el.dataset.rotation = rotation;
    lanternContainer.appendChild(el);
    gsap.set(el, {
      y: window.innerHeight + 150,
      x: -30 + Math.random() * 60,
      rotation: rotation + (-8 + Math.random() * 16),
      scale: 0.5 + Math.random() * 0.3,
      opacity: 0,
    });
    lanterns.push(el);
  }
  const sizeScale = isSmall ? 0.7 : 1;
  for (let i = 0; i < counts.left; i++)
    createLantern(
      2 + Math.random() * 18,
      8 + Math.random() * 78,
      (30 + Math.random() * 45) * sizeScale
    );
  for (let i = 0; i < counts.right; i++)
    createLantern(
      80 + Math.random() * 16,
      8 + Math.random() * 78,
      (30 + Math.random() * 45) * sizeScale
    );
  for (let i = 0; i < counts.top; i++)
    createLantern(
      20 + Math.random() * 60,
      3 + Math.random() * 9,
      (22 + Math.random() * 25) * sizeScale
    );

  gsap.to(lanterns, {
    y: 0,
    x: 0,
    scale: 1,
    rotation: (i, t) => Number(t.dataset.rotation),
    opacity: () => 0.6 + Math.random() * 0.35,
    duration: 2.2,
    delay: 0.5,
    ease: 'power2.out',
    stagger: { each: 0.12, from: 'random' },
    onComplete() {
      // gentle float — started only after the entrance so the two tweens never fight
      lanterns.forEach((l) => {
        const fy = 8 + Math.random() * 18,
          fx = -10 + Math.random() * 20,
          r = -4 + Math.random() * 8;
        gsap.to(l, {
          keyframes: [
            { y: -fy, x: fx, rotation: r },
            { y: 0, x: -fx, rotation: -r },
          ],
          duration: 4 + Math.random() * 3,
          delay: Math.random() * 2,
          repeat: -1,
          ease: 'sine.inOut',
        });
      });
    },
  });

  // ==========================================
  // HERO ENTRANCE  (one orchestrated moment)
  // ==========================================
  const letterIn = {
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 1.3,
    stagger: 0.07,
    ease: 'back.out(1.4)',
  };
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-image', { opacity: 0, duration: 1.8, ease: 'power2.out' })
    .to('.hero-small', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1 }, '-=1.0')
    .to('.hero-groom .ch', letterIn, '-=0.5')
    .to('.hero-weds', { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1 }, '-=0.7')
    .to('.hero-bride .ch', letterIn, '-=0.5')
    .to(
      '.ornament',
      { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'back.out(1.5)' },
      '-=0.5'
    );

  // ==========================================
  // CINEMATIC HERO -> STORY REVEAL
  // ==========================================
  //
  // Keep the hero transition as one ScrollTrigger. The Story section itself
  // is NOT pinned; it should enter and continue naturally with the page.
  //
  // The explicit boundary reset below is intentional. It prevents a scrubbed
  // animation from leaving the hero overlay/content in an in-between state
  // when the visitor quickly jumps all the way back to the top.
  gsap.set('#story', {
    clipPath: 'inset(100% 0% 0% 0%)',
    y: 0,
  });

  const heroTransition = gsap.timeline({
    scrollTrigger: {
      trigger: '.scroll-transition-wrapper',
      start: 'top top',
      end: () =>
        '+=' + Math.round(window.innerHeight * (isSmall ? 0.82 : 0.95)),
      pin: '.hero',
      pinSpacing: false,
      scrub: 0.45,
      anticipatePin: 1,
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        const story = document.querySelector('#story');

        // Hard-reset the exact top boundary. This is what fixes the
        // intermittent "overlay remains" state after a fast reverse scroll.
        if (self.progress <= 0.001) {
          gsap.set('.hero-image', {
            scale: 1,
            x: 0,
            y: 0,
          });
          gsap.set('.hero-overlay', { opacity: 1 });
          gsap.set('.hero-content, .scroll-indicator, #lantern-container', {
            opacity: 1,
            scale: 1,
          });
          gsap.set('#story', {
            clipPath: 'inset(100% 0% 0% 0%)',
          });
          story?.classList.remove('story-reveal-active');
          return;
        }

        // At the end of the transition, guarantee the Story state is complete.
        if (self.progress >= 0.999) {
          gsap.set('#story', {
            clipPath: 'inset(0% 0% 0% 0%)',
          });
          story?.classList.add('story-reveal-active');
        }
      },

      onLeaveBack: () => {
        const story = document.querySelector('#story');
        story?.classList.remove('story-reveal-active');

        // Reset immediately when leaving the transition in reverse. This
        // avoids a stale overlay/transform frame during fast upward scrolling.
        gsap.set('.hero-image', { scale: 1, x: 0, y: 0 });
        gsap.set('.hero-overlay', { opacity: 1 });
        gsap.set('.hero-content, .scroll-indicator, #lantern-container', {
          opacity: 1,
          scale: 1,
        });
        gsap.set('#story', {
          clipPath: 'inset(100% 0% 0% 0%)',
        });
      },

      onEnterBack: () => {
        // Let the scrubbed timeline take over again from a clean state.
        gsap.set('.hero-overlay', { opacity: 1 });
      },
    },
  });

  heroTransition
    .to(
      '.hero-image',
      {
        scale: isSmall ? 2.25 : 2.55,
        transformOrigin: '50% 42%',
        ease: 'power2.inOut',
        duration: 6,
      },
      0
    )
    .to(
      '.hero-overlay',
      {
        opacity: 0.08,
        ease: 'power1.inOut',
        duration: 3.5,
      },
      0
    )
    .to(
      '.hero-content, .scroll-indicator, #lantern-container',
      {
        opacity: 0,
        scale: 0.94,
        ease: 'power2.inOut',
        duration: 2.8,
      },
      0
    )
    .to(
      '#story',
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'power2.inOut',
        duration: 3.8,
      },
      2.0
    )
    .call(
      () => {
        document.querySelector('#story')?.classList.add('story-reveal-active');
      },
      null,
      5.5
    );

  // Subtle parallax on the new photographic section backgrounds.
  gsap.utils.toArray('.section-photo-bg').forEach((bg) => {
    gsap.fromTo(
      bg,
      { scale: 1.08, yPercent: -3 },
      {
        scale: 1,
        yPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: bg.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.4,
        },
      }
    );
  });

  // ==========================================
  // STORY
  // ==========================================
  gsap.to('.intro-section-bg', {
    yPercent: 5,
    ease: 'none',
    scrollTrigger: { trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: 1.5 },
  });

  gsap
    .timeline({
      scrollTrigger: { trigger: '#story', start: 'top 65%', toggleActions: 'play none none none' },
    })
    .to('.couple-title-reveal', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
    .to('.groom-card', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
    .to('.bride-card', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '-=0.85')
    .to('.couple-center', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.6');

  // ==========================================
  // SECTION REVEALS  (data-driven instead of seven copy-pasted timelines)
  // ==========================================
  const reveals = [
    { trigger: '#countdown', targets: '.countdown-reveal' },
    { trigger: '#scripture', targets: '.scripture-reveal', duration: 1.2 },
    { trigger: '#timeline', targets: '.timeline-title-reveal, .timeline-item', stagger: 0.25 },
    { trigger: '#ceremony', targets: '.ceremony-reveal', stagger: 0.15 },
    { trigger: '#gallery', targets: '.gallery-reveal' },
    { trigger: '#reception', targets: '.reception-reveal', stagger: 0.15 },
    { trigger: '#rsvp', targets: '.rsvp-reveal', stagger: 0.15 },
  ];
  reveals.forEach(({ trigger, targets, stagger = 0, duration = 1 }) => {
    gsap.fromTo(
      targets,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger, start: 'top 78%', toggleActions: 'play none none none' },
      }
    );
  });

  // ==========================================
  // GALLERY — SWIPER + MAGNIFIC POPUP
  // ==========================================
  if (window.Swiper) {
    const gallerySwiper = new Swiper('.gallery-swiper', {
      loop: true,
      speed: 600,
      spaceBetween: 22,
      slidesPerView: 1.15,
      centeredSlides: true,
      grabCursor: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: '.gallery-next',
        prevEl: '.gallery-prev',
      },
      breakpoints: {
        640: { slidesPerView: 2.1, spaceBetween: 24 },
        1024: { slidesPerView: 3.15, spaceBetween: 28 },
        1400: { slidesPerView: 3.55, spaceBetween: 32 },
      },
      on: {
        autoplayTimeLeft(swiper, time, progress) {
          const bar = document.querySelector('.gallery-progress span');
          if (bar) bar.style.transform = `scaleX(${1 - progress})`;
        },
      },
    });
    window.__gallerySwiper = gallerySwiper;
  }

  if (window.jQuery && jQuery.fn.magnificPopup) {
    jQuery('.gallery-lightbox').magnificPopup({
      type: 'image',
      gallery: { enabled: true, navigateByImgClick: true, preload: [1, 2] },
      closeOnContentClick: false,
      closeBtnInside: false,
      mainClass: 'gallery-lightbox-popup',
      removalDelay: 180,
      image: { titleSrc: 'title', verticalFit: true },
    });
  }

  // ==========================================
  // RESIZE SAFETY — restore the hero's exact top state
  // ==========================================
  let resizeTimer;
  const resetHeroAtTop = () => {
    if (!hasGsap || window.scrollY > 4) return;
    const story = document.querySelector('#story');
    gsap.set('.hero-image', { scale: 1, x: 0, y: 0 });
    gsap.set('.hero-overlay', { opacity: 1 });
    gsap.set('.hero-content, .scroll-indicator, #lantern-container', { opacity: 1, scale: 1 });
    gsap.set('#story', { clipPath: 'inset(100% 0% 0% 0%)' });
    story?.classList.remove('story-reveal-active');
    heroTransition?.scrollTrigger?.update();
  };

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resetHeroAtTop();
      if (hasGsap) ScrollTrigger.refresh();
      resetHeroAtTop();
    }, 180);
  }, { passive: true });

  // Lazy images and web fonts change layout after DOMContentLoaded — re-measure the pin.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
