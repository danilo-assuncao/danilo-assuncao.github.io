/**
 * Surprise page: progressive unlock + local persistence.
 * No dependencies.
 */

const STORAGE_KEY = "tic-tac-surpresa:v1";

const STORY_PARTS = [
  "Desde Outubro, o meu tempo deixou de ser apenas tempo.\nNão foi o relógio que mudou, nem os dias. Foi o jeito que tudo passou a ser sentido.",
  "Antes, os segundos apenas seguiam em frente.\nHoje, eles fazem tic… tac…\nE em cada batida, sem exceção, eu acabo em você.",
  "É bonito perceber que a gente criou um jeito de se reconhecer sem dizer nomes.\nComo se tic tac fosse mais do que uma brincadeira.\nFosse o nosso idioma secreto.\nNosso código silencioso.\nA forma mais simples e verdadeira de dizer é você.",
  "Quando eu penso em você, o mundo desacelera.\nEu sinto calma.\nSinto casa.\nE entendo que não quero correr contra o tempo, nem apressar nada.\nEu quero viver.\nE quero viver com você, segundo por segundo.",
  "Se o tempo continuar passando assim, eu aceito todos eles.\nPorque todo tic tac meu termina em você.",
  "Porque todo tic tac meu termina em você.",
];

// We intentionally reveal 6 steps, but the last paragraph is a soft “echo” (and the modal shows full text in proper form).
const FINAL_TEXT = [
  "Desde Outubro, o meu tempo deixou de ser apenas tempo.",
  "Não foi o relógio que mudou, nem os dias. Foi o jeito que tudo passou a ser sentido.",
  "",
  "Antes, os segundos apenas seguiam em frente.",
  "Hoje, eles fazem tic… tac…",
  "E em cada batida, sem exceção, eu acabo em você.",
  "",
  "É bonito perceber que a gente criou um jeito de se reconhecer sem dizer nomes.",
  "Como se tic tac fosse mais do que uma brincadeira.",
  "Fosse o nosso idioma secreto.",
  "Nosso código silencioso.",
  "A forma mais simples e verdadeira de dizer é você.",
  "",
  "Quando eu penso em você, o mundo desacelera.",
  "Eu sinto calma.",
  "Sinto casa.",
  "E entendo que não quero correr contra o tempo, nem apressar nada.",
  "Eu quero viver.",
  "E quero viver com você, segundo por segundo.",
  "",
  "Se o tempo continuar passando assim, eu aceito todos eles.",
  "Porque todo tic tac meu termina em você.",
].join("\n");

const CHALLENGES = [
  {
    key: "start",
    title: "Faça o relógio começar",
    desc: "Toque em “Começar” e veja o tic… tac… ganhar vida.",
    ui: "none",
  },
  {
    key: "date",
    title: "Marque o dia",
    desc: "Escolha o dia em que o tempo mudou.",
    ui: "date",
  },
  {
    key: "code",
    title: "Diga o nosso idioma",
    desc: "Às vezes, uma palavra é só uma palavra. Às vezes, é um lugar.",
    ui: "code",
  },
  {
    key: "feelings",
    title: "Escolha duas palavras",
    desc: "Duas palavras que combinam com o que você me traz.",
    ui: "feelings",
  },
  {
    key: "hold",
    title: "Sem pressa",
    desc: "Aperte e segure por 3 segundos. Sem correr contra o tempo.",
    ui: "hold",
  },
  {
    key: "rhythm",
    title: "No ritmo certo",
    desc: "tic… tac… tic… tac… (quatro toques, alternando).",
    ui: "rhythm",
  },
];

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const state = safeParse(raw, null);
  if (!state || typeof state !== "object") return { unlocked: 0 };
  if (typeof state.unlocked !== "number") return { unlocked: 0 };
  const unlocked = clamp(state.unlocked, 0, STORY_PARTS.length);
  let opened = Array.isArray(state.opened) ? state.opened.map(Boolean) : [];
  if (opened.length < unlocked) opened = opened.concat(Array(unlocked - opened.length).fill(false));
  if (opened.length > unlocked) opened = opened.slice(0, unlocked);
  return { unlocked, opened };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function splitParagraphs(text) {
  return text.split("\n").map((s) => s.trimEnd());
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function renderCards() {
  const grid = $("cardGrid");
  grid.innerHTML = "";
  for (let i = 0; i < state.unlocked; i++) {
    grid.appendChild(createCard(i, state.opened?.[i] === true));
  }
}

function createCard(index, isOpen) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "loveCard";
  btn.setAttribute("data-idx", String(index));
  btn.setAttribute("aria-expanded", isOpen ? "true" : "false");

  const inner = document.createElement("div");
  inner.className = "loveCard__inner";

  const top = document.createElement("div");
  top.className = "loveCard__top";

  const title = document.createElement("div");
  title.className = "loveCard__title";
  title.textContent = `Carta ${index + 1}`;

  const tag = document.createElement("div");
  tag.className = "loveCard__tag";
  tag.textContent = isOpen ? "aberta" : "ABRA";
  if (!isOpen) tag.classList.add("loveCard__tag--abra");

  top.appendChild(title);
  top.appendChild(tag);

  const hint = document.createElement("div");
  hint.className = "loveCard__hint";
  hint.textContent = isOpen ? "Clique para recolher" : "Clique para abrir";

  const body = document.createElement("div");
  body.className = "loveCard__body";

  inner.appendChild(top);
  inner.appendChild(hint);
  inner.appendChild(body);
  btn.appendChild(inner);

  if (isOpen) {
    btn.classList.add("is-open");
    body.textContent = STORY_PARTS[index];
  }

  btn.addEventListener("click", async () => {
    const idx = Number(btn.getAttribute("data-idx"));
    const open = btn.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    tag.textContent = open ? "aberta" : "ABRA";
    tag.classList.toggle("loveCard__tag--abra", !open);
    hint.textContent = open ? "Clique para recolher" : "Clique para abrir";

    if (!open) return;

    // stop “new card” highlight once opened
    btn.classList.remove("loveCard--blink");
    btn.classList.remove("is-new");

    // First open: type it.
    if (!state.opened[idx]) {
      state.opened[idx] = true;
      saveState(state);
      body.textContent = "";
      await typeIntoSpan(body, STORY_PARTS[idx]);
    } else {
      body.textContent = STORY_PARTS[idx];
    }
  });

  return btn;
}

async function typeIntoSpan(span, text) {
  if (prefersReducedMotion()) {
    span.textContent = text;
    return;
  }

  span.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "typingCursor";
  cursor.setAttribute("aria-hidden", "true");
  span.appendChild(cursor);

  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += ch;
    span.textContent = out;
    span.appendChild(cursor);

    let delay = 14;
    if (ch === " " || ch === "\n") delay = 8;
    if (ch === "." || ch === "…" || ch === "!" || ch === "?" || ch === ",") delay = 90;
    if (ch === "—" || ch === ":" || ch === ";") delay = 70;
    delay += Math.random() * 18;
    await sleep(delay);
  }
  cursor.remove();
}

function setPill(status, kind) {
  const pill = $("challengePill");
  pill.classList.remove("pill--ok", "pill--warn");
  pill.textContent = status;
  if (kind === "ok") pill.classList.add("pill--ok");
  if (kind === "warn") pill.classList.add("pill--warn");
}

function setProgress(unlockedCount) {
  const total = STORY_PARTS.length;
  $("progressLabel").textContent = `${unlockedCount}/${total} desbloqueados`;
  const pct = (unlockedCount / total) * 100;
  $("progressFill").style.width = `${pct}%`;
}

function hideAllChallenges() {
  $("challengeDate").hidden = true;
  $("challengeCode").hidden = true;
  $("challengeFeelings").hidden = true;
  $("challengeHold").hidden = true;
  $("challengeRhythm").hidden = true;
}

function updateStepLabels(unlockedCount) {
  if (unlockedCount >= STORY_PARTS.length) {
    $("stepLabel").textContent = "Tudo desbloqueado";
  } else {
    $("stepLabel").textContent = `Próximo: ${unlockedCount + 1} de ${STORY_PARTS.length}`;
  }
}

function showFinalButtonIfDone(unlockedCount) {
  $("finalBtn").hidden = unlockedCount < STORY_PARTS.length;
}

function showFinalCardIfDone(unlockedCount) {
  const finalCard = $("finalCard");
  finalCard.hidden = unlockedCount < STORY_PARTS.length;
}

let mergeInProgress = false;
async function mergeCardsIntoFinal() {
  if (mergeInProgress) return;
  mergeInProgress = true;

  const grid = $("cardGrid");
  const cards = Array.from(grid.querySelectorAll(".loveCard"));
  if (!cards.length) return;

  const finalCard = $("finalCard");
  finalCard.hidden = false;
  finalCard.classList.add("is-ghost");

  // Ensure layout updates so we can measure.
  await sleep(30);
  const target = finalCard.getBoundingClientRect();
  const tx = target.left + target.width / 2;
  const ty = target.top + target.height / 2;

  cards.forEach((c) => (c.disabled = true));

  const animations = cards.map((c, i) => {
    const r = c.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    return c.animate(
      [
        { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.22)`, opacity: 0 },
      ],
      {
        duration: 720,
        delay: i * 55,
        easing: "cubic-bezier(.2,.9,.2,1)",
        fill: "forwards",
      },
    );
  });

  await Promise.all(animations.map((a) => a.finished.catch(() => null)));
  grid.innerHTML = "";
  finalCard.classList.remove("is-ghost");
  toast("Todas as cartas viraram uma só");
}

function openFinalDialog() {
  const dlg = $("finalDialog");
  const finalText = $("finalText");
  finalText.innerHTML = "";
  for (const line of splitParagraphs(FINAL_TEXT)) {
    if (line === "") {
      const spacer = document.createElement("div");
      spacer.style.height = "10px";
      finalText.appendChild(spacer);
      continue;
    }
    const p = document.createElement("p");
    p.textContent = line;
    finalText.appendChild(p);
  }
  dlg.showModal();
}

function closeFinalDialog() {
  const dlg = $("finalDialog");
  if (dlg.open) dlg.close();
}

let toastTimer = null;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("is-on");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("is-on"), 1400);
}

function flashOk() {
  const panel = $("challengePanel");
  panel.classList.remove("flashOk");
  void panel.offsetWidth; // force reflow so animation re-triggers
  panel.classList.add("flashOk");
}

// Confetti (tiny + short, so it feels “premium” not childish)
let confettiCtx = null;
let confettiW = 0;
let confettiH = 0;
function initConfetti() {
  const canvas = $("confetti");
  confettiCtx = canvas.getContext("2d");
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    confettiW = canvas.clientWidth;
    confettiH = canvas.clientHeight;
    canvas.width = Math.floor(confettiW * dpr);
    canvas.height = Math.floor(confettiH * dpr);
    confettiCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
}

function confettiBurst() {
  if (prefersReducedMotion()) return;
  if (!confettiCtx) initConfetti();
  if (!confettiCtx) return;

  const ctx = confettiCtx;
  const colors = ["#9bf6ff", "#f4d06f", "#ff5c7a", "rgba(255,255,255,.9)"];
  const count = 70;
  const cx = confettiW * 0.5;
  const cy = 120;
  const parts = Array.from({ length: count }, () => ({
    x: cx + (Math.random() - 0.5) * 40,
    y: cy + (Math.random() - 0.5) * 10,
    vx: (Math.random() - 0.5) * 6.5,
    vy: Math.random() * -6.5 - 3.5,
    g: 0.22 + Math.random() * 0.12,
    r: 2 + Math.random() * 2.5,
    a: 1,
    c: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.25,
  }));

  const start = performance.now();
  const dur = 900;
  function frame(t) {
    const dt = (t - start) / dur;
    ctx.clearRect(0, 0, confettiW, confettiH);
    for (const p of parts) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.a = 1 - dt;
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (t - start < dur) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, confettiW, confettiH);
  }
  requestAnimationFrame(frame);
}

// Clock animation
let clockTimer = null;
let clockTick = 0;
let clockRaf = 0;
let clockStartAt = 0;
let lastBeat = -1;
function startClock() {
  if (clockRaf) return;
  setPill("Em andamento", "warn");
  const secHand = document.querySelector(".clock__hand--sec");
  const minHand = document.querySelector(".clock__hand--min");

  clockStartAt = performance.now();
  lastBeat = -1;

  const loop = (t) => {
    const elapsed = (t - clockStartAt) / 1000;
    const sec = elapsed % 60;
    const min = (elapsed / 60) % 60;
    const secDeg = sec * 6;
    const minDeg = min * 6;
    if (secHand) secHand.style.transform = `translate(-50%, -85%) rotate(${secDeg}deg)`;
    if (minHand) minHand.style.transform = `translate(-50%, -85%) rotate(${minDeg}deg)`;

    const beat = Math.floor(elapsed);
    if (beat !== lastBeat) {
      lastBeat = beat;
      const isTic = beat % 2 === 0;
      const a = $("tic");
      const b = $("tac");
      a.classList.toggle("tt--pulse", isTic);
      b.classList.toggle("tt--pulse", !isTic);
      const target = isTic ? a : b;
      target.classList.remove("tt--beat");
      void target.offsetWidth;
      target.classList.add("tt--beat");
      navigator.vibrate?.(6);
    }
    clockRaf = requestAnimationFrame(loop);
  };
  clockRaf = requestAnimationFrame(loop);
}

function stopClock() {
  if (clockRaf) cancelAnimationFrame(clockRaf);
  clockRaf = 0;
}

// Challenge mechanics
let state = loadState();

function currentChallengeIndex() {
  // Challenge #0 is "start" and is considered completed once user clicks start.
  // We map unlockedCount -> next challenge:
  // unlocked 0 -> start
  // unlocked 1 -> date
  // unlocked 2 -> code
  // unlocked 3 -> feelings
  // unlocked 4 -> hold
  // unlocked 5 -> rhythm
  // unlocked 6 -> done
  return clamp(state.unlocked, 0, CHALLENGES.length);
}

function renderChallenge() {
  const idx = currentChallengeIndex();
  hideAllChallenges();
  $("nextBtn").hidden = true;

  if (state.unlocked >= STORY_PARTS.length) {
    $("challengeTitle").textContent = "Tudo pronto";
    $("challengeDesc").textContent = "Agora é só ver o texto completo — e guardar esse momento.";
    setPill("Concluído", "ok");
    showFinalButtonIfDone(state.unlocked);
    return;
  }

  const ch = CHALLENGES[idx];
  $("challengeTitle").textContent = ch.title;
  $("challengeDesc").textContent = ch.desc;
  setPill("Aguardando", "warn");

  if (ch.ui === "date") $("challengeDate").hidden = false;
  if (ch.ui === "code") $("challengeCode").hidden = false;
  if (ch.ui === "feelings") $("challengeFeelings").hidden = false;
  if (ch.ui === "hold") $("challengeHold").hidden = false;
  if (ch.ui === "rhythm") $("challengeRhythm").hidden = false;
}

function unlockNext() {
  if (state.unlocked >= STORY_PARTS.length) return;
  state.unlocked++;
  if (!Array.isArray(state.opened)) state.opened = [];
  state.opened.push(false);
  saveState(state);
  const idx = state.unlocked - 1;
  const grid = $("cardGrid");
  const card = createCard(idx, false);
  card.classList.add("is-new");
  card.classList.add("loveCard--blink");
  grid.appendChild(card);
  // blink only for a short moment
  setTimeout(() => card.classList.remove("loveCard--blink"), prefersReducedMotion() ? 0 : 2600);
  setProgress(state.unlocked);
  updateStepLabels(state.unlocked);
  showFinalButtonIfDone(state.unlocked);
  showFinalCardIfDone(state.unlocked);
  setPill("Desbloqueado ✓", "ok");
  flashOk();
  confettiBurst();
  toast("Nova carta desbloqueada");
  navigator.vibrate?.(22);
  $("storyPanel").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  $("nextBtn").hidden = state.unlocked >= STORY_PARTS.length;
  if (!$("nextBtn").hidden) $("nextBtn").focus();

  if (state.unlocked >= STORY_PARTS.length) {
    // Auto-merge after a short beat.
    setTimeout(() => void mergeCardsIntoFinal(), prefersReducedMotion() ? 0 : 850);
  }
}

function resetAll() {
  stopClock();
  clockTick = 0;
  state = { unlocked: 0, opened: [] };
  saveState(state);

  // reset UI inputs
  $("dateInput").value = "";
  $("codeInput").value = "";
  resetFeelings();
  resetHold();
  resetRhythm();

  renderCards();
  setProgress(state.unlocked);
  updateStepLabels(state.unlocked);
  showFinalButtonIfDone(state.unlocked);
  showFinalCardIfDone(state.unlocked);
  renderChallenge();
  setPill("Aguardando", "warn");
  $("finalCard").hidden = true;
  mergeInProgress = false;
}

// Date challenge
function isOct18(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  // In date input, parsing can be timezone-sensitive; we only check month/day.
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return month === 10 && day === 18;
}

// Feelings challenge
const selectedFeelings = new Set();
function resetFeelings() {
  selectedFeelings.clear();
  document.querySelectorAll(".cardPick").forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
  });
  $("feelingsConfirmBtn").disabled = true;
}

function updateFeelingsButton() {
  const ok =
    selectedFeelings.has("viver") && selectedFeelings.has("felicidade") && selectedFeelings.size === 2;
  $("feelingsConfirmBtn").disabled = !ok;
}

// Hold challenge
let holdStart = null;
let holdRaf = null;
function resetHold() {
  holdStart = null;
  if (holdRaf) cancelAnimationFrame(holdRaf);
  holdRaf = null;
  $("holdMeter").style.width = "0%";
}

function setHoldProgress(pct) {
  $("holdMeter").style.width = `${clamp(pct, 0, 100)}%`;
}

// Rhythm challenge
let rhythmSeq = [];
let rhythmLastAt = 0;
function resetRhythm() {
  rhythmSeq = [];
  rhythmLastAt = 0;
  $("rhythmStatus").textContent = "0/4";
}

function pushRhythm(token) {
  const now = Date.now();
  // If too slow between taps, reset
  if (rhythmLastAt && now - rhythmLastAt > 2500) rhythmSeq = [];
  rhythmLastAt = now;
  rhythmSeq.push(token);
  const needed = ["tic", "tac", "tic", "tac"];
  const okSoFar = needed.slice(0, rhythmSeq.length).every((v, i) => v === rhythmSeq[i]);
  if (!okSoFar) {
    rhythmSeq = [];
    $("rhythmStatus").textContent = "0/4 (ops — tenta de novo)";
    return;
  }
  $("rhythmStatus").textContent = `${rhythmSeq.length}/4`;
  if (rhythmSeq.length === 4) {
    unlockNext();
  }
}

// Wire up events
function init() {
  // Initial render
  // migrate old saved state
  if (!Array.isArray(state.opened)) state.opened = Array(state.unlocked).fill(false);
  renderCards();
  setProgress(state.unlocked);
  updateStepLabels(state.unlocked);
  showFinalButtonIfDone(state.unlocked);
  showFinalCardIfDone(state.unlocked);
  renderChallenge();
  initConfetti();

  $("hintBtn").addEventListener("click", () => {
    const hint = $("hintText");
    hint.hidden = !hint.hidden;
  });

  $("resetBtn").addEventListener("click", () => resetAll());

  $("startBtn").addEventListener("click", () => {
    startClock();
    if (state.unlocked === 0) {
      unlockNext();
      // move to next challenge immediately
      renderChallenge();
      setPill("Aguardando", "warn");
    }
  });

  $("nextBtn").addEventListener("click", () => {
    renderChallenge();
    setPill("Aguardando", "warn");
  });

  $("dateCheckBtn").addEventListener("click", () => {
    if (state.unlocked !== 1) return;
    const val = $("dateInput").value;
    if (isOct18(val)) {
      unlockNext();
    } else {
      setPill("Quase", "warn");
    }
  });

  $("codeCheckBtn").addEventListener("click", () => {
    if (state.unlocked !== 2) return;
    const code = normalize($("codeInput").value);
    const ok = code === "tic tac" || code === "tictac" || code === "tic-tac" || code === "tic… tac" || code === "tic…tac";
    if (ok) {
      unlockNext();
    } else {
      setPill("Não ainda", "warn");
    }
  });

  document.querySelectorAll(".cardPick").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.unlocked !== 3) return;
      const pick = btn.getAttribute("data-pick");
      if (!pick) return;
      if (selectedFeelings.has(pick)) {
        selectedFeelings.delete(pick);
        btn.setAttribute("aria-pressed", "false");
      } else {
        // only allow two picks
        if (selectedFeelings.size >= 2) return;
        selectedFeelings.add(pick);
        btn.setAttribute("aria-pressed", "true");
      }
      updateFeelingsButton();
    });
  });

  $("feelingsConfirmBtn").addEventListener("click", () => {
    if (state.unlocked !== 3) return;
    const ok =
      selectedFeelings.has("viver") && selectedFeelings.has("felicidade") && selectedFeelings.size === 2;
    if (ok) {
      unlockNext();
    } else {
      setPill("Quase", "warn");
    }
  });

  const holdBtn = $("holdBtn");
  const HOLD_MS = 3000;

  function tickHold() {
    if (!holdStart) return;
    const elapsed = Date.now() - holdStart;
    const pct = (elapsed / HOLD_MS) * 100;
    setHoldProgress(pct);
    if (elapsed >= HOLD_MS) {
      holdStart = null;
      setHoldProgress(100);
      if (state.unlocked === 4) unlockNext();
      return;
    }
    holdRaf = requestAnimationFrame(tickHold);
  }

  function startHold() {
    if (state.unlocked !== 4) return;
    if (holdStart) return;
    holdStart = Date.now();
    setPill("Segurando", "warn");
    holdRaf = requestAnimationFrame(tickHold);
  }

  function endHold() {
    if (!holdStart) return;
    holdStart = null;
    setHoldProgress(0);
    setPill("Sem pressa", "warn");
  }

  holdBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    holdBtn.setPointerCapture?.(e.pointerId);
    startHold();
  });
  holdBtn.addEventListener("pointerup", endHold);
  holdBtn.addEventListener("pointercancel", endHold);
  holdBtn.addEventListener("pointerleave", endHold);

  $("rhythmTic").addEventListener("click", () => {
    if (state.unlocked !== 5) return;
    pushRhythm("tic");
  });
  $("rhythmTac").addEventListener("click", () => {
    if (state.unlocked !== 5) return;
    pushRhythm("tac");
  });

  $("finalBtn").addEventListener("click", () => openFinalDialog());
  $("finalCard").addEventListener("click", () => openFinalDialog());
  $("closeDialogBtn").addEventListener("click", () => closeFinalDialog());

  $("copyBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(FINAL_TEXT);
      $("copyBtn").textContent = "Copiado!";
      setTimeout(() => ($("copyBtn").textContent = "Copiar texto"), 1200);
    } catch {
      $("copyBtn").textContent = "Não deu :(";
      setTimeout(() => ($("copyBtn").textContent = "Copiar texto"), 1200);
    }
  });

  // If user already unlocked everything, ensure clock looks alive for vibes
  if (state.unlocked > 0) startClock();
}

document.addEventListener("DOMContentLoaded", init);


