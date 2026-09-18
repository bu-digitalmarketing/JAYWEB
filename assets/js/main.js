/* =========================================================
   Renders the page from SITE (assets/js/data.js)
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";

/* --- brand icons --- */
const ICONS = {
  facebook:  '<path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"/>',
  instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.71-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.71-1.46-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32A6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>',
  github:    '<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/>',
  linkedin:  '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>',
  youtube:   '<path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>',
  line:      '<path d="M24 10.3C24 4.94 18.62.58 12 .58S0 4.94 0 10.3c0 4.8 4.27 8.82 10.03 9.58.39.08.92.26 1.06.6.12.3.08.78.04 1.09l-.17 1.03c-.05.3-.24 1.19 1.04.65 1.28-.54 6.9-4.06 9.41-6.95C23.05 14.4 24 12.47 24 10.3zM7.76 13.5H5.37a.63.63 0 0 1-.63-.63V8.1a.63.63 0 1 1 1.26 0v4.14h1.76a.63.63 0 1 1 0 1.26zm2.47-.63a.63.63 0 1 1-1.26 0V8.1a.63.63 0 1 1 1.26 0v4.77zm5.74 0a.63.63 0 0 1-1.13.38l-2.45-3.33v2.95a.63.63 0 1 1-1.26 0V8.1a.63.63 0 0 1 1.13-.38l2.45 3.34V8.1a.63.63 0 1 1 1.26 0v4.77zm3.85-3.02a.63.63 0 0 1 0 1.26h-1.76v1.13h1.76a.63.63 0 1 1 0 1.26h-2.39a.63.63 0 0 1-.63-.63V8.1c0-.35.28-.63.63-.63h2.39a.63.63 0 1 1 0 1.26h-1.76v1.12h1.76z"/>',
  link:      '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.6a3 3 0 1 1 4.3 4.3l-1.5 1.5a1 1 0 0 1-1.4-1.4l1.5-1.5a1 1 0 0 0-1.5-1.5l-3.5 3.6a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.6a3 3 0 0 1-4.3-4.3l1.5-1.5a1 1 0 0 1 1.4 1.4l-1.5 1.5a1 1 0 0 0 1.5 1.5l3.5-3.6a1 1 0 0 1 1.4 0z"/>'
};
const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

/* --- initials fallback for avatar --- */
function initials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (!parts[0]) return "?";
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}

/* ============================ render ============================ */
function render() {
  const d = SITE;
  const p = d.profile;

  document.title = `${p.name}${p.nameEn ? " · " + p.nameEn : ""}`;
  $("#brand").innerHTML = `${esc(p.name)}<span>.</span>`;

  /* ---- hero ---- */
  $("#avatar").innerHTML = has(p.avatar)
    ? `<img src="${esc(p.avatar)}" alt="รูปโปรไฟล์ของ${esc(p.name)}">`
    : esc(initials(p.nameEn || p.name));

  if (has(p.cover)) {
    const bg = $("#heroBg");
    bg.style.background = `url("${p.cover}") center/cover`;
    bg.style.opacity = ".28";
    bg.style.filter = "blur(2px)";
  }

  $("#heroText").innerHTML = `
    ${has(p.role) ? `<div class="hero__eyebrow">${esc(p.role)}</div>` : ""}
    <h1>${esc(p.name)}</h1>
    ${has(p.nameEn) ? `<p class="hero__name-en">${esc(p.nameEn)}</p>` : ""}
    ${has(p.tagline) ? `<p class="hero__tagline">${esc(p.tagline)}</p>` : ""}
    ${(d.stats || []).length ? `<div class="stats">${d.stats.map(s => `
      <div class="stat"><div class="stat__value">${esc(s.value)}</div>
      <div class="stat__label">${esc(s.label)}</div></div>`).join("")}</div>` : ""}
    <div class="btn-row">
      <a class="btn btn--primary" href="#contact">ติดต่อฉัน</a>
      <a class="btn btn--ghost" href="#about">รู้จักฉันเพิ่มเติม</a>
    </div>`;

  /* ---- about ---- */
  const a = d.about || {};
  $("#aboutTitle").textContent = a.heading || "เกี่ยวกับฉัน";
  $("#aboutText").innerHTML = (a.paragraphs || []).map(t => `<p>${esc(t)}</p>`).join("");
  $("#aboutFacts").innerHTML = (a.facts || []).filter(f => has(f.value)).map(f => `
    <div class="fact">
      <div class="fact__icon">${esc(f.icon)}</div>
      <div><div class="fact__label">${esc(f.label)}</div>
      <div class="fact__value">${esc(f.value)}</div></div>
    </div>`).join("");

  /* ---- timeline ---- */
  const tl = d.timeline || {};
  $("#timelineTitle").textContent = tl.heading || "เส้นทางของฉัน";
  $("#timeline").innerHTML = (tl.items || []).map(i => `
    <div class="tl-item reveal">
      <div class="tl-period">${esc(i.period)}</div>
      <div class="tl-title">${esc(i.title)}${has(i.tag) ? `<span class="tag">${esc(i.tag)}</span>` : ""}</div>
      ${has(i.org) ? `<div class="tl-org">${esc(i.org)}</div>` : ""}
      ${has(i.desc) ? `<div class="tl-desc">${esc(i.desc)}</div>` : ""}
    </div>`).join("");

  /* ---- skills ---- */
  const sk = d.skills || {};
  $("#skillsTitle").textContent = sk.heading || "ทักษะ";
  $("#skillsGrid").innerHTML = (sk.groups || []).map(g => `
    <div class="skill-card reveal">
      <h3>${esc(g.name)}</h3>
      <div class="chips">${(g.items || []).map(s => `<span class="chip">${esc(s)}</span>`).join("")}</div>
    </div>`).join("");

  /* ---- works ---- */
  const w = d.works || {};
  $("#worksTitle").textContent = w.heading || "ผลงาน";
  $("#worksGrid").innerHTML = (w.items || []).map(i => {
    const tag = has(i.link) ? "a" : "div";
    const attr = has(i.link) ? ` href="${esc(i.link)}" target="_blank" rel="noopener noreferrer"` : "";
    const thumb = has(i.image)
      ? `<div class="work__thumb" style="background-image:url('${esc(i.image)}')"></div>`
      : `<div class="work__thumb">🗂️</div>`;
    return `<${tag} class="work reveal"${attr}>
      ${thumb}
      <div class="work__body">
        <h3 class="work__title">${esc(i.title)}</h3>
        ${has(i.desc) ? `<p class="work__desc">${esc(i.desc)}</p>` : ""}
        <div class="work__tags">${(i.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
      </div>
    </${tag}>`;
  }).join("");

  /* ---- interests ---- */
  const it = d.interests || {};
  $("#interestsTitle").textContent = it.heading || "สิ่งที่ชอบ";
  $("#interestsGrid").innerHTML = (it.items || []).map(i =>
    `<div class="interest reveal"><span>${esc(i.icon)}</span><span>${esc(i.label)}</span></div>`).join("");

  /* ---- contact ---- */
  const c = d.contact || {};
  $("#contactTitle").textContent = c.heading || "ติดต่อฉัน";
  const lines = [];
  if (has(c.email)) lines.push(`<a class="contact-line" href="mailto:${esc(c.email)}"><i>✉️</i><span>อีเมล · <b>${esc(c.email)}</b></span></a>`);
  if (has(c.phone)) lines.push(`<a class="contact-line" href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ""))}"><i>📞</i><span>โทร · <b>${esc(c.phone)}</b></span></a>`);
  if (has(c.line))  lines.push(`<div class="contact-line"><i>💬</i><span>LINE · <b>${esc(c.line)}</b></span></div>`);
  $("#contactBody").innerHTML = `
    ${has(c.intro) ? `<p>${esc(c.intro)}</p>` : ""}
    ${lines.length ? `<div class="contact-lines">${lines.join("")}</div>` : ""}
    <div class="socials">${(c.links || []).filter(l => has(l.url)).map(l =>
      `<a class="social" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${svg(l.icon)}${esc(l.label)}</a>`).join("")}</div>`;

  /* ---- footer ---- */
  $("#footerLeft").innerHTML = `© ${new Date().getFullYear()} ${esc(p.name)} · ${esc((d.footer || {}).note || "")}`;

  /* hide empty sections */
  document.querySelectorAll("section[data-list]").forEach(sec => {
    const list = $("#" + sec.dataset.list, sec);
    if (list && !list.children.length) sec.style.display = "none";
  });
}

/* ============================ behaviour ============================ */
function boot() {
  render();

  /* theme */
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setTheme = t => {
    root.dataset.theme = t;
    $("#themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("theme", t); } catch {}
  };
  setTheme(saved || (prefersDark ? "dark" : "light"));
  $("#themeBtn").addEventListener("click", () =>
    setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  /* mobile menu */
  const links = $("#navLinks");
  $("#menuBtn").addEventListener("click", () => links.classList.toggle("open"));
  links.addEventListener("click", e => { if (e.target.tagName === "A") links.classList.remove("open"); });

  /* nav shadow */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* active link + reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    document.querySelectorAll("#navLinks a").forEach(a =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("section[id]").forEach(s => spy.observe(s));
}

document.addEventListener("DOMContentLoaded", boot);
