import { useState, useRef, useMemo } from "react";
import { makeHerbCards } from "./cards.js";
import { palette } from "./theme.js";
import { numberWords } from "./moon.js";

// ══════════════════════════════════════════════════════════════
//  The Card Library: one specimen under the glass, then every
//  card pressed onto its plate. The plates are drawn once as SVG
//  strings and inked per paper into cached <img> sources.
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

const TOKENS = ["ink", "ox", "gilt", "verd", "card", "soft", "wash"];
let deck = null;
const getDeck = () => deck || (deck = makeHerbCards(strH));
const srcCache = {};

function cardSrc(c, theme) {
  const ck = theme + c.i;
  if (srcCache[ck]) return srcCache[ck];
  const v = palette(theme);
  let svg = c.art.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(">", ">" + getDeck().defs);
  TOKENS.forEach(t => { svg = svg.split("var(--" + t + ")").join(v[t]); });
  return (srcCache[ck] = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
}

const drawnTimes = n => n === 0 ? "not yet" : n === 1 ? "once" : n === 2 ? "twice" : `${numberWords(n)} times`;

function SpecRow({ label, children, italic }) {
  return (
    <div className="spec-row">
      <span className="spec-key">{label}</span>
      <span className="spec-dots" />
      <span className="spec-val" style={italic ? { fontStyle: "italic" } : undefined}>{children}</span>
    </div>
  );
}

export default function CardLibrary({ theme, meaningOf, countOf }) {
  const { cards, plates } = useMemo(getDeck, []);
  const [sel, setSel] = useState(17);
  const specRef = useRef(null);
  const n = cards.length, c = cards[sel];
  const numColor = card => card.major ? "var(--ox)" : "var(--verd)";
  const meaning = meaningOf(c.name);

  const pick = (i, scroll) => {
    setSel(i);
    const s = specRef.current;
    if (scroll && s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 24, behavior: "smooth" });
  };

  return (
    <>
      <section className="lib-hero" ref={specRef}>
        <div className="h-specimen-col">
          <div className="h-label">Specimen under the glass</div>
          <div className="h-mount">
            <div className="h-tape h-tape-tl" />
            <div className="h-tape h-tape-br" />
            <div className="lib-cq">
              <div className="lib-card lib-card-lg">
                <div className="lib-card-frame">
                  <div className="lib-card-num" style={{ color: numColor(c) }}>{c.num}</div>
                  <div className="lib-card-art"><img src={cardSrc(c, theme)} alt="" /></div>
                  <div className="lib-card-name">{c.name}</div>
                  <div className="lib-card-latin">{c.latin}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lib-label-col">
          <div className="h-label-mount">
            <div className="h-label-card">
              <div className="h-label-head">
                <span className="h-label-herb">Herb. Reading Room</span>
                <span className="h-label-no">Sheet {c.i + 1}</span>
              </div>
              <SpecRow label="Card">{c.name}</SpecRow>
              <SpecRow label="Arcana">{c.arcana}</SpecRow>
              <SpecRow label="Paired herb">{c.herb}, <i>{c.latin}</i></SpecRow>
              {c.folk && <SpecRow label="Folk name" italic>{c.folk}</SpecRow>}
              <SpecRow label={c.countLabel}>{c.counted}</SpecRow>
              <SpecRow label="In your readings">{drawnTimes(countOf(c.name))}</SpecRow>
            </div>
          </div>
          {meaning && (
            <div className="library-meanings">
              <div className="library-meaning-block">
                <span className="library-meaning-label">Upright</span>
                <p className="library-meaning-text">{meaning.up}</p>
              </div>
              <div className="library-meaning-block reversed">
                <span className="library-meaning-label">Reversed</span>
                <p className="library-meaning-text">{meaning.rev}</p>
              </div>
            </div>
          )}
          <div className="lib-step">
            <button className="lib-step-btn" onClick={() => pick((sel + n - 1) % n)}>← {cards[(sel + n - 1) % n].name}</button>
            <button className="lib-step-btn" onClick={() => pick((sel + 1) % n)}>{cards[(sel + 1) % n].name} →</button>
          </div>
        </div>
      </section>

      {plates.map(p => (
        <section key={p.title} className="lib-plate">
          <div className="lib-plate-intro">
            <div className="h-label">{p.eyebrow}</div>
            <h2 className="lib-plate-title">{p.title}</h2>
            <div className="lib-plate-herb">{p.herb}</div>
            {p.latin && <div className="lib-plate-sub">{p.latin}</div>}
            {p.folk && <div className="lib-plate-sub">{p.folk}</div>}
            <p className="lib-plate-note">{p.note}</p>
          </div>
          <div className="lib-plate-cards">
            {p.idx.map(j => {
              const pc = cards[j];
              return (
                <button key={j} className={`lib-pick ${j === sel ? "on" : ""}`} aria-label={pc.name} aria-pressed={j === sel} onClick={() => pick(j, true)}>
                  <div className="lib-card">
                    <div className="lib-card-frame">
                      <div className="lib-card-num" style={{ color: numColor(pc) }}>{pc.num}</div>
                      <div className="lib-card-art"><img src={cardSrc(pc, theme)} alt="" loading="lazy" /></div>
                      <div className="lib-card-name">{pc.name}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
