/* ============================================================
   NATIONAL ENERGY CENTRE — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqSmall = window.matchMedia('(max-width: 900px)');

  /* ---------- 1. Serve a lighter video on small screens ---------- */
  function pickVideoSource() {
    var video = document.getElementById('heroVideo');
    if (!video) return;
    var src = video.querySelector('source');
    var wanted = mqSmall.matches
      ? 'assets/video/hero-energy-mobile.mp4'
      : 'assets/video/hero-energy.mp4';
    if (src.getAttribute('src') !== wanted) {
      src.setAttribute('src', wanted);
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked — poster shows */ });
    }
  }

  /* ---------- 2. Header state on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var lastY = -1;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y === lastY) return;
    lastY = y;
    header.classList.toggle('is-stuck', y > 40);
    parallax(y);
  }

  /* ---------- 3. Mobile navigation ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    nav.classList.toggle('is-open', !open);
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 4. Hero headline: split into animated words ---------- */
  (function splitHeadline() {
    var el = document.querySelector('[data-split]');
    if (!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--i', i);
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }());

  /* ---------- 5. Hero mosaic: build cells + ambient shimmer ---------- */
  var grid = document.getElementById('heroGrid');
  var cells = [];
  var shimmerTimer = null;

  function buildGrid() {
    var cols = mqSmall.matches ? 3 : 8;
    var rows = mqSmall.matches ? 6 : 3;
    var total = cols * rows;

    grid.innerHTML = '';
    cells = [];

    for (var i = 0; i < total; i++) {
      var cell = document.createElement('span');
      cell.className = 'cell';
      /* diagonal stagger reads better than a straight left-to-right sweep */
      cell.style.setProperty('--cd', (i % cols) + Math.floor(i / cols));
      grid.appendChild(cell);
      cells.push(cell);
    }

    /* a few cells lit in the mockup */
    var lit = mqSmall.matches ? [1, 7, 13] : [0, 4, 17, 23];
    lit.forEach(function (i) {
      if (cells[i]) cells[i].classList.add('is-lit');
    });

    startShimmer();
  }

  function startShimmer() {
    clearInterval(shimmerTimer);
    if (reduced || !cells.length) return;

    shimmerTimer = setInterval(function () {
      if (document.hidden) return;
      /* move one lit cell somewhere new — slow, ambient, never busy */
      var lit = cells.filter(function (c) { return c.classList.contains('is-lit'); });
      var dark = cells.filter(function (c) { return !c.classList.contains('is-lit'); });
      if (!lit.length || !dark.length) return;
      lit[Math.floor(Math.random() * lit.length)].classList.remove('is-lit');
      dark[Math.floor(Math.random() * dark.length)].classList.add('is-lit');
    }, 2200);
  }

  /* ---------- 6. Pillar tiles: expand on click / keyboard ---------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.pillar-tile'));

  function setTile(tile, open) {
    tile.classList.toggle('is-open', open);
    var btn = tile.querySelector('.pillar-tile__plus');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  tiles.forEach(function (tile) {
    var btn = tile.querySelector('.pillar-tile__plus');
    if (btn) btn.setAttribute('aria-expanded', 'false');

    tile.addEventListener('click', function () {
      var open = !tile.classList.contains('is-open');
      tiles.forEach(function (t) { setTile(t, t === tile && open); });
    });

    tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tile.click();
      }
      if (e.key === 'Escape') setTile(tile, false);
    });
  });

  /* ---------- 7. Scroll reveal ---------- */
  var revealables = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 8. Gentle parallax on the closing banner ---------- */
  var ctaSection = document.getElementById('cta');
  var ctaImg = document.getElementById('ctaImg');
  var ticking = false;

  function parallax(y) {
    if (reduced || !ctaImg || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var rect = ctaSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        ctaImg.style.transform = 'translate3d(0,' + (progress * 60 - 30).toFixed(2) + 'px,0)';
      }
      ticking = false;
    });
  }

  /* ---------- 9. Boot ---------- */
  function onBreakpointChange() {
    pickVideoSource();
    buildGrid();
  }

  if (mqSmall.addEventListener) mqSmall.addEventListener('change', onBreakpointChange);
  else if (mqSmall.addListener) mqSmall.addListener(onBreakpointChange);

  document.addEventListener('visibilitychange', function () {
    var video = document.getElementById('heroVideo');
    if (!video) return;
    if (document.hidden) video.pause();
    else video.play().catch(function () {});
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  pickVideoSource();
  buildGrid();
  onScroll();
}());
