import { createElement as h } from "react";
import { moonPath, SABBATS, PHASE_ANGLES, PHASE_NAMES } from "./moon.js";

// ══════════════════════════════════════════════════════════════
//  Ink-and-wash botanical plates, drawn procedurally in SVG.
//  Every colour is a theme token so both papers re-ink themselves.
// ══════════════════════════════════════════════════════════════

const leaf = (L, w) => `M0 0 C${L * .3} ${-w} ${L * .72} ${-w * .75} ${L} 0 C${L * .72} ${w * .75} ${L * .3} ${w} 0 0Z`;
const INK = { stroke: "var(--ink)", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
const wcFilter = id => h("filter", { key: "f", id, x: "-10%", y: "-10%", width: "120%", height: "120%" },
  h("feTurbulence", { type: "fractalNoise", baseFrequency: .05, numOctaves: 2, result: "t" }),
  h("feDisplacementMap", { in: "SourceGraphic", in2: "t", scale: 6 }),
  h("feGaussianBlur", { stdDeviation: .7 }));
const quad = (p0, c, p1) => ({
  at: t => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]],
  ang: t => Math.atan2(2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]), 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0])) * 180 / Math.PI,
  d: `M${p0} Q${c} ${p1}`,
});
const at = (x, y, a) => `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})`;
const plate = kids => h("svg", { viewBox: "0 0 200 290", style: { display: "block", height: "100%", maxWidth: "100%" } }, kids);

// A leaf with its watercolour wash a hair off-register, like the real thing
function washedLeaf(key, x, y, a, L, w, wash, filter, opacity = .65) {
  return h("g", { key, transform: at(x, y, a) },
    h("path", { d: leaf(L, w), transform: "translate(1.5 1.4)", style: { fill: wash, opacity }, filter: `url(#${filter})` }),
    h("path", { d: leaf(L, w), style: INK, strokeWidth: .8 }));
}

// ── Header fern ──────────────────────────────────────────────
export function Fern() {
  const q = quad([30, 330], [70, 170], [160, 14]), kids = [wcFilter("wcf")];
  kids.push(h("path", { key: "rw", d: q.d, style: { stroke: "var(--wash)", fill: "none", opacity: .7 }, strokeWidth: 5, filter: "url(#wcf)" }));
  for (let i = 0; i < 22; i++) {
    const t = .05 + i * .042, [x, y] = q.at(t), a = q.ang(t);
    const L = (8 + 54 * Math.pow(1 - t, .85)) * Math.min(1, (t + .04) * 6), w = L * .2;
    [-1, 1].forEach(s => kids.push(h("g", { key: i + "" + s, transform: at(x, y, a + s * 62) },
      h("path", { d: leaf(L, w), transform: "translate(1.6 1.4)", style: { fill: "var(--wash)", opacity: .65 }, filter: "url(#wcf)" }),
      h("path", { d: leaf(L, w), style: INK, strokeWidth: .8 }),
      h("path", { d: `M0 0 L${L * .9} 0`, style: INK, strokeWidth: .45 }))));
  }
  kids.push(h("path", { key: "r", d: q.d, style: INK, strokeWidth: 1.3 }));
  return h("svg", { viewBox: "0 0 200 340", width: "100%", style: { display: "block", overflow: "visible" } }, kids);
}

// ── Major Arcana: lavender ───────────────────────────────────
function Lavender() {
  const kids = [wcFilter("wcl")];
  const stems = [quad([100, 272], [90, 180], [70, 62]), quad([100, 272], [106, 172], [128, 56]), quad([100, 272], [100, 160], [99, 32])];
  const leaves = [[100, 264, -152, 56], [100, 264, -28, 58], [99, 248, -128, 46], [101, 246, -52, 48], [98, 230, -142, 38], [102, 228, -38, 40], [97, 212, -118, 30], [103, 210, -62, 30], [96, 196, -132, 22], [104, 194, -48, 22]];
  leaves.forEach(([x, y, a, L], i) => kids.push(washedLeaf("l" + i, x, y, a, L, L * .1, "var(--wash)", "wcl", .8)));
  stems.forEach((q, si) => {
    kids.push(h("path", { key: "s" + si, d: q.d, style: INK, strokeWidth: 1 }));
    for (let t = .76, k = 0; t <= 1.001; t += .026, k++) {
      const [x, y] = q.at(t), a = q.ang(t), sz = 1 - (t - .76) * 1.6;
      [-1, 1].forEach(s => kids.push(h("g", { key: `f${si}${k}${s}`, transform: at(x, y, a + s * 48) },
        h("ellipse", { cx: 4.2 * sz, cy: 0, rx: 4.4 * sz, ry: 2.5 * sz, transform: "translate(1 1)", style: { fill: "var(--ox)", opacity: .2 }, filter: "url(#wcl)" }),
        h("ellipse", { cx: 4.2 * sz, cy: 0, rx: 4.4 * sz, ry: 2.5 * sz, style: INK, strokeWidth: .7 }))));
    }
  });
  kids.push(h("path", { key: "root", d: "M100 272 q-6 6 -14 7 M100 272 q2 7 10 9 M100 272 q-1 6 -3 10", style: INK, strokeWidth: .6 }));
  return plate(kids);
}

// ── Wands: St John's wort ────────────────────────────────────
function StJohnsWort() {
  const kids = [wcFilter("wcw")];
  const main = quad([100, 274], [94, 170], [100, 70]);
  const [bx, by] = main.at(.58);
  const stems = [main, quad([bx, by], [70, 110], [58, 78]), quad([bx, by], [132, 112], [144, 82])];
  for (let i = 0; i < 6; i++) {
    const t = .08 + i * .085, [x, y] = main.at(t), a = main.ang(t), L = 30 - i * 2.6;
    [-1, 1].forEach(s => kids.push(washedLeaf(`l${i}${s}`, x, y, a + s * (78 - i * 4), L, L * .34, "var(--wash)", "wcw")));
  }
  stems.forEach((q, i) => kids.push(h("path", { key: "s" + i, d: q.d, style: INK, strokeWidth: i ? .9 : 1.1 })));
  const flower = (key, [x, y], r, tilt) => h("g", { key, transform: at(x, y, tilt) },
    ...[0, 1, 2, 3, 4].map(p => h("g", { key: "p" + p, transform: `rotate(${p * 72})` },
      h("ellipse", { cx: 0, cy: -r * .62, rx: r * .38, ry: r * .62, transform: "translate(1.2 1.2)", style: { fill: "var(--gilt)", opacity: .38 }, filter: "url(#wcw)" }),
      h("ellipse", { cx: 0, cy: -r * .62, rx: r * .38, ry: r * .62, style: INK, strokeWidth: .7 }))),
    ...Array.from({ length: 14 }, (_, s) => {
      const a = s / 14 * Math.PI * 2, l = r * (.55 + (s % 3) * .1);
      return h("g", { key: "st" + s },
        h("line", { x1: 0, y1: 0, x2: Math.cos(a) * l, y2: Math.sin(a) * l, style: INK, strokeWidth: .4 }),
        h("circle", { cx: Math.cos(a) * l, cy: Math.sin(a) * l, r: .9, style: { fill: "var(--ink)" } }));
    }));
  kids.push(flower("f0", main.at(1), 15, 8), flower("f1", stems[1].at(1), 12, -20), flower("f2", stems[2].at(1), 12.5, 24));
  [[stems[1], .72, -40], [stems[2], .7, 50], [main, .86, -60]].forEach(([q, t, off], i) => {
    const [x, y] = q.at(t);
    kids.push(h("g", { key: "b" + i, transform: at(x, y, q.ang(t) + off) },
      h("path", { d: "M0 0 L9 0", style: INK, strokeWidth: .6 }),
      h("ellipse", { cx: 13, cy: 0, rx: 4.6, ry: 3, transform: "translate(1 1)", style: { fill: "var(--gilt)", opacity: .35 }, filter: "url(#wcw)" }),
      h("ellipse", { cx: 13, cy: 0, rx: 4.6, ry: 3, style: INK, strokeWidth: .7 })));
  });
  kids.push(h("path", { key: "root", d: "M100 274 q-7 5 -15 6 M100 274 q3 6 11 8 M100 274 q0 6 -2 11", style: INK, strokeWidth: .6 }));
  return plate(kids);
}

// ── Cups: white water lily ───────────────────────────────────
function WaterLily() {
  const kids = [wcFilter("wcc")];
  const pad = "M100 250 C70 250 40 256 40 264 C40 274 74 280 104 279 C138 278 162 272 160 263 C158 255 136 250 112 250 L104 262 Z";
  kids.push(h("path", { key: "pw", d: pad, transform: "translate(2 2)", style: { fill: "var(--wash)", opacity: .7 }, filter: "url(#wcc)" }));
  kids.push(h("path", { key: "p", d: pad, style: INK, strokeWidth: .9 }));
  [-70, -40, -10, 20, 50].forEach((a, i) => kids.push(h("path", { key: "v" + i, d: `M104 262 L${104 + Math.cos(a * Math.PI / 180) * 50} ${262 + Math.sin(a * Math.PI / 180) * 12}`, style: INK, strokeWidth: .35 })));
  kids.push(h("path", { key: "rip", d: "M24 284 q14 -4 28 0 M150 284 q12 -3 24 0 M60 290 q10 -3 20 0", style: { stroke: "var(--soft)", fill: "none" }, strokeWidth: .6 }));
  const stem = quad([96, 262], [82, 190], [100, 132]), bud = quad([118, 258], [140, 210], [140, 168]);
  kids.push(h("path", { key: "s", d: stem.d, style: INK, strokeWidth: 1.1 }), h("path", { key: "s2", d: bud.d, style: INK, strokeWidth: .9 }));
  const petal = (key, x, y, a, L, w, op) => h("g", { key, transform: at(x, y, a) },
    h("path", { d: leaf(L, w), transform: "translate(1.4 1.4)", style: { fill: "var(--verd)", opacity: op }, filter: "url(#wcc)" }),
    h("path", { d: leaf(L, w), style: { ...INK, fill: "var(--card)" }, strokeWidth: .8 }),
    h("path", { d: `M${L * .15} 0 L${L * .8} 0`, style: INK, strokeWidth: .35 }));
  [-160, -135, -110, -90, -70, -45, -20].forEach((a, i) => kids.push(petal("bp" + i, 100, 132, a, 46 - Math.abs(a + 90) * .12, 11, .16)));
  [-150, -118, -62, -30].forEach((a, i) => kids.push(petal("fp" + i, 100, 136, a, 34, 10, .22)));
  kids.push(petal("bud", 140, 170, -84, 30, 8, .22));
  [-122, -58].forEach((a, i) => kids.push(petal("se" + i, 140, 172, a, 16, 5, .3)));
  for (let s = 0; s < 9; s++) kids.push(h("circle", { key: "c" + s, cx: 92 + s * 2, cy: 126 - Math.sin(s / 8 * Math.PI) * 5, r: 1.2, style: { fill: "var(--gilt)" } }));
  return plate(kids);
}

// ── Swords: dandelion clock ──────────────────────────────────
function DandelionClock() {
  const kids = [wcFilter("wcs")];
  const tooth = L => {
    let d = "M0 0", n = 6;
    for (let i = 1; i <= n; i++) { const x = L * i / n, w = 9 * (1 - i / (n + 2)); d += ` L${(x - L / n * .7).toFixed(1)} ${(-w * 1.6).toFixed(1)} L${x.toFixed(1)} ${(-w * .5).toFixed(1)}`; }
    for (let i = n; i >= 1; i--) { const x = L * i / n, w = 9 * (1 - i / (n + 2)); d += ` L${x.toFixed(1)} ${(w * .5).toFixed(1)} L${(x - L / n * .7).toFixed(1)} ${(w * 1.6).toFixed(1)}`; }
    return d + " Z";
  };
  [[-168, 62], [-138, 54], [-42, 56], [-12, 64], [-104, 40], [-76, 42]].forEach(([a, L], i) => kids.push(h("g", { key: "l" + i, transform: `translate(100 272) rotate(${a})` },
    h("path", { d: tooth(L), transform: "translate(1.5 1.5)", style: { fill: "var(--wash)", opacity: .7 }, filter: "url(#wcs)" }),
    h("path", { d: tooth(L), style: INK, strokeWidth: .75 }),
    h("path", { d: `M0 0 L${L * .92} 0`, style: INK, strokeWidth: .4 }))));
  const stem = quad([100, 272], [108, 180], [100, 92]);
  kids.push(h("path", { key: "s", d: stem.d, style: INK, strokeWidth: 1.1 }));
  const cx = 100, cy = 78;
  kids.push(h("circle", { key: "core", cx, cy, r: 5, style: { ...INK, fill: "var(--card)" }, strokeWidth: .8 }));
  const seed = (key, x, y, a, len) => h("g", { key, transform: at(x, y, a) },
    h("line", { x1: 0, y1: 0, x2: len, y2: 0, style: INK, strokeWidth: .45 }),
    h("ellipse", { cx: 2.2, cy: 0, rx: 2.2, ry: .9, style: { fill: "var(--ink)" } }),
    ...[-50, -25, 0, 25, 50].map((p, i) => h("line", { key: i, x1: len, y1: 0, x2: len + Math.cos(p * Math.PI / 180) * 5.5, y2: Math.sin(p * Math.PI / 180) * 5.5, style: INK, strokeWidth: .35 })));
  for (let i = 0; i < 44; i++) {
    const a = i / 44 * 360 + (i % 2) * 4;
    if (a > 300 && a < 340) continue; // a few have already flown
    const r = 5.5;
    kids.push(seed("sd" + i, cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r, a, 24 + (i % 3) * 2));
  }
  [[150, 34, -40], [166, 18, -28], [138, 14, -60]].forEach(([x, y, a], i) => kids.push(seed("fly" + i, x, y, a, 18)));
  kids.push(h("path", { key: "root", d: "M100 272 q-1 8 -4 16 M100 272 q2 6 7 9", style: INK, strokeWidth: .6 }));
  return plate(kids);
}

// ── Pentacles: wheat ─────────────────────────────────────────
function Wheat() {
  const kids = [wcFilter("wcp")];
  const stems = [quad([100, 276], [92, 160], [70, 44]), quad([100, 276], [102, 150], [100, 28]), quad([100, 276], [110, 160], [132, 46])];
  [[stems[0], .3, -1, 92], [stems[1], .22, 1, 100], [stems[2], .36, 1, 84], [stems[1], .44, -1, 70]].forEach(([q, t, s, L], i) => {
    const [x, y] = q.at(t);
    kids.push(washedLeaf("bl" + i, x, y, q.ang(t) + s * 22, L, 4.2, "var(--wash)", "wcp", .75));
  });
  stems.forEach((q, si) => {
    kids.push(h("path", { key: "s" + si, d: q.d, style: INK, strokeWidth: 1 }));
    for (let t = .74, k = 0; t <= 1.001; t += .03, k++) {
      const [x, y] = q.at(t), a = q.ang(t), sz = 1 - (t - .74) * 1.1;
      [-1, 1].forEach(s => kids.push(h("g", { key: `g${si}${k}${s}`, transform: at(x, y, a + s * 26) },
        h("ellipse", { cx: 5.5 * sz, cy: 0, rx: 5.8 * sz, ry: 3 * sz, transform: "translate(1 1)", style: { fill: "var(--gilt)", opacity: .4 }, filter: "url(#wcp)" }),
        h("ellipse", { cx: 5.5 * sz, cy: 0, rx: 5.8 * sz, ry: 3 * sz, style: INK, strokeWidth: .7 }),
        h("line", { x1: 11 * sz, y1: 0, x2: 11 * sz + 20, y2: s * -3, style: INK, strokeWidth: .35 }))));
    }
  });
  kids.push(h("path", { key: "tie", d: "M93 214 q7 5 15 0 M93 219 q7 5 15 0", style: { stroke: "var(--ox)", fill: "none" }, strokeWidth: 1.1 }));
  kids.push(h("path", { key: "root", d: "M100 276 q-6 5 -13 6 M100 276 q2 6 9 8", style: INK, strokeWidth: .6 }));
  return plate(kids);
}

const PLATES = { Major: Lavender, Wands: StJohnsWort, Cups: WaterLily, Swords: DandelionClock, Pentacles: Wheat };
export function SuitPlate({ suit }) {
  const P = PLATES[suit] || Lavender;
  return <P />;
}

// ── Card back: engraved sunburst on oxblood ──────────────────
export function CardBack() {
  const c = [150, 250], E = { stroke: "var(--eng)", fill: "none" }, k = [];
  k.push(h("defs", { key: "d" }, h("pattern", { id: "lat", width: 12, height: 12, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
    h("path", { d: "M0 0 L0 12 M0 0 L12 0", style: E, strokeWidth: .4, opacity: .55 }))));
  k.push(h("rect", { key: "bg", width: 300, height: 500, style: { fill: "var(--back)" } }));
  k.push(h("rect", { key: "b1", x: 12, y: 12, width: 276, height: 476, style: E, strokeWidth: .9 }));
  k.push(h("rect", { key: "b2", x: 18, y: 18, width: 264, height: 464, style: E, strokeWidth: .5 }));
  k.push(h("rect", { key: "lt", x: 18, y: 18, width: 264, height: 464, fill: "url(#lat)" }));
  k.push(h("circle", { key: "c0", cx: c[0], cy: c[1], r: 128, style: { fill: "var(--back)", stroke: "var(--eng)" }, strokeWidth: .9 }));
  k.push(h("circle", { key: "c1", cx: c[0], cy: c[1], r: 122, style: E, strokeWidth: .5 }));
  for (let i = 0; i < 96; i++) {
    const a = i / 96 * Math.PI * 2, r0 = i % 2 ? 70 : 62, r1 = i % 4 ? 112 : 118;
    k.push(h("line", { key: "r" + i, x1: c[0] + Math.cos(a) * r0, y1: c[1] + Math.sin(a) * r0, x2: c[0] + Math.cos(a) * r1, y2: c[1] + Math.sin(a) * r1, style: E, strokeWidth: .45 }));
  }
  const pts = [];
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 24 : 58; pts.push((c[0] + Math.cos(a) * r).toFixed(1) + "," + (c[1] + Math.sin(a) * r).toFixed(1)); }
  k.push(h("polygon", { key: "st", points: pts.join(" "), style: { fill: "var(--back)", stroke: "var(--eng)" }, strokeWidth: .9 }));
  k.push(h("circle", { key: "c2", cx: c[0], cy: c[1], r: 27, style: { fill: "var(--back)", stroke: "var(--eng)" }, strokeWidth: .7 }));
  k.push(h("path", { key: "cr", d: `M${c[0] + 2} ${c[1] - 19} A19 19 0 1 0 ${c[0] + 2} ${c[1] + 19} A15 15 0 1 1 ${c[0] + 2} ${c[1] - 19}Z`, style: { fill: "var(--eng)" } }));
  [[46, 52], [254, 52], [46, 448], [254, 448]].forEach(([x, y], i) => k.push(h("path", { key: "cs" + i, d: `M${x} ${y - 14} L${x + 3} ${y - 3} L${x + 14} ${y} L${x + 3} ${y + 3} L${x} ${y + 14} L${x - 3} ${y + 3} L${x - 14} ${y} L${x - 3} ${y - 3}Z`, style: { fill: "var(--eng)" }, opacity: .9 })));
  return h("svg", { viewBox: "0 0 300 500", preserveAspectRatio: "xMidYMid slice", style: { display: "block", width: "100%", height: "100%" } }, k);
}

// ── Tally marks, five-barred gates ───────────────────────────
export function Tally({ n, color }) {
  const k = [], j = i => Math.sin(i * 12.9898) * 1.4;
  let x = 4;
  for (let i = 0; i < n; i++) {
    const p = i % 5;
    if (p < 4) k.push(h("line", { key: i, x1: x + j(i), y1: 4 + j(i + 7) * .6, x2: x + j(i + 3), y2: 27 + j(i + 9) * .6, stroke: color, strokeWidth: 1.5, strokeLinecap: "round" }));
    else k.push(h("line", { key: i, x1: x - 25 + j(i), y1: 22, x2: x + 3, y2: 9 + j(i + 2), stroke: color, strokeWidth: 1.5, strokeLinecap: "round" }));
    x += p === 4 ? 14 : (p === 3 ? 4 : 7);
  }
  return h("svg", { width: x + 6, height: 31, style: { display: "block", flex: "none", overflow: "visible" } }, k);
}

// ── Wheel of the year ────────────────────────────────────────
export function Wheel({ today, next }) {
  const c = 80, r = 46, yr = today.getFullYear();
  const doyOf = d => (d - new Date(d.getFullYear(), 0, 1)) / 864e5;
  const ang = d => (d / 365) * Math.PI * 2 - Math.PI / 2, P = (d, rr) => [c + Math.cos(ang(d)) * rr, c + Math.sin(ang(d)) * rr];
  const k = [h("circle", { key: "o", cx: c, cy: c, r, style: INK, strokeWidth: .9 }), h("circle", { key: "i", cx: c, cy: c, r: r - 5, style: INK, strokeWidth: .4 })];
  for (let m = 0; m < 12; m++) { const d = m * 30.4, [x1, y1] = P(d, r - 5), [x2, y2] = P(d, r); k.push(h("line", { key: "m" + m, x1, y1, x2, y2, style: INK, strokeWidth: .4 })); }
  SABBATS.forEach(([n, mo, da]) => {
    const d = doyOf(new Date(yr, mo, da));
    const [x1, y1] = P(d, r - 8), [x2, y2] = P(d, r + 4), [tx, ty] = P(d, r + 16);
    k.push(h("line", { key: n, x1, y1, x2, y2, style: { stroke: "var(--gilt)" }, strokeWidth: 1.1 }));
    k.push(h("text", { key: n + "t", x: tx, y: ty + 3, textAnchor: "middle", style: { fill: n === next.name ? "var(--ox)" : "var(--soft)", fontFamily: "'IM Fell English SC',serif", fontSize: 12.5 } }, n));
  });
  const doy = doyOf(new Date(yr, today.getMonth(), today.getDate()));
  const [ax, ay] = P(doy, r), [bx, by] = P(doy + next.days, r);
  k.push(h("path", { key: "arc", d: `M${ax} ${ay} A${r} ${r} 0 0 1 ${bx} ${by}`, style: { stroke: "var(--ox)", fill: "none" }, strokeWidth: 2.4 }));
  const [hx, hy] = P(doy, r - 9);
  k.push(h("line", { key: "h", x1: c, y1: c, x2: hx, y2: hy, style: { stroke: "var(--ink)" }, strokeWidth: 1.1 }));
  k.push(h("circle", { key: "hd", cx: c, cy: c, r: 2.4, style: { fill: "var(--ink)" } }));
  return h("svg", { viewBox: "0 0 160 160", width: "100%", role: "img", "aria-label": `Wheel of the year, ${next.name} next`, style: { display: "block", overflow: "visible" } }, k);
}

// ── Moons ────────────────────────────────────────────────────
export function MoonBig({ angle }) {
  const c = 42, R = 34, k = [];
  k.push(h("circle", { key: "s", cx: c, cy: c, r: R, style: { fill: "var(--shade)" } }));
  k.push(h("path", { key: "l", d: moonPath(angle, c, R), style: { fill: "var(--card)" } }));
  [[30, 32, 4], [50, 52, 6], [36, 58, 3], [54, 30, 3.5]].forEach(([x, y, rr], i) => k.push(h("circle", { key: "m" + i, cx: x, cy: y, r: rr, style: INK, strokeWidth: .4, opacity: .5 })));
  k.push(h("circle", { key: "o", cx: c, cy: c, r: R, style: INK, strokeWidth: 1 }));
  k.push(h("circle", { key: "o2", cx: c, cy: c, r: R + 4, style: { stroke: "var(--gilt)", fill: "none" }, strokeWidth: .5 }));
  return h("svg", { viewBox: "0 0 84 84", width: "100%", style: { display: "block" } }, k);
}

// Small inline moon; pass an angle, or a stored phase name
export function MoonGlyph({ angle, phase, size = 15, title, style }) {
  const a = angle ?? PHASE_ANGLES[Math.max(0, PHASE_NAMES.indexOf(phase))];
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} style={{ flex: "none", ...style }} role="img" aria-label={title || phase}>
      {(title || phase) && <title>{title || phase}</title>}
      <circle cx="10" cy="10" r="8" style={{ fill: "var(--shade)" }} />
      <path d={moonPath(a, 10, 8)} style={{ fill: "var(--card)" }} />
      <circle cx="10" cy="10" r="8" style={{ fill: "none", stroke: "var(--ink)" }} strokeWidth=".8" />
    </svg>
  );
}
