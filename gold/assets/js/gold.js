/* =========================================================
   ราคาทองวันนี้ — logic
   ดึงข้อมูลสดจาก API สมาคมค้าทองคำ (CORS เปิด) และ
   ถ้าดึงไม่ได้จะใช้ข้อมูลสำรองใน gold-data.js
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const API = GOLD_SEED.source.api;
const REFRESH_MS = 60_000;
const LS_KEY = "goldRounds";

/* น้ำหนักมาตรฐาน */
const G_PER_BAHT_BAR = 15.244;  // ทองคำแท่ง 1 บาท
const G_PER_BAHT_ORN = 15.16;   // ทองรูปพรรณ 1 บาท

/* ---------- helpers ---------- */
const num = v => typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, "")) || 0;
const fmt = (v, d = 0) => v.toLocaleString("th-TH", { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = v => (v > 0 ? "+" : v < 0 ? "−" : "±") + fmt(Math.abs(v));
const dirClass = v => v > 0 ? "up" : v < 0 ? "down" : "flat";
const arrow = v => v > 0 ? "▲" : v < 0 ? "▼" : "—";

/* สถานะข้อมูลปัจจุบัน */
const state = {
  latest: { ...GOLD_SEED.latest },
  rounds: [...GOLD_SEED.rounds],
  live: false,
  fetchedAt: null,
  chartTab: "today"
};

/* ---------- เก็บ/อ่านประกาศระหว่างวันจาก localStorage ---------- */
function loadStored(date) {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (raw && raw.date === date && Array.isArray(raw.rounds)) return raw.rounds;
  } catch {}
  return null;
}
function saveStored(date, rounds) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ date, rounds })); } catch {}
}

/* ---------- ดึงข้อมูลสด ---------- */
async function fetchLive() {
  const btn = $("#refreshBtn");
  btn.classList.add("spin");
  try {
    const res = await fetch(API, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (json.status !== "success") throw new Error("bad payload");
    const r = json.response;

    const next = {
      date: r.update_date,
      time: r.update_time,
      barBuy:  num(r.price.gold_bar.buy),
      barSell: num(r.price.gold_bar.sell),
      ornBuy:  num(r.price.gold.buy),
      ornSell: num(r.price.gold.sell)
    };

    /* ถ้าวันเปลี่ยน ให้เริ่มนับประกาศใหม่ */
    if (next.date !== state.latest.date) state.rounds = [];
    else if (state.rounds.length === 0) {
      state.rounds = loadStored(next.date) || [...GOLD_SEED.rounds];
    }

    mergeRound(next);
    state.latest = next;
    state.live = true;
    state.fetchedAt = new Date();
    saveStored(next.date, state.rounds);
  } catch (err) {
    state.live = false;
    console.warn("ดึงข้อมูลสดไม่สำเร็จ ใช้ข้อมูลสำรองแทน:", err.message);
  } finally {
    setTimeout(() => btn.classList.remove("spin"), 350);
    renderAll();
  }
}

/* เพิ่มประกาศใหม่เข้าไปในรายการ ถ้าเป็นครั้งใหม่จริง */
function mergeRound(next) {
  const roundNo = parseInt((next.time.match(/ครั้งที่\s*(\d+)/) || [])[1] || "0", 10);
  const time = (next.time.match(/(\d{1,2}[:.]\d{2})/) || [])[1]?.replace(".", ":") || "";
  const prev = state.rounds[state.rounds.length - 1];
  if (prev && (prev.round === roundNo || prev.barSell === next.barSell && prev.time === time)) {
    /* อัปเดตค่าเดิม */
    Object.assign(prev, { barBuy: next.barBuy, barSell: next.barSell, ornSell: next.ornSell, taxBase: next.ornBuy });
    return;
  }
  state.rounds.push({
    round: roundNo || (prev ? prev.round + 1 : 1),
    time,
    barBuy: next.barBuy, barSell: next.barSell,
    taxBase: next.ornBuy, ornSell: next.ornSell,
    spot: prev?.spot ?? null, fx: prev?.fx ?? null,
    chg: prev ? next.barSell - prev.barSell : 0
  });
}

/* ---------- เปลี่ยนแปลงเทียบราคาเปิด ---------- */
function todayChange() {
  const r = state.rounds;
  if (!r.length) return GOLD_SEED.summary.today.value;
  const open = r[0].barSell - (r[0].chg || 0);   // ราคาปิดเมื่อวาน
  return state.latest.barSell - open;
}

/* ============================ render ============================ */
function renderStatus() {
  const live = state.live;
  const t = state.fetchedAt;
  $("#status").innerHTML = `
    <span class="dot ${live ? "live" : "stale"}"></span>
    <span>${live ? "ข้อมูลสดจากสมาคมค้าทองคำ" : "ข้อมูลสำรอง (ดึงข้อมูลสดไม่สำเร็จ)"}</span>
    ${t ? `<span class="muted">· ดึงเมื่อ ${t.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>` : ""}
    <span class="muted">· รีเฟรชอัตโนมัติทุก 60 วินาที</span>`;
}

function renderHero() {
  const L = state.latest;
  const chg = todayChange();

  $("#headline").innerHTML = `
    <h1>ราคาทองคำวันนี้</h1>
    <span class="meta num">${L.date} · ${L.time}</span>
    <span class="chg ${dirClass(chg)}">${arrow(chg)} ${signed(chg)} บาท</span>`;

  $("#priceGrid").innerHTML = `
    <div class="pcard">
      <div class="pcard__label">ทองคำแท่ง <span class="pcard__badge">96.5%</span></div>
      <div class="pcard__rows">
        <div><div class="prow__k">รับซื้อ</div><div class="prow__v num">${fmt(L.barBuy, 2)}</div></div>
        <div><div class="prow__k">ขายออก</div><div class="prow__v sell num">${fmt(L.barSell, 2)}</div></div>
      </div>
      <div class="pcard__unit">บาท ต่อทองหนัก 1 บาท (${G_PER_BAHT_BAR} กรัม)</div>
    </div>
    <div class="pcard">
      <div class="pcard__label">ทองรูปพรรณ <span class="pcard__badge">96.5%</span></div>
      <div class="pcard__rows">
        <div><div class="prow__k">รับซื้อ</div><div class="prow__v num">${fmt(L.ornBuy, 2)}</div></div>
        <div><div class="prow__k">ขายออก</div><div class="prow__v sell num">${fmt(L.ornSell, 2)}</div></div>
      </div>
      <div class="pcard__unit">บาท ต่อทองหนัก 1 บาท (${G_PER_BAHT_ORN} กรัม) · ราคาขายรวมค่ากำเหน็จแล้ว</div>
    </div>`;

  const s = GOLD_SEED.summary;
  const spread = L.barSell - L.barBuy;
  $("#strip").innerHTML = [
    { k: "ส่วนต่างซื้อ–ขาย (ทองแท่ง)", v: fmt(spread) + " บาท", cls: "" },
    { k: s.yesterday.label,  v: signed(s.yesterday.value), cls: dirClass(s.yesterday.value) },
    { k: s.lastWeek.label,   v: signed(s.lastWeek.value),  cls: dirClass(s.lastWeek.value) },
    { k: s.lastMonth.label,  v: signed(s.lastMonth.value), cls: dirClass(s.lastMonth.value) },
    { k: "ประกาศวันนี้",      v: state.rounds.length + " ครั้ง", cls: "" }
  ].map(i => `<div class="strip__item">
      <div class="strip__k">${i.k}</div>
      <div class="strip__v num ${i.cls ? "cell-" + i.cls : ""}">${i.v}</div>
    </div>`).join("");
}

function renderRounds() {
  const rows = [...state.rounds].reverse();
  $("#roundsBody").innerHTML = rows.map((r, i) => `
    <tr class="${i === 0 ? "is-latest" : ""}">
      <td class="num">${state.latest.date.slice(0, 5)} ${r.time}</td>
      <td class="num">${r.round}</td>
      <td class="num">${fmt(r.barBuy, 2)}</td>
      <td class="num">${fmt(r.barSell, 2)}</td>
      <td class="num muted">${fmt(r.taxBase, 2)}</td>
      <td class="num">${fmt(r.ornSell, 2)}</td>
      <td class="num muted">${r.spot ? fmt(r.spot) : "—"}</td>
      <td class="num muted">${r.fx ? r.fx.toFixed(2) : "—"}</td>
      <td class="num cell-${dirClass(r.chg)}">${r.chg ? signed(r.chg) : "—"}</td>
    </tr>`).join("");
}

function renderPurity() {
  const base = state.latest.ornBuy;
  $("#purityBody").innerHTML = GOLD_SEED.purity.map(p => {
    const baht = base * p.factor;
    const isMain = p.factor === 1;
    return `<tr>
      <td>${p.name}</td>
      <td class="num">${isMain ? fmt(state.latest.ornSell, 2) : '<span class="muted">n/a</span>'}</td>
      <td class="num">${fmt(baht, 2)}</td>
      <td class="num">${fmt(baht / G_PER_BAHT_ORN, 2)}</td>
    </tr>`;
  }).join("") + `<tr>
      <td>ทองคำแท่ง 96.5%</td>
      <td class="num">${fmt(state.latest.barSell, 2)}</td>
      <td class="num">${fmt(state.latest.barBuy, 2)}</td>
      <td class="num">${fmt(state.latest.barBuy / G_PER_BAHT_BAR, 2)}</td>
    </tr>`;
}

/* ---------- chart ---------- */
function renderChart() {
  const isToday = state.chartTab === "today";
  const series = isToday
    ? state.rounds.map(r => ({ x: r.time, y: r.barSell }))
    : GOLD_SEED.daily.map(d => ({ x: d.date.slice(0, 5), y: d.close }));

  if (isToday && series.length) series[series.length - 1].y = state.latest.barSell;
  if (series.length < 2) { $("#chart").innerHTML = '<p class="muted">ข้อมูลไม่พอสำหรับวาดกราฟ</p>'; return; }

  const W = 900, H = 320, P = { t: 22, r: 62, b: 34, l: 16 };
  const ys = series.map(p => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  const pad = Math.max((max - min) * 0.22, 60);
  min -= pad; max += pad;

  const X = i => P.l + (i / (series.length - 1)) * (W - P.l - P.r);
  const Y = v => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);

  const line = series.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
  const area = `${line} L${X(series.length - 1).toFixed(1)},${H - P.b} L${X(0).toFixed(1)},${H - P.b} Z`;

  /* เส้นกริดแนวนอน 4 เส้น */
  const ticks = Array.from({ length: 4 }, (_, i) => min + ((max - min) * (i + .5)) / 4);
  const grid = ticks.map(v => `
    <line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke-dasharray="3 4"/>
    <text class="axis" x="${W - P.r + 8}" y="${(Y(v) + 4).toFixed(1)}">${fmt(Math.round(v))}</text>`).join("");

  /* ป้ายแกน X — แสดงไม่เกิน 7 ป้าย */
  const step = Math.max(1, Math.ceil(series.length / 7));
  const xlab = series.map((p, i) =>
    (i % step === 0 || i === series.length - 1)
      ? `<text class="axis" x="${X(i).toFixed(1)}" y="${H - 10}" text-anchor="middle">${p.x}</text>` : "").join("");

  const lastX = X(series.length - 1), lastY = Y(series[series.length - 1].y);

  $("#chart").innerHTML = `
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img"
         aria-label="กราฟราคาขายออกทองคำแท่ง ${isToday ? "ระหว่างวัน" : "ย้อนหลัง 7 วัน"}">
      <defs>
        <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="var(--gold)" stop-opacity=".28"/>
          <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
        </linearGradient>
        <!-- 🌈 เส้นกราฟไล่สีสายรุ้งตามแนวนอน -->
        <linearGradient id="rainbowStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="var(--c1)"/>
          <stop offset="17%"  stop-color="var(--c2)"/>
          <stop offset="34%"  stop-color="var(--c3)"/>
          <stop offset="51%"  stop-color="var(--c4)"/>
          <stop offset="68%"  stop-color="var(--c5)"/>
          <stop offset="84%"  stop-color="var(--c6)"/>
          <stop offset="100%" stop-color="var(--c7)"/>
        </linearGradient>
        <!-- พื้นใต้เส้นกราฟ: ไล่สีสายรุ้งจาง ๆ แล้วจางหายลงล่าง -->
        <linearGradient id="rainbowH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="var(--c1)"/>
          <stop offset="34%"  stop-color="var(--c3)"/>
          <stop offset="68%"  stop-color="var(--c5)"/>
          <stop offset="100%" stop-color="var(--c7)"/>
        </linearGradient>
        <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#fff" stop-opacity=".38"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <mask id="fadeMask">
          <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeDown)"/>
        </mask>
      </defs>
      ${grid}
      <path class="area" d="${area}" mask="url(#fadeMask)"/>
      <path class="line" d="${line}"/>
      ${series.map((p, i) => `<circle class="pt" cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${i === series.length - 1 ? 5.5 : 3}"><title>${p.x} · ${fmt(p.y)} บาท</title></circle>`).join("")}
      <text class="lastlabel" x="${(lastX + 10).toFixed(1)}" y="${(lastY - 12).toFixed(1)}">${fmt(series[series.length - 1].y)}</text>
      ${xlab}
    </svg>`;
}

/* ---------- calculator ---------- */
function renderCalc() {
  const weight = parseFloat($("#calcWeight").value) || 0;
  const unit   = $("#calcUnit").value;              // baht | salueng | gram
  const type   = $("#calcType").value;              // bar | orn
  const fee    = parseFloat($("#calcFee").value) || 0;

  const gPerBaht = type === "bar" ? G_PER_BAHT_BAR : G_PER_BAHT_ORN;
  const baht = unit === "baht" ? weight : unit === "salueng" ? weight / 4 : weight / gPerBaht;
  const grams = baht * gPerBaht;

  const sell = type === "bar" ? state.latest.barSell : state.latest.ornSell;  // ราคาที่ร้านขายให้เรา
  const buy  = type === "bar" ? state.latest.barBuy  : state.latest.ornBuy;   // ราคาที่ร้านรับซื้อคืน

  const cost    = baht * sell + (type === "orn" ? fee * baht : 0);
  const payback = baht * buy;
  const diff    = payback - cost;

  $("#calcResult").innerHTML = `
    <h3>ผลการคำนวณ</h3>
    <div class="rrow"><span>น้ำหนักทอง</span><b class="num">${fmt(baht, 4)} บาท · ${fmt(grams, 2)} กรัม</b></div>
    <div class="rrow"><span>ถ้าซื้อวันนี้ จ่าย</span><b class="gold num">${fmt(cost, 2)} บาท</b></div>
    ${type === "orn" && fee ? `<div class="rrow"><span>รวมค่ากำเหน็จ</span><b class="num">${fmt(fee * baht, 2)} บาท</b></div>` : ""}
    <div class="rrow"><span>ถ้าขายคืนวันนี้ ได้</span><b class="num">${fmt(payback, 2)} บาท</b></div>
    <div class="rrow"><span>ส่วนต่าง (ซื้อแล้วขายคืนทันที)</span><b class="num cell-${diff >= 0 ? "up" : "down"}">${signed(Math.round(diff * 100) / 100)} บาท</b></div>
    <p class="result__note">
      ราคารับซื้อคืนอ้างอิงประกาศสมาคมค้าทองคำ ร้านทองแต่ละร้านอาจคิดต่างจากนี้เล็กน้อย
      ${type === "orn" ? "· สคบ. กำหนดให้ร้านทองหักค่าใช้จ่ายรับซื้อคืนทองรูปพรรณได้ไม่เกิน 5%" : ""}
    </p>`;
}

/* ---------- news ---------- */
function renderNews() {
  $("#newsGrid").innerHTML = GOLD_SEED.news.map(n => `
    <article class="news">
      <div class="news__date">${n.date}</div>
      <h3 class="news__title">${n.title}</h3>
      <p class="news__body">${n.body}</p>
    </article>`).join("");
}

function renderAll() {
  renderStatus(); renderHero(); renderRounds();
  renderPurity(); renderChart(); renderCalc();
}

/* ============================ boot ============================ */
function boot() {
  /* theme */
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem("goldTheme"); } catch { return null; } })();
  const setTheme = t => {
    root.dataset.theme = t;
    $("#themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("goldTheme", t); } catch {}
    renderChart();
  };
  setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("#themeBtn").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  /* chart tabs */
  $$(".chart-tab").forEach(b => b.addEventListener("click", () => {
    $$(".chart-tab").forEach(x => x.classList.toggle("active", x === b));
    state.chartTab = b.dataset.tab;
    renderChart();
  }));

  /* calculator */
  ["#calcWeight", "#calcUnit", "#calcType", "#calcFee"].forEach(s =>
    $(s).addEventListener("input", renderCalc));
  $$("#quickWeights button").forEach(b => b.addEventListener("click", () => {
    $("#calcWeight").value = b.dataset.w; $("#calcUnit").value = "baht"; renderCalc();
  }));

  /* refresh */
  $("#refreshBtn").addEventListener("click", fetchLive);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) fetchLive(); });

  renderNews();
  renderAll();
  fetchLive();
  setInterval(fetchLive, REFRESH_MS);
}

document.addEventListener("DOMContentLoaded", boot);
