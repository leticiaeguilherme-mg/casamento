/* ==========================================================
   Letícia & Guilherme · Site do casamento
   ========================================================== */
document.documentElement.classList.add("js");

/* ---------- CONFIGURAÇÃO: edite aqui ---------- */
const CONFIG = {
  weddingDate: "2027-06-19T15:00:00-03:00",
  // Endereço que recebe as confirmações (Google Apps Script, Formspree...).
  // Enquanto estiver vazio, o formulário avisa que a confirmação abre em breve.
  rsvpEndpoint: "",
  // Link da lista de presentes. Vazio = aparece "em breve".
  giftsUrl: ""
};

const VIEWS = ["inicio", "historia", "manual", "guia", "presenca"];
const TITLES = { historia: "Nossa história", manual: "Manual", guia: "Guia de viagem", presenca: "Confirmar presença" };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Revelar ao rolar ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    io.unobserve(e.target);
  });
}, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

// Traços que se desenham: usa o comprimento real de cada linha
function prepDraw(scope) {
  $$(".week [pathLength]", scope).forEach((el) => {
    const len = el.getTotalLength();
    if (!len) return;
    el.removeAttribute("pathLength");
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    el.classList.add("dl");
  });
}

function watchReveals(scope) {
  prepDraw(scope);
  $$(".rv", scope).forEach((el) => {
    if (el.classList.contains("is-in")) return;
    if (reduceMotion) { el.classList.add("is-in"); return; }
    io.observe(el);
  });
}

/* ---------- Páginas ---------- */
let current = null;
let busy = false;
let introPlayed = false;

function viewFromHash() {
  const h = location.hash.replace("#", "");
  return VIEWS.includes(h) ? h : "inicio";
}

function showView(name) {
  $$(".view").forEach((v) => {
    v.hidden = v.dataset.view !== name;
    v.classList.remove("is-entering", "is-leaving");
  });
  const view = $(`#view-${name}`);
  window.scrollTo(0, 0);
  void view.offsetWidth;
  view.classList.add("is-entering");
  $$(".nav__links a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + name));
  document.title = name === "inicio" ? "Letícia & Guilherme" : `${TITLES[name]} · Letícia & Guilherme`;
  current = name;
  document.body.dataset.view = name;
  watchReveals(view);
  requestAnimationFrame(() => $$(".seg", view).forEach(placePill));
  if (name === "inicio") hero.start(!introPlayed);
  else hero.stop();
  updateNav();
}

function go(name) {
  if (name === current || busy) return;
  closeMenu();
  if (reduceMotion || !current) { showView(name); return; }
  busy = true;
  const leaving = $(`#view-${current}`);
  leaving.classList.add("is-leaving");
  setTimeout(() => { showView(name); busy = false; }, 340);
}

window.addEventListener("hashchange", () => {
  const h = location.hash.replace("#", "");
  if (VIEWS.includes(h) || h === "") go(viewFromHash());
});

/* ---------- Navegação ---------- */
const nav = $("#nav");
const toggle = $("#navToggle");
function updateNav() {
  const view = $(`#view-${current}`);
  const head = view && $(".hero, .page-head, .rsvp", view);
  const limit = head ? head.offsetHeight - 80 : 0;
  nav.classList.toggle("is-solid", window.scrollY > limit);
}
window.addEventListener("scroll", updateNav, { passive: true });
function closeMenu() {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-locked");
}
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("is-locked", open);
});
$$(".nav__links a").forEach((a) => a.addEventListener("click", closeMenu));
$$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  $("#" + a.dataset.scroll).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}));

/* ---------- Brasão que se desenha ----------
   Ordem: a moldura nasce do centro para as bordas, ganha cor,
   depois o G é escrito, depois o L, e as letras ganham cor. */
const crest = (function () {
  const box = $("#crest");
  const NS = "http://www.w3.org/2000/svg";
  let ready = false, failed = false, waiting = null, timer = 0;

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function build(text) {
    const src = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
    const frame = src.querySelector(".fr").getAttribute("d");
    const lg = src.querySelector(".lg");
    const vb = src.getAttribute("viewBox");
    const [vx, vy, vw, vh] = vb.split(/\s+/).map(Number);
    const tf = lg.getAttribute("transform");
    const dG = src.querySelector(".g").getAttribute("d");
    const dL = src.querySelector(".l").getAttribute("d");

    const svg = el("svg", { viewBox: vb, "aria-hidden": "true" });
    el("path", { class: "fill fill--frame", d: frame, "fill-rule": "evenodd" }, svg);
    const fillLg = el("g", { class: "fill fill--lg", transform: tf }, svg);
    el("path", { d: dG }, fillLg); el("path", { d: dL }, fillLg);
    const strokes = el("g", { class: "stroke" }, svg);
    frame.split(/(?=M)/).filter(Boolean).forEach((d) => el("path", { d }, strokes));
    const lgStroke = el("g", { class: "lg", transform: tf }, strokes);
    const pG = el("path", { d: dG }, lgStroke);
    const pL = el("path", { d: dL }, lgStroke);
    box.appendChild(svg);

    const cx = vx + vw / 2, cy = vy + vh * 0.45, maxD = Math.hypot(vw / 2, vh / 2);
    $$(":scope > path", strokes).forEach((p) => {
      const len = p.getTotalLength(), b = p.getBBox();
      const dist = Math.hypot(b.x + b.width / 2 - cx, b.y + b.height / 2 - cy) / maxD;
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.style.setProperty("--delay", (dist * 1.2).toFixed(2) + "s");
      p.style.setProperty("--dur", (1 + Math.min(0.9, len / 3500)).toFixed(2) + "s");
    });
    [[pG, 2.6], [pL, 3.35]].forEach(([p, delay]) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.style.setProperty("--delay", delay + "s");
      p.style.setProperty("--dur", "1.2s");
    });
    box.classList.add("is-ready");
    ready = true;
    if (waiting) { const w = waiting; waiting = null; play(w.full, w.done); }
  }

  function fallback() {
    if (ready) return;
    failed = true; ready = true;
    box.classList.add("is-fallback");
    if (waiting) { const w = waiting; waiting = null; play(w.full, w.done); }
  }

  // full = desenho completo; done = chamado quando é hora de revelar o resto
  function play(full, done) {
    if (!ready) { waiting = { full, done }; return; }
    clearTimeout(timer);
    if (failed) { timer = setTimeout(done, full ? 1400 : 200); return; }
    box.classList.remove("is-drawing", "is-done");
    if (!full || reduceMotion) { box.classList.add("is-done"); done(); return; }
    void box.offsetWidth;
    box.classList.add("is-drawing");
    timer = setTimeout(done, 4500);
    setTimeout(() => box.classList.replace("is-drawing", "is-done"), 5900);
  }

  fetch("assets/brasao.svg").then((r) => (r.ok ? r.text() : Promise.reject())).then(build).catch(fallback);
  setTimeout(fallback, 3500);
  return { play, box };
})();

/* ---------- Contagem regressiva ---------- */
const dials = (function () {
  const target = new Date(CONFIG.weddingDate).getTime();
  const out = {};
  $$("[data-cd]").forEach((n) => (out[n.dataset.cd] = n));
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  let timer = 0;
  function tick() {
    let t = Math.max(0, target - Date.now());
    const d = Math.floor(t / 864e5); t -= d * 864e5;
    const h = Math.floor(t / 36e5); t -= h * 36e5;
    const m = Math.floor(t / 6e4); t -= m * 6e4;
    out.d.textContent = d; out.h.textContent = pad(h);
    out.m.textContent = pad(m); out.s.textContent = pad(Math.floor(t / 1e3));
  }
  tick();
  return {
    start() { if (!timer) timer = setInterval(tick, 1000); tick(); },
    stop() { clearInterval(timer); timer = 0; }
  };
})();

/* ---------- Abertura ---------- */
const hero = (function () {
  const el = $("#hero");
  function centerCrest() {
    const box = crest.box;
    box.classList.remove("is-intro");
    const r = box.getBoundingClientRect();
    const sc = Math.min(2.5, (window.innerHeight * 0.5) / r.height);
    const ty = window.innerHeight / 2 - (r.top + r.height / 2);
    const tx = window.innerWidth / 2 - (r.left + r.width / 2);
    box.style.setProperty("--tx", tx.toFixed(1) + "px");
    box.style.setProperty("--sc", sc.toFixed(3));
    box.style.setProperty("--ty", ty.toFixed(1) + "px");
    box.classList.add("is-intro");
  }
  return {
    start(full) {
      dials.start();
      if (!full || reduceMotion) {
        el.classList.add("is-revealed");
        nav.classList.remove("is-hidden");
        crest.play(false, () => {});
        return;
      }
      introPlayed = true;
      el.classList.remove("is-revealed");
      nav.classList.add("is-hidden");
      centerCrest();
      crest.play(true, () => {
        crest.box.classList.remove("is-intro");
        el.classList.add("is-revealed");
        setTimeout(() => nav.classList.remove("is-hidden"), 900);
      });
    },
    stop() { dials.stop(); }
  };
})();

/* ---------- Seletores (abas e guia) ---------- */
function placePill(seg) {
  const pill = $(".seg__pill", seg), on = $("button.is-on", seg);
  if (!pill || !on) return;
  pill.style.left = on.offsetLeft + "px";
  pill.style.width = on.offsetWidth + "px";
  pill.style.top = on.offsetTop + "px";
  pill.style.height = on.offsetHeight + "px";
}
window.addEventListener("resize", () => $$(".seg").forEach(placePill));
if (document.fonts) document.fonts.ready.then(() => $$(".seg").forEach(placePill));

$$(".seg").forEach((seg) => {
  const group = seg.dataset.group;
  $$(".tab", seg).forEach((tab) => tab.addEventListener("click", () => {
    $$(".tab", seg).forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-selected", String(on));
    });
    $$(`.panel[data-group="${group}"]`).forEach((p) => {
      const on = p.id === tab.dataset.panel;
      p.hidden = !on;
      if (on) { watchReveals(p); checkPhotos(p); }
    });
    placePill(seg);
    const head = seg.closest(".page-head");
    if (head && window.scrollY > head.offsetHeight - 80) window.scrollTo({ top: head.offsetHeight - 70, behavior: reduceMotion ? "auto" : "smooth" });
    trip.refresh();
  }));
});

/* ---------- Fotos: sem o arquivo, entra a moldura com as serras ---------- */
function checkPhotos(scope) {
  $$(".ph img", scope).forEach((img) => {
    const fail = () => {
      const alt = img.dataset.fallback;
      if (alt && img.src !== alt) { img.src = alt; return; }
      img.parentElement.classList.add("is-empty");
    };
    if (img.dataset.watch) return;
    img.dataset.watch = "1";
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
  });
}
checkPhotos(document);

/* ---------- Guia: o carrinho na estrada ---------- */
const trip = (function () {
  const box = $("#trip"), road = $(".road", box), car = $("#car"), stops = $$("[data-stop]", box);
  let pos = [], vertical = false, raf = 0, running = false, t0 = 0;
  const DRIVE = 1700, PAUSE = 1100, END = 2200;
  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  function measure() {
    if (!box.offsetParent) return false;
    vertical = window.matchMedia("(max-width: 1040px)").matches;
    const r = road.getBoundingClientRect();
    pos = stops.map((s) => {
      const c = $(".cartouche", s).getBoundingClientRect();
      return vertical ? c.top + c.height / 2 - r.top : c.left + c.width / 2 - r.left;
    });
    if (vertical) road.style.height = box.querySelector(".route").offsetHeight + "px";
    road.style.setProperty("--a", pos[0] + "px");
    road.style.setProperty("--len", pos[pos.length - 1] - pos[0] + "px");
    return true;
  }
  function place(p) {
    if (vertical) { car.style.top = p + "px"; car.style.left = ""; }
    else { car.style.left = p + "px"; car.style.top = ""; }
  }
  function here(i) { stops.forEach((s, k) => s.classList.toggle("is-here", k === i)); }

  // ciclo: dirige até cada parada, para um instante e recomeça
  const legs = () => pos.length - 1;
  const cycle = () => legs() * (DRIVE + PAUSE) + END;
  function frame(now) {
    if (!running) return;
    let e = (now - t0) % cycle();
    let i = 0;
    car.classList.toggle("is-hidden", e > cycle() - 500 || e < 120);
    if (e < PAUSE) { place(pos[0]); here(0); }
    else {
      e -= PAUSE;
      for (i = 0; i < legs(); i++) {
        if (e < DRIVE) { place(pos[i] + (pos[i + 1] - pos[i]) * ease(e / DRIVE)); here(-1); break; }
        e -= DRIVE;
        if (e < PAUSE || i === legs() - 1) { place(pos[i + 1]); here(i + 1); if (e < PAUSE) break; }
        e -= PAUSE;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || !measure()) return;
    if (reduceMotion) { place(pos[pos.length - 1]); here(pos.length - 1); return; }
    running = true; t0 = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  const obs = new IntersectionObserver((en) => en.forEach((x) => (x.isIntersecting ? start() : stop())), { threshold: 0.3 });
  obs.observe(box);
  window.addEventListener("resize", () => { if (measure()) place(pos[0]); });
  if (document.fonts) document.fonts.ready.then(measure);
  return { refresh() { stop(); requestAnimationFrame(() => { const r = box.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) start(); }); } };
})();

/* ---------- Confirmação de presença ---------- */
(function rsvp() {
  const form = $("#rsvpForm");
  const msg = $("#formMsg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get("nome") || !data.get("sobrenome") || !data.get("vai")) {
      msg.textContent = "Preencha seu nome, sobrenome e se você vai.";
      return;
    }
    if (!CONFIG.rsvpEndpoint) {
      msg.textContent = "A confirmação abre em breve. Volte aqui mais pertinho da data.";
      return;
    }
    msg.textContent = "Enviando...";
    try {
      await fetch(CONFIG.rsvpEndpoint, { method: "POST", body: data, mode: "no-cors" });
      form.reset();
      msg.textContent = data.get("vai") === "sim"
        ? "Presença confirmada. Nos vemos em Ouro Preto!"
        : "Recebemos sua resposta. Obrigado pelo carinho.";
    } catch {
      msg.textContent = "Não conseguimos enviar agora. Tente de novo em alguns minutos.";
    }
  });
  const gifts = $("#giftsLink");
  if (CONFIG.giftsUrl) gifts.href = CONFIG.giftsUrl;
  else { gifts.removeAttribute("href"); gifts.innerHTML = "Lista de presentes em breve"; }
})();

/* ---------- Início ---------- */
showView(viewFromHash());
