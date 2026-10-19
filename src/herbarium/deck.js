import { makeHerbCards } from "./cards.js";
import { palette } from "./theme.js";

// ══════════════════════════════════════════════════════════════
//  The one deck every page reads from: each card's herb, and its
//  plate inked for the current paper as a cached <img> source.
// ══════════════════════════════════════════════════════════════

const kebab = k => k.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
const esc = v => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const strH = (tag, props, ...kids) => {
  let a = "";
  for (const k in props || {}) {
    const v = props[k];
    if (k === "key" || v == null) continue;
    if (k === "style") a += ' style="' + esc(Object.keys(v).map(x => kebab(x) + ":" + v[x]).join(";")) + '"';
    else a += " " + (k === "strokeWidth" ? "stroke-width" : k) + '="' + esc(v) + '"';
  }
  return "<" + tag + a + ">" + kids.flat(Infinity).filter(x => x != null && x !== false).join("") + "</" + tag + ">";
};

export const { cards, plates, defs } = makeHerbCards(strH);
const byName = Object.fromEntries(cards.map(c => [c.name, c]));
export const cardNamed = name => byName[name] || null;

const TOKENS = ["ink", "ox", "gilt", "verd", "card", "soft", "wash"];
const srcCache = {};

export function cardSrc(c, theme) {
  const ck = theme + c.i;
  if (srcCache[ck]) return srcCache[ck];
  const v = palette(theme);
  let svg = c.art.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(">", ">" + defs);
  TOKENS.forEach(t => { svg = svg.split("var(--" + t + ")").join(v[t]); });
  return (srcCache[ck] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
}
