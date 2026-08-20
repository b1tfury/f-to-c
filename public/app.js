const MIN = 34;
const MAX = 42;
const STEP = 0.1;
const PX_PER_TENTH = 16;
const CIRC = 2 * Math.PI * 92;

const shell = document.getElementById("shell");
const cOut = document.getElementById("cOut");
const fOut = document.getElementById("fOut");
const arc = document.getElementById("arc");
const ghost = document.getElementById("ghost");
const fill = document.getElementById("fill");
const thumb = document.getElementById("thumb");
const hint = document.getElementById("hint");

const toF = (c) => Number(c) * 9 / 5 + 32;
const round1 = (n) => Math.round(n / STEP) * STEP;
const clamp = (n) => Math.min(MAX, Math.max(MIN, n));
function fmt(n) {
  const r = round1(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
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
function offsetFor(c) {
  const pct = Math.min(1, Math.max(0, (c - 35) / 6));
  return CIRC * (1 - pct);
}
function railPct(c) {
  return ((c - MIN) / (MAX - MIN)) * 100;
}
function paint(c, dir) {
  const b = band(c);
  shell.dataset.band = b.id;
  shell.dataset.dir = dir || "idle";
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
  arc.style.strokeDashoffset = String(offsetFor(c));
  fill.style.height = railPct(c) + "%";
  thumb.style.bottom = railPct(c) + "%";
}

let temp = 37.6;
let startTemp = 37.6;
let startY = 0;
let dragging = false;
let idleTimer = 0;

function setTemp(n, dir) {
  const next = round1(clamp(n));
  if (next !== temp && navigator.vibrate) navigator.vibrate(8);
  temp = next;
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set("c", fmt(temp));
  history.replaceState(null, "", url);
  paint(temp, dir);
}

function dirFrom(from, to) {
  if (to > from) return "rising";
  if (to < from) return "falling";
  return "idle";
}

function onDown(y, id) {
  dragging = true;
  startY = y;
  startTemp = temp;
  ghost.style.strokeDasharray = String(CIRC);
  ghost.style.strokeDashoffset = String(offsetFor(startTemp));
  hint.textContent = "from " + fmt(startTemp) + "\u00b0";
  paint(temp, "idle");
  try { shell.setPointerCapture(id); } catch (e) {}
}
function onMove(y) {
  if (!dragging) return;
  const tenths = (startY - y) / PX_PER_TENTH;
  const next = startTemp + tenths * STEP;
  setTemp(next, dirFrom(startTemp, next));
}
function onUp() {
  if (!dragging) return;
  dragging = false;
  hint.textContent = "slide · 0.1° at a time";
  clearTimeout(idleTimer);
  idleTimer = setTimeout(function () { paint(temp, "idle"); }, 700);
}

shell.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  onDown(e.clientY, e.pointerId);
});
shell.addEventListener("pointermove", function (e) {
  onMove(e.clientY);
});
shell.addEventListener("pointerup", onUp);
shell.addEventListener("pointercancel", onUp);

window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowUp") { e.preventDefault(); setTemp(temp + STEP, "rising"); }
  if (e.key === "ArrowDown") { e.preventDefault(); setTemp(temp - STEP, "falling"); }
});

const start = Number(new URLSearchParams(location.search).get("c")) || 37.6;
setTemp(start, "idle");
