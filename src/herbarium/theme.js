// ══════════════════════════════════════════════════════════════
//  Herbarium papers: "vellum" by day, "lamplit" by night
// ══════════════════════════════════════════════════════════════

const VELLUM = {
  paper: "#EAE0C6", mount: "#F3ECD9", card: "#F8F2E3", ink: "#33251A", soft: "#6A5541",
  ox: "#7B2432", verd: "#3D7264", gilt: "#9A782C", back: "#6C1F2B", eng: "#E6CE95", wash: "#A8C3A0",
  moss: "#5B6A2C", shade: "rgba(106,85,65,.26)", rule: "rgba(51,37,26,.32)", tape: "rgba(242,235,214,.62)",
  lift: "0 1px 1px rgba(51,37,26,.14), 0 12px 24px -12px rgba(51,37,26,.5)",
};
const LAMPLIT = {
  paper: "#1C1712", mount: "#2B241B", card: "#30291F", ink: "#EBE0C8", soft: "#B9A88D",
  ox: "#D46D78", verd: "#8ABFAD", gilt: "#D6B76B", back: "#521A24", eng: "#D9BF84", wash: "#4E7466",
  moss: "#B3C27A", shade: "rgba(0,0,0,.45)", rule: "rgba(235,224,200,.22)", tape: "rgba(214,200,165,.2)",
  lift: "0 1px 1px rgba(0,0,0,.5), 0 14px 28px -12px rgba(0,0,0,.85)",
};

const svgUri = s => 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
const noise = (freq, oct, rgb, alphaRow, op) => svgUri(`<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${oct}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} ${alphaRow}'/></filter><rect width='260' height='260' filter='url(#n)' opacity='${op}'/></svg>`);

// CSS custom properties plus the paper's grain, fibre and vignette
export function themeStyle(theme, texture = 1) {
  const dark = theme === "lamplit", t = texture, v = dark ? LAMPLIT : VELLUM;
  const grain = dark ? noise(.85, 3, [.95, .86, .66], "1.6 0 0 0 -0.75", .09 * t) : noise(.85, 3, [.22, .14, .07], "1.6 0 0 0 -0.6", .22 * t);
  const fib = dark ? noise(".0025 .2", 2, [.9, .8, .6], "4 0 0 0 -2.7", .08 * t) : noise(".0025 .2", 2, [.38, .27, .13], "4 0 0 0 -2.6", .2 * t);
  const vig = dark
    ? `radial-gradient(ellipse 70% 55% at 26% 14%, rgba(214,170,90,${.11 * t}), rgba(0,0,0,0) 70%), radial-gradient(ellipse 120% 90% at 50% 40%, rgba(0,0,0,0) 48%, rgba(0,0,0,${.6 * t}) 100%)`
    : `radial-gradient(ellipse 120% 90% at 50% 40%, rgba(0,0,0,0) 52%, rgba(112,72,28,${.3 * t}) 100%)`;
  const style = { backgroundImage: [vig, fib, grain].join(","), "--grain": grain, colorScheme: dark ? "dark" : "light" };
  Object.entries(v).forEach(([k, val]) => { style["--" + k] = val; });
  return { style, paper: v.paper };
}

export function initialTheme() {
  try {
    const saved = localStorage.getItem("rr-theme");
    if (saved === "vellum" || saved === "lamplit") return saved;
  } catch {}
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "lamplit" : "vellum";
}
