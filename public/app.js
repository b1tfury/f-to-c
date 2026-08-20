const cEl = document.getElementById("c");
const fEl = document.getElementById("f");
const cOut = document.getElementById("cOut");
const fOut = document.getElementById("fOut");
const mercury = document.getElementById("mercury");
const err = document.getElementById("err");
const toC = (f) => (Number(f) - 32) * 5 / 9;
const toF = (c) => Number(c) * 9 / 5 + 32;
const round1 = (n) => Math.round(n * 10) / 10;
function fmt(n) {
  const r = round1(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
function isDraft(raw) {
  const s = String(raw).trim();
  if (!s || s === "-" || s === "." || s === "-.") return true;
  const last = s.charAt(s.length - 1);
  return last === ".";
}
function setUrl(key, value) {
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set(key, value);
  history.replaceState(null, "", url);
}
function paint(c) {
  err.textContent = "";
  cOut.textContent = fmt(c) + " C";
  fOut.textContent = fmt(toF(c)) + " F";
  const pct = Math.min(86, Math.max(12, ((c + 10) / 60) * 100));
  mercury.style.height = pct + "%";
}
function fromC(raw, writeBack) {
  if (isDraft(raw)) return;
  const n = Number(raw);
  if (!Number.isFinite(n)) { err.textContent = "Need a number"; return; }
  if (writeBack) cEl.value = String(raw);
  fEl.value = fmt(toF(n));
  setUrl("c", raw);
  paint(n);
}
function fromF(raw, writeBack) {
  if (isDraft(raw)) return;
  const n = Number(raw);
  if (!Number.isFinite(n)) { err.textContent = "Need a number"; return; }
  if (writeBack) fEl.value = String(raw);
  cEl.value = fmt(toC(n));
  setUrl("f", raw);
  paint(toC(n));
}
cEl.addEventListener("input", function () { fromC(cEl.value, false); });
fEl.addEventListener("input", function () { fromF(fEl.value, false); });
const params = new URLSearchParams(location.search);
const c = params.get("c") || params.get("celsius");
const f = params.get("f") || params.get("fahrenheit");
if (c) fromC(c, true);
else if (f) fromF(f, true);
else fromC("37.6", true);
