import { cardNamed } from "./deck.js";

// ══════════════════════════════════════════════════════════════
//  A paired herb for every card, read from the pressed deck so the
//  label always names the plant on the plate. Majors each have
//  their own herb; each minor suit shares one.
// ══════════════════════════════════════════════════════════════

// Botanical authority for each binomial in the deck
const AUTHORITY = {
  "Taraxacum officinale": "F.H.Wigg.",
  "Achillea millefolium": "L.",
  "Artemisia vulgaris": "L.",
  "Rosa canina": "L.",
  "Quercus robur": "L.",
  "Salvia officinalis": "L.",
  "Myrtus communis": "L.",
  "Cirsium vulgare": "(Savi) Ten.",
  "Borago officinalis": "L.",
  "Dryopteris filix-mas": "(L.) Schott",
  "Hedera helix": "L.",
  "Verbena officinalis": "L.",
  "Salix alba": "L.",
  "Taxus baccata": "L.",
  "Matricaria chamomilla": "L.",
  "Atropa belladonna": "L.",
  "Urtica dioica": "L.",
  "Lavandula angustifolia": "Mill.",
  "Papaver rhoeas": "L.",
  "Calendula officinalis": "L.",
  "Sambucus nigra": "L.",
  "Laurus nobilis": "L.",
  "Verbascum thapsus": "L.",
  "Alchemilla vulgaris": "L.",
  "Iris pseudacorus": "L.",
  "Lunaria annua": "L.",
};

export function herbFor(card) {
  const c = cardNamed(card);
  return c ? { common: c.herb, latin: c.latin, authority: AUTHORITY[c.latin] || "", folk: c.folk } : null;
}
