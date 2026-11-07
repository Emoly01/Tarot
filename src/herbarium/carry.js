// Carrying the grimoire between devices.
// Readings and journal pages live in each browser's own localStorage, so a
// phone and a desktop each keep a separate book. These helpers pack one book
// into a file and fold it into another without losing a word on either side.

const KIND = "tarot-grimoire";
const SEAM = "\n\n· · ·\n\n";

export function packGrimoire(readings, journal) {
  return JSON.stringify({ kind: KIND, version: 1, exportedAt: Date.now(), readings, journal }, null, 2);
}

export function unpackGrimoire(text) {
  const data = JSON.parse(text);
  if (!data || data.kind !== KIND || !Array.isArray(data.readings) || typeof data.journal !== "object" || !data.journal) {
    throw new Error("That file isn't a grimoire copy.");
  }
  return { readings: data.readings, journal: data.journal };
}

// Keep both texts unless one already holds the other, so importing the same
// copy twice changes nothing.
function weave(a = "", b = "") {
  const x = a.trim(), y = b.trim();
  if (!y || x.includes(y)) return a;
  if (!x || y.includes(x)) return b;
  return x + SEAM + y;
}

export function mergeGrimoire(local, incoming) {
  let addedReadings = 0, addedDays = 0, wovenDays = 0;

  const byId = new Map(local.readings.map(r => [r.id, r]));
  for (const r of incoming.readings) {
    if (!r || !r.id) continue;
    const mine = byId.get(r.id);
    if (!mine) { byId.set(r.id, r); addedReadings++; continue; }
    const notes = weave(mine.notes, r.notes);
    if (notes !== mine.notes) byId.set(r.id, { ...mine, notes });
  }
  const readings = [...byId.values()].sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const journal = { ...local.journal };
  for (const [day, page] of Object.entries(incoming.journal)) {
    if (!page) continue;
    const mine = journal[day];
    if (!mine) { journal[day] = page; addedDays++; continue; }
    const text = weave(mine.text, page.text);
    const newer = (page.updatedAt || 0) > (mine.updatedAt || 0);
    const mood = mine.mood && page.mood ? (newer ? page.mood : mine.mood) : (mine.mood || page.mood || null);
    if (text !== mine.text || mood !== mine.mood) {
      journal[day] = { ...mine, text, mood, updatedAt: Math.max(mine.updatedAt || 0, page.updatedAt || 0) };
      wovenDays++;
    }
  }

  return { readings, journal, addedReadings, addedDays, wovenDays };
}

// On phones, hand the file to the share sheet (AirDrop, Mail, Drive…);
// elsewhere, download it.
export async function sendGrimoire(text) {
  const name = `grimoire-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([text], { type: "application/json" });
  const file = typeof File === "function" ? new File([blob], name, { type: "application/json" }) : null;
  if (file && navigator.canShare?.({ files: [file] }) && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    try { await navigator.share({ files: [file], title: "Tarot grimoire" }); return "shared"; }
    catch (e) { if (e?.name === "AbortError") return "cancelled"; }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
