// ══════════════════════════════════════════════════════════════
//  Moon, calendar and wording helpers for the Herbarium theme
// ══════════════════════════════════════════════════════════════

// ── True lunar phases (Meeus, Astronomical Algorithms ch. 49) ─
const RAD = Math.PI / 180;
const sin = d => Math.sin(d * RAD);
const cos = d => Math.cos(d * RAD);

// q: 0 new, 1 first quarter, 2 full, 3 last quarter
function phaseJDE(k, q) {
  k += q / 4;
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;
  let c;
  if (q === 0 || q === 2) {
    const n = q === 0;
    c = (n ? -0.4072 : -0.40614) * sin(Mp)
      + (n ? 0.17241 : 0.17302) * E * sin(M)
      + (n ? 0.01608 : 0.01614) * sin(2 * Mp)
      + (n ? 0.01039 : 0.01043) * sin(2 * F)
      + (n ? 0.00739 : 0.00734) * E * sin(Mp - M)
      + (n ? -0.00514 : -0.00515) * E * sin(Mp + M)
      + (n ? 0.00208 : 0.00209) * E * E * sin(2 * M)
      - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F)
      + 0.00056 * E * sin(2 * Mp + M) - 0.00042 * sin(3 * Mp)
      + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F)
      - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om);
  } else {
    c = -0.62801 * sin(Mp) + 0.17172 * E * sin(M) - 0.01183 * E * sin(Mp + M)
      + 0.00862 * sin(2 * Mp) + 0.00804 * sin(2 * F) + 0.00454 * E * sin(Mp - M)
      + 0.00204 * E * E * sin(2 * M) - 0.0018 * sin(Mp - 2 * F) - 0.0007 * sin(Mp + 2 * F)
      - 0.0004 * sin(3 * Mp) - 0.00034 * E * sin(2 * Mp - M) + 0.00032 * E * sin(M + 2 * F)
      + 0.00032 * E * sin(M - 2 * F) - 0.00028 * E * E * sin(Mp + 2 * M)
      + 0.00027 * E * sin(2 * Mp + M) - 0.00017 * sin(Om);
    const W = 0.00306 - 0.00038 * E * cos(M) + 0.00026 * cos(Mp) - 0.00002 * cos(Mp - M)
      + 0.00002 * cos(Mp + M) + 0.00002 * cos(2 * F);
    c += q === 1 ? W : -W;
  }
  return jde + c;
}

const jdeToMs = jde => (jde - 2440587.5) * 864e5;

// Phase events (new, quarters, full) within ~two lunations of a date
const eventCache = new Map();
function eventsAround(date) {
  const k0 = Math.floor((date.getTime() / 864e5 / 365.25 + 1970 - 2000) * 12.3685);
  if (eventCache.has(k0)) return eventCache.get(k0);
  const ev = [];
  for (let k = k0 - 2; k <= k0 + 2; k++) for (let q = 0; q < 4; q++) ev.push({ q, t: jdeToMs(phaseJDE(k, q)) });
  ev.sort((a, b) => a.t - b.t);
  eventCache.set(k0, ev);
  return ev;
}

export const SYNODIC = 29.530589;

// Phase angle 0–360° (0 new, 180 full), interpolated between true events
export function moonAngle(date = new Date()) {
  const t = date.getTime(), ev = eventsAround(date);
  let i = ev.findIndex(e => e.t > t);
  const prev = ev[i - 1], next = ev[i];
  return (prev.q * 90 + ((t - prev.t) / (next.t - prev.t)) * 90) % 360;
}

export const litFraction = angle => (1 - cos(angle)) / 2;
export const isWaxing = angle => angle < 180;

const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const noonOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

export const PHASE_NAMES = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
// A representative angle per phase, for drawing a phase by name
export const PHASE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// Name of the moon for a calendar day: a principal phase if one falls that day,
// otherwise the crescent or gibbous in between
export function moonPhaseOfDay(date = new Date()) {
  const s = startOfDay(date).getTime(), e = s + 864e5;
  const hit = eventsAround(date).find(ev => ev.t >= s && ev.t < e);
  if (hit) return PHASE_NAMES[hit.q * 2];
  const a = moonAngle(noonOf(date));
  return PHASE_NAMES[Math.floor(a / 90) * 2 + 1];
}

export function nextFullMoon(from = new Date()) {
  const s = startOfDay(from).getTime();
  let ev = eventsAround(from).find(e => e.q === 2 && e.t >= s);
  if (!ev) ev = eventsAround(new Date(s + 20 * 864e5)).find(e => e.q === 2 && e.t >= s);
  const date = new Date(ev.t);
  return { date, name: fullMoonName(date) };
}

// Traditional names; the Harvest Moon is the full moon nearest the autumn
// equinox and the Hunter's Moon the one after it
const FULL_MOON_NAMES = ["Wolf", "Snow", "Worm", "Pink", "Flower", "Strawberry", "Buck", "Sturgeon", "Corn", "Hunter's", "Beaver", "Cold"];
function fullMoonName(date) {
  const equinox = new Date(date.getFullYear(), 8, 22, 12).getTime();
  const fulls = eventsAround(new Date(equinox)).filter(e => e.q === 2);
  const harvest = fulls.reduce((a, b) => Math.abs(b.t - equinox) < Math.abs(a.t - equinox) ? b : a);
  const day = 864e5;
  if (Math.abs(date.getTime() - harvest.t) < day) return "The Harvest Moon";
  if (Math.abs(date.getTime() - (harvest.t + SYNODIC * day)) < 2 * day) return "The Hunter's Moon";
  return `The ${FULL_MOON_NAMES[date.getMonth()]} Moon`;
}

// SVG path of the lit part of a moon disc
export function moonPath(angle, c, R) {
  const f = litFraction(angle), wax = isWaxing(angle), rx = (R * Math.abs(2 * f - 1)).toFixed(2);
  return wax
    ? `M${c} ${c - R} A${R} ${R} 0 0 1 ${c} ${c + R} A${rx} ${R} 0 0 ${f > .5 ? 1 : 0} ${c} ${c - R}Z`
    : `M${c} ${c - R} A${R} ${R} 0 0 0 ${c} ${c + R} A${rx} ${R} 0 0 ${f > .5 ? 0 : 1} ${c} ${c - R}Z`;
}

// ── Wheel of the year ────────────────────────────────────────
export const SABBATS = [
  ["Imbolc", 1, 1], ["Ostara", 2, 20], ["Beltane", 4, 1], ["Litha", 5, 21],
  ["Lammas", 7, 1], ["Mabon", 8, 22], ["Samhain", 9, 31], ["Yule", 11, 21],
];

export function dayOfYear(d) {
  return Math.round((startOfDay(d) - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1;
}

export function nextSabbat(from = new Date()) {
  const today = startOfDay(from);
  for (const y of [today.getFullYear(), today.getFullYear() + 1]) {
    for (const [name, m, d] of SABBATS) {
      const date = new Date(y, m, d);
      if (date >= today) return { name, date, days: daysBetween(today, date) };
    }
  }
}

const SEASONS = [["the spring equinox", 2, 20], ["the summer solstice", 5, 21], ["the autumn equinox", 8, 22], ["the winter solstice", 11, 21]];
export function seasonStart(from = new Date()) {
  const today = startOfDay(from);
  const all = [-1, 0].flatMap(o => SEASONS.map(([name, m, d]) => ({ name, date: new Date(today.getFullYear() + o, m, d) })));
  return all.filter(s => s.date <= today).pop();
}

export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 864e5);
}

// ── Words ────────────────────────────────────────────────────
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ORD_ONES = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
const ORD_TENS = ["", "", "twentieth", "thirtieth"];

export function numberWords(n) {
  if (n < 0 || n > 99 || !Number.isInteger(n)) return String(n);
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
}

export function ordinalWords(n) {
  if (n < 20) return ORD_ONES[n];
  return n % 10 ? TENS[Math.floor(n / 10)] + "-" + ORD_ONES[n % 10] : ORD_TENS[n / 10];
}

export function roman(n) {
  if (n === 0) return "0";
  const map = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "Monday, the nineteenth of October 2026"
export const longDate = d => `${WEEKDAYS[d.getDay()]}, the ${ordinalWords(d.getDate())} of ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
// "the twenty-sixth of September"
export const ordinalDate = d => `the ${ordinalWords(d.getDate())} of ${MONTHS[d.getMonth()]}`;
// "Sunday, the eighteenth" (month added when it isn't the current one)
export const weekdayDate = (d, now = new Date()) =>
  `${WEEKDAYS[d.getDay()]}, the ${ordinalWords(d.getDate())}` + (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear() ? ` of ${MONTHS[d.getMonth()]}` : "");
// "19.x.2026" and "26.x"
export const dotDate = d => `${d.getDate()}.${roman(d.getMonth() + 1).toLowerCase()}.${d.getFullYear()}`;
export const dotDayMonth = d => `${d.getDate()}.${roman(d.getMonth() + 1).toLowerCase()}`;
export const weekdayName = d => WEEKDAYS[d.getDay()];
