/* =========================================================================
   Palata Nauke · AI Lab — interakcije i animacije
   Bez spoljnih biblioteka. Sve animacije poštuju "prefers-reduced-motion".
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var finePointer = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
  var TAU = Math.PI * 2;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function onVisible(el, cb, margin) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); cb(); }
      });
    }, { rootMargin: margin || '0px 0px -10% 0px' });
    io.observe(el);
  }

  /* ---------- 1. Svetla / tamna tema ---------- */
  $$('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* privatni režim */ }
      document.dispatchEvent(new CustomEvent('themechange'));
    });
  });

  /* ---------- 2. Navigacija na mobilnom ---------- */
  var header = $('.site-header');
  var navToggle = $('.nav-toggle');
  if (header && navToggle) {
    var setNav = function (open) {
      header.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    };
    navToggle.addEventListener('click', function () {
      setNav(!header.classList.contains('nav-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });
    $$('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }

  /* ---------- 3. Senka zaglavlja pri skrolovanju ---------- */
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 4. Tekuća godina u podnožju ---------- */
  $$('[data-current-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 5. Pojavljivanje elemenata pri skrolovanju ---------- */
  var reveals = $$('.reveal');
  reveals.forEach(function (el) {
    var siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [el];
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 90 + 'ms';
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          revealIO.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 6. Brojači koji se pune ---------- */
  $$('[data-count]').forEach(function (el) {
    if (reduceMotion) return;
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = (raw.split('.')[1] || '').length;
    el.textContent = (0).toFixed(dec) + suffix;
    onVisible(el, function () {
      var t0 = performance.now();
      var dur = 1800;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * e).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  });

  /* ---------- 7. "Dekodiranje" reči u naslovu ---------- */
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function Scrambler(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}=+*^?#01ΣΔλπ';
    this.queue = [];
    this.frame = 0;
    this.raf = 0;
  }
  Scrambler.prototype.set = function (text) {
    var self = this;
    var old = this.el.textContent;
    var len = Math.max(old.length, text.length);
    this.queue = [];
    for (var i = 0; i < len; i++) {
      var start = Math.floor(Math.random() * 24);
      this.queue.push({ from: old[i] || '', to: text[i] || '', start: start, end: start + Math.floor(Math.random() * 24) + 6, ch: '' });
    }
    cancelAnimationFrame(this.raf);
    this.frame = 0;
    return new Promise(function (resolve) { self.resolve = resolve; self.update(); });
  };
  Scrambler.prototype.update = function () {
    var out = '';
    var done = 0;
    for (var i = 0; i < this.queue.length; i++) {
      var q = this.queue[i];
      if (this.frame >= q.end) {
        done++;
        out += escapeHtml(q.to);
      } else if (this.frame >= q.start) {
        if (!q.ch || Math.random() < 0.3) q.ch = this.chars[Math.floor(Math.random() * this.chars.length)];
        out += '<span class="dud">' + escapeHtml(q.ch) + '</span>';
      } else {
        out += escapeHtml(q.from);
      }
    }
    this.el.innerHTML = out;
    if (done === this.queue.length) {
      this.resolve();
    } else {
      this.frame++;
      this.raf = requestAnimationFrame(this.update.bind(this));
    }
  };
  $$('[data-scramble]').forEach(function (el) {
    if (reduceMotion) return;
    var words = el.getAttribute('data-scramble').split('|');
    if (words.length < 2) return;
    var fx = new Scrambler(el);
    var i = Math.max(0, words.indexOf(el.textContent.trim()));
    (function next() {
      setTimeout(function () {
        i = (i + 1) % words.length;
        fx.set(words[i]).then(next);
      }, 2600);
    })();
  });

  /* ---------- 8. Svetlo koje prati kursor + "spotlight" kartice ---------- */
  if (finePointer && !reduceMotion) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    var gx = window.innerWidth / 2;
    var gy = window.innerHeight / 3;
    var tx = gx;
    var ty = gy;
    var glowRaf = 0;
    var moveGlow = function () {
      gx += (tx - gx) * 0.16;
      gy += (ty - gy) * 0.16;
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      glowRaf = (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(moveGlow) : 0;
    };
    moveGlow();
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!glowRaf) glowRaf = requestAnimationFrame(moveGlow);
    }, { passive: true });
  }
  if (finePointer) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card-hover');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- 9. Terminal koji sam kuca ---------- */
  $$('[data-terminal]').forEach(function (term) {
    var lines = $$('.hud-line', term);
    var texts = lines.map(function (l) {
      var t = $('.typed', l);
      return t ? t.textContent : null;
    });
    var bar = $('.bar > span', term);
    var pct = $('[data-pct]', term);
    var epoch = $('[data-epoch]', term);
    if (reduceMotion) {
      lines.forEach(function (l) { l.classList.add('on'); });
      return;
    }
    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var play = function () {
      timers.forEach(clearTimeout);
      timers = [];
      lines.forEach(function (l) { l.classList.remove('on'); });
      var t = 400;
      lines.forEach(function (line, i) {
        var txt = texts[i];
        at(t, function () { line.classList.add('on'); });
        if (txt !== null) {
          var typed = $('.typed', line);
          at(t, function () { typed.textContent = ''; });
          for (var c = 0; c < txt.length; c++) {
            (function (n) {
              at(t + 40 + n * 42, function () { typed.textContent = txt.slice(0, n + 1); });
            })(c);
          }
          t += txt.length * 42 + 450;
        } else if (line.classList.contains('hud-progress') && bar) {
          var steps = 40;
          for (var s = 0; s <= steps; s++) {
            (function (k) {
              at(t + k * 55, function () {
                var p = k / steps;
                bar.style.width = (p * 100).toFixed(1) + '%';
                if (pct) pct.textContent = Math.round(p * 100) + '%';
                if (epoch) epoch.textContent = 'epoha ' + Math.round(p * 50) + '/50';
              });
            })(s);
          }
          t += steps * 55 + 350;
        } else {
          t += 380;
        }
      });
      at(t + 7000, play);
    };
    onVisible(term, play);
  });

  /* ---------- 10. 3D neuronsko jezgro (hero animacija) ---------- */
  var coreCanvas = $('[data-neural-core]');
  if (coreCanvas && coreCanvas.getContext) initNeuralCore(coreCanvas, $('[data-core-anchor]'));

  function initNeuralCore(canvas, anchor) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;
    var MONO = '600 10px Consolas, "Cascadia Code", Menlo, monospace';
    var FOV = 3.4;
    var BUCKETS = 5;

    var W = 0, H = 0, CX = 0, CY = 0, R = 140;
    var pts = [], edges = [], adj = [], pulses = [], dust = [], waves = [];
    var edgeBuckets = [], ptBuckets = [];
    var rings = [
      { tiltX: 1.2, tiltZ: 0.38, speed: 0.6, r: 1.24, phase: 0 },
      { tiltX: -0.5, tiltZ: -0.95, speed: -0.42, r: 1.36, phase: 2.1 }
    ];
    rings.forEach(function (rg) {
      rg.cX = Math.cos(rg.tiltX); rg.sX = Math.sin(rg.tiltX);
      rg.cZ = Math.cos(rg.tiltZ); rg.sZ = Math.sin(rg.tiltZ);
    });

    var rotY = 0.6, mx = 0, my = 0, ex = 0, ey = 0, boost = 0, time = 0;
    var pointer = { x: -9999, y: -9999 };
    var cY = 1, sY = 0, cX = 1, sX = 0;
    var C = null, light = false, sprite = {};
    var running = false, raf = 0, last = 0;
    var P1 = {}, P2 = {};

    for (var b = 0; b < BUCKETS; b++) { edgeBuckets.push([]); ptBuckets.push([]); }

    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
    function mix(c1, c2, t) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t)
      ];
    }
    function makeSprite(c) {
      var s = document.createElement('canvas');
      s.width = s.height = 64;
      var g = s.getContext('2d');
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, light ? rgba(c, 1) : 'rgba(255,255,255,1)');
      gr.addColorStop(0.18, rgba(c, 0.95));
      gr.addColorStop(0.45, rgba(c, 0.25));
      gr.addColorStop(1, rgba(c, 0));
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return s;
    }
    function readColors() {
      var cs = getComputedStyle(root);
      var v = function (name, fb) {
        var s = (cs.getPropertyValue(name) || '').trim() || fb;
        return s.split(/[\s,]+/).map(Number);
      };
      light = root.getAttribute('data-theme') === 'light';
      C = { a: v('--c-cyan', '34 211 238'), b: v('--c-violet', '167 139 250'), c: v('--c-pink', '244 114 182') };
      sprite.a = makeSprite(C.a);
      sprite.b = makeSprite(C.b);
      sprite.c = makeSprite(C.c);
    }

    function newPulse(from, life) {
      var a = from != null ? from : (Math.random() * pts.length) | 0;
      var nb = adj[a];
      return {
        a: a,
        b: nb[(Math.random() * nb.length) | 0],
        t: from != null ? 0 : Math.random(),
        sp: 0.016 + Math.random() * 0.024,
        col: Math.random() < 0.22 ? 'c' : (Math.random() < 0.3 ? 'b' : 'a'),
        life: life || 5 + ((Math.random() * 12) | 0),
        temp: !!life
      };
    }

    function build() {
      var small = W < 720;
      var n = small ? 220 : 340;
      var golden = Math.PI * (3 - Math.sqrt(5));
      var i, k;
      pts = [];
      for (i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2;
        var rr = Math.sqrt(1 - y * y);
        var th = golden * i;
        var j = 1 + (Math.random() - 0.5) * 0.08;
        pts.push({ x: Math.cos(th) * rr * j, y: y * j, z: Math.sin(th) * rr * j, sx: 0, sy: 0, sz: 0, flash: 0 });
      }
      adj = pts.map(function () { return []; });
      edges = [];
      for (i = 0; i < n; i++) {
        var best = [];
        for (k = 0; k < n; k++) {
          if (k === i) continue;
          var dx = pts[i].x - pts[k].x, dy = pts[i].y - pts[k].y, dz = pts[i].z - pts[k].z;
          best.push([dx * dx + dy * dy + dz * dz, k]);
        }
        best.sort(function (p, q) { return p[0] - q[0]; });
        for (var m = 0; m < 3; m++) {
          var kk = best[m][1];
          if (adj[i].indexOf(kk) === -1) {
            adj[i].push(kk);
            adj[kk].push(i);
            edges.push([i, kk]);
          }
        }
      }
      pulses = [];
      var np = small ? 14 : 26;
      for (i = 0; i < np; i++) pulses.push(newPulse());
      var nd = Math.round(Math.min(small ? 36 : 80, (W * H) / 16000));
      dust = [];
      for (i = 0; i < nd; i++) {
        dust.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: 0.6 + Math.random() * 1.3 });
      }
    }

    function resize() {
      var cr = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cr.width;
      H = cr.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (anchor && anchor.offsetWidth) {
        var ar = anchor.getBoundingClientRect();
        CX = ar.left - cr.left + ar.width / 2;
        CY = ar.top - cr.top + ar.height / 2;
        R = Math.min(ar.width, ar.height) * 0.29;
      } else {
        CX = W * 0.72;
        CY = H * 0.45;
        R = Math.min(W, H) * 0.26;
      }
      R = Math.max(80, Math.min(R, 180));
      build();
    }

    function proj(x, y, z, o) {
      var x1 = x * cY - z * sY;
      var z1 = x * sY + z * cY;
      var y1 = y * cX - z1 * sX;
      var z2 = y * sX + z1 * cX;
      var s = FOV / (FOV + z2);
      o.sx = CX + x1 * R * s;
      o.sy = CY + y1 * R * s;
      o.sz = z2;
      return o;
    }
    function ringPoint(rg, t, o) {
      var x = Math.cos(t) * rg.r, z = Math.sin(t) * rg.r;
      var y1 = -z * rg.sX, z1 = z * rg.cX;
      var x2 = x * rg.cZ - y1 * rg.sZ, y2 = x * rg.sZ + y1 * rg.cZ;
      return proj(x2, y2, z1, o);
    }

    function drawDust(dt) {
      var L = 120, L2 = L * L, i, j, a, q, dx, dy, d2;
      for (i = 0; i < dust.length; i++) {
        a = dust[i];
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        if (a.x < -10) a.x = W + 10; else if (a.x > W + 10) a.x = -10;
        if (a.y < -10) a.y = H + 10; else if (a.y > H + 10) a.y = -10;
      }
      ctx.lineWidth = 0.6;
      for (i = 0; i < dust.length; i++) {
        a = dust[i];
        for (j = i + 1; j < dust.length; j++) {
          q = dust[j];
          dx = a.x - q.x; dy = a.y - q.y; d2 = dx * dx + dy * dy;
          if (d2 < L2) {
            ctx.strokeStyle = rgba(C.a, (1 - Math.sqrt(d2) / L) * (light ? 0.2 : 0.14));
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        dx = a.x - pointer.x; dy = a.y - pointer.y; d2 = dx * dx + dy * dy;
        if (d2 < 180 * 180) {
          ctx.strokeStyle = rgba(C.b, (1 - Math.sqrt(d2) / 180) * 0.5);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }
      ctx.fillStyle = rgba(C.a, light ? 0.45 : 0.5);
      ctx.beginPath();
      for (i = 0; i < dust.length; i++) {
        a = dust[i];
        ctx.moveTo(a.x + a.r, a.y);
        ctx.arc(a.x, a.y, a.r, 0, TAU);
      }
      ctx.fill();
    }

    function drawReticle() {
      var rr = R * 1.55, i, a, c, s, l;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(C.a, light ? 0.22 : 0.16);
      ctx.beginPath(); ctx.arc(CX, CY, rr, 0, TAU); ctx.stroke();

      var rot = time * 0.0015;
      ctx.beginPath();
      for (i = 0; i < 120; i++) {
        a = rot + (i / 120) * TAU;
        l = i % 10 === 0 ? 9 : 4;
        c = Math.cos(a); s = Math.sin(a);
        ctx.moveTo(CX + c * rr, CY + s * rr);
        ctx.lineTo(CX + c * (rr + l), CY + s * (rr + l));
      }
      ctx.strokeStyle = rgba(C.a, light ? 0.4 : 0.32);
      ctx.stroke();

      var sw = -time * 0.006;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(C.a, 0.8);
      ctx.beginPath(); ctx.arc(CX, CY, rr + 17, sw, sw + 0.9); ctx.stroke();
      ctx.strokeStyle = rgba(C.b, 0.7);
      ctx.beginPath(); ctx.arc(CX, CY, rr + 17, sw + Math.PI, sw + Math.PI + 0.5); ctx.stroke();
      ctx.lineCap = 'butt';

      ctx.setLineDash([2, 9]);
      ctx.lineDashOffset = -time * 0.3;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(C.b, light ? 0.35 : 0.28);
      ctx.beginPath(); ctx.arc(CX, CY, rr + 31, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = MONO;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(C.a, light ? 0.85 : 0.75);
      ctx.fillText('PN·AI  NEURAL CORE  v3.2', CX, CY - rr - 44);
      var deg = (((rotY % TAU) + TAU) % TAU) * 180 / Math.PI;
      ctx.fillStyle = rgba(C.b, light ? 0.85 : 0.75);
      ctx.fillText('ROT ' + deg.toFixed(1) + '°  ·  SINAPSE ' + (pulses.length * 47 + Math.round(boost * 900)) + '/s', CX, CY + rr + 52);
      ctx.textAlign = 'start';
    }

    function drawRings(front) {
      for (var r = 0; r < rings.length; r++) {
        var rg = rings[r];
        var spin = time * 0.0024 * rg.speed;
        var col = r ? C.b : C.a;
        ctx.beginPath();
        for (var i = 0; i < 96; i += 2) {
          ringPoint(rg, spin + (i / 96) * TAU, P1);
          ringPoint(rg, spin + ((i + 1.3) / 96) * TAU, P2);
          if ((P1.sz + P2.sz < 0) !== front) continue;
          ctx.moveTo(P1.sx, P1.sy);
          ctx.lineTo(P2.sx, P2.sy);
        }
        ctx.strokeStyle = rgba(col, front ? 0.6 : (light ? 0.2 : 0.16));
        ctx.lineWidth = front ? 1.5 : 0.9;
        ctx.stroke();
        for (var k = 0; k < 2; k++) {
          ringPoint(rg, spin * 7 + k * Math.PI + rg.phase, P1);
          if ((P1.sz < 0) !== front) continue;
          var d = (1 - P1.sz / 1.4) / 2;
          var size = (12 + 20 * d) * (R / 160);
          ctx.drawImage(sprite[r ? 'b' : 'a'], P1.sx - size / 2, P1.sy - size / 2, size, size);
        }
      }
    }

    function drawSphere(dt) {
      var i, k, p, q, e, d, bi, list, t;
      var breathe = 1 + Math.sin(time * 0.03) * 0.015;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        proj(p.x * breathe, p.y * breathe, p.z * breathe, p);
      }
      for (bi = 0; bi < BUCKETS; bi++) { edgeBuckets[bi].length = 0; ptBuckets[bi].length = 0; }
      for (i = 0; i < edges.length; i++) {
        e = edges[i];
        d = (1 - (pts[e[0]].sz + pts[e[1]].sz) / 2) / 2;
        edgeBuckets[Math.max(0, Math.min(BUCKETS - 1, (d * BUCKETS) | 0))].push(e);
      }
      for (bi = 0; bi < BUCKETS; bi++) {
        list = edgeBuckets[bi];
        if (!list.length) continue;
        t = (bi + 0.5) / BUCKETS;
        ctx.strokeStyle = rgba(mix(C.b, C.a, t), (light ? 0.1 : 0.04) + t * t * (light ? 0.5 : 0.5));
        ctx.lineWidth = 0.5 + t;
        ctx.beginPath();
        for (k = 0; k < list.length; k++) {
          p = pts[list[k][0]]; q = pts[list[k][1]];
          ctx.moveTo(p.sx, p.sy);
          ctx.lineTo(q.sx, q.sy);
        }
        ctx.stroke();
      }

      // impulsi koji putuju po sinapsama
      for (i = pulses.length - 1; i >= 0; i--) {
        var u = pulses[i];
        u.t += u.sp * dt * (1 + boost * 3);
        if (u.t >= 1) {
          pts[u.b].flash = 1;
          u.life--;
          if (u.life <= 0) {
            if (u.temp) { pulses.splice(i, 1); continue; }
            u = pulses[i] = newPulse((Math.random() * pts.length) | 0);
          } else {
            var nb = adj[u.b];
            var nxt = nb[(Math.random() * nb.length) | 0];
            if (nxt === u.a && nb.length > 1) nxt = nb[(nb.indexOf(nxt) + 1) % nb.length];
            u.a = u.b;
            u.b = nxt;
            u.t = 0;
          }
        }
        p = pts[u.a]; q = pts[u.b];
        var x = p.sx + (q.sx - p.sx) * u.t;
        var y = p.sy + (q.sy - p.sy) * u.t;
        d = (1 - (p.sz + (q.sz - p.sz) * u.t)) / 2;
        ctx.strokeStyle = rgba(C[u.col], 0.12 + d * 0.65);
        ctx.lineWidth = 1 + d * 1.3;
        ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(x, y); ctx.stroke();
        var sz = (8 + d * 20) * (R / 160);
        ctx.globalAlpha = 0.3 + d * 0.7;
        ctx.drawImage(sprite[u.col], x - sz / 2, y - sz / 2, sz, sz);
        ctx.globalAlpha = 1;
      }

      // neuroni
      for (i = 0; i < pts.length; i++) {
        d = (1 - pts[i].sz) / 2;
        ptBuckets[Math.max(0, Math.min(BUCKETS - 1, (d * BUCKETS) | 0))].push(pts[i]);
      }
      var scale = R / 160;
      for (bi = 0; bi < BUCKETS; bi++) {
        list = ptBuckets[bi];
        if (!list.length) continue;
        t = (bi + 0.5) / BUCKETS;
        ctx.fillStyle = rgba(mix(C.b, C.a, t), 0.25 + 0.75 * t);
        var rad = (0.7 + t * 1.9) * scale;
        ctx.beginPath();
        for (k = 0; k < list.length; k++) {
          ctx.moveTo(list[k].sx + rad, list[k].sy);
          ctx.arc(list[k].sx, list[k].sy, rad, 0, TAU);
        }
        ctx.fill();
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        d = (1 - p.sz) / 2;
        if (d > 0.84) {
          var gs = 9 * d * scale;
          ctx.globalAlpha = 0.6;
          ctx.drawImage(sprite.a, p.sx - gs / 2, p.sy - gs / 2, gs, gs);
          ctx.globalAlpha = 1;
        }
        if (p.flash > 0.02) {
          var fs = (14 + 26 * p.flash) * d * scale;
          ctx.globalAlpha = p.flash;
          ctx.drawImage(sprite.c, p.sx - fs / 2, p.sy - fs / 2, fs, fs);
          ctx.globalAlpha = 1;
          p.flash *= Math.pow(0.9, dt || 1);
        }
      }
    }

    function drawWaves(dt) {
      for (var i = waves.length - 1; i >= 0; i--) {
        var w = waves[i];
        w.r += 7 * dt;
        w.a -= 0.017 * dt;
        if (w.a <= 0) { waves.splice(i, 1); continue; }
        ctx.lineWidth = 2;
        ctx.strokeStyle = rgba(C.a, w.a);
        ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(C.c, w.a * 0.7);
        ctx.beginPath(); ctx.arc(w.x, w.y, w.r * 0.68, 0, TAU); ctx.stroke();
      }
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      drawDust(dt);

      var glowPulse = 0.5 + 0.5 * Math.sin(time * 0.04);
      var g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 1.6);
      g.addColorStop(0, rgba(C.a, light ? 0.12 : 0.14 + glowPulse * 0.08 + boost * 0.15));
      g.addColorStop(0.45, rgba(C.b, light ? 0.07 : 0.08));
      g.addColorStop(1, rgba(C.b, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(CX, CY, R * 1.6, 0, TAU); ctx.fill();

      drawReticle();
      var ry = rotY + ex * 0.7;
      var rx = 0.32 + ey * 0.4;
      cY = Math.cos(ry); sY = Math.sin(ry); cX = Math.cos(rx); sX = Math.sin(rx);
      drawRings(false);
      drawSphere(dt);
      drawRings(true);
      drawWaves(dt);
      ctx.globalCompositeOperation = 'source-over';
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(48, now - last) / 16.667 : 1;
      last = now;
      time += dt;
      ex += (mx - ex) * 0.05 * dt;
      ey += (my - ey) * 0.05 * dt;
      boost *= Math.pow(0.965, dt);
      rotY += (0.0035 + boost * 0.05) * dt;
      draw(dt);
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    var heroVisible = true;
    function sync() {
      if (heroVisible && !document.hidden) start(); else stop();
    }
    function drawStill() { draw(0); }

    // interakcija: pomeranje miša rotira jezgro, klik šalje udarni talas
    hero.addEventListener('pointermove', function (e) {
      var cr = canvas.getBoundingClientRect();
      pointer.x = e.clientX - cr.left;
      pointer.y = e.clientY - cr.top;
      mx = Math.max(-1, Math.min(1, (pointer.x - CX) / (W / 2)));
      my = Math.max(-1, Math.min(1, (pointer.y - CY) / (H / 2)));
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      pointer.x = pointer.y = -9999;
      mx = my = 0;
    });
    hero.addEventListener('pointerdown', function (e) {
      if (reduceMotion || (e.target.closest && e.target.closest('a, button, input'))) return;
      var cr = canvas.getBoundingClientRect();
      var x = e.clientX - cr.left;
      var y = e.clientY - cr.top;
      waves.push({ x: x, y: y, r: 4, a: 1 });
      boost = 1;
      var bestI = 0, bestD = Infinity;
      for (var i = 0; i < pts.length; i++) {
        if (pts[i].sz > 0.2) continue;
        var dx = pts[i].sx - x, dy = pts[i].sy - y, d2 = dx * dx + dy * dy;
        if (d2 < bestD) { bestD = d2; bestI = i; }
      }
      pts[bestI].flash = 1;
      for (var k = 0; k < 16 && pulses.length < 90; k++) pulses.push(newPulse(bestI, 3 + ((Math.random() * 4) | 0)));
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('themechange', function () {
      readColors();
      if (reduceMotion) drawStill();
    });
    var onResize = function () {
      resize();
      if (reduceMotion) drawStill();
    };
    if ('ResizeObserver' in window) {
      var lastW = 0;
      new ResizeObserver(function () {
        var w = hero.offsetWidth;
        if (Math.abs(w - lastW) > 2 || !W) { lastW = w; onResize(); } else { resize(); }
      }).observe(hero);
    } else {
      window.addEventListener('resize', onResize);
    }

    readColors();
    resize();
    if (reduceMotion) drawStill(); else sync();
  }

  /* ---------- 11. Publikacije: pretraga i filteri ---------- */
  var pubRoot = $('[data-publications]');
  if (pubRoot) {
    var search = $('[data-pub-search]', pubRoot);
    var chips = $$('[data-pub-filter]', pubRoot);
    var pubs = $$('.pub', pubRoot);
    var years = $$('.pub-year', pubRoot);
    var counter = $('[data-pub-count]', pubRoot);
    var totalEl = $('[data-pub-total]', pubRoot);
    var empty = $('[data-pub-empty]', pubRoot);
    var activeType = 'all';

    var normalize = function (s) {
      return s.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[̀-ͯ]/g, '');
    };
    pubs.forEach(function (p) {
      var parts = $$('.pub-title, .pub-authors, .pub-venue', p).map(function (el) { return el.textContent; });
      p._search = normalize(parts.join(' '));
    });
    // data-type može da sadrži više tema odvojenih razmakom, npr. "vid medicina"
    var hasType = function (p, type) {
      return type === 'all' || (' ' + (p.getAttribute('data-type') || '') + ' ').indexOf(' ' + type + ' ') !== -1;
    };
    if (totalEl) totalEl.textContent = String(pubs.length);
    chips.forEach(function (chip) {
      var type = chip.getAttribute('data-pub-filter');
      var n = pubs.filter(function (p) { return hasType(p, type); }).length;
      var badge = $('.chip-count', chip);
      if (badge) badge.textContent = String(n);
    });

    var apply = function () {
      var q = normalize(search ? search.value.trim() : '');
      var shown = 0;
      pubs.forEach(function (p) {
        var ok = hasType(p, activeType) && (!q || p._search.indexOf(q) !== -1);
        p.hidden = !ok;
        if (ok) shown++;
      });
      years.forEach(function (y) { y.hidden = !$('.pub:not([hidden])', y); });
      if (counter) counter.textContent = String(shown);
      if (empty) empty.hidden = shown !== 0;
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeType = chip.getAttribute('data-pub-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    apply();
  }

  /* ---------- 12. BibTeX: prikaz i kopiranje ---------- */
  $$('[data-bibtex-toggle]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    btn.addEventListener('click', function () {
      var open = target.hidden;
      target.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  var copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  };
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.bibtex');
      var code = box && $('code', box);
      if (!code) return;
      var label = btn.textContent;
      copyText(code.textContent).then(function () {
        btn.textContent = 'Kopirano ✓';
      }, function () {
        btn.textContent = 'Greška';
      }).then(function () {
        setTimeout(function () { btn.textContent = label; }, 1600);
      });
    });
  });

  /* ---------- 13. GitHub repozitorijumi (automatski) ---------- */
  var repoGrid = $('[data-github-repos]');
  if (repoGrid) {
    var org = repoGrid.getAttribute('data-github-repos');
    var note = $('[data-github-note]');
    var LANG = {
      'Python': '#3572A5', 'Jupyter Notebook': '#DA5B0B', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6',
      'HTML': '#e34c26', 'CSS': '#663399', 'C++': '#f34b7d', 'C': '#555555', 'Java': '#b07219', 'R': '#198CE7',
      'Julia': '#a270ba', 'MATLAB': '#e16737', 'Rust': '#dea584', 'Go': '#00ADD8', 'Shell': '#89e051',
      'TeX': '#3D6117', 'Cuda': '#3A4E3A', 'Dockerfile': '#384d54'
    };
    var ICON_REPO = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>';
    var ICON_STAR = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>';
    var ICON_FORK = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M12 11v6"/></svg>';
    var fmt = window.Intl ? new Intl.DateTimeFormat('sr-Latn', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

    var el = function (tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };
    var iconSpan = function (svg, text) {
      var s = el('span');
      s.innerHTML = svg;
      s.appendChild(document.createTextNode(text));
      return s;
    };
    var renderRepo = function (r) {
      var a = el('a', 'repo-card');
      a.href = /^https:\/\/github\.com\//.test(r.html_url) ? r.html_url : 'https://github.com/' + org;
      var head = el('div', 'repo-name');
      head.innerHTML = ICON_REPO;
      head.appendChild(el('span', null, r.name));
      head.appendChild(el('span', 'repo-visibility', 'Javni'));
      a.appendChild(head);
      a.appendChild(el('p', 'repo-desc', r.description || 'Bez opisa.'));
      if (r.topics && r.topics.length) {
        var tags = el('ul', 'tags');
        r.topics.slice(0, 4).forEach(function (t) { tags.appendChild(el('li', 'tag', t)); });
        a.appendChild(tags);
      }
      var meta = el('div', 'repo-meta');
      if (r.language) {
        var lang = el('span');
        var dot = el('span', 'lang-dot');
        dot.style.background = LANG[r.language] || '#8b949e';
        dot.style.color = LANG[r.language] || '#8b949e';
        lang.appendChild(dot);
        lang.appendChild(document.createTextNode(r.language));
        meta.appendChild(lang);
      }
      meta.appendChild(iconSpan(ICON_STAR, String(r.stargazers_count || 0)));
      if (r.forks_count) meta.appendChild(iconSpan(ICON_FORK, String(r.forks_count)));
      if (r.pushed_at && fmt) meta.appendChild(el('span', null, 'Ažurirano ' + fmt.format(new Date(r.pushed_at))));
      a.appendChild(meta);
      return a;
    };
    var showNote = function (text) {
      repoGrid.hidden = true;
      if (note) {
        note.hidden = false;
        if (text) $('[data-github-note-text]', note).textContent = text;
      }
    };

    if (!window.fetch) {
      showNote();
    } else {
      fetch('https://api.github.com/orgs/' + encodeURIComponent(org) + '/repos?per_page=100&type=public&sort=pushed', {
        headers: { 'Accept': 'application/vnd.github+json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (repos) {
          repos = (Array.isArray(repos) ? repos : []).filter(function (r) { return !r.fork && !r.archived; });
          repos.sort(function (a, b) {
            return (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at));
          });
          if (!repos.length) {
            showNote('Javni repozitorijumi laboratorije uskoro će se pojaviti ovde.');
            return;
          }
          repoGrid.innerHTML = '';
          repos.slice(0, 6).forEach(function (r) { repoGrid.appendChild(renderRepo(r)); });
        })
        .catch(function () { showNote(); });
    }
  }
})();
