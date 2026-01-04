/**
 * Clarinha — sky tribute
 * - Stars: canvas starfield with subtle twinkle
 * - Meteors: canvas-based shooting stars with head + tail + fragments (more realistic)
 * No dependencies.
 */

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

// ---- Stars (canvas) ----
const STAR_CFG = {
  countBase: 240, // scaled by screen area
  twinkleSpeed: 0.55,
};

let stars = [];
let ctx = null;
let w = 0;
let h = 0;
let dpr = 1;
let raf = 0;
let lastT = 0;
let sparkles = [];
let showActive = false;
let showUntil = 0;
let meteors = [];
let meteorSparks = [];
let textParticles = [];
let finale = null; // { until, phaseUntil, gatherUntil, textOnAt, textOffAt, cx, cy, text }
let comets = []; // cinematic shooting stars that can collide
let impact = null; // { x,y, at, triggered }
let flash = null; // { t0, dur, x, y }

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function resizeStars() {
  const canvas = $("stars");
  dpr = window.devicePixelRatio || 1;
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const area = w * h;
  const scale = Math.max(0.7, Math.min(1.8, area / (1200 * 700)));
  const count = Math.floor(STAR_CFG.countBase * scale);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: rand(0.6, 1.8),
    a: rand(0.25, 0.95),
    tw: rand(0.6, 1.4),
    hue: rand(190, 55), // mostly cool; some warm-ish
    vx: rand(-12, 12),
    vy: rand(-10, 10),
  }));
}

function drawStars(t) {
  if (!ctx) return;
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;

  ctx.clearRect(0, 0, w, h);

  // Full-screen “fireworks flash” (fills the whole screen)
  if (!prefersReducedMotion() && flash) {
    const p = 1 - clamp((t - flash.t0) / flash.dur, 0, 1);
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255,255,255,${0.12 * p})`;
    ctx.fillRect(0, 0, w, h);

    const R = Math.max(w, h) * (0.35 + (1 - p) * 1.45);
    const g = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, R);
    g.addColorStop(0, `rgba(255,255,255,${0.48 * p})`);
    g.addColorStop(0.25, `rgba(155,246,255,${0.24 * p})`);
    g.addColorStop(0.55, `rgba(244,208,111,${0.13 * p})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
    if (t - flash.t0 >= flash.dur) flash = null;
  }

  // subtle nebula glow overlay (very faint)
  ctx.globalCompositeOperation = "source-over";
  const g1 = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, Math.max(w, h) * 0.7);
  g1.addColorStop(0, "rgba(155,246,255,0.06)");
  g1.addColorStop(1, "rgba(155,246,255,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, w, h);

  const g2 = ctx.createRadialGradient(w * 0.85, h * 0.25, 0, w * 0.85, h * 0.25, Math.max(w, h) * 0.7);
  g2.addColorStop(0, "rgba(244,208,111,0.05)");
  g2.addColorStop(1, "rgba(244,208,111,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);

  // stars (with optional “warp” streaks during show)
  for (const s of stars) {
    const tw = prefersReducedMotion() ? 0 : Math.sin(t * 0.001 * STAR_CFG.twinkleSpeed * s.tw);
    const alpha = s.a + tw * 0.12;
    ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));

    if (showActive && !prefersReducedMotion()) {
      // accelerate stars a bit and draw a streak
      const boost = 1 + Math.min(2.2, (showUntil - t) / 800) * 0.8;
      const dx = s.vx * boost;
      const dy = s.vy * boost;
      ctx.strokeStyle = `rgba(155,246,255,${0.12})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - dx * 2.8, s.y - dy * 2.8);
      ctx.stroke();

      s.x += dx;
      s.y += dy;
      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;
    }

    // tiny glow
    const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
    glow.addColorStop(0, `hsla(${s.hue}, 90%, 80%, ${0.22})`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // meteors (more realistic than DOM streaks)
  if (!prefersReducedMotion()) {
    const nextM = [];
    const nextS = [];

    // spawn a rare ambient meteor (outside show)
    if (!showActive && Math.random() < 0.004 * (dt * 60)) {
      spawnMeteor({ intensity: 0.7 });
    }

    ctx.globalCompositeOperation = "lighter";

    // update/draw meteors
    for (const m of meteors) {
      m.life -= dt;
      if (m.life <= 0) continue;

      // move
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      // occasional fragments from tail
      if (Math.random() < 0.18 * (dt * 60)) {
        meteorSparks.push({
          x: m.x - m.vx * 0.02,
          y: m.y - m.vy * 0.02,
          vx: m.vx * rand(0.15, 0.35) + rand(-80, 80),
          vy: m.vy * rand(0.15, 0.35) + rand(-60, 60),
          life0: rand(0.22, 0.45),
          life: 0,
          r: rand(0.8, 1.7),
        });
        meteorSparks[meteorSparks.length - 1].life = meteorSparks[meteorSparks.length - 1].life0;
      }

      // draw tail (gradient line)
      const a = Math.max(0, Math.min(1, m.life / m.life0));
      const tail = m.len;
      const tx = m.x - m.nx * tail;
      const ty = m.y - m.ny * tail;

      const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
      grad.addColorStop(0, `rgba(155,246,255,0)`);
      grad.addColorStop(0.35, `rgba(155,246,255,${0.18 * a})`);
      grad.addColorStop(0.75, `rgba(244,208,111,${0.16 * a})`);
      grad.addColorStop(1, `rgba(255,255,255,${0.85 * a})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = m.w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // head glow
      ctx.globalAlpha = a;
      const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.w * 14);
      head.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
      head.addColorStop(0.35, `rgba(155,246,255,${0.25 * a})`);
      head.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.w * 14, 0, Math.PI * 2);
      ctx.fill();

      nextM.push(m);
    }

    // update/draw meteor sparks
    for (const p of meteorSparks) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      const a = Math.max(0, Math.min(1, p.life / p.life0));
      ctx.globalAlpha = a * 0.75;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
      glow.addColorStop(0, `rgba(255,255,255,${0.55 * a})`);
      glow.addColorStop(0.6, `rgba(155,246,255,${0.20 * a})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 10, 0, Math.PI * 2);
      ctx.fill();
      nextS.push(p);
    }

    meteors = nextM;
    meteorSparks = nextS;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // comets (two shooting stars that collide — less “robot”, more cinematic)
  if (!prefersReducedMotion() && comets.length) {
    ctx.globalCompositeOperation = "lighter";
    const next = [];
    for (const c of comets) {
      const u = clamp((t - c.t0) / c.dur, 0, 1);
      const e = 1 - Math.pow(1 - u, 2.6); // smooth ease

      const x = quadBezier(c.x0, c.x1, c.x2, e);
      const y = quadBezier(c.y0, c.y1, c.y2, e);

      // derivative for direction
      const dx = quadBezierDer(c.x0, c.x1, c.x2, e);
      const dy = quadBezierDer(c.y0, c.y1, c.y2, e);
      const L = Math.hypot(dx, dy) || 1;
      const nx = dx / L;
      const ny = dy / L;

      // small organic wobble (removes “robotized” feel)
      const wob = Math.sin((t * 0.001 + c.seed) * 9) * 0.9;
      const px = x + (-ny * wob);
      const py = y + (nx * wob);

      drawComet(px, py, nx, ny, c.w, c.len, u);
      c.lastX = px;
      c.lastY = py;

      if (u < 1) next.push(c);
    }
    comets = next;
    ctx.globalCompositeOperation = "source-over";
  }

  // Trigger the impact sequence when both comets have reached the collision point.
  if (!prefersReducedMotion() && impact && !impact.triggered && t >= impact.at + 1100) {
    impact.triggered = true;
    // Main impact blast at the collision
    startScreenExplosion(impact.x, impact.y);

    // Several fireworks across the whole screen (random positions/timing)
    for (let i = 0; i < 8; i++) {
      const dx = rand(w * 0.08, w * 0.92);
      const dy = rand(h * 0.10, h * 0.78);
      const delay = rand(80, 980);
      setTimeout(() => startScreenExplosion(dx, dy), delay);
    }

    // After the fireworks, the fragments assemble into CLARINHA
    setTimeout(() => startFinaleAt("CLARINHA", w * 0.5, h * 0.46), 1150);
  }

  // sparkles (wish burst)
  if (!prefersReducedMotion() && sparkles.length) {
    ctx.globalCompositeOperation = "lighter";
    const next = [];
    for (const p of sparkles) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.vy += 22 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.985;
      p.vy *= 0.99;

      const a = Math.max(0, Math.min(1, p.life / p.life0));
      ctx.globalAlpha = a * 0.85;

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
      glow.addColorStop(0, `rgba(155,246,255,${0.35 * a})`);
      glow.addColorStop(0.6, `rgba(244,208,111,${0.18 * a})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      next.push(p);
    }
    sparkles = next;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // finale: fireworks fragments -> form CLARINHA (particle text)
  if (!prefersReducedMotion() && finale) {
    const now = t;
    ctx.globalCompositeOperation = "lighter";

    // supernova flash (first ~650ms)
    const flashLeft = finale.phaseUntil - now;
    if (flashLeft > 0) {
      const p = 1 - clamp(flashLeft / 650, 0, 1);
      const r = 18 + p * Math.min(w, h) * 0.45;
      const g = ctx.createRadialGradient(finale.cx, finale.cy, 0, finale.cx, finale.cy, r);
      g.addColorStop(0, `rgba(255,255,255,${0.75 * (1 - p)})`);
      g.addColorStop(0.2, `rgba(155,246,255,${0.35 * (1 - p)})`);
      g.addColorStop(0.55, `rgba(244,208,111,${0.14 * (1 - p)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(finale.cx, finale.cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // update/draw particles attracted to text targets
    const next = [];
    for (const p of textParticles) {
      const fadeOut = clamp((finale.until - now) / 900, 0, 1);
      const prog = clamp((now - finale.phaseUntil) / Math.max(1, finale.gatherUntil - finale.phaseUntil), 0, 1);
      const k = 18 + prog * 26;

      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const ax = dx * k;
      const ay = dy * k;
      p.vx = (p.vx + ax * dt) * 0.78;
      p.vy = (p.vy + ay * dt) * 0.78;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const dist2 = dx * dx + dy * dy;
      // snap near target -> crisp letters
      if (dist2 < 2.4 * 2.4) {
        p.x = p.tx;
        p.y = p.ty;
        p.vx = 0;
        p.vy = 0;
      }

      // tiny organic jitter
      p.x += Math.sin((now * 0.001 + p.seed) * 5) * 0.03;
      p.y += Math.cos((now * 0.001 + p.seed) * 5) * 0.03;

      const a = Math.max(0.05, Math.min(1, p.a * fadeOut));
      ctx.globalAlpha = a * 0.85;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 9);
      glow.addColorStop(0, `rgba(255,255,255,${0.45 * a})`);
      glow.addColorStop(0.4, `rgba(155,246,255,${0.18 * a})`);
      glow.addColorStop(0.8, `rgba(244,208,111,${0.10 * a})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      next.push(p);
    }
    textParticles = next;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // finish finale
    if (now >= finale.until) {
      finale = null;
      textParticles = [];
    }
  }

  raf = requestAnimationFrame(drawStars);
}

// ---- Meteors (canvas) ----
function spawnMeteor({ intensity = 1 } = {}) {
  if (prefersReducedMotion()) return;
  // start near top/left, travel down-right (more natural)
  const startX = rand(-120, w * 0.75);
  const startY = rand(-120, h * 0.40);
  const sp = rand(980, 1650) * intensity;
  const ang = rand(Math.PI * 0.12, Math.PI * 0.28); // ~22°–50°
  const vx = Math.cos(ang) * sp;
  const vy = Math.sin(ang) * sp;
  const len = rand(240, 520) * intensity;
  const ww = rand(1.4, 2.6) * intensity;
  const life0 = rand(0.55, 1.05);
  const nx = vx / (Math.hypot(vx, vy) || 1);
  const ny = vy / (Math.hypot(vx, vy) || 1);
  meteors.push({
    x: startX,
    y: startY,
    vx,
    vy,
    nx,
    ny,
    len,
    w: ww,
    life0,
    life: life0,
  });
}

function startScreenExplosion(cx, cy) {
  if (prefersReducedMotion()) return;
  const now = performance.now();
  flash = { t0: now, dur: 900, x: cx, y: cy };

  // BIG fireworks feel: multiple spark bursts across the screen
  sparkBurstAt(cx, cy, 2.4);
  for (let i = 0; i < 7; i++) {
    sparkBurstAt(rand(w * 0.06, w * 0.94), rand(h * 0.08, h * 0.72), rand(1.0, 1.8));
  }
  // quick meteor rain during the blast
  spawnMeteor({ intensity: 1.45 });
  setTimeout(() => spawnMeteor({ intensity: 1.35 }), 90);
  setTimeout(() => spawnMeteor({ intensity: 1.25 }), 180);
  setTimeout(() => spawnMeteor({ intensity: 1.15 }), 270);
}

function computeTextTargets(text) {
  // Offscreen render to sample pixels for target points.
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.floor(w));
  c.height = Math.max(1, Math.floor(h));
  const g = c.getContext("2d");
  g.clearRect(0, 0, c.width, c.height);

  const fontSize = clamp(Math.floor(w * 0.12), 46, 96);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `900 ${fontSize}px ui-serif, Georgia, serif`;
  g.fillStyle = "white";

  const x = c.width / 2;
  const y = c.height * 0.46;
  g.fillText(text, x, y);

  const img = g.getImageData(0, 0, c.width, c.height).data;
  // smaller step = more points = more legible text
  const step = clamp(Math.floor(fontSize / 24), 2, 5);
  const pts = [];
  for (let yy = 0; yy < c.height; yy += step) {
    for (let xx = 0; xx < c.width; xx += step) {
      const a = img[(yy * c.width + xx) * 4 + 3];
      if (a > 32) pts.push({ x: xx, y: yy });
    }
  }

  // cap points for perf
  const maxPts = 1800;
  if (pts.length > maxPts) {
    const sampled = [];
    for (let i = 0; i < maxPts; i++) sampled.push(pts[(Math.random() * pts.length) | 0]);
    return { pts: sampled, cx: x, cy: y };
  }
  return { pts, cx: x, cy: y };
}

function startFinaleAt(text, cx, cy) {
  if (prefersReducedMotion()) return;
  const res = computeTextTargets(text);
  const pts = res.pts;

  // Seed particles from “explosion dust” spread across screen, then pull into letters.
  textParticles = pts.map((pt) => ({
    x: rand(-40, w + 40),
    y: rand(-40, h + 40),
    vx: rand(-220, 220),
    vy: rand(-220, 220),
    tx: pt.x,
    ty: pt.y,
    r: rand(0.9, 1.9),
    a: rand(0.55, 0.95),
    seed: Math.random() * 10,
  }));

  const now = performance.now();
  finale = {
    cx,
    cy,
    phaseUntil: now + 650,
    gatherUntil: now + 2200, // more time to “organically” settle into letters
    until: now + 3600,
    text,
  };
}

function drawStarHead(x, y, s = 1) {
  const r = 10 * s;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
  g.addColorStop(0, "rgba(255,255,255,.95)");
  g.addColorStop(0.25, "rgba(155,246,255,.35)");
  g.addColorStop(0.6, "rgba(244,208,111,.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function quadBezier(a, b, c, t) {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}
function quadBezierDer(a, b, c, t) {
  return 2 * (1 - t) * (b - a) + 2 * t * (c - b);
}
function drawComet(x, y, nx, ny, w0, len, u) {
  // tail points behind the head
  const tail = len * (0.65 + 0.35 * (1 - u));
  const tx = x - nx * tail;
  const ty = y - ny * tail;
  const grad = ctx.createLinearGradient(tx, ty, x, y);
  grad.addColorStop(0, "rgba(155,246,255,0)");
  grad.addColorStop(0.35, "rgba(155,246,255,0.20)");
  grad.addColorStop(0.75, "rgba(244,208,111,0.16)");
  grad.addColorStop(1, "rgba(255,255,255,0.92)");
  ctx.strokeStyle = grad;
  ctx.lineWidth = w0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.stroke();

  // head glow
  const g = ctx.createRadialGradient(x, y, 0, x, y, w0 * 22);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.35, "rgba(155,246,255,0.30)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, w0 * 22, 0, Math.PI * 2);
  ctx.fill();
}

// ---- UI ----
function wishBurst() {
  if (prefersReducedMotion()) return;

  // name glow pulse
  const name = document.getElementById("name");
  if (name) {
    name.classList.remove("is-wish");
    // reflow to restart animation
    void name.offsetWidth;
    name.classList.add("is-wish");
  }

  // Meteor burst
  spawnMeteor({ intensity: 1.0 });
  setTimeout(() => spawnMeteor({ intensity: 0.95 }), 120);
  setTimeout(() => spawnMeteor({ intensity: 0.9 }), 240);

  // Sparkles explode from around the name
  const rect = name?.getBoundingClientRect?.();
  const cx = rect ? rect.left + rect.width / 2 : w * 0.5;
  const cy = rect ? rect.top + rect.height * 0.55 : h * 0.42;
  const count = 80;
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = rand(80, 520);
    sparkles.push({
      x: cx + rand(-12, 12),
      y: cy + rand(-10, 10),
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp * 0.7 - rand(30, 160),
      r: rand(0.8, 2.1),
      life0: rand(0.65, 1.25),
      life: 0, // set below
    });
    sparkles[sparkles.length - 1].life = sparkles[sparkles.length - 1].life0;
  }
}

function sparkBurstAt(x, y, intensity = 1) {
  if (prefersReducedMotion()) return;
  const count = Math.floor(70 * intensity);
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = rand(120, 760) * intensity;
    sparkles.push({
      x: x + rand(-10, 10),
      y: y + rand(-10, 10),
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp * 0.7 - rand(40, 220) * intensity,
      r: rand(0.9, 2.3) * intensity,
      life0: rand(0.65, 1.15),
      life: 0,
    });
    sparkles[sparkles.length - 1].life = sparkles[sparkles.length - 1].life0;
  }
}

async function runShow() {
  if (showActive) return;
  const ui = document.querySelector(".ui");
  const btn = $("wishBtn");
  btn.disabled = true;

  // Hide the button
  ui?.classList.add("is-hidden");

  if (prefersReducedMotion()) {
    // minimal: quick flash of a few stars then restore
    setTimeout(() => {
      sky?.classList.remove("is-showtime");
      btn.disabled = false;
    }, 400);
    return;
  }

  // Showtime
  showActive = true;
  showUntil = performance.now() + 4200;

  // Kickoff: immediate meteor rain + sparkles
  sparkBurstAt(w * 0.5, h * 0.35, 1.1);
  spawnMeteor({ intensity: 1.1 });
  setTimeout(() => spawnMeteor({ intensity: 1.0 }), 110);
  setTimeout(() => spawnMeteor({ intensity: 0.95 }), 220);

  let tick = 0;
  const showTimer = window.setInterval(() => {
    tick++;
    spawnMeteor({ intensity: 1.05 });
    if (tick % 3 === 0) setTimeout(() => spawnMeteor({ intensity: 0.95 }), 90);
    if (tick % 5 === 0) setTimeout(() => spawnMeteor({ intensity: 0.9 }), 180);

    // Random sparkle explosions across the sky
    if (tick % 2 === 0) {
      sparkBurstAt(rand(w * 0.15, w * 0.85), rand(h * 0.12, h * 0.55), rand(0.6, 1.05));
    }
  }, 180);

  // Mid-show: TWO shooting stars (comets) collide (curved paths, organic timing)
  const now = performance.now();
  const ix = w * rand(0.45, 0.58);
  const iy = h * rand(0.30, 0.42);
  impact = { x: ix, y: iy, at: now + 1400, triggered: false };

  const durA = rand(860, 1180);
  const durB = rand(860, 1180);
  comets.push({
    t0: impact.at,
    dur: durA,
    x0: -120,
    y0: h * rand(0.15, 0.40),
    x1: w * rand(0.20, 0.45),
    y1: h * rand(0.05, 0.30),
    x2: ix,
    y2: iy,
    w: rand(1.6, 2.4),
    len: rand(320, 560),
    seed: Math.random() * 10,
    lastX: 0,
    lastY: 0,
  });
  comets.push({
    t0: impact.at + rand(40, 140),
    dur: durB,
    x0: w + 140,
    y0: h * rand(0.18, 0.46),
    x1: w * rand(0.55, 0.82),
    y1: h * rand(0.06, 0.34),
    x2: ix,
    y2: iy,
    w: rand(1.6, 2.4),
    len: rand(320, 560),
    seed: Math.random() * 10,
    lastX: 0,
    lastY: 0,
  });

  // Wait for show end
  await new Promise((r) => setTimeout(r, 4300));
  clearInterval(showTimer);
  showActive = false;

  // If impact happened, give time for CLARINHA to form
  if (!prefersReducedMotion() && finale) await new Promise((r) => setTimeout(r, 3600));

  // Restore button
  ui?.classList.remove("is-hidden");
  btn.disabled = false;
}

function initUI() {
  const wishBtn = $("wishBtn");

  wishBtn.addEventListener("click", () => {
    // Full show: hide hero and run the sky spectacle
    void runShow();
  });
}

function init() {
  resizeStars();
  window.addEventListener("resize", () => {
    resizeStars();
  });

  initUI();
  raf = requestAnimationFrame(drawStars);
}

document.addEventListener("DOMContentLoaded", init);


