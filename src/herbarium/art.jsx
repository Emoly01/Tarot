import { createElement as h } from "react";
import { moonPath, SABBATS, PHASE_ANGLES, PHASE_NAMES } from "./moon.js";

// ══════════════════════════════════════════════════════════════
//  Ink-and-wash ornaments (fern, card back, tallies, wheel, moons),
//  drawn procedurally in SVG. The card plates live in cards.js.
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
