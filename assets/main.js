  const LAUNCH_DATE = new Date('2026-09-15T00:00:00+03:00');

  function pad(n){ return String(n).padStart(2, '0'); }

  function updateCountdown(){
    const now = new Date();
    let diff = LAUNCH_DATE.getTime() - now.getTime();
    if (diff < 0) diff = 0;

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);

    const panel = document.getElementById('dialPanel');
    panel.setAttribute('aria-label', `Açılışa kalan süre: ${days} gün, ${hours} saat, ${mins} dakika, ${secs} saniye`);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const hero = document.querySelector('.hero');
  const newsletterSection = document.querySelector('.newsletter-section');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroEase = 0.035;
  const heroImageAspect = 4830 / 2400;
  let heroBaseLayerWidth = 0;

  const maxZoomOut = 0.78;
  const newsletterStart = 0.2;
  const contentExitDistance = 120;
  const contentExitScrollRatio = 0.42;
  const zoomOutScrollRatio = 0.48;
  const newsletterRevealScrollRatio = 0.48;
  const lightModeQuery = window.matchMedia('(max-width: 760px), (orientation: portrait)');
  let targetHeroProgress = 0;
  let targetContentProgress = 0;
  let targetNewsletterProgress = 0;
  let targetZoomProgress = 0;
  let currentHeroProgress = 0;
  let currentContentProgress = 0;
  let currentNewsletterProgress = 0;
  let currentZoomProgress = 0;
  let heroPanFrame = null;

  function clamp01(value){
    return Math.min(1, Math.max(0, value));
  }

  function smoothstep(edge0, edge1, value){
    const x = clamp01((value - edge0) / (edge1 - edge0));
    return x * x * (3 - 2 * x);
  }

  function getPercentVariable(name, fallback){
    const rawValue = getComputedStyle(hero).getPropertyValue(name).trim();
    if (!rawValue.endsWith('%')) return fallback;
    const parsed = parseFloat(rawValue);
    return Number.isFinite(parsed) ? parsed / 100 : fallback;
  }

  function updateHeroLayerMetrics(){
    const horizontalScale = getPercentVariable('--hero-horizontal-scale', 1.35);
    heroBaseLayerWidth = Math.max(window.innerWidth * horizontalScale, window.innerHeight * heroImageAspect);
    hero.style.setProperty('--hero-layer-width', `${heroBaseLayerWidth.toFixed(2)}px`);
  }

  function updateHeroScrollHeight(){
    const revealScrollRatio = newsletterRevealScrollRatio / (1 - newsletterStart);
    const totalScrollRatio = lightModeQuery.matches
      ? contentExitScrollRatio + revealScrollRatio
      : 1 + contentExitScrollRatio + zoomOutScrollRatio + revealScrollRatio;
    hero.style.setProperty('--hero-scroll-height', `${((totalScrollRatio + 1) * 100).toFixed(1)}vh`);
  }

  function getHeroProgressState(){
    const scrollRange = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const heroScroll = Math.min(scrollRange, Math.max(0, -hero.getBoundingClientRect().top));

    if (lightModeQuery.matches){
      const contentRange = Math.min(window.innerHeight * contentExitScrollRatio, scrollRange);
      const revealRange = Math.max(scrollRange - contentRange, 1);
      const rawContent = clamp01(heroScroll / contentRange);
      const rawReveal = clamp01((heroScroll - contentRange) / revealRange);

      return {
        pan: 0,
        content: rawContent,
        reveal: clamp01((rawReveal - newsletterStart) / (1 - newsletterStart)),
        zoom: 0
      };
    }

    const panRange = Math.min(window.innerHeight, scrollRange);
    const contentRange = Math.min(window.innerHeight * contentExitScrollRatio, Math.max(scrollRange - panRange, 1));
    const zoomRange = Math.min(window.innerHeight * zoomOutScrollRatio, Math.max(scrollRange - panRange - contentRange, 1));
    const revealRange = Math.min(
      window.innerHeight * newsletterRevealScrollRatio,
      Math.max(scrollRange - panRange - contentRange - zoomRange, 1)
    );

    const rawContent = clamp01((heroScroll - panRange) / contentRange);
    const rawZoom = clamp01((heroScroll - panRange - contentRange) / zoomRange);
    const rawReveal = clamp01((heroScroll - panRange - contentRange - zoomRange) / revealRange);

    return {
      pan: clamp01(heroScroll / panRange),
      content: rawContent,
      reveal: clamp01((rawReveal - newsletterStart) / (1 - newsletterStart)),
      zoom: rawZoom
    };
  }

  function applyHeroProgress(panProgress, contentProgress, revealProgress, zoomProgress){
    const minScaleForHeight = window.innerHeight / (heroBaseLayerWidth / heroImageAspect);
    const targetZoomScale = Math.max(maxZoomOut, minScaleForHeight);
    const zoomScale = 1 + ((targetZoomScale - 1) * smoothstep(0, 1, zoomProgress));
    const baseOverflow = Math.max(0, (heroBaseLayerWidth / heroImageAspect) - window.innerHeight);

    hero.style.setProperty('--hero-zoom-scale', zoomScale.toFixed(4));
    hero.style.setProperty('--hero-forward-y', `${(-baseOverflow * panProgress).toFixed(2)}px`);
    hero.style.setProperty('--hero-reverse-y', `${(-baseOverflow * (1 - panProgress)).toFixed(2)}px`);
    hero.style.setProperty('--hero-content-y', `${contentProgress * contentExitDistance}vh`);
    newsletterSection.style.setProperty('--newsletter-y', `${(1 - revealProgress) * 112}vh`);
    newsletterSection.style.setProperty('--newsletter-opacity', smoothstep(0.08, 0.45, revealProgress).toFixed(3));
  }

  function animateHeroPan(){
    const diff = targetHeroProgress - currentHeroProgress;
    const contentDiff = targetContentProgress - currentContentProgress;
    const newsletterDiff = targetNewsletterProgress - currentNewsletterProgress;
    const zoomDiff = targetZoomProgress - currentZoomProgress;

    if (Math.abs(diff) < 0.001 && Math.abs(contentDiff) < 0.001 && Math.abs(newsletterDiff) < 0.001 && Math.abs(zoomDiff) < 0.001){
      currentHeroProgress = targetHeroProgress;
      currentContentProgress = targetContentProgress;
      currentNewsletterProgress = targetNewsletterProgress;
      currentZoomProgress = targetZoomProgress;
      applyHeroProgress(currentHeroProgress, currentContentProgress, currentNewsletterProgress, currentZoomProgress);
      heroPanFrame = null;
      return;
    }

    currentHeroProgress += diff * heroEase;
    currentContentProgress += contentDiff * heroEase;
    currentNewsletterProgress += newsletterDiff * heroEase;
    currentZoomProgress += zoomDiff * heroEase;
    applyHeroProgress(currentHeroProgress, currentContentProgress, currentNewsletterProgress, currentZoomProgress);
    heroPanFrame = requestAnimationFrame(animateHeroPan);
  }

  function requestHeroBackgroundUpdate(){
    updateHeroScrollHeight();
    const progress = getHeroProgressState();
    targetHeroProgress = progress.pan;
    targetContentProgress = progress.content;
    targetNewsletterProgress = progress.reveal;
    targetZoomProgress = progress.zoom;

    if (prefersReducedMotion){
      currentHeroProgress = targetHeroProgress;
      currentContentProgress = targetContentProgress;
      currentNewsletterProgress = targetNewsletterProgress;
      currentZoomProgress = targetZoomProgress;
      applyHeroProgress(currentHeroProgress, currentContentProgress, currentNewsletterProgress, currentZoomProgress);
      return;
    }

    if (heroPanFrame === null){
      heroPanFrame = requestAnimationFrame(animateHeroPan);
    }
  }

  function handleHeroResize(){
    updateHeroLayerMetrics();
    requestHeroBackgroundUpdate();
  }

  updateHeroScrollHeight();
  updateHeroLayerMetrics();
  const initialHeroProgress = getHeroProgressState();
  targetHeroProgress = initialHeroProgress.pan;
  targetContentProgress = initialHeroProgress.content;
  targetNewsletterProgress = initialHeroProgress.reveal;
  targetZoomProgress = initialHeroProgress.zoom;
  currentHeroProgress = targetHeroProgress;
  currentContentProgress = targetContentProgress;
  currentNewsletterProgress = targetNewsletterProgress;
  currentZoomProgress = targetZoomProgress;
  applyHeroProgress(currentHeroProgress, currentContentProgress, currentNewsletterProgress, currentZoomProgress);
  window.addEventListener('scroll', requestHeroBackgroundUpdate, { passive: true });
  window.addEventListener('resize', handleHeroResize);
  if (lightModeQuery.addEventListener){
    lightModeQuery.addEventListener('change', handleHeroResize);
  } else {
    lightModeQuery.addListener(handleHeroResize);
  }

  const scrollHint = document.querySelector('.scroll-hint');
  scrollHint.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({
      top: hero.offsetTop + hero.offsetHeight - window.innerHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });

  const form = document.getElementById('newsletterForm');
  const note = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = form.email.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid){
      note.textContent = 'Lütfen geçerli bir e-posta adresi gir.';
      note.classList.add('is-error');
      return;
    }

    note.classList.remove('is-error');
    note.textContent = 'Teşekkürler, kâşif! Kapılar açılınca ilk sen haber alacaksın.';
    form.reset();
  });
