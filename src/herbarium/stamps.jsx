// ══════════════════════════════════════════════════════════════
//  Mood stamps: a ring seal per mood, inked in currentColor so the
//  page decides the colour. The "worn" filter roughens the edge and
//  drops a little ink, the way a rubber stamp does on rag paper.
// ══════════════════════════════════════════════════════════════

export const MOODS = ["Grounded", "Energized", "Emotional", "Foggy", "Restless", "Reflective", "Quiet", "Magical"];

const leaf = (x, y, a, L = 7, w = 2.6) =>
  <path d={`M0 0 C${L * .3} ${-w} ${L * .72} ${-w * .75} ${L} 0 C${L * .72} ${w * .75} ${L * .3} ${w} 0 0Z`} transform={`translate(${x} ${y}) rotate(${a})`} />;
const sparkle = (x, y, r) =>
  <path d={`M${x} ${y - r} L${x + r * .22} ${y - r * .22} L${x + r} ${y} L${x + r * .22} ${y + r * .22} L${x} ${y + r} L${x - r * .22} ${y + r * .22} L${x - r} ${y} L${x - r * .22} ${y - r * .22}Z`} fill="currentColor" stroke="none" />;

// Each glyph sits in a 48 × 48 box, centred on (24, 24), inside the ring
const GLYPHS = {
  Grounded: <>
    <path d="M24 29 L24 14" />
    {leaf(24, 25, -38)}{leaf(24, 25, -142)}{leaf(24, 19.5, -48, 6, 2.2)}{leaf(24, 19.5, -132, 6, 2.2)}
    <path d="M15 29 H33" />
    <path d="M24 29 L24 35 M24 29 Q21 31.5 18.5 33.5 M24 29 Q27 31.5 29.5 33.5" />
  </>,
  Energized: <>
    <path d="M24 12 C29 18 32 22.5 30 28.5 C28.8 32 26.4 34 24 34 C20.6 34 17.6 31.4 17.8 27.2 C18 24.4 19.6 22.4 21 20.4 C21.2 23.2 22.2 25.2 24 25.6 C25.4 22 22.4 18 24 12Z" />
    <path d="M24 34 C22 34 21 32.4 21.4 30.6 C21.8 29 23 28 23.6 26.8 C25.4 28.6 26.6 30.4 26.2 32 C25.9 33.2 25 34 24 34Z" />
  </>,
  Emotional: <>
    {[18, 24, 30].map(y => <path key={y} d={`M13 ${y} q2.75 -3.2 5.5 0 t5.5 0 t5.5 0 t5.5 0`} />)}
  </>,
  Foggy: <>
    <path d="M17.5 25 a3.6 3.6 0 0 1 2 -6.6 a5.6 5.6 0 0 1 10.6 -.8 a3.8 3.8 0 0 1 1 7.4 Z" />
    <path d="M14 29.5 H27 M30 29.5 H34 M16.5 33.5 H22 M25 33.5 H32" />
  </>,
  Restless: <>
    <path d="M27 11.5 L17.5 25.5 H23.5 L20.5 36.5 L31 21.5 H25 L28.5 11.5Z" />
  </>,
  Reflective: <>
    <path d="M27.5 13 A11 11 0 1 0 34.5 29.5 A9 9 0 0 1 27.5 13Z" />
    {sparkle(32.5, 16, 2.6)}
  </>,
  Quiet: <>
    <path d="M24 12.5 C26.2 15.6 26.8 17.8 24 19.6 C21.2 17.8 21.8 15.6 24 12.5Z" />
    <path d="M24 19.6 V22" />
    <path d="M19.5 22 H28.5 V35 H19.5Z" />
    <path d="M22 22 V25.5 Q22 27 23 27" />
    <path d="M16 35 H32" />
  </>,
  Magical: <>
    {sparkle(24, 24, 9)}
    {sparkle(16, 16, 2.8)}{sparkle(32.5, 31.5, 2.4)}
    <circle cx="31.5" cy="16.5" r=".9" fill="currentColor" stroke="none" />
  </>,
};

import { useId } from "react";

const Wear = ({ id }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4" result="warp" />
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.4" result="rough" />
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="9" result="grit" />
    <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -14 9" result="ink" />
    <feComposite in="rough" in2="ink" operator="in" />
  </filter>
);

export function MoodStamp({ mood, size = 44, worn = true, title, style }) {
  const glyph = GLYPHS[mood];
  const id = "wear" + useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}
      style={{ display: "block", flex: "none", overflow: "visible", ...style }}>
      {title && <title>{title}</title>}
      {worn && <defs><Wear id={id} /></defs>}
      <g filter={worn ? `url(#${id})` : undefined} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="21.5" strokeWidth="1.8" />
        <circle cx="24" cy="24" r="18.6" strokeWidth=".7" />
        <g strokeWidth={size < 24 ? 2.2 : 1.5}>{glyph || <circle cx="24" cy="24" r="2" fill="currentColor" />}</g>
      </g>
    </svg>
  );
}

// A little tilt per mood, so a row of stamps looks hand-pressed
export const stampTilt = mood => [-7, 5, -3, 8, -9, 4, -5, 6][MOODS.indexOf(mood)] || 0;
