// ══════════════════════════════════════════════════════════════
//  The pressed deck: all seventy-eight cards drawn as ink-and-wash
//  plates. makeHerbCards(h) takes any createElement-style builder
//  and returns { cards, plates, defs }; colours are theme tokens.
// ══════════════════════════════════════════════════════════════

export function makeHerbCards(h) {
const f = n => (+n).toFixed(1), rad = a => a * Math.PI / 180;
const INK = {stroke: 'var(--ink)', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round'};
const G = 'var(--wash)', R = 'var(--ox)', Y = 'var(--gilt)', B = 'var(--verd)', WT = 'var(--card)', S = 'var(--soft)', D = 'var(--ink)';
let C = null, K = 0, seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const key = () => 'e' + (K++);
const T = (x, y, a = 0) => `translate(${f(x)} ${f(y)}) rotate(${f(a)})`;
const P = p => f(p[0]) + ' ' + f(p[1]);
function wash(d, col = G, op = .8, tr = '') { C.w.push(h('path', {key: key(), d, transform: (tr + ' translate(1.4 1.2)').trim(), style: {fill: col, opacity: op}})); }
function ink(d, sw = .8, tr, st) { C.i.push(h('path', {key: key(), d, transform: tr || undefined, style: st ? Object.assign({}, INK, st) : INK, strokeWidth: sw})); }
function solid(d, col = D, op = 1, tr) { C.i.push(h('path', {key: key(), d, transform: tr || undefined, style: {fill: col, opacity: op}})); }
const ell = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
function blob(cx, cy, rx, ry, col, op = .8, sw = .7, tr) { const d = ell(cx, cy, rx, ry); if (col) wash(d, col, op, tr || ''); ink(d, sw, tr); }
function dot(x, y, r, col = D, op = 1) { solid(ell(x, y, r, r), col, op); }
function open(p) { let d = 'M' + P(p[0]); for (let i = 1; i < p.length - 1; i++) { const m = [(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]; d += 'Q' + P(p[i]) + ' ' + P(m); } return d + 'L' + P(p[p.length - 1]); }
function closed(p) { const n = p.length, m = i => { const a = p[i % n], b = p[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }; let d = 'M' + P(m(n - 1)); for (let i = 0; i < n; i++) d += 'Q' + P(p[i]) + ' ' + P(m(i)); return d + 'Z'; }
function curve(fn, d) {
  const ang = t => { const a = fn(Math.max(0, t - .01)), b = fn(Math.min(1, t + .01)); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; };
  if (!d) { const p = []; for (let i = 0; i <= 30; i++) p.push(fn(i / 30)); d = open(p); }
  return {at: fn, ang, d};
}
const quad = (p0, c, p1) => curve(t => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]], `M${P(p0)}Q${P(c)} ${P(p1)}`);
function along(q, t0, t1, n, fn) { for (let i = 0; i < n; i++) { const t = n === 1 ? t0 : t0 + (t1 - t0) * i / (n - 1), p = q.at(t); fn(p[0], p[1], q.ang(t), t, i); } }
function line(p, sw = .8, st) { ink(open(p), sw, undefined, st); }
function stem(q, sw = 1) { ink(q.d, sw); }
const sp = x => Math.max(0, Math.sin(Math.PI * x));
const SH = {
  lance: t => Math.pow(sp(t), .8) * (1 - .25 * t),
  ovate: t => Math.pow(sp(Math.pow(t, .75)), .9),
  obovate: t => Math.pow(sp(Math.pow(t, 1.4)), .8),
  narrow: t => Math.pow(sp(t), .6),
  round: t => Math.sqrt(sp(t)),
  cord: t => Math.pow(sp(Math.pow(t, .55)), .6),
  blade: t => Math.min(1, .55 + t * 4) * Math.min(1, (1 - t) * 3.2)
};
const serr = (s, n, a = .2) => t => s(t) * (1 - a * ((t * n) % 1));
const lobe = (s, n, a = .5) => t => s(t) * (1 - a + a * Math.abs(Math.cos(t * Math.PI * n)));
function leafD(L, W, s, n = 22, sharp) {
  const top = [], bot = [];
  for (let i = 0; i <= n; i++) { const t = i / n, w = W * s(t); top.push([t * L, -w]); bot.push([t * L, w]); }
  bot.reverse();
  if (sharp) return 'M' + top.map(P).join('L') + 'L' + bot.map(P).join('L') + 'Z';
  return open(top) + open(bot).replace('M', 'L') + 'Z';
}
function leaf(x, y, a, L, W, s = SH.lance, o = {}) {
  const tr = T(x, y, a), d = leafD(L, W, s, o.n || 22, o.sharp);
  wash(d, o.col || G, o.op ?? .8, tr); ink(d, o.sw || .75, tr);
  if (o.rib !== false) ink(`M0 0L${f(L * .9)} 0`, .4, tr);
  if (o.veins) { let v = ''; for (let i = 1; i <= o.veins; i++) { const t = i / (o.veins + 1), w = W * s(Math.min(.95, t + .08)) * .85; v += `M${f(t * L)} 0Q${f(t * L + W * .35)} ${f(-w * .4)} ${f(t * L + W * .55)} ${f(-w)}M${f(t * L)} 0Q${f(t * L + W * .35)} ${f(w * .4)} ${f(t * L + W * .55)} ${f(w)}`; } ink(v, .35, tr); }
}
function bloom(x, y, n, L, W, s, col, op, rot = 0, o = {}) { for (let i = 0; i < n; i++) leaf(x, y, rot + i * 360 / n, L, W, s, {col, op, rib: false, sw: o.sw || .6, n: 14}); }
function floret(x, y, r, col = WT, op = 1) { bloom(x, y, 5, r, r * .55, SH.round, col, op, rnd() * 72, {sw: .4}); dot(x, y, r * .24, Y, .9); }
function hairs(q, n, len = 3, t0 = 0, t1 = 1) { let d = ''; along(q, t0, t1, n, (x, y, a, t, i) => { const r = rad(a + (i % 2 ? 60 : -60)); d += `M${f(x)} ${f(y)}l${f(Math.cos(r) * len)} ${f(Math.sin(r) * len)}`; }); ink(d, .4); }
function soil(y) { ink(`M16 ${f(y)}L184 ${f(y)}`, 1, undefined, {strokeDasharray: '0.4 4.6'}); for (let i = 0; i < 9; i++) dot(22 + i * 18 + rnd() * 8, y + 4 + rnd() * 6, .7, S, .8); }
function root(x, y, L, o = {}) {
  const n = o.n ?? 5;
  if (!o.fib) line([[x, y], [x + (rnd() - .5) * 6, y + L * .4], [x + (rnd() - .5) * 8, y + L * .75], [x + (rnd() - .5) * 4, y + L]], o.sw || 1.1);
  for (let i = 0; i < n; i++) { const t = .15 + i / n * .75, yy = y + L * t, s = i % 2 ? 1 : -1, l = (1 - t) * L * .5 + 6; line([[x, yy], [x + s * l * .5, yy + l * .25], [x + s * l, yy + l * .6]], .5); }
  if (o.fib) for (let i = 0; i < o.fib; i++) { const a = rad((i / (o.fib - 1) - .5) * 120 + 90), l = L * (.6 + rnd() * .4); line([[x, y], [x + Math.cos(a) * l * .4 + (rnd() - .5) * 6, y + Math.sin(a) * l * .5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], .5); }
}
function feather(x, y, a, L, o = {}) {
  const tr = T(x, y, a); wash(leafD(L, L * .2, SH.lance, 14), G, o.op ?? .6, tr);
  let d = `M0 0L${f(L)} 0`; const n = Math.max(4, Math.round(L / 4));
  for (let j = 1; j < n; j++) { const t = j / n, px = t * L, w = L * .22 * SH.lance(t); d += `M${f(px)} 0l${f(w * .5)} ${f(-w)}M${f(px)} 0l${f(w * .5)} ${f(w)}`; if (w > 4) d += `M${f(px + w * .25)} ${f(-w * .5)}l${f(w * .35)} ${f(-w * .15)}M${f(px + w * .25)} ${f(w * .5)}l${f(w * .35)} ${f(w * .15)}`; }
  ink(d, .5, tr);
}
function pinnate(x, y, a, L, pairs, lL, lW, s, o = {}) {
  const r = rad(a), dx = Math.cos(r), dy = Math.sin(r);
  ink(`M${f(x)} ${f(y)}l${f(dx * L)} ${f(dy * L)}`, .6);
  for (let j = 0; j < pairs; j++) { const t = .3 + .7 * j / pairs, px = x + dx * L * t, py = y + dy * L * t, z = 1 - .15 * j; [-1, 1].forEach(sg => leaf(px, py, a + sg * (o.ang || 55), lL * z, lW * z, s, o)); }
  leaf(x + dx * L, y + dy * L, a, lL * 1.1, lW * 1.05, s, o);
}
function thorn(x, y, a, s) { const r = rad(a), n = rad(a + s * 90), c = Math.cos(r), si = Math.sin(r); solid(`M${f(x - c * 2.6)} ${f(y - si * 2.6)}Q${f(x + Math.cos(n) * 2)} ${f(y + Math.sin(n) * 2)} ${f(x + Math.cos(n) * 5.5 - c * 2.5)} ${f(y + Math.sin(n) * 5.5 - si * 2.5)}L${f(x + c * 2.6)} ${f(y + si * 2.6)}Z`, D, .85); }
function bow(x, y, tail = 22) {
  leaf(x, y, -150, 14, 6, SH.round, {col: R, op: .5, rib: false}); leaf(x, y, -30, 14, 6, SH.round, {col: R, op: .5, rib: false});
  leaf(x, y, 104, tail, 3, SH.lance, {col: R, op: .5, rib: false}); leaf(x, y, 76, tail * .9, 3, SH.lance, {col: R, op: .5, rib: false});
  blob(x, y, 2.6, 2.6, R, .6, .7);
}
function mantle(cx, cy, Rr, o = {}) {
  const pts = [], N = 108, sq = .7, op = o.op ?? .8;
  for (let i = 0; i < N; i++) { const th = i / N * Math.PI * 2; let r = Rr * (1 - .085 * Math.pow(Math.abs(Math.sin(4.5 * th)), .6)); const dn = th - Math.PI / 2; r *= 1 - .3 * Math.exp(-(dn * dn) / .008); pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th) * sq]); }
  const d = closed(pts); wash(d, G, op); ink(d, .75);
  wash(ell(cx, cy - Rr * .04, Rr * .5, Rr * .5 * sq), G, op * .6);
  let v = ''; for (let j = 0; j < 9; j++) { const th = j / 9 * Math.PI * 2; v += `M${f(cx)} ${f(cy + Rr * .05)}L${f(cx + Math.cos(th) * Rr * .84)} ${f(cy + Math.sin(th) * Rr * .84 * sq)}`; } ink(v, .35);
  ink(closed(pts.filter((_, i) => i % 3 === 0).map(p => [cx + (p[0] - cx) * .55, cy + (p[1] - cy) * .55])), .3, undefined, {strokeDasharray: '1 2'});
  if (o.drop !== false) { const dr = Rr * .21; blob(cx, cy - dr * .1, dr, dr * .95, B, .22, .6); ink(`M${f(cx - dr * .6)} ${f(cy - dr * .4)}A${f(dr * .65)} ${f(dr * .65)} 0 0 1 ${f(cx - dr * .05)} ${f(cy - dr * .82)}`, .5); solid(ell(cx - dr * .32, cy - dr * .42, dr * .17, dr * .12), WT, .95); }
}
function ivy(x, y, a, Rr, o = {}) {
  const pts = []; for (let i = 0; i < 90; i++) { const th = i / 90 * Math.PI * 2, r = Rr * (1 - .36 * Math.pow(Math.abs(Math.sin(2.5 * th)), .75)); pts.push([Rr * .62 + r * Math.cos(th), r * Math.sin(th)]); }
  const tr = T(x, y, a), d = closed(pts); wash(d, G, o.op ?? .8, tr); ink(d, .7, tr);
  let v = ''; for (let j = 0; j < 5; j++) { const th = j / 5 * Math.PI * 2; v += `M0 0L${f(Rr * .62 + Rr * .82 * Math.cos(th))} ${f(Rr * .82 * Math.sin(th))}`; } ink(v, .35, tr);
}

/* ———— Major Arcana ———— */
function seedD(x, y, a, L) { const c = Math.cos(a), s = Math.sin(a), ex = x + c * L, ey = y + s * L; let d = `M${f(x)} ${f(y)}L${f(ex)} ${f(ey)}`; for (let k = -3; k <= 3; k++) { const b = a + k * .28; d += `M${f(ex)} ${f(ey)}l${f(Math.cos(b) * 5.5)} ${f(Math.sin(b) * 5.5)}`; } return d; }
function fool() {
  const q = quad([112, 276], [88, 190], [100, 100]); stem(q, 1.1);
  [[-164, 64], [-22, 68], [-136, 46], [-48, 48]].forEach(([a, L]) => leaf(112, 272, a, L, L * .17, serr(SH.lance, 6, .6), {n: 96, sharp: true}));
  const cx = 100, cy = 78; let d = '', ach = '';
  for (let i = 0; i < 50; i++) { const a = i / 50 * Math.PI * 2 + (rnd() - .5) * .06; if (a > 5.5 && a < 6.2) continue; d += seedD(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, a, 34 + rnd() * 5); ach += `M${f(cx + Math.cos(a) * 6)} ${f(cy + Math.sin(a) * 6)}l${f(Math.cos(a) * 4)} ${f(Math.sin(a) * 4)}`; }
  ink(d, .4); ink(ach, 1.1); blob(cx, cy, 6, 6, Y, .55, .7);
  let e = '', ea = ''; [[150, 36, -.5], [168, 58, -.25], [136, 16, -.8], [180, 24, -.6], [184, 86, -.05]].forEach(([x, y, a]) => { e += seedD(x, y, a, 15); ea += `M${f(x - Math.cos(a) * 4)} ${f(y - Math.sin(a) * 4)}l${f(Math.cos(a) * 4)} ${f(Math.sin(a) * 4)}`; });
  ink(e, .45); ink(ea, 1.1);
}
function magician() {
  const q = quad([100, 278], [94, 180], [100, 98]); stem(q, 1.1); hairs(q, 24, 2);
  along(q, .08, .72, 7, (x, y, a, t, i) => feather(x, y, a + (i % 2 ? 58 : -58), 50 - 36 * t));
  const top = q.at(1);
  for (let i = 0; i < 9; i++) { const u = i / 8 - .5, hx = 100 + u * 100, hy = 60 + u * u * 28; line([top, [100 + u * 44, 84], [hx, hy]], .55); for (let j = 0; j < 5; j++) floret(hx + (rnd() - .5) * 15, hy - rnd() * 9, 2.7); }
}
function priestess() {
  const q = quad([100, 280], [104, 170], [98, 24]); stem(q, 1.1);
  along(q, .08, .6, 7, (x, y, a, t, i) => leaf(x, y, a + (i % 2 ? 58 : -58), 62 - 50 * t, 10 - 5 * t, lobe(SH.lance, 2.5, .75), {n: 44, op: .75}));
  along(q, .6, .96, 9, (x, y, a, t, i) => { const s = i % 2 ? 1 : -1, L = 34 * (1 - t) + 9, b = quad([x, y], [x + s * L * .4, y - L * .2], [x + s * L * .8, y - L * .7]); stem(b, .55); along(b, .3, 1, 4, (bx, by) => blob(bx, by, 1.7, 2.3, Y, .45, .5)); });
  along(q, .92, 1, 4, (x, y) => blob(x + (rnd() - .5) * 4, y, 1.8, 2.4, Y, .45, .5));
}
function rose(x, y, L) {
  bloom(x, y, 5, L, L * .6, SH.round, R, .26, rnd() * 72, {sw: .7});
  let d = ''; for (let j = 0; j < 18; j++) { const a = j / 18 * Math.PI * 2, r = L * (.24 + rnd() * .08); d += `M${f(x)} ${f(y)}L${f(x + Math.cos(a) * r)} ${f(y + Math.sin(a) * r)}`; dot(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.1, Y, 1); }
  ink(d, .3); blob(x, y, L * .14, L * .14, Y, .6, .5);
}
function empress() {
  const q = quad([66, 282], [34, 150], [130, 64]); stem(q, 1.3);
  along(q, .08, .85, 9, (x, y, a, t, i) => thorn(x, y, a, i % 2 ? 1 : -1));
  along(q, .16, .72, 4, (x, y, a, t, i) => pinnate(x, y, a + (i % 2 ? 62 : -62), 30, 2, 15, 6.5, serr(SH.ovate, 8, .2), {n: 60, sharp: true, op: .75}));
  const b = quad(q.at(.5), [110, 150], [166, 150]); stem(b, .9); along(b, .3, .6, 2, (x, y, a) => thorn(x, y, a, 1));
  const b2 = quad(q.at(.3), [40, 170], [34, 132]); stem(b2, .8);
  rose(130, 62, 25); rose(166, 148, 19);
  blob(34, 124, 6, 9, R, .6, .7); ink('M34 115l-4 -7M34 115l-1 -8M34 115l2 -8M34 115l5 -6', .5);
}
function acorn(x, y, a) {
  const tr = T(x, y, a), nut = ell(0, 12, 7, 11); wash(nut, Y, .5, tr); ink(nut, .7, tr); ink('M0 23l0 2.5', .7, tr);
  const cup = 'M-8.5 6A8.5 6.5 0 0 1 8.5 6Q0 9.5 -8.5 6Z'; wash(cup, S, .4, tr); ink(cup, .7, tr);
  ink('M-6 3.5l2 2M-2.5 1.5l2 2M1.5 1.5l2 2M5 3.5l1.5 1.5M-4 5.5l1.5 1.5M0 4l1.5 1.5M3.5 5.5l1.5 1.5', .4, tr);
}
function emperor() {
  const q = quad([100, 282], [90, 210], [100, 132]); stem(q, 2.2); ink(q.d, .4, 'translate(2.4 0)');
  const oak = lobe(SH.obovate, 4.5, .5);
  [[-125, 84], [-55, 82], [-160, 70], [-20, 70], [-90, 98]].forEach(([a, L]) => leaf(100, 132, a, L, L * .25, oak, {n: 70, veins: 4}));
  const p = quad([100, 150], [132, 156], [140, 200]); stem(p, .8); line([p.at(.62), [128, 188], [126, 192]], .7);
  acorn(140, 200, 6); acorn(126, 192, 30);
}
function hierophant() {
  const q = quad([100, 280], [100, 180], [100, 30]); stem(q, 1.2); ink(q.d, .4, 'translate(2.2 0)');
  along(q, .08, .46, 4, (x, y, a, t, i) => { const L = 60 - 44 * t; [-1, 1].forEach(s => leaf(x, y, -90 + s * (72 - i * 6), L, L * .32, SH.ovate, {veins: 5, op: .65})); });
  along(q, .54, .98, 7, (x, y, a, t, i) => { const z = 7 - 4 * t; [-1, 1].forEach(s => { [0, 1].forEach(j => leaf(x, y, -90 + s * (32 + j * 42), z * 2.3, z * .75, SH.obovate, {col: B, op: .42, rib: false, sw: .6})); leaf(x, y, -90 + s * 100, z * 1.4, z * .4, SH.lance, {op: .8, sw: .5}); }); });
}
function myrtleFlower(x, y, r) {
  bloom(x, y, 5, r, r * .6, SH.round, WT, 1, rnd() * 72, {sw: .6});
  let d = ''; for (let j = 0; j < 24; j++) { const a = rnd() * Math.PI * 2, l = r * (.7 + rnd() * .5); d += `M${f(x)} ${f(y)}L${f(x + Math.cos(a) * l)} ${f(y + Math.sin(a) * l)}`; dot(x + Math.cos(a) * l, y + Math.sin(a) * l, .8, Y, 1); }
  ink(d, .3); dot(x, y, 1.6, Y, .9);
}
function lovers() {
  const a = quad([60, 280], [84, 170], [140, 50]), b = quad([140, 280], [116, 170], [60, 50]);
  [a, b].forEach((q, qi) => { stem(q, 1); along(q, .08, .92, 10, (x, y, an, t) => { const L = 21 - 7 * t; [-1, 1].forEach(s => leaf(x, y, an + s * 42, L, L * .32, SH.lance, {op: .8})); }); const m = q.at(.72); myrtleFlower(m[0] + (qi ? -16 : 16), m[1] + 4, 9); line([m, [m[0] + (qi ? -16 : 16), m[1] + 4]], .5); });
  myrtleFlower(140, 48, 12); myrtleFlower(60, 48, 12);
  bow(100, 144, 26);
}
function thistle(x, y, s, a = 0) {
  const tr = T(x, y, a);
  wash(leafD(28 * s, 15 * s, SH.obovate, 16), R, .3, tr + ' translate(0 ' + f(-s) + ') rotate(-90)');
  let fan = ''; for (let j = 0; j < 26; j++) { const g = rad(-90 + (j / 25 - .5) * 100); fan += `M0 ${f(-s)}l${f(Math.cos(g) * 27 * s)} ${f(Math.sin(g) * 27 * s)}`; } ink(fan, .42, tr);
  const bulb = ell(0, 10 * s, 13 * s, 12 * s); wash(bulb, G, .7, tr); ink(bulb, .75, tr);
  let d = ''; for (let r = 0; r < 4; r++) for (let j = 0; j < 5; j++) { const bx = (-9 + j * 4.5 + (r % 2) * 2.2) * s, by = (2 + r * 5) * s; if (Math.hypot(bx / (13 * s), (by - 10 * s) / (12 * s)) > .9) continue; d += `M${f(bx - 2 * s)} ${f(by)}L${f(bx)} ${f(by + 2.6 * s)}L${f(bx + 2 * s)} ${f(by)}`; } ink(d, .45, tr);
  let spn = ''; for (let j = 0; j < 13; j++) { const t = Math.PI * (-.12 + j * .1), px = Math.cos(t) * 13 * s, py = 10 * s + Math.sin(t) * 12 * s; spn += `M${f(px)} ${f(py)}l${f(Math.cos(t) * 6 * s)} ${f(Math.sin(t) * 6 * s)}`; } ink(spn, .5, tr);
}
function chariot() {
  const q = quad([100, 282], [98, 180], [100, 104]); stem(q, 1.3);
  let w = ''; along(q, .05, .85, 24, (x, y, a, t, i) => { const r = rad(a + (i % 2 ? 125 : -125)); w += `M${f(x)} ${f(y)}l${f(Math.cos(r) * 5)} ${f(Math.sin(r) * 5)}`; }); ink(w, .5);
  along(q, .1, .62, 5, (x, y, a, t, i) => leaf(x, y, a + (i % 2 ? 62 : -62), 66 - 38 * t, 11 - 4 * t, lobe(SH.lance, 3, .6), {n: 60, sharp: true}));
  const b = quad(q.at(.72), [130, 146], [146, 124]); stem(b, .8);
  thistle(100, 82, 1.15); thistle(148, 112, .55, 25);
}
function borage(x, y, L, rot) { bloom(x, y, 5, L * .55, L * .16, SH.lance, G, .8, rot - 54, {sw: .45}); bloom(x, y, 5, L, L * .4, SH.lance, B, .5, rot - 90, {sw: .6}); solid(`M${f(x - 2.4)} ${f(y)}L${f(x)} ${f(y + 5)}L${f(x + 2.4)} ${f(y)}Z`, D, .9); }
function strength() {
  const q = quad([94, 282], [78, 172], [112, 74]); stem(q, 1.4); hairs(q, 44, 3);
  [[92, 266, -162, 72], [92, 266, -18, 68], [86, 222, -150, 52], [87, 206, -28, 46]].forEach(([x, y, a, L]) => leaf(x, y, a, L, L * .3, SH.ovate, {veins: 4}));
  const tip = q.at(1);
  [[74, 82, 0], [100, 110, 20], [140, 98, -10], [152, 62, -30], [118, 46, 10]].forEach(([x, y, r]) => { line([tip, [(tip[0] + x) / 2, Math.min(tip[1], y) - 12], [x, y - 9]], .6); borage(x, y, 10, r); });
}
function hermit() {
  const q = quad([108, 284], [86, 160], [112, 22]); stem(q, 1.2);
  let sc = ''; along(q, 0, .16, 10, (x, y, a, t, i) => { const r = rad(a + (i % 2 ? 130 : -130)); sc += `M${f(x)} ${f(y)}l${f(Math.cos(r) * 4)} ${f(Math.sin(r) * 4)}`; }); ink(sc, .5);
  for (let i = 0; i < 21; i++) { const t = .12 + i * .042, p = q.at(t), a = q.ang(t), L = 56 * Math.pow(sp(Math.min(.97, t - .04)), .7) + 4; [-1, 1].forEach(s => leaf(p[0], p[1], a + s * 72, L, L * .16, lobe(SH.lance, 7, .5), {n: 80, op: .7})); }
  const cx = 46, cy = 210, spl = []; for (let i = 0; i < 70; i++) { const th = i * .15, r = 18 * Math.exp(-th * .16); spl.push([cx - Math.cos(th) * r, cy - Math.sin(th) * r]); }
  wash(ell(cx, cy - 2, 14, 14), G, .45); stem(quad([104, 284], [36, 268], [cx - 18, cy]), 1.1); ink(open(spl), 1.1);
  let sh = ''; for (let i = 4; i < 40; i += 3) { const p = spl[i]; sh += `M${f(p[0])} ${f(p[1])}l${f((cx - p[0]) * .25)} ${f((cy - p[1]) * .25)}`; } ink(sh, .4);
}
function wheel() {
  const cx = 100, cy = 128, Rr = 64;
  const ring = curve(t => { const th = Math.PI / 2 + t * Math.PI * 2 * .97; return [cx + Math.cos(th) * Rr, cy + Math.sin(th) * Rr]; });
  stem(quad([100, 282], [96, 236], [cx, cy + Rr]), 1.3); stem(ring, 1.3);
  let rts = ''; along(ring, .03, .97, 30, (x, y, a) => { const r = rad(a + 90); rts += `M${f(x)} ${f(y)}l${f(Math.cos(r) * 3)} ${f(Math.sin(r) * 3)}`; }); ink(rts, .4);
  const bt = ring.at(.5); line([bt, [cx, cy - Rr + 16], [cx, cy - 36]], .6);
  for (let j = 0; j < 7; j++) { const a = j / 7 * Math.PI * 2, bx = cx + Math.cos(a) * 8, by = cy - 30 + Math.sin(a) * 8; line([[cx, cy - 38], [bx, by]], .4); blob(bx, by, 3.4, 3.4, D, .8, .6); dot(bx - 1.1, by - 1.2, .8, WT, .95); }
  along(ring, .05, .95, 12, (x, y, a, t, i) => ivy(x, y, a + (i % 2 ? 50 : -50), 12 + (i % 3) * 2.6));
}
function spikeTiny(q) { along(q, .3, 1, 13, (x, y, a, t, i) => { const r = rad(a + (i % 2 ? 80 : -80)), px = x + Math.cos(r) * 3, py = y + Math.sin(r) * 3; if (t < .82) floret(px, py, 2.6, R, .25); else blob(px, py, 1.3, 1.8, G, .8, .45); }); }
function justice() {
  const m = quad([100, 282], [100, 210], [100, 150]); stem(m, 1.1);
  [-1, 1].forEach(s => {
    const arm = quad([100, 150], [100, 118], [100 + s * 48, 108]); stem(arm, .9);
    const spk = quad([100 + s * 48, 108], [100 + s * 52, 80], [100 + s * 50, 34]); stem(spk, .7); spikeTiny(spk);
    along(m, .12, .62, 3, (x, y, a, t, i) => leaf(x, y, -90 + s * (76 - i * 10), 46 - 24 * t, 9 - 4 * t, lobe(SH.lance, 2.5, .55), {n: 44, op: .75}));
    leaf(100 + s * 30, 113, -90 + s * 40, 18, 3.5, SH.lance, {op: .7});
  });
  const c = quad([100, 150], [100, 110], [100, 64]); stem(c, .8); spikeTiny(c);
}
function hanged() {
  const br = quad([14, 16], [100, -4], [186, 22]); stem(br, 1.7);
  for (let j = 0; j < 7; j++) { const p = br.at(.1 + j * .13), len = 200 - Math.abs(j - 3) * 34 + rnd() * 14; const tw = quad(p, [p[0] + (rnd() - .5) * 14 + (j - 3) * 4, p[1] + len * .45], [p[0] + (j - 3) * 6 + (rnd() - .5) * 10, p[1] + len]); stem(tw, .65);
    along(tw, .1, 1, Math.round(len / 18), (x, y, a, t, i) => leaf(x, y, a + (i % 2 ? 16 : -16), 30 - 8 * t, 3.4, SH.narrow, {op: .6, sw: .6})); }
}
function death() {
  const mb = quad([44, 282], [70, 170], [150, 58]), b1 = quad(mb.at(.45), [120, 172], [172, 150]), b2 = quad(mb.at(.66), [66, 112], [44, 70]);
  [mb, b1, b2].forEach((b, k) => { stem(b, k ? 1 : 1.6); along(b, k ? .06 : .25, .98, k ? 18 : 24, (x, y, a, t) => [-1, 1].forEach(s => leaf(x, y, a + s * 68, 12 - 3 * t, 1.7, SH.narrow, {sw: .5, op: .85}))); });
  [[104, 162], [150, 172], [128, 116], [60, 100]].forEach(([x, y]) => { line([[x, y - 11], [x, y - 5]], .5); blob(x, y, 5.5, 6, R, .7, .7); solid(ell(x, y + 3.2, 2.1, 1.5), D, .9); });
}
function daisy(x, y, r) { bloom(x, y, 15, r, r * .24, SH.obovate, WT, 1, rnd() * 24, {sw: .5}); blob(x, y, r * .36, r * .36, Y, .75, .6); for (let j = 0; j < 7; j++) dot(x + (rnd() - .5) * r * .4, y + (rnd() - .5) * r * .4, .6, D, .6); }
function temperance() {
  const ends = [[56, 100, 15], [98, 64, 17], [144, 90, 15], [124, 146, 11], [70, 160, 9]];
  ends.forEach(([x, y, r]) => { const q = quad([100, 282], [100 + (x - 100) * .2, 200], [x, y + r * .3]); stem(q, .8); along(q, .15, .7, 4, (px, py, a, t, i) => feather(px, py, a + (i % 2 ? 50 : -50), 30 - 16 * t, {op: .5})); });
  ends.forEach(([x, y, r]) => daisy(x, y, r));
}
function bell(x, y) {
  line([[x, y], [x + 2, y + 6], [x + 1, y + 10]], .5); const tr = T(x + 1, y + 10, 0), d = 'M-5 0C-5 9 -7 14 -9 17Q-4.5 15 0 17.5Q4.5 15 9 17C7 14 5 9 5 0Z';
  wash(d, R, .45, tr); ink(d, .7, tr); ink('M-2 1C-2 8 -3 13 -4 16M2 1C2 8 3 13 4 16', .35, tr);
  [-20, -60, -120, -160].forEach(a => leaf(x + 1, y + 11, a, 6, 2, SH.lance, {rib: false, sw: .5}));
}
function berry(x, y) { bloom(x, y + 2, 5, 10, 2.6, SH.lance, G, .8, -90 + rnd() * 20, {sw: .5}); blob(x, y - 1, 6, 6, D, .85, .7); solid(ell(x - 2, y - 3, 1.5, 1), WT, .95); }
function devil() {
  const q = quad([100, 282], [112, 180], [96, 52]); stem(q, 1.2);
  const b1 = quad(q.at(.5), [140, 138], [164, 104]), b2 = quad(q.at(.36), [62, 172], [40, 142]); stem(b1, .9); stem(b2, .9);
  [[q, .2], [q, .66], [b1, .6], [b2, .65]].forEach(([c, t], i) => { const p = c.at(t), a = c.ang(t), s = i % 2 ? 1 : -1; leaf(p[0], p[1], a + s * 64, 58 - i * 6, 19 - i * 2, SH.ovate, {veins: 4}); leaf(p[0], p[1], a - s * 64, 30, 10, SH.ovate, {veins: 2}); });
  [[q, .82], [b1, .32], [b2, .38]].forEach(([c, t]) => { const p = c.at(t); bell(p[0] + 3, p[1] + 2); });
  [q, b1, b2].forEach(c => { const p = c.at(1); berry(p[0], p[1]); });
}
function tower() {
  const q = quad([100, 282], [101, 160], [100, 22]); stem(q, 1.4); ink(q.d, .45, 'translate(2.4 0)'); hairs(q, 44, 2.5);
  along(q, .07, .82, 6, (x, y, a, t, i) => { const L = 56 - 34 * t; [-1, 1].forEach(s => { leaf(x, y, -90 + s * (76 - i * 7), L, L * .36, serr(SH.cord, 9, .3), {n: 110, sharp: true, veins: 3}); if (i > 0 && i < 5) { const c = quad([x, y], [x + s * 12, y + 4], [x + s * 15, y + 32]); stem(c, .5); along(c, .25, 1, 6, (bx, by) => blob(bx, by, 1.5, 1.5, G, .9, .4)); } }); });
  along(q, .9, .98, 2, (x, y) => [-1, 1].forEach(s => leaf(x, y, -90 + s * 30, 12, 4, serr(SH.cord, 6, .25), {n: 60, sharp: true})));
}
function star() {
  const stems = [quad([100, 272], [90, 180], [70, 62]), quad([100, 272], [106, 172], [128, 56]), quad([100, 272], [100, 160], [99, 32])];
  [[100, 264, -152, 56], [100, 264, -28, 58], [99, 248, -128, 46], [101, 246, -52, 48], [98, 230, -142, 38], [102, 228, -38, 40], [97, 212, -118, 30], [103, 210, -62, 30], [96, 196, -132, 22], [104, 194, -48, 22]].forEach(([x, y, a, L]) => leaf(x, y, a, L, L * .1, SH.lance, {rib: false}));
  stems.forEach(q => { stem(q, 1); for (let t = .76; t <= 1.001; t += .026) { const p = q.at(t), a = q.ang(t), sz = 1 - (t - .76) * 1.6; [-1, 1].forEach(s => blob(4.2 * sz, 0, 4.4 * sz, 2.5 * sz, R, .2, .7, T(p[0], p[1], a + s * 48))); } });
  ink('M100 272q-6 6 -14 7M100 272q2 7 10 9M100 272q-1 6 -3 10', .6);
}
function poppy(x, y, L) {
  bloom(x, y, 4, L, L * .62, SH.round, R, .5, 45 + rnd() * 10, {sw: .75});
  for (let j = 0; j < 4; j++) { const a = rad(45 + j * 90); solid(ell(x + Math.cos(a) * L * .22, y + Math.sin(a) * L * .22, 3.2, 3.2), D, .55); }
  for (let j = 0; j < 26; j++) { const a = j / 26 * Math.PI * 2, r = 7 + rnd() * 3; dot(x + Math.cos(a) * r, y + Math.sin(a) * r, .9, D, .85); }
  blob(x, y, 5, 5, G, .8, .7); let d = ''; for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; d += `M${f(x)} ${f(y)}l${f(Math.cos(a) * 4.6)} ${f(Math.sin(a) * 4.6)}`; } ink(d, .4);
}
function moon() {
  const s1 = quad([96, 282], [66, 170], [110, 74]), s2 = quad([96, 282], [132, 200], [150, 124]), s3 = quad([96, 282], [60, 214], [46, 152]);
  [s1, s2, s3].forEach(s => { stem(s, .9); hairs(s, 24, 2.4, .1, .95); });
  [[-160, 58], [-24, 54], [-130, 42]].forEach(([a, L]) => leaf(96, 276, a, L, L * .17, lobe(SH.lance, 3.5, .7), {n: 60}));
  line([[150, 124], [158, 108], [152, 98], [146, 102]], .9);
  const bt = T(144, 114, 20); blob(0, 0, 6, 10, G, .7, .7, bt); wash(ell(0, 6, 3, 4), R, .4, bt); hairs(curve(t => [138 + t * 12, 106 + t * 16]), 8, 2);
  const pt = T(46, 142, 0), urn = 'M-7 10C-9 2 -8 -6 0 -7C8 -6 9 2 7 10Q0 13 -7 10Z'; wash(urn, G, .6, pt); ink(urn, .7, pt);
  blob(0, -7, 8, 2.4, S, .3, .6, pt); ink('M0 -7l-7 0M0 -7l7 0M0 -7l-5 -1.7M0 -7l5 -1.7M0 -7l-5 1.7M0 -7l5 1.7', .35, pt);
  poppy(110, 66, 32);
}
function sun() {
  const q = quad([100, 282], [92, 190], [100, 98]); stem(q, 1.3); hairs(q, 20, 2);
  along(q, .08, .6, 5, (x, y, a, t, i) => leaf(x, y, a + (i % 2 ? 55 : -55), 52 - 26 * t, 11 - 4 * t, SH.obovate, {veins: 3}));
  const b = quad(q.at(.62), [134, 140], [146, 116]); stem(b, .8); bloom(146, 114, 8, 8, 2.6, SH.lance, G, .8, -90); blob(146, 111, 4, 5, Y, .5, .6);
  const x = 100, y = 84; bloom(x, y, 22, 36, 5.4, SH.obovate, Y, .45, 0, {sw: .55}); bloom(x, y, 16, 25, 5, SH.obovate, Y, .5, 8, {sw: .55}); blob(x, y, 11, 11, R, .4, .7);
  for (let j = 0; j < 28; j++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 9; dot(x + Math.cos(a) * r, y + Math.sin(a) * r, .7, D, .7); }
}
function judgement() {
  const q = quad([100, 282], [96, 214], [100, 156]); stem(q, 2); ink(q.d, .4, 'translate(2.4 0)');
  let lent = ''; along(q, .1, .9, 8, (x, y) => { lent += `M${f(x - .5)} ${f(y)}l1.6 0`; }); ink(lent, .8);
  const L1 = quad([100, 156], [70, 140], [62, 98]), R1 = quad([100, 156], [136, 146], [148, 114]); stem(L1, 1); stem(R1, 1);
  [-1, 1].forEach(s => pinnate(100, 210, -90 + s * 72, 58, 2, 22, 7, serr(SH.lance, 10, .18), {n: 80, sharp: true, op: .75, ang: 58}));
  const top = [62, 98]; for (let i = 0; i < 8; i++) { const u = i / 7 - .5, hx = 62 + u * 76, hy = 56 + u * u * 24; line([top, [62 + u * 30, 80], [hx, hy]], .55); for (let j = 0; j < 6; j++) floret(hx + (rnd() - .5) * 14, hy - rnd() * 8 + 2, 2.4); }
  const bt = [148, 114]; for (let i = 0; i < 7; i++) { const u = i / 6 - .5, ex = 148 + u * 50, ey = 164 - u * u * 20; line([bt, [148 + u * 18, 128], [ex, ey]], .5, {stroke: 'var(--ox)'}); for (let j = 0; j < 5; j++) blob(ex + (rnd() - .5) * 12, ey + (rnd() - .5) * 10, 2.6, 2.6, D, .8, .5); }
}
function world() {
  const cx = 100, cy = 136, Rr = 72;
  [-1, 1].forEach(s => {
    const br = curve(t => { const th = rad(90 - s * (8 + t * 164)); return [cx + Math.cos(th) * Rr, cy + Math.sin(th) * Rr]; }); stem(br, 1.1);
    along(br, .04, .97, 16, (x, y, a, t, i) => leaf(x, y, a + (i % 2 ? 34 : -34), 24 - 6 * t, 6.5 - 1.5 * t, SH.lance, {}));
    [[14, -8], [22, -15], [8, -14]].forEach(([dx, dy]) => { blob(cx + s * dx, cy + Rr + dy, 3.4, 3.4, D, .8, .6); dot(cx + s * dx - 1, cy + Rr + dy - 1.2, .8, WT, .95); });
  });
  bow(100, cy + Rr + 2, 40);
}

/* ———— Minor Arcana ———— */
function rosette(x, y, s, op = .8) { [[-176, 40], [-150, 46], [-124, 38], [-4, 40], [-30, 46], [-56, 38], [-102, 30], [-78, 30]].forEach(([a, L]) => leaf(x, y, a, L * s, L * s * .32, SH.ovate, {veins: 3, op})); }
function mulStalk(q, stage, z = 1) {
  stem(q, .9 * z + .3); hairs(q, 26, 2 * z, 0, .4);
  along(q, .08, .32, 3, (x, y, a, t, i) => leaf(x, y, a + (i % 2 ? 26 : -26), 30 * z * (1 - t * .8), 7 * z, SH.lance, {op: .7}));
  along(q, .36, 1, 22, (x, y, a, t, i) => {
    const s = i % 2 ? 1 : -1, off = 3.4 * z * (1.15 - t * .5), r = rad(a + s * 90), px = x + Math.cos(r) * off, py = y + Math.sin(r) * off, k = 1.15 - t * .45;
    if (stage === 'flower' && t < .86) { bloom(px, py, 5, 4.6 * z * k, 3.2 * z * k, SH.round, Y, .55, rnd() * 72, {sw: .28}); dot(px, py, .6 * z, R, .7); }
    else if (stage === 'seed') { blob(px, py, 2.1 * z * k, 3 * z * k, S, .3, .55); }
    else blob(px, py, 2.1 * z * k, 2.6 * z * k, G, .8, .5);
  });
}
function wandsPip(n) {
  const bx = 100, by = 262, spread = Math.min(96, 14 * n), z = n <= 3 ? 1 : n <= 6 ? .85 : .72;
  for (let i = 0; i < n; i++) { const dev = -spread / 2 + spread * i / (n - 1), r = rad(-90 + dev), L = 224 - Math.abs(dev) * .9; mulStalk(quad([bx, by], [bx + Math.cos(r) * L * .5, by + Math.sin(r) * L * .48], [bx + Math.cos(r) * L, by + Math.sin(r) * L]), 'flower', z); }
  rosette(bx, by, .9);
}
function wandsAce() { soil(232); root(100, 234, 50, {n: 6}); mulStalk(quad([100, 230], [96, 120], [100, 18]), 'flower', 1.3); rosette(100, 230, 1); }
function wandsCourt(rank) {
  if (rank === 'Page') { soil(206); root(100, 208, 62); leaf(100, 204, -155, 22, 9, SH.ovate); leaf(100, 204, -25, 22, 9, SH.ovate); leaf(100, 204, -104, 44, 15, SH.ovate, {veins: 3}); leaf(100, 204, -76, 40, 14, SH.ovate, {veins: 3}); }
  if (rank === 'Knight') { mulStalk(quad([100, 262], [104, 150], [160, 52]), 'bud', 1.05); rosette(100, 264, .95); }
  if (rank === 'Queen') { [-1, 1].forEach(s => mulStalk(quad([100, 236], [100 + s * 34, 190], [100 + s * 40, 104]), 'flower', .8)); mulStalk(quad([100, 262], [98, 150], [100, 20]), 'flower', 1.05); rosette(100, 264, .95); }
  if (rank === 'King') { soil(226); root(100, 228, 56, {n: 6}); [-1, 1].forEach(s => mulStalk(quad([100, 206], [100 + s * 32, 170], [100 + s * 38, 96]), 'seed', .8)); mulStalk(quad([100, 224], [100, 120], [100, 16]), 'seed', 1.05); rosette(100, 224, .85, .4); }
}
function froth(x, y, r, mode) { for (let j = 0; j < 14; j++) { const px = x + (rnd() - .5) * 2 * r, py = y + (rnd() - .5) * 1.4 * r; if (mode === 'flower') blob(px, py, 1.8, 1.8, Y, .75, .4); else if (mode === 'bud') blob(px, py, 1.4, 1.6, G, .9, .4); else dot(px, py, 1.1, S, .9); } }
function mantleStem(q, mode, z = 1) {
  stem(q, .8);
  along(q, .4, .9, 4, (x, y, a, t, i) => { const s = i % 2 ? 1 : -1, r = rad(a + s * 60), L = 22 * z * (1.2 - t * .6), ex = x + Math.cos(r) * L, ey = y + Math.sin(r) * L; line([[x, y], [(x + ex) / 2, (y + ey) / 2 - 3], [ex, ey]], .5); froth(ex, ey, 7 * z, mode); });
  const p = q.at(1); froth(p[0], p[1], 8 * z, mode);
  const m = q.at(.25); leaf(m[0], m[1], q.ang(.25) + 60, 12, 6, lobe(SH.round, 3, .3), {n: 30, op: .7});
}
const LAY = {2: [1, 1], 3: [1, 2], 4: [2, 2], 5: [2, 1, 2], 6: [2, 2, 2], 7: [2, 3, 2], 8: [3, 2, 3], 9: [3, 3, 3], 10: [3, 4, 3]};
function cupsPip(n) {
  const Rr = [0, 0, 34, 30, 28, 26, 24, 23, 22, 21, 19][n], rows = LAY[n], dy = Math.min(64, Rr * 1.25 + 20), y0 = Math.max(44, 150 - (rows.length - 1) * dy / 2 - 30), cr = [100, 266], pts = [];
  rows.forEach((k, ri) => { const sx = k >= 3 ? 2 * Rr + 6 : 2 * Rr + 24; for (let j = 0; j < k; j++) pts.push([100 + (j - (k - 1) / 2) * sx, y0 + ri * dy]); });
  pts.forEach(p => stem(quad(cr, [(cr[0] * 2 + p[0]) / 3, p[1] + (cr[1] - p[1]) * .75], [p[0], p[1] + Rr * .5]), .7));
  pts.forEach(p => mantle(p[0], p[1], Rr)); blob(100, 267, 6, 3, S, .4, .6);
}
function cupsAce() { soil(232); root(100, 234, 46, {fib: 7, n: 0}); stem(quad([100, 230], [92, 180], [100, 150]), 1); mantle(100, 112, 64); }
function cupsCourt(rank) {
  if (rank === 'Page') { soil(206); root(100, 208, 50, {fib: 6, n: 0}); leaf(100, 204, -150, 16, 8, SH.round); leaf(100, 204, -30, 16, 8, SH.round); stem(quad([100, 204], [106, 186], [112, 172]), .8); mantle(112, 160, 18); }
  if (rank === 'Knight') { mantleStem(quad([100, 262], [112, 170], [162, 76]), 'bud'); mantle(66, 234, 26); mantle(136, 240, 22); }
  if (rank === 'Queen') { mantleStem(quad([100, 262], [86, 170], [70, 70]), 'flower'); mantleStem(quad([100, 262], [110, 160], [134, 56]), 'flower'); mantle(62, 228, 28); mantle(140, 232, 26); mantle(100, 252, 20); }
  if (rank === 'King') { soil(226); root(100, 228, 50, {fib: 8, n: 0}); mantleStem(quad([100, 224], [90, 140], [78, 50]), 'seed'); mantleStem(quad([100, 224], [116, 140], [134, 62]), 'seed'); mantle(62, 206, 24, {op: .4, drop: false}); mantle(140, 210, 22, {op: .4, drop: false}); }
}
function blade(x, y, a, L, W, op = .8) { const tr = T(x, y, a), d = leafD(L, W, SH.blade, 30); wash(d, G, op, tr); ink(d, .75, tr); ink(`M${f(L * .04)} 0L${f(L * .94)} 0`, .45, tr); ink(`M${f(L * .06)} ${f(-W * .42)}L${f(L * .8)} ${f(-W * .3)}M${f(L * .06)} ${f(W * .42)}L${f(L * .8)} ${f(W * .3)}`, .3, tr); }
function rhizome(x, y, s = 1) { blob(x, y, 24 * s, 7 * s, S, .35, .8); ink(`M${f(x - 12 * s)} ${f(y - 6 * s)}q-2 6 0 12M${f(x + 2 * s)} ${f(y - 7 * s)}q-2 7 0 14M${f(x + 14 * s)} ${f(y - 6 * s)}q-2 6 0 12`, .4); for (let i = 0; i < 6; i++) { const rx = x - 18 * s + i * 7 * s; line([[rx, y + 6 * s], [rx + (rnd() - .5) * 8, y + 14 * s], [rx + (rnd() - .5) * 10, y + 22 * s]], .45); } }
function swordsFan(n, Lmax, op = .8, base = [100, 262]) {
  const spread = n === 1 ? 0 : Math.min(104, 14 + 11 * n), W = n <= 3 ? 10 : n <= 6 ? 8.5 : 7, devs = [];
  for (let i = 0; i < n; i++) devs.push(n === 1 ? 0 : -spread / 2 + spread * i / (n - 1));
  devs.sort((a, b) => Math.abs(b) - Math.abs(a)).forEach(dev => blade(base[0] + dev * .12, base[1], -90 + dev, Lmax - Math.abs(dev) * 1.05, W, op));
}
function irisFlower(x, y, s) {
  [-62, -118].forEach(a => leaf(x, y, a, 22 * s, 6.5 * s, SH.obovate, {col: Y, op: .4}));
  [28, 152].forEach(a => leaf(x, y, a, 30 * s, 11 * s, SH.obovate, {col: Y, op: .6, veins: 3}));
  leaf(x, y, -90, 16 * s, 3 * s, SH.lance, {col: Y, op: .4}); leaf(x, y, 90, 32 * s, 12 * s, SH.obovate, {col: Y, op: .65, veins: 3});
  ink(`M${f(x)} ${f(y + 4 * s)}l0 ${f(10 * s)}M${f(x - 2 * s)} ${f(y + 5 * s)}l-1 ${f(8 * s)}M${f(x + 2 * s)} ${f(y + 5 * s)}l1 ${f(8 * s)}`, .5, undefined, {stroke: 'var(--ox)'});
}
function swordsPip(n) { swordsFan(n, 226); rhizome(100, 266); }
function swordsAce() { soil(232); rhizome(100, 244, 1.1); blade(96, 232, -100, 60, 7); blade(104, 232, -80, 52, 7); blade(100, 232, -90, 214, 17); }
function swordsCourt(rank) {
  if (rank === 'Page') { soil(206); root(100, 212, 40, {fib: 6, n: 0}); blob(100, 213, 5, 3.5, S, .45, .6); blade(100, 206, -96, 62, 5); blade(101, 206, -80, 42, 4.5); }
  if (rank === 'Knight') { swordsFan(4, 170); stem(quad([100, 262], [116, 170], [150, 74]), 1); leaf(150, 76, -48, 22, 4, SH.lance, {op: .8}); leaf(150, 74, -62, 32, 5.5, SH.lance, {col: Y, op: .45}); rhizome(100, 266); }
  if (rank === 'Queen') { swordsFan(4, 176); stem(quad([100, 262], [100, 160], [100, 72]), 1.1); const b = quad([100, 150], [120, 136], [126, 112]); stem(b, .8); leaf(126, 114, -70, 24, 4.5, SH.lance, {col: Y, op: .45}); irisFlower(100, 66, 1.2); rhizome(100, 266); }
  if (rank === 'King') { soil(226); swordsFan(4, 150, .4, [100, 226]); stem(quad([100, 226], [102, 140], [100, 68]), 1); const tr = T(100, 50, 0); wash(ell(0, 0, 8, 18), G, .5, tr); ink(ell(0, 0, 8, 18), .7, tr); ink('M-3 -16Q-4 0 -3 16M3 -16Q4 0 3 16', .4, tr); ink('M-6 -14L-9 -22M6 -14L9 -22', .6, tr); [[-4, -15], [0, -17], [4, -15], [-2, -12], [2, -12]].forEach(([dx, dy]) => dot(100 + dx, 50 + dy, 1.8, S, .9)); rhizome(100, 240, 1); }
}
function pod(x, y, r, op = .14) { blob(x, y, r, r * .94, S, op, .7); ink(ell(x, y, r * .86, r * .8), .3); [[-.3, -.25], [.28, -.05], [-.05, .32]].forEach(([dx, dy]) => blob(x + dx * r, y + dy * r, r * .15, r * .11, Y, .45, .5)); ink(`M${f(x)} ${f(y - r * .94)}l0 -3`, .6); }
function heartLeaf(x, y, a, L, op = .8) { leaf(x, y, a, L, L * .42, serr(SH.cord, 8, .16), {n: 96, sharp: true, veins: 3, op}); }
function pentPip(n) {
  const r = n <= 3 ? 30 : n <= 5 ? 27 : n <= 7 ? 24 : 21, v = Math.min(50, 196 / n), y0 = 140 - (n - 1) * v / 2 - 16;
  stem(quad([100, 272], [96, 170], [100, y0 - 8]), 1); heartLeaf(100, 262, -150, 34); heartLeaf(100, 262, -30, 34);
  for (let i = 0; i < n; i++) { const s = i % 2 ? 1 : -1, y = y0 + i * v, cx = 100 + s * (r + 3); line([[100, y + r * .7 + 4], [100 + s * r * .5, y + r * 1.05], [cx, y + r * .94]], .6); pod(cx, y, r); }
}
function pentAce() { soil(232); root(100, 234, 50); stem(quad([100, 230], [98, 200], [100, 170]), 1); heartLeaf(100, 226, -150, 26); heartLeaf(100, 226, -30, 26); pod(100, 112, 58); }
function honestyFlower(x, y, s = 1) { bloom(x, y, 4, 9 * s, 5 * s, SH.obovate, R, .3, 45 + rnd() * 10); dot(x, y, 1.2 * s, Y, .9); }
function pentCourt(rank) {
  if (rank === 'Page') { soil(206); root(100, 208, 56); leaf(100, 204, -150, 15, 8, SH.round); leaf(100, 204, -30, 15, 8, SH.round); stem(quad([100, 204], [98, 184], [102, 170]), .8); heartLeaf(102, 170, -90, 28); }
  if (rank === 'Knight') { const q = quad([100, 264], [110, 170], [156, 70]); stem(q, 1); along(q, .1, .6, 4, (x, y, a, t, i) => heartLeaf(x, y, a + (i % 2 ? 60 : -60), 34 - 14 * t)); const p = q.at(1); for (let j = 0; j < 8; j++) { const bx = p[0] + (rnd() - .5) * 16, by = p[1] + (rnd() - .5) * 14; line([p, [bx, by]], .4); blob(bx, by, 2, 3, G, .85, .45); } }
  if (rank === 'Queen') { const q = quad([100, 264], [98, 170], [100, 40]); stem(q, 1); along(q, .1, .62, 4, (x, y, a, t, i) => heartLeaf(x, y, a + (i % 2 ? 60 : -60), 38 - 16 * t)); along(q, .7, 1, 7, (x, y, a, t, i) => { const s = i % 2 ? 1 : -1; line([[x, y], [x + s * 12, y - 6]], .5); honestyFlower(x + s * 13, y - 7, 1.15); }); }
  if (rank === 'King') { soil(226); root(100, 228, 56); const q = quad([100, 224], [100, 130], [100, 30]); stem(q, 1); along(q, .3, .95, 5, (x, y, a, t, i) => { const s = i % 2 ? 1 : -1; line([[x, y + 8], [x + s * 22, y + 18]], .6); pod(x + s * 24, y, 19, .1); }); }
}

/* ———— assembly ———— */
function art(fn, arg, id) {
  C = {w: [], i: []}; K = 0; seed = id * 7919 + 13; rnd(); rnd();
  fn(arg);
  return h('svg', {viewBox: '0 0 200 290', style: {display: 'block', width: '100%', height: '100%'}, 'aria-hidden': true},
    h('g', {key: 'w', filter: 'url(#hwc)'}, C.w), h('g', {key: 'i'}, C.i));
}
const MAJ = [
  ['0', 'The Fool', 'Dandelion clock', 'Taraxacum officinale', fool], ['I', 'The Magician', 'Yarrow', 'Achillea millefolium', magician],
  ['II', 'The High Priestess', 'Mugwort', 'Artemisia vulgaris', priestess], ['III', 'The Empress', 'Dog rose', 'Rosa canina', empress],
  ['IV', 'The Emperor', 'Oak', 'Quercus robur', emperor], ['V', 'The Hierophant', 'Sage', 'Salvia officinalis', hierophant],
  ['VI', 'The Lovers', 'Myrtle', 'Myrtus communis', lovers], ['VII', 'The Chariot', 'Spear thistle', 'Cirsium vulgare', chariot],
  ['VIII', 'Strength', 'Borage', 'Borago officinalis', strength], ['IX', 'The Hermit', 'Male fern', 'Dryopteris filix-mas', hermit],
  ['X', 'Wheel of Fortune', 'Ivy', 'Hedera helix', wheel], ['XI', 'Justice', 'Vervain', 'Verbena officinalis', justice],
  ['XII', 'The Hanged Man', 'White willow', 'Salix alba', hanged], ['XIII', 'Death', 'Yew', 'Taxus baccata', death],
  ['XIV', 'Temperance', 'Chamomile', 'Matricaria chamomilla', temperance], ['XV', 'The Devil', 'Deadly nightshade', 'Atropa belladonna', devil],
  ['XVI', 'The Tower', 'Stinging nettle', 'Urtica dioica', tower], ['XVII', 'The Star', 'Lavender', 'Lavandula angustifolia', star],
  ['XVIII', 'The Moon', 'Field poppy', 'Papaver rhoeas', moon], ['XIX', 'The Sun', 'Pot marigold', 'Calendula officinalis', sun],
  ['XX', 'Judgement', 'Elder', 'Sambucus nigra', judgement], ['XXI', 'The World', 'Bay laurel', 'Laurus nobilis', world]
];
const SUITS = [
  {name: 'Wands', herb: 'Great mullein', latin: 'Verbascum thapsus', folk: 'Königskerze', one: 'flowering stalk', many: 'flowering stalks', note: 'Pips are flowering stalks fanning from a woolly rosette.', pip: wandsPip, ace: wandsAce, court: wandsCourt},
  {name: 'Cups', herb: "Lady's mantle", latin: 'Alchemilla vulgaris', folk: 'Frauenmantel', one: 'cupped leaf', many: 'cupped leaves, each holding a dew drop', note: 'Pips are cupped leaves, each holding a dew drop.', pip: cupsPip, ace: cupsAce, court: cupsCourt},
  {name: 'Swords', herb: 'Yellow flag iris', latin: 'Iris pseudacorus', folk: 'Sumpf-Schwertlilie', one: 'leaf blade', many: 'sword-shaped leaf blades', note: 'Pips are sword-shaped leaf blades rising from the rhizome.', pip: swordsPip, ace: swordsAce, court: swordsCourt},
  {name: 'Pentacles', herb: 'Honesty', latin: 'Lunaria annua', folk: 'Silberblatt', one: 'seed-pod coin', many: 'round silver seed-pod coins', note: 'Pips are round silver seed-pod coins on one stem.', pip: pentPip, ace: pentAce, court: pentCourt}
];
const ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const WORD = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const STAGE = {Page: 'Seedling', Knight: 'In bud, leaning', Queen: 'In flower', King: 'In seed, with its root'};
const cards = [];
MAJ.forEach(([num, name, herb, latin, fn], i) => cards.push({i: cards.length, num, name, herb, latin, folk: '', arcana: 'Major Arcana', countLabel: 'Trump', counted: 'No. ' + i + ' of the twenty-two', major: true, art: art(fn, null, cards.length + 1)}));
SUITS.forEach(s => {
  for (let r = 1; r <= 14; r++) {
    const court = ['Page', 'Knight', 'Queen', 'King'][r - 11], id = cards.length + 1;
    const c = {i: cards.length, herb: s.herb, latin: s.latin, folk: s.folk, arcana: 'Suit of ' + s.name, major: false};
    if (r === 1) Object.assign(c, {num: 'Ace', name: 'Ace of ' + s.name, countLabel: 'Counted', counted: 'One ' + s.one + ', the root below the soil', art: art(s.ace, null, id)});
    else if (r <= 10) Object.assign(c, {num: ROM[r], name: WORD[r] + ' of ' + s.name, countLabel: 'Counted', counted: WORD[r] + ' ' + s.many, art: art(s.pip, r, id)});
    else Object.assign(c, {num: court, name: court + ' of ' + s.name, countLabel: 'Stage', counted: STAGE[court], art: art(s.court, court, id)});
    cards.push(c);
  }
});
const plates = [{eyebrow: 'Plate I', title: 'The Major Arcana', herb: 'Twenty-two herbs', latin: '', folk: '', note: 'One herb for each trump, gathered from hedgerow, wood and wall.', idx: cards.slice(0, 22).map(c => c.i)}]
  .concat(SUITS.map((s, k) => ({eyebrow: 'Plate ' + ['II', 'III', 'IV', 'V'][k], title: s.name, herb: s.herb, latin: s.latin, folk: s.folk, note: s.note + ' Aces show the root; courts are the plant growing up.', idx: cards.slice(22 + k * 14, 36 + k * 14).map(c => c.i)})));
const defs = h('svg', {width: 0, height: 0, style: {position: 'absolute'}, 'aria-hidden': true},
  h('filter', {id: 'hwc', x: '-10%', y: '-10%', width: '120%', height: '120%'},
    h('feTurbulence', {type: 'fractalNoise', baseFrequency: .05, numOctaves: 2, result: 't'}),
    h('feDisplacementMap', {in: 'SourceGraphic', in2: 't', scale: 6}),
    h('feGaussianBlur', {stdDeviation: .7})));
return {cards, plates, defs};
}
