const shell = document.querySelector(".shell");
const cEl = document.getElementById("c");
const cOut = document.getElementById("cOut");
const fOut = document.getElementById("fOut");
const arc = document.getElementById("arc");
const CIRC = 2 * Math.PI * 92;

const toF = (c) => Number(c) * 9 / 5 + 32;
const round1 = (n) => Math.round(n * 10) / 10;
function fmt(n) {
  const r = round1(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
function isDraft(raw) {
  const s = String(raw).trim();
  if (!s || s === "-" || s === "." || s === "-.") return true;
  return s.charAt(s.length - 1) === ".";
}
function band(c) {
  if (c < 35) return { id: "low", title: "Too low", line: "Warm up. If it stays there, get help." };
  if (c < 36.1) return { id: "low", title: "On the low side", line: "Have something warm and recheck." };
  if (c <= 37.2) return { id: "ok", title: "All good", line: "Normal range. No medicine needed." };
  if (c <= 38.0) return { id: "mild", title: "Mild fever", line: "Rest and water. Watch it." };
  if (c <= 39.0) return { id: "fever", title: "Fever", line: "Rest, fluids. Consider medicine." };
  if (c <= 40.0) return { id: "high", title: "High fever", line: "Take medicine. Keep checking." };
  return { id: "high", title: "Very high", line: "Seek care now." };
}
function fitKeyboard() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty("--vvh", Math.round(h) + "px");
}
function paint(c) {
  const b = band(c);
  shell.dataset.band = b.id;
  cOut.textContent = fmt(c) + "\u00b0C";
  fOut.textContent = fmt(toF(c)) + "\u00b0F";
  const t = document.getElementById("title");
  const p = document.getElementById("line");
  p.textContent = b.line;
  if (t.textContent !== b.title) {
    const next = t.cloneNode(true);
    next.textContent = b.title;
    t.replaceWith(next);
  }
  arc.style.strokeDasharray = String(CIRC);
  const pct = Math.min(1, Math.max(0, (c - 35) / 6));
  arc.style.strokeDashoffset = String(CIRC * (1 - pct));
}
function fromC(raw, writeBack) {
  if (isDraft(raw)) return;
  const n = Number(raw);
  if (!Number.isFinite(n)) return;
  if (writeBack) cEl.value = String(raw);
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set("c", raw);
  history.replaceState(null, "", url);
  paint(n);
}

fitKeyboard();
if (window.visualViewport) {
  visualViewport.addEventListener("resize", fitKeyboard);
  visualViewport.addEventListener("scroll", fitKeyboard);
}
window.addEventListener("resize", fitKeyboard);
cEl.addEventListener("input", function () { fromC(cEl.value, false); });
cEl.addEventListener("focus", function () { setTimeout(fitKeyboard, 80); });

const start = new URLSearchParams(location.search).get("c") || "37.6";
fromC(start, true);
cEl.value = start;
