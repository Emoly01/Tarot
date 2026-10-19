import { useState, useEffect, useCallback, useMemo } from "react";
import "./grimoire.css";
import { moonPhaseOfDay, moonAngle, litFraction, isWaxing, nextFullMoon, nextSabbat, seasonStart, dayOfYear,
  numberWords, roman, longDate, ordinalDate, weekdayDate, dotDate, dotDayMonth, weekdayName, daysBetween } from "./herbarium/moon.js";
import { herbFor } from "./herbarium/herbs.js";
import { Fern, SuitPlate, CardBack, Tally, Wheel, MoonBig, MoonGlyph } from "./herbarium/art.jsx";
import { themeStyle, initialTheme } from "./herbarium/theme.js";

// ══════════════════════════════════════════════════════════════
//  THE READING ROOM — A Digital Grimoire
//  Wave 2: Card Pairs, Timeline, Reflection Prompts,
//          Enhanced Patterns, Polish
// ══════════════════════════════════════════════════════════════

// ── Moon Phase Calculation ───────────────────────────────────
const MOON_SYMBOLS = { "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓", "Waxing Gibbous": "🌔", "Full Moon": "🌕", "Waning Gibbous": "🌖", "Last Quarter": "🌗", "Waning Crescent": "🌘" };
function getMoonPhase(date = new Date()) {
  const name = moonPhaseOfDay(date);
  return { name, symbol: MOON_SYMBOLS[name] };
}

function getMoonDescription(phase) {
  const desc = {
    "New Moon": "beginnings · intention setting · planting seeds",
    "Waxing Crescent": "momentum · hope · emerging clarity",
    "First Quarter": "action · decisions · overcoming obstacles",
    "Waxing Gibbous": "refinement · patience · trust the process",
    "Full Moon": "illumination · culmination · release",
    "Waning Gibbous": "gratitude · sharing · integration",
    "Last Quarter": "letting go · forgiveness · re-evaluation",
    "Waning Crescent": "rest · surrender · reflection",
  };
  return desc[phase] || "";
}

// ── Reflection Prompts by Moon Phase ─────────────────────────
function getReflectionPrompts(phase) {
  const prompts = {
    "New Moon": [
      "What intention am I planting today? What do I want to grow?",
      "What am I ready to begin that I've been putting off?",
      "If I could start one thing with zero fear, what would it be?",
      "What does my intuition keep whispering about?",
    ],
    "Waxing Crescent": [
      "What small step can I take today toward what I want?",
      "Where am I already seeing signs of growth?",
      "What doubts are surfacing, and what do they need from me?",
      "What gives me hope right now?",
    ],
    "First Quarter": [
      "What obstacle is actually trying to teach me something?",
      "Where am I holding back when I need to push forward?",
      "What decision have I been avoiding?",
      "What would the bravest version of me do today?",
    ],
    "Waxing Gibbous": [
      "What needs refining before it's ready?",
      "Where am I being impatient with my own process?",
      "What have I learned in the last week that surprised me?",
      "What am I grateful for in this moment of waiting?",
    ],
    "Full Moon": [
      "What has come to fruition? What can I celebrate?",
      "What needs to be released that no longer serves me?",
      "What truth is being illuminated that I've been avoiding?",
      "If I stood fully in my power today, what would I say?",
    ],
    "Waning Gibbous": [
      "What wisdom am I carrying from this cycle?",
      "Who or what am I grateful for today?",
      "What can I share that might help someone else?",
      "What did this cycle teach me about myself?",
    ],
    "Last Quarter": [
      "What am I ready to forgive — in myself or others?",
      "What habit or pattern is it time to release?",
      "What would I do differently if I could start this cycle over?",
      "Where am I clinging to something that's already gone?",
    ],
    "Waning Crescent": [
      "What does rest look like for me today?",
      "What am I surrendering control over?",
      "What dreams have been visiting me lately?",
      "What does my body need right now that I've been ignoring?",
    ],
  };
  const list = prompts[phase] || prompts["New Moon"];
  // Pick one based on the day so it feels fresh but consistent within a day
  const today = new Date();
  const dayHash = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
  return list[dayHash % list.length];
}

// ── Full 78 card Tarot deck ──────────────────────────────────
const MAJOR_ARCANA = [
  "The Fool","The Magician","The High Priestess","The Empress","The Emperor",
  "The Hierophant","The Lovers","The Chariot","Strength","The Hermit",
  "Wheel of Fortune","Justice","The Hanged Man","Death","Temperance",
  "The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World",
];
const MINOR_ARCANA = [
  "Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands",
  "Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands",
  "Page of Wands","Knight of Wands","Queen of Wands","King of Wands",
  "Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups",
  "Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups",
  "Page of Cups","Knight of Cups","Queen of Cups","King of Cups",
  "Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords",
  "Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords",
  "Page of Swords","Knight of Swords","Queen of Swords","King of Swords",
  "Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles","Five of Pentacles",
  "Six of Pentacles","Seven of Pentacles","Eight of Pentacles","Nine of Pentacles","Ten of Pentacles",
  "Page of Pentacles","Knight of Pentacles","Queen of Pentacles","King of Pentacles",
];
const ALL_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// ── Card Meanings (short & sweet) ────────────────────────────
const CARD_MEANINGS = {
  "The Fool": { up: "New beginnings, spontaneity, a leap of faith", rev: "Recklessness, fear of the unknown, holding back" },
  "The Magician": { up: "Willpower, manifestation, resourcefulness", rev: "Manipulation, untapped potential, trickery" },
  "The High Priestess": { up: "Intuition, mystery, the subconscious mind", rev: "Secrets withheld, disconnection from intuition" },
  "The Empress": { up: "Abundance, nurturing, sensuality, creation", rev: "Neglect, creative block, dependence" },
  "The Emperor": { up: "Authority, structure, stability, control", rev: "Rigidity, tyranny, lack of discipline" },
  "The Hierophant": { up: "Tradition, spiritual guidance, conformity", rev: "Rebellion, subversion, new approaches" },
  "The Lovers": { up: "Love, union, choices, alignment of values", rev: "Disharmony, misalignment, difficult choices" },
  "The Chariot": { up: "Determination, willpower, victory through focus", rev: "Lack of direction, aggression, losing control" },
  "Strength": { up: "Inner strength, courage, patience, compassion", rev: "Self-doubt, weakness, insecurity" },
  "The Hermit": { up: "Solitude, soul-searching, inner guidance", rev: "Isolation, loneliness, withdrawal" },
  "Wheel of Fortune": { up: "Cycles, fate, a turning point, luck", rev: "Resistance to change, bad luck, broken cycles" },
  "Justice": { up: "Fairness, truth, cause and effect, clarity", rev: "Injustice, dishonesty, avoiding accountability" },
  "The Hanged Man": { up: "Surrender, new perspective, letting go", rev: "Stalling, resistance, unnecessary sacrifice" },
  "Death": { up: "Transformation, endings that bring beginnings", rev: "Resisting change, stagnation, fear of letting go" },
  "Temperance": { up: "Balance, moderation, patience, harmony", rev: "Imbalance, excess, lack of patience" },
  "The Devil": { up: "Shadow self, attachment, bondage, temptation", rev: "Breaking free, reclaiming power, release" },
  "The Tower": { up: "Sudden upheaval, revelation, necessary destruction", rev: "Averting disaster, fear of change, delaying the inevitable" },
  "The Star": { up: "Hope, renewal, serenity, inspiration", rev: "Despair, disconnection, lack of faith" },
  "The Moon": { up: "Illusion, intuition, the unconscious, fear", rev: "Clarity emerging, releasing fear, truth revealed" },
  "The Sun": { up: "Joy, success, vitality, confidence", rev: "Dimmed joy, temporary setbacks, inner child wounded" },
  "Judgement": { up: "Reflection, reckoning, inner calling, absolution", rev: "Self-doubt, refusal of the call, harsh self-judgement" },
  "The World": { up: "Completion, integration, accomplishment, wholeness", rev: "Incompletion, shortcuts, delayed closure" },
  // Wands
  "Ace of Wands": { up: "Inspiration, new creative spark, potential", rev: "Delays, lack of motivation, missed opportunity" },
  "Two of Wands": { up: "Planning, future vision, decisions ahead", rev: "Fear of the unknown, lack of planning" },
  "Three of Wands": { up: "Expansion, foresight, momentum building", rev: "Delays, frustration, playing it too safe" },
  "Four of Wands": { up: "Celebration, home, harmony, milestones", rev: "Lack of support, instability, feeling unwelcome" },
  "Five of Wands": { up: "Conflict, competition, tension, growing pains", rev: "Avoiding conflict, inner turmoil, resolution" },
  "Six of Wands": { up: "Victory, recognition, pride, progress", rev: "Self-doubt despite success, fall from grace" },
  "Seven of Wands": { up: "Perseverance, defending your ground, courage", rev: "Overwhelm, giving up, feeling outnumbered" },
  "Eight of Wands": { up: "Speed, momentum, swift action, travel", rev: "Delays, frustration, scattered energy" },
  "Nine of Wands": { up: "Resilience, persistence, last stand, grit", rev: "Exhaustion, stubbornness, paranoia" },
  "Ten of Wands": { up: "Burden, responsibility, hard work, near the end", rev: "Release, delegation, refusing to carry it all" },
  "Page of Wands": { up: "Enthusiasm, exploration, new ventures", rev: "Lack of direction, procrastination, restlessness" },
  "Knight of Wands": { up: "Action, adventure, impulsiveness, passion", rev: "Haste, recklessness, scattered energy" },
  "Queen of Wands": { up: "Confidence, warmth, fierce independence", rev: "Jealousy, insecurity, demanding nature" },
  "King of Wands": { up: "Leadership, vision, bold action, charisma", rev: "Impulsiveness, arrogance, ruthlessness" },
  // Cups
  "Ace of Cups": { up: "New love, emotional awakening, compassion", rev: "Blocked emotions, emptiness, repressed feelings" },
  "Two of Cups": { up: "Partnership, mutual attraction, connection", rev: "Imbalance in relationship, miscommunication" },
  "Three of Cups": { up: "Friendship, celebration, community, joy", rev: "Overindulgence, gossip, isolation" },
  "Four of Cups": { up: "Apathy, contemplation, missed opportunities", rev: "Renewed interest, awareness, accepting help" },
  "Five of Cups": { up: "Grief, loss, regret, focusing on what's gone", rev: "Acceptance, moving on, finding what remains" },
  "Six of Cups": { up: "Nostalgia, innocence, reunion, childhood", rev: "Living in the past, naivety, outgrowing" },
  "Seven of Cups": { up: "Fantasy, illusion, many choices, wishful thinking", rev: "Clarity, making a choice, grounding" },
  "Eight of Cups": { up: "Walking away, disillusionment, seeking deeper meaning", rev: "Avoidance, fear of moving on, stagnation" },
  "Nine of Cups": { up: "Contentment, satisfaction, wishes fulfilled", rev: "Greed, dissatisfaction despite having enough" },
  "Ten of Cups": { up: "Emotional fulfillment, family, lasting happiness", rev: "Broken home, misaligned values, disconnection" },
  "Page of Cups": { up: "Creative messages, intuition, gentle spirit", rev: "Emotional immaturity, escapism, insecurity" },
  "Knight of Cups": { up: "Romance, charm, following the heart", rev: "Moodiness, unrealistic expectations, jealousy" },
  "Queen of Cups": { up: "Compassion, emotional depth, intuitive healer", rev: "Martyrdom, co-dependence, emotional overwhelm" },
  "King of Cups": { up: "Emotional maturity, calm authority, diplomacy", rev: "Emotional manipulation, coldness, volatility" },
  // Swords
  "Ace of Swords": { up: "Clarity, breakthrough, new idea, truth", rev: "Confusion, misinformation, mental fog" },
  "Two of Swords": { up: "Difficult decision, avoidance, stalemate", rev: "Indecision broken, seeing the truth, overwhelm" },
  "Three of Swords": { up: "Heartbreak, grief, sorrow, painful truth", rev: "Healing, forgiveness, releasing pain" },
  "Four of Swords": { up: "Rest, recovery, contemplation, retreat", rev: "Restlessness, burnout, refusing to rest" },
  "Five of Swords": { up: "Conflict, defeat, winning at a cost", rev: "Reconciliation, making amends, moving past" },
  "Six of Swords": { up: "Transition, moving on, leaving difficulty behind", rev: "Resistance to change, unfinished business" },
  "Seven of Swords": { up: "Deception, strategy, getting away with something", rev: "Coming clean, conscience, being caught" },
  "Eight of Swords": { up: "Restriction, trapped thinking, self-imposed limits", rev: "Freedom, new perspective, breaking free" },
  "Nine of Swords": { up: "Anxiety, nightmares, worry, despair", rev: "Hope, recovery, reaching out for help" },
  "Ten of Swords": { up: "Rock bottom, painful ending, betrayal — but it's over", rev: "Recovery, surviving the worst, rising" },
  "Page of Swords": { up: "Curiosity, mental agility, new ideas", rev: "Gossip, hasty communication, scattered thoughts" },
  "Knight of Swords": { up: "Ambition, fast action, determination", rev: "Recklessness, impatience, burnout" },
  "Queen of Swords": { up: "Clear boundaries, independence, sharp perception", rev: "Coldness, bitterness, overly critical" },
  "King of Swords": { up: "Intellectual authority, truth, clear judgement", rev: "Manipulation, cruelty, abuse of power" },
  // Pentacles
  "Ace of Pentacles": { up: "New opportunity, prosperity, potential", rev: "Missed chance, poor planning, scarcity mindset" },
  "Two of Pentacles": { up: "Balance, adaptability, juggling priorities", rev: "Overwhelm, imbalance, dropping the ball" },
  "Three of Pentacles": { up: "Teamwork, collaboration, skill, craft", rev: "Lack of teamwork, poor quality, disharmony" },
  "Four of Pentacles": { up: "Security, control, holding on tight", rev: "Greed, materialism — or finally letting go" },
  "Five of Pentacles": { up: "Hardship, loss, isolation, worry", rev: "Recovery, finding help, turning a corner" },
  "Six of Pentacles": { up: "Generosity, charity, giving and receiving", rev: "Strings attached, power imbalance, selfishness" },
  "Seven of Pentacles": { up: "Patience, long-term investment, assessment", rev: "Impatience, poor returns, wasted effort" },
  "Eight of Pentacles": { up: "Skill-building, diligence, dedication to craft", rev: "Perfectionism, lack of focus, shortcuts" },
  "Nine of Pentacles": { up: "Self-sufficiency, luxury earned, independence", rev: "Over-investment in work, financial setback" },
  "Ten of Pentacles": { up: "Legacy, wealth, family, long-term security", rev: "Financial failure, family disputes, instability" },
  "Page of Pentacles": { up: "Ambition, new study, diligent planning", rev: "Procrastination, lack of progress, unfocused" },
  "Knight of Pentacles": { up: "Reliability, hard work, steady progress", rev: "Stubbornness, boredom, stagnation" },
  "Queen of Pentacles": { up: "Nurturing abundance, practical warmth, home", rev: "Neglecting self-care, smothering, imbalance" },
  "King of Pentacles": { up: "Wealth, security, discipline, provider", rev: "Greed, workaholism, materialism over meaning" },
};

function getCardMeaning(card, reversed) {
  const m = CARD_MEANINGS[card];
  if (!m) return null;
  return reversed ? m.rev : m.up;
}

// ── Spread definitions ───────────────────────────────────────
const SPREADS = {
  single: { id: "single", label: "Single Card", positions: ["The Card"] },
  three: { id: "three", label: "Three Card", positions: ["Past", "Present", "Future"] },
  cross: {
    id: "cross", label: "Celtic Cross",
    positions: ["Present","Challenge","Foundation","Past","Crown","Future","Self","Environment","Hopes & Fears","Outcome"],
  },
};

// ── Utility ──────────────────────────────────────────────────
function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function formatDateShort(ts) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function formatMonthYear(ts) {
  return new Date(ts).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
function toDateKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}
function suitSymbol(card) {
  if (MAJOR_ARCANA.includes(card)) return "✶";
  if (card.includes("Wands")) return "🜂";
  if (card.includes("Cups")) return "🜄";
  if (card.includes("Swords")) return "🜁";
  if (card.includes("Pentacles")) return "🜃";
  return "·";
}
function suitOf(card) {
  if (MAJOR_ARCANA.includes(card)) return "Major";
  if (card.includes("Wands")) return "Wands";
  if (card.includes("Cups")) return "Cups";
  if (card.includes("Swords")) return "Swords";
  if (card.includes("Pentacles")) return "Pentacles";
  return null;
}
const SUIT_COLORS = { Major: "var(--ox)", Wands: "var(--gilt)", Cups: "var(--verd)", Swords: "var(--ink)", Pentacles: "var(--moss)" };
function suitColor(card) {
  return SUIT_COLORS[suitOf(card)] || "var(--soft)";
}
// Numeral for the top of a card face: Roman for the Major Arcana and pips, the rank for courts
const PIP_RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
function cardNumeral(card) {
  const major = MAJOR_ARCANA.indexOf(card);
  if (major >= 0) return roman(major);
  const rank = card.split(" of ")[0];
  const pip = PIP_RANKS.indexOf(rank);
  return pip >= 0 ? roman(pip + 1) : rank;
}

// ── Card of the Day ──────────────────────────────────────────
function drawCardOfDay() {
  const today = toDateKey(new Date());
  // Use a proper mixing function to avoid clustering
  let h = 0x9e3779b9;
  for (let i = 0; i < today.length; i++) {
    h = Math.imul(h ^ today.charCodeAt(i), 0x5bd1e995);
    h ^= h >>> 15;
  }
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
  h ^= h >>> 15;
  const cardHash = Math.abs(h) % ALL_CARDS.length;
  // Second round for reversal — independent from card selection
  let h2 = Math.imul(h ^ 0xdeadbeef, 0x41c6ce57);
  h2 ^= h2 >>> 15;
  const reversed = (Math.abs(h2) % 3) === 0; // ~33% chance
  return { card: ALL_CARDS[cardHash], reversed };
}

// ── Card autocomplete ────────────────────────────────────────
function CardInput({ value, reversed, onChange, onReversedChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const matches = query.length > 0
    ? ALL_CARDS.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  const select = (card) => { setQuery(card); onChange(card); setOpen(false); };
  useEffect(() => { setQuery(value || ""); }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <input
          className="card-input"
          value={query}
          placeholder={placeholder || "Card name..."}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
        <label className="rev-label" title="Reversed">
          <input type="checkbox" checked={reversed} onChange={e => onReversedChange(e.target.checked)} style={{ display: "none" }} />
          <span className={`rev-toggle ${reversed ? "active" : ""}`}>↓ Rev</span>
        </label>
      </div>
      {open && matches.length > 0 && (
        <div className="card-dropdown">
          {matches.map(c => (
            <div key={c} className="card-option" onMouseDown={() => select(c)}>
              <span style={{ color: suitColor(c), marginRight: "0.4rem", fontSize: "0.8rem" }}>{suitSymbol(c)}</span>
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Celtic Cross Spatial Layout ──────────────────────────────
function CelticCrossLayout({ cards, getCardHistory }) {
  const renderCard = (idx) => {
    const c = cards[idx];
    if (!c || !c.card) return null;
    const count = getCardHistory ? getCardHistory(c.card) : 0;
    const meaning = getCardMeaning(c.card, c.reversed);
    return (
      <div className="cross-card-spatial" style={{ "--suit-color": suitColor(c.card) }}>
        <span className="cross-position-label">{c.position}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span className="cross-suit-sym" style={{ color: suitColor(c.card) }}>{suitSymbol(c.card)}</span>
          <span className={`cross-card-name ${c.reversed ? "reversed" : ""}`}>
            {c.card}
            {c.reversed && <span className="reversed-tag-sm">rev</span>}
          </span>
        </div>
        {meaning && <span className="cross-meaning">{meaning}</span>}
        {count > 1 && <span className="cross-whisper">appeared {count}×</span>}
      </div>
    );
  };

  return (
    <div className="celtic-cross-container">
      <div className="celtic-cross-grid">
        <div className="cross-section">
          <div className="cross-pos crown">{renderCard(4)}</div>
          <div className="cross-pos past">{renderCard(3)}</div>
          <div className="cross-pos center">
            {renderCard(0)}
            <div className="cross-challenge-overlay">{renderCard(1)}</div>
          </div>
          <div className="cross-pos future">{renderCard(5)}</div>
          <div className="cross-pos foundation">{renderCard(2)}</div>
        </div>
        <div className="staff-section">
          {renderCard(9)}
          {renderCard(8)}
          {renderCard(7)}
          {renderCard(6)}
        </div>
      </div>
    </div>
  );
}

// ── Moon Phase Badge ─────────────────────────────────────────
function MoonBadge({ timestamp, size = "sm" }) {
  const date = new Date(timestamp);
  const phase = getMoonPhase(date);
  const isSm = size === "sm";
  return (
    <span className={`moon-badge ${isSm ? "moon-sm" : "moon-lg"}`} title={phase.name}>
      <MoonGlyph angle={moonAngle(date)} title={phase.name} size={isSm ? 13 : 17} />
      {!isSm && <span className="moon-name">{phase.name}</span>}
    </span>
  );
}

// ── Tag Input ────────────────────────────────────────────────
const DEFAULT_TAGS = ["shadow work","love","career","guidance","spiritual","health","creative","relationship","decision","reflection"];

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = DEFAULT_TAGS.filter(t => !tags.includes(t) && t.includes(input.toLowerCase())).slice(0, 5);

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) { onChange([...tags, t]); }
    setInput(""); setShowSuggestions(false);
  };

  return (
    <div className="tag-input-wrap">
      <div className="tags-display">
        {tags.map(t => (
          <span key={t} className="tag-pill">
            {t}
            <span className="tag-remove" onClick={() => onChange(tags.filter(x => x !== t))}>×</span>
          </span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <input
          className="card-input"
          value={input}
          placeholder={tags.length ? "add tag..." : "add tags (e.g. shadow work, love, career)..."}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={e => { if (e.key === "Enter" && input.trim()) { e.preventDefault(); addTag(input); } }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="card-dropdown">
            {suggestions.map(s => (
              <div key={s} className="card-option" onMouseDown={() => addTag(s)}>
                <span style={{ color: "var(--verd)", marginRight: "0.4rem", fontSize: "0.7rem" }}>◆</span>{s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Home: the Herbarium folio ────────────────────────────────
const REGISTER_SPREADS = { single: "Single draw", three: "Three-card", cross: "Celtic Cross" };
const COLLECTOR = "E.";

const sentenceCase = s => s.charAt(0) + s.slice(1).toLowerCase();
const lowerFirst = s => s.charAt(0).toLowerCase() + s.slice(1);
// "the Star", "Strength", "the Six of Cups"
function theCard(card, capital = false) {
  const the = capital ? "The" : "the";
  if (MAJOR_ARCANA.includes(card)) return card.startsWith("The ") ? the + card.slice(3) : card;
  return `${the} ${card}`;
}
function underMoon(phase) {
  if (phase === "New Moon" || phase === "Full Moon") return `under the ${phase.toLowerCase()}`;
  if (phase.endsWith("Quarter")) return `under the ${phase.toLowerCase().replace(" ", "-")} moon`;
  return `under a ${phase.toLowerCase()}${phase.endsWith("Gibbous") ? " moon" : ""}`;
}
const inNights = n => n === 0 ? "tonight" : n === 1 ? "tomorrow night" : `in ${numberWords(n)} nights`;

function freshCotd(dateKey) {
  const draw = drawCardOfDay();
  return { date: dateKey, card: draw.card, reversed: draw.reversed, faceDown: true, revealed: false, physical: false, musing: "" };
}
function loadCotd(dateKey) {
  try {
    const saved = JSON.parse(localStorage.getItem("rr-cotd") || "null");
    if (saved?.date === dateKey) return saved;
  } catch {}
  return freshCotd(dateKey);
}

function SectionLabel({ children, style }) {
  return <div className="h-label" style={style}>{children}</div>;
}

function LabelRow({ label, children, script }) {
  return (
    <div className="spec-row">
      <span className="spec-key">{label}</span>
      <span className="spec-dots" />
      <span className={script ? "spec-val script" : "spec-val"}>{children}</span>
    </div>
  );
}

function HerbariumHome({ readings, journal, cardPairs, onLog, onUpdateNotes, onTodayText, onOpenReading, onNavigate }) {
  const now = new Date();
  const todayKey = toDateKey(now);
  const [stored, setStored] = useState(() => loadCotd(todayKey));
  const [pulling, setPulling] = useState(false);
  const [pullText, setPullText] = useState("");
  const cotd = stored.date === todayKey ? stored : freshCotd(todayKey);
  const setCotd = patch => setStored(prev => {
    const next = { ...(prev.date === todayKey ? prev : freshCotd(todayKey)), ...patch };
    try { localStorage.setItem("rr-cotd", JSON.stringify(next)); } catch {}
    return next;
  });

  // Once today's card is in the register, the register is the source of truth
  const logged = readings.find(r => r.isCardOfDay && toDateKey(new Date(r.ts)) === todayKey);
  const card = logged ? logged.cards[0].card : cotd.card;
  const reversed = logged ? logged.cards[0].reversed : cotd.reversed;
  const revealed = cotd.revealed || !!logged;
  const faceDown = logged && !cotd.revealed ? false : cotd.faceDown;
  const musing = logged ? logged.notes || "" : cotd.musing;
  const herb = herbFor(card);
  const meanings = CARD_MEANINGS[card];
  const numeral = cardNumeral(card);

  const pullCard = (val) => {
    setPullText(val);
    if (ALL_CARDS.includes(val)) {
      setCotd({ card: val, physical: true, faceDown: false, revealed: true });
      setPulling(false); setPullText("");
    }
  };
  const record = () => onLog({ card, reversed, notes: musing.trim() });

  // Last time this card turned up
  const prior = readings.find(r => r !== logged && r.cards.some(c => c.card === card));
  let lastVisit = `${theCard(card, true)} has not visited you before. A first meeting.`;
  if (prior) {
    const d = new Date(prior.ts), other = prior.cards.find(c => c.card && c.card !== card);
    lastVisit = `${theCard(card, true)} last visited you on ${ordinalDate(d)}, ${underMoon(moonPhaseOfDay(d))}` +
      (other ? `, beside ${theCard(other.card)}.` : ".");
  }

  // Sky
  const angle = moonAngle(now), moonName = moonPhaseOfDay(now), moonPct = Math.round(litFraction(angle) * 100);
  const fullMoon = nextFullMoon(now), fullIn = daysBetween(now, fullMoon.date);
  const sabbat = nextSabbat(now);
  const doy = dayOfYear(now);

  // Daily page: the most recent earlier entry, and today's
  const prevKey = Object.keys(journal).filter(k => k < todayKey && journal[k].text?.trim()).sort().pop();
  const prevDate = prevKey && new Date(prevKey + "T12:00:00");
  const prevText = prevKey && journal[prevKey].text.trim();

  // Patterns since the turn of the season
  const season = seasonStart(now);
  const seasonCards = readings.filter(r => r.ts >= season.date.getTime()).flatMap(r => r.cards.filter(c => c.card).map(c => c.card));
  const suitRows = [["Major Arcana", "Major"], ["Cups", "Cups"], ["Wands", "Wands"], ["Swords", "Swords"], ["Pentacles", "Pentacles"]]
    .map(([name, key]) => ({ name, n: seasonCards.filter(c => suitOf(c) === key).length, color: key === "Major" ? "var(--ox)" : "var(--ink)" }));
  const topPair = cardPairs[0];
  let pairNote = null;
  if (topPair) {
    const [c1, c2] = topPair[0].split(" ⟷ ");
    const together = readings.filter(r => r.cards.some(c => c.card === c1) && r.cards.some(c => c.card === c2)).map(r => r.ts);
    const weeks = Math.round((Math.max(...together) - Math.min(...together)) / (7 * 864e5));
    const kw = c => lowerFirst(CARD_MEANINGS[c]?.up.split(",")[0] || c);
    pairNote = { c1, c2, text: `${numberWords(topPair[1])} readings ${weeks > 1 ? `in ${numberWords(weeks)} weeks` : "within a week or two"}: ${kw(c1)} keeps arriving with ${kw(c2)}` };
  }

  return (
    <>
      <section className="h-hero">
        {/* ── I · Specimen of the day ── */}
        <div className="h-specimen-col" id="specimen">
          <SectionLabel>I · Specimen of the day</SectionLabel>
          <div className="h-mount">
            <div className="h-tape h-tape-tl" />
            <div className="h-tape h-tape-br" />
            <button onClick={() => setCotd({ faceDown: !faceDown, revealed: true })} aria-label={faceDown ? "Turn the card over" : "Turn the card face down"} className="h-flip">
              <div className="h-flip-inner" style={{ transform: `rotateY(${faceDown ? 180 : 0}deg) rotateZ(${reversed && !faceDown ? 180 : 0}deg)` }}>
                <div className="h-face">
                  <div className="h-face-frame">
                    <div className="h-face-numeral">{numeral}</div>
                    <div className="h-face-art"><SuitPlate suit={suitOf(card)} /></div>
                    <div className="h-face-name">{card}</div>
                    {herb && <div className="h-face-latin">{herb.latin}</div>}
                  </div>
                </div>
                <div className="h-back"><CardBack /></div>
              </div>
            </button>
          </div>
          <div className="h-caption">Touch the card to turn it {faceDown ? "over" : "face down"}</div>
          {!logged && (pulling ? (
            <div className="h-pull">
              <CardInput value={pullText} reversed={reversed} onChange={pullCard} onReversedChange={v => setCotd({ reversed: v })} placeholder="the card you drew…" />
              <button className="h-quiet-link" onClick={() => { setPulling(false); setPullText(""); }}>never mind</button>
            </div>
          ) : cotd.physical ? (
            <button className="h-quiet-link" onClick={() => setCotd({ ...freshCotd(todayKey), faceDown: false, revealed: true, musing: cotd.musing })}>return to the grimoire's draw</button>
          ) : (
            <button className="h-quiet-link" onClick={() => setPulling(true)}>or enter a card from your own deck</button>
          ))}
        </div>

        <div className="h-label-col">
          <div className="h-label-mount">
            <div className="h-label-card">
              <div className="h-label-head">
                <span className="h-label-herb">Herb. Reading Room</span>
                <span className="h-label-no">No. {doy}</span>
              </div>
              {revealed ? (
                <>
                  <LabelRow label="Card">{MAJOR_ARCANA.includes(card) ? `${card}, ${numeral}` : card}</LabelRow>
                  <LabelRow label="Position">{reversed ? "Reversed" : "Upright"}</LabelRow>
                  {herb && <LabelRow label="Paired herb">{herb.common}, <i>{herb.latin}</i> {herb.authority}</LabelRow>}
                </>
              ) : (
                <>
                  <LabelRow label="Card"><i className="soft">not yet turned</i></LabelRow>
                  <LabelRow label="Position"><i className="soft">face down</i></LabelRow>
                  <LabelRow label="Paired herb"><i className="soft">under the card</i></LabelRow>
                </>
              )}
              <LabelRow label="Moon">{sentenceCase(moonName)}, {moonPct}% lit</LabelRow>
              <LabelRow label="Leg." script>{COLLECTOR}</LabelRow>
              <LabelRow label="Det." script>your own gut</LabelRow>
              <div className="h-label-date">{dotDate(now)}</div>
            </div>
          </div>

          {revealed && meanings ? (
            <div className="h-orient">
              {[[false, "Upright", meanings.up], [true, "Reversed", meanings.rev]].map(([rev, label, text]) => (
                <button key={label} onClick={() => !logged && setCotd({ reversed: rev })} disabled={!!logged}
                  className={`h-orient-btn ${reversed === rev ? "on" : ""}`} aria-pressed={reversed === rev}>
                  <div className="h-orient-label">{label}</div>
                  <div className="h-orient-text">{lowerFirst(text)}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="h-note">The meanings wait under the card. Turn it when you're ready.</p>
          )}

          {revealed && <p className="h-note">{lastVisit}</p>}

          <label className="h-lined-label">
            <SectionLabel>Musing</SectionLabel>
            <textarea className="h-lined" rows={3} value={musing} placeholder={`what ${revealed ? theCard(card) : "the card"} stirred in you…`}
              onChange={e => logged ? onUpdateNotes(logged.id, e.target.value) : setCotd({ musing: e.target.value })} />
          </label>
          {revealed && (logged ? (
            <div className="h-entered">
              Entered in the register at {new Date(logged.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.{" "}
              <button className="h-link" onClick={() => onOpenReading(logged)}>see the entry →</button>
            </div>
          ) : (
            <button className="h-record" onClick={record}>Enter in the register</button>
          ))}
        </div>
      </section>

      {/* ── The sky ── */}
      <section className="h-sky">
        <div className="h-sky-cell" style={{ flex: "1 1 280px", gap: 20 }}>
          <div style={{ width: 84, flex: "none" }}><MoonBig angle={angle} /></div>
          <div>
            <div className="h-label sm">Tonight's moon</div>
            <div className="h-sky-big">{sentenceCase(moonName)}</div>
            <div className="h-sky-sub">{moonPct}% lit, {isWaxing(angle) ? "waxing" : "waning"}</div>
          </div>
        </div>
        <div className="h-sky-cell" style={{ flex: "1 1 220px", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
          <div className="h-label sm">Next full moon</div>
          <div className="h-sky-big">{fullMoon.name}</div>
          <div className="h-sky-sub">{weekdayName(fullMoon.date)}, {dotDayMonth(fullMoon.date)} · {inNights(fullIn)}</div>
        </div>
        <div className="h-sky-cell" style={{ flex: "1 1 340px", gap: 18, paddingTop: 16, paddingBottom: 16 }}>
          <div style={{ width: 156, flex: "none" }}><Wheel today={now} next={sabbat} /></div>
          <div>
            <div className="h-label sm">Wheel of the year</div>
            <div className="h-sky-big">{sabbat.days === 0 ? `${sabbat.name} is today` : sabbat.days === 1 ? `${sabbat.name} tomorrow` : `${sabbat.name} in ${sabbat.days} days`}</div>
            <div className="h-sky-sub">{weekdayName(sabbat.date)}, {dotDayMonth(sabbat.date)}</div>
          </div>
        </div>
      </section>

      <section className="h-pair">
        {/* ── II · The Daily Page ── */}
        <div className="h-col">
          <SectionLabel>II · The Daily Page</SectionLabel>
          {prevKey ? (
            <>
              <div className="h-entry-head">
                <MoonGlyph angle={moonAngle(prevDate)} size={18} title={moonPhaseOfDay(prevDate)} />
                <span>{weekdayDate(prevDate, now)} · {moonPhaseOfDay(prevDate).toLowerCase()}</span>
              </div>
              <p className="h-entry"><span className="h-dropcap">{prevText.charAt(0)}</span>{prevText.slice(1)}</p>
            </>
          ) : (
            <p className="h-note">No earlier pages yet. Today's will be the first.</p>
          )}
          <label className="h-lined-label" style={{ marginTop: 10 }}>
            <SectionLabel>Today, {dotDayMonth(now)}</SectionLabel>
            <textarea className="h-lined" rows={4} style={{ minHeight: 144 }} placeholder="begin anywhere…"
              value={journal[todayKey]?.text || ""} onChange={e => onTodayText(e.target.value)} />
          </label>
        </div>

        {/* ── III · Patterns ── */}
        <div className="h-col">
          <SectionLabel>III · Patterns</SectionLabel>
          <div className="h-entry-head">Since {season.name}, {seasonCards.length ? `${numberWords(seasonCards.length)} card${seasonCards.length === 1 ? "" : "s"}` : "no cards yet"}</div>
          <div>
            {suitRows.map(s => (
              <div key={s.name} className="h-suit-row">
                <span className="h-suit-name" style={{ color: s.color }}>{s.name}</span>
                <span className="h-suit-tally"><Tally n={s.n} color={s.color} /></span>
                <span className="h-suit-n" style={{ color: s.color }}>{s.n}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
            <div className="h-label sm">Most often together</div>
            {pairNote ? (
              <>
                <div className="h-pair-names">{pairNote.c1} <span style={{ color: "var(--gilt)" }}>&amp;</span> {pairNote.c2}</div>
                <div className="h-sky-sub" style={{ fontStyle: "italic" }}>{pairNote.text}</div>
              </>
            ) : (
              <div className="h-sky-sub" style={{ fontStyle: "italic" }}>No two cards have met twice yet. Keep pulling; they'll find each other.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── IV · Register of readings ── */}
      <section style={{ marginTop: "clamp(48px,7vw,80px)" }}>
        <div className="h-register-top">
          <SectionLabel>IV · Register of readings</SectionLabel>
          <button className="h-link" onClick={() => onNavigate("journal")}>the whole register →</button>
        </div>
        <div className="h-register">
          <div className="h-register-head">
            <span style={{ flex: "0 0 96px" }}>Date</span><span style={{ flex: "0 0 140px" }}>Spread</span><span style={{ flex: "1 1 240px" }}>Cards</span><span style={{ flex: "0 0 160px" }}>Moon</span><span style={{ flex: "0 0 90px" }}>Theme</span>
          </div>
          {readings.length === 0 && (
            <div className="h-register-row" style={{ cursor: "default" }}>
              <span className="h-note">No readings yet. The cards are waiting. <button className="h-link" onClick={() => onNavigate("new")}>Begin one →</button></span>
            </div>
          )}
          {readings.slice(0, 5).map(r => {
            const d = new Date(r.ts), names = r.cards.filter(c => c.card).map(c => c.card), phase = moonPhaseOfDay(d);
            const theme = r.tags?.find(t => t !== "card of the day") || (r.isCardOfDay ? "daily" : "—");
            return (
              <button key={r.id} className="h-register-row" onClick={() => onOpenReading(r)}>
                <span className="h-reg-date">{dotDate(d)}</span>
                <span className="h-reg-spread">{r.isCardOfDay ? "Card of the day" : REGISTER_SPREADS[r.spread] || SPREADS[r.spread]?.label}</span>
                <span className="h-reg-cards">{names.slice(0, 3).join(" · ")}{names.length > 3 ? `, and ${numberWords(names.length - 3)} more` : ""}</span>
                <span className="h-reg-moon"><MoonGlyph angle={moonAngle(d)} title={phase} style={{ transform: "translateY(2px)" }} />{phase.toLowerCase()}</span>
                <span className="h-reg-theme">{theme}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ── Card Timeline (Cards Over Time) ──────────────────────────
function CardTimeline({ readings }) {
  // Group readings by month, show top cards per month
  const months = useMemo(() => {
    const map = {};
    readings.forEach(r => {
      const key = formatMonthYear(r.ts);
      if (!map[key]) map[key] = { label: key, ts: r.ts, cards: [], suits: { Major: 0, Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 } };
      r.cards.forEach(c => {
        if (!c.card) return;
        map[key].cards.push(c.card);
        if (MAJOR_ARCANA.includes(c.card)) map[key].suits.Major++;
        else if (c.card.includes("Wands")) map[key].suits.Wands++;
        else if (c.card.includes("Cups")) map[key].suits.Cups++;
        else if (c.card.includes("Swords")) map[key].suits.Swords++;
        else if (c.card.includes("Pentacles")) map[key].suits.Pentacles++;
      });
    });
    return Object.values(map).sort((a, b) => a.ts - b.ts);
  }, [readings]);

  if (months.length < 1) return null;

  const suitColors = SUIT_COLORS;
  const maxCards = Math.max(...months.map(m => m.cards.length), 1);

  return (
    <div className="timeline-container">
      <div className="timeline-scroll">
        {months.map((m, mi) => {
          const topCard = (() => {
            const freq = {};
            m.cards.forEach(c => freq[c] = (freq[c] || 0) + 1);
            const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
            return sorted[0]?.[0];
          })();
          const totalSuits = Object.values(m.suits).reduce((a, b) => a + b, 0) || 1;

          return (
            <div key={mi} className="timeline-month">
              <div className="timeline-month-label">{m.label}</div>
              <div className="timeline-bar-stack" style={{ height: `${Math.max((m.cards.length / maxCards) * 120, 12)}px` }}>
                {Object.entries(m.suits).filter(([_, v]) => v > 0).map(([suit, count]) => (
                  <div
                    key={suit}
                    className="timeline-bar-segment"
                    style={{
                      height: `${(count / totalSuits) * 100}%`,
                      background: suitColors[suit],
                      opacity: 0.75,
                    }}
                    title={`${suit}: ${count}`}
                  />
                ))}
              </div>
              <div className="timeline-count">{m.cards.length}</div>
              {topCard && (
                <div className="timeline-top" style={{ color: suitColor(topCard) }}>
                  {suitSymbol(topCard)} {topCard.replace(/^(The |Ace of |Two of |Three of |Four of |Five of |Six of |Seven of |Eight of |Nine of |Ten of |Page of |Knight of |Queen of |King of )/, (match) => match.length > 6 ? match.slice(0, 3) + ". " : match)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Card Pairs Analysis ──────────────────────────────────────
function getCardPairs(readings) {
  const pairMap = {};
  readings.forEach(r => {
    const cardNames = r.cards.filter(c => c.card).map(c => c.card);
    // Only count pairs in multi-card readings
    if (cardNames.length < 2) return;
    for (let i = 0; i < cardNames.length; i++) {
      for (let j = i + 1; j < cardNames.length; j++) {
        const pair = [cardNames[i], cardNames[j]].sort().join(" ⟷ ");
        pairMap[pair] = (pairMap[pair] || 0) + 1;
      }
    }
  });
  return Object.entries(pairMap)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

// ── Moon Phase Distribution ──────────────────────────────────
function getMoonDistribution(readings) {
  const dist = {};
  readings.forEach(r => {
    const phase = r.moonPhase || getMoonPhase(new Date(r.ts)).name;
    dist[phase] = (dist[phase] || 0) + 1;
  });
  return Object.entries(dist).sort((a, b) => b[1] - a[1]);
}

// ── Grimoire Calendar ────────────────────────────────────────
function GrimoireCalendar({ journal, readings, onSelectDate, onSelectReading }) {
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  // Monday-start: getDay() returns 0=Sun, so shift: (day + 6) % 7 gives 0=Mon
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const todayKey = toDateKey(new Date());

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedDay(null);
  };
  const goToday = () => {
    setCalYear(new Date().getFullYear());
    setCalMonth(new Date().getMonth());
    setSelectedDay(null);
  };

  // Build lookup for this month
  const dayData = useMemo(() => {
    const data = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const hasJournal = journal[key] && (journal[key].text?.trim() || journal[key].mood);
      const dayReadings = readings.filter(r => toDateKey(new Date(r.ts)) === key);
      const mood = journal[key]?.mood || null;
      if (hasJournal || dayReadings.length > 0) {
        data[d] = { key, hasJournal, readings: dayReadings, mood };
      }
    }
    return data;
  }, [calYear, calMonth, daysInMonth, journal, readings]);

  const selectedDayData = selectedDay ? dayData[selectedDay] : null;
  const selectedKey = selectedDay
    ? `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const moods = { Grounded: "🌿", Energized: "🔥", Emotional: "🌊", Foggy: "☁️", Restless: "⚡", Reflective: "🌙", Quiet: "🕯️", Magical: "✨" };

  return (
    <div className="cal-container">
      {/* Month nav */}
      <div className="cal-nav">
        <button className="daily-date-btn" onClick={prevMonth}>←</button>
        <span className="cal-month-label">{monthNames[calMonth]} {calYear}</span>
        <button className="daily-date-btn" onClick={nextMonth}>→</button>
        {(calYear !== new Date().getFullYear() || calMonth !== new Date().getMonth()) && (
          <button className="daily-today-btn" onClick={goToday}>Today</button>
        )}
      </div>

      {/* Day headers */}
      <div className="cal-grid">
        {dayLabels.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-cell empty" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const data = dayData[day];
          const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = key === todayKey;
          const isSelected = selectedDay === day;
          const isFuture = key > todayKey;

          return (
            <div
              key={day}
              className={`cal-cell ${data ? "has-entry" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${isFuture ? "future" : ""}`}
              onClick={() => {
                if (!isFuture) setSelectedDay(isSelected ? null : day);
              }}
            >
              <span className="cal-day-num">{day}</span>
              {data && (
                <div className="cal-dots">
                  {data.hasJournal && <span className="cal-dot journal-dot" />}
                  {data.readings.length > 0 && <span className="cal-dot reading-dot" />}
                </div>
              )}
              {data?.mood && (
                <span className="cal-mood-mini">{moods[data.mood] || ""}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot journal-dot" /> journal</span>
        <span className="cal-legend-item"><span className="cal-dot reading-dot" /> reading</span>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="cal-detail" style={{ animation: "fadeIn 0.25s ease" }}>
          <div className="cal-detail-header">
            <span className="cal-detail-date">
              {formatDate(new Date(selectedKey + "T12:00:00"))}
            </span>
            <MoonBadge timestamp={new Date(selectedKey + "T12:00:00").getTime()} size="lg" />
          </div>

          {/* Journal entry preview */}
          {selectedDayData?.hasJournal && (
            <div
              className="cal-detail-section clickable"
              onClick={() => onSelectDate(selectedKey)}
            >
              <span className="cal-detail-label">
                {selectedDayData.mood && <span style={{ marginRight: "0.3rem" }}>{moods[selectedDayData.mood]}</span>}
                Journal Entry
              </span>
              {journal[selectedKey]?.text?.trim() && (
                <p className="cal-detail-preview">
                  {journal[selectedKey].text.trim().slice(0, 120)}
                  {journal[selectedKey].text.trim().length > 120 ? "..." : ""}
                </p>
              )}
              <span className="cal-detail-link">open entry →</span>
            </div>
          )}

          {/* Readings on this day */}
          {selectedDayData?.readings.length > 0 && (
            <div>
              <span className="cal-detail-label" style={{ display: "block", marginBottom: "0.4rem", marginTop: selectedDayData?.hasJournal ? "0.6rem" : 0 }}>
                {selectedDayData.readings.length} Reading{selectedDayData.readings.length > 1 ? "s" : ""}
              </span>
              {selectedDayData.readings.map(r => (
                <div
                  key={r.id}
                  className="cal-detail-section clickable"
                  style={{ marginBottom: "0.4rem" }}
                  onClick={() => onSelectReading(r)}
                >
                  <span className="reading-spread-badge" style={{ marginBottom: "0.2rem", display: "inline-block" }}>
                    {SPREADS[r.spread]?.label}
                  </span>
                  {r.question && (
                    <p className="cal-detail-preview" style={{ fontStyle: "italic" }}>“{r.question}”</p>
                  )}
                  <div className="card-preview" style={{ marginTop: "0.2rem" }}>
                    {r.cards.filter(c => c.card).map((c, ci) => (
                      <span key={ci} className="card-chip" style={{ color: suitColor(c.card), fontSize: "0.7rem" }}>
                        {suitSymbol(c.card)} {c.card}
                      </span>
                    ))}
                  </div>
                  <span className="cal-detail-link">view reading →</span>
                </div>
              ))}
            </div>
          )}

          {/* Nothing on this day */}
          {!selectedDayData && (
            <div
              className="cal-detail-section clickable"
              onClick={() => onSelectDate(selectedKey)}
            >
              <p className="cal-detail-preview" style={{ color: "var(--soft)", fontStyle: "italic" }}>nothing recorded this day</p>
              <span className="cal-detail-link">start a journal entry →</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Paired herb, as written on a specimen label ─────────────
function HerbLine({ card }) {
  const herb = herbFor(card);
  if (!herb) return null;
  return (
    <span className="herb-line">
      <span className="herb-line-label">Paired herb</span> {herb.common}, <i>{herb.latin}</i> {herb.authority}
    </span>
  );
}

// ── Library: Search Component ────────────────────────────────
function LibrarySearch({ readings, getCardHistory }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const matches = query.length > 0
    ? ALL_CARDS.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const selectCard = (card) => {
    setSelected(card);
    setQuery(card);
  };

  const count = selected ? getCardHistory(selected) : 0;

  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          className="search-input"
          style={{ width: "100%" }}
          value={query}
          placeholder="Type a card name..."
          onChange={e => { setQuery(e.target.value); setSelected(null); }}
          onFocus={() => setSelected(null)}
          autoComplete="off"
        />
        {!selected && query.length > 0 && matches.length > 0 && (
          <div className="card-dropdown">
            {matches.map(c => (
              <div key={c} className="card-option" onMouseDown={() => selectCard(c)}>
                <span style={{ color: suitColor(c), marginRight: "0.4rem", fontSize: "0.8rem" }}>{suitSymbol(c)}</span>
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && CARD_MEANINGS[selected] && (
        <div className="library-card-detail" style={{ animation: "fadeIn 0.3s ease" }}>
          <div className="library-card-header" style={{ "--suit-color": suitColor(selected) }}>
            <div className="library-plate"><SuitPlate suit={suitOf(selected)} /></div>
            <div>
              <span className="library-card-numeral">{cardNumeral(selected)}</span>
              <span className="library-card-name">{selected}</span>
              <HerbLine card={selected} />
              {count > 0 && <span className="library-card-count">appeared {count}× in your readings</span>}
            </div>
          </div>
          <div className="library-meanings">
            <div className="library-meaning-block">
              <span className="library-meaning-label">Upright</span>
              <p className="library-meaning-text">{CARD_MEANINGS[selected].up}</p>
            </div>
            <div className="library-meaning-block reversed">
              <span className="library-meaning-label">Reversed</span>
              <p className="library-meaning-text">{CARD_MEANINGS[selected].rev}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Library: Browse by Suit ──────────────────────────────────
function LibraryBrowse({ readings, getCardHistory }) {
  const [openSuit, setOpenSuit] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const suits = [
    { name: "Major Arcana", cards: MAJOR_ARCANA, color: SUIT_COLORS.Major, sym: "✶" },
    { name: "Wands", cards: MINOR_ARCANA.filter(c => c.includes("Wands")), color: SUIT_COLORS.Wands, sym: "🜂" },
    { name: "Cups", cards: MINOR_ARCANA.filter(c => c.includes("Cups")), color: SUIT_COLORS.Cups, sym: "🜄" },
    { name: "Swords", cards: MINOR_ARCANA.filter(c => c.includes("Swords")), color: SUIT_COLORS.Swords, sym: "🜁" },
    { name: "Pentacles", cards: MINOR_ARCANA.filter(c => c.includes("Pentacles")), color: SUIT_COLORS.Pentacles, sym: "🜃" },
  ];

  return (
    <div className="library-suits">
      {suits.map(suit => (
        <div key={suit.name} className="library-suit-group">
          <button
            className={`library-suit-header ${openSuit === suit.name ? "open" : ""}`}
            style={{ "--suit-color": suit.color }}
            onClick={() => { setOpenSuit(openSuit === suit.name ? null : suit.name); setExpandedCard(null); }}
          >
            <span style={{ color: suit.color, fontSize: "0.9rem" }}>{suit.sym}</span>
            <span className="library-suit-name">{suit.name}</span>
            <span className="library-suit-count">{suit.cards.length} cards</span>
            <span className="library-suit-arrow">{openSuit === suit.name ? "−" : "+"}</span>
          </button>

          {openSuit === suit.name && (
            <div className="library-suit-cards" style={{ animation: "fadeIn 0.2s ease" }}>
              {suit.cards.map(card => {
                const isExpanded = expandedCard === card;
                const meaning = CARD_MEANINGS[card];
                const count = getCardHistory(card);
                return (
                  <div key={card} className="library-browse-card">
                    <button
                      className="library-browse-btn"
                      style={{ "--suit-color": suit.color }}
                      onClick={() => setExpandedCard(isExpanded ? null : card)}
                    >
                      <span style={{ color: suit.color }}>{suitSymbol(card)}</span>
                      <span className="library-browse-name">{card}</span>
                      {count > 0 && <span className="library-browse-count">{count}×</span>}
                      <span className="library-suit-arrow">{isExpanded ? "−" : "+"}</span>
                    </button>
                    {isExpanded && meaning && (
                      <div className="library-browse-meanings" style={{ animation: "fadeIn 0.2s ease" }}>
                        <HerbLine card={card} />
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function TarotJournal() {
  const [readings, setReadings] = useState([]);
  const [journal, setJournal] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home");
  const [selectedReading, setSelectedReading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState(null);
  const [statsTab, setStatsTab] = useState("overview"); // overview | pairs | timeline | moons
  const [theme, setTheme] = useState(initialTheme); // vellum | lamplit
  const [scrollTo, setScrollTo] = useState(null);

  // New reading form state
  const [spread, setSpread] = useState("single");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState({});
  const [reversals, setReversals] = useState({});
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);

  // Daily journal state
  const [dailyDate, setDailyDate] = useState(toDateKey(new Date()));
  const [dailyText, setDailyText] = useState("");
  const [dailyMood, setDailyMood] = useState(null);
  const [dailySaving, setDailySaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // ── Storage ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grimoire-readings-v2");
      if (stored) setReadings(JSON.parse(stored));
      else {
        const legacy = localStorage.getItem("tarot-journal-v1");
        if (legacy) setReadings(JSON.parse(legacy));
      }
    } catch {}
    try {
      const storedJ = localStorage.getItem("grimoire-journal-v1");
      if (storedJ) setJournal(JSON.parse(storedJ));
    } catch {}
    setLoaded(true);
  }, []);

  const saveReadings = (updated) => {
    setReadings(updated);
    try { localStorage.setItem("grimoire-readings-v2", JSON.stringify(updated)); } catch {}
  };
  const saveJournal = (updated) => {
    setJournal(updated);
    try { localStorage.setItem("grimoire-journal-v1", JSON.stringify(updated)); } catch {}
  };

  useEffect(() => {
    const entry = journal[dailyDate];
    if (entry) { setDailyText(entry.text || ""); setDailyMood(entry.mood || null); }
    else { setDailyText(""); setDailyMood(null); }
    setShowPrompt(false);
  }, [dailyDate, journal]);

  const saveDailyEntry = () => {
    setDailySaving(true);
    const updated = {
      ...journal,
      [dailyDate]: {
        text: dailyText.trim(), mood: dailyMood,
        moonPhase: getMoonPhase(new Date(dailyDate + "T12:00:00")).name,
        updatedAt: Date.now(),
      },
    };
    if (!dailyText.trim() && !dailyMood) delete updated[dailyDate];
    saveJournal(updated);
    setTimeout(() => setDailySaving(false), 600);
  };

  // ── Paper & navigation ─────────────────────────────────────
  const paper = useMemo(() => themeStyle(theme), [theme]);
  useEffect(() => {
    document.body.style.background = paper.paper;
    try { localStorage.setItem("rr-theme", theme); } catch {}
  }, [theme, paper]);

  useEffect(() => {
    if (!scrollTo) return;
    document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setScrollTo(null);
  }, [scrollTo, view]);

  const go = (target) => {
    if (target === "cotd") { setView("home"); setScrollTo("specimen"); return; }
    if (target === "daily") setDailyDate(toDateKey(new Date()));
    if (target === "new") { startNew(); return; }
    setView(target);
    window.scrollTo({ top: 0 });
  };

  // Home's "Today" page writes straight into the journal, keeping any mood
  const saveTodayText = (text) => {
    const key = toDateKey(new Date());
    const prev = journal[key] || {};
    const updated = { ...journal, [key]: { ...prev, text, moonPhase: getMoonPhase(new Date()).name, updatedAt: Date.now() } };
    if (!text.trim() && !prev.mood) delete updated[key];
    saveJournal(updated);
  };

  const updateReadingNotes = (id, notes) => {
    saveReadings(readings.map(r => r.id === id ? { ...r, notes } : r));
  };

  // ── New reading ────────────────────────────────────────────
  const startNew = () => {
    setSpread("single"); setQuestion(""); setCards({}); setReversals({}); setNotes(""); setTags([]);
    setView("new");
    window.scrollTo({ top: 0 });
  };

  const saveReading = () => {
    const positions = SPREADS[spread].positions;
    const cardList = positions.map((pos, i) => ({
      position: pos, card: cards[i] || "", reversed: reversals[i] || false,
    }));
    const reading = {
      id: makeId(), spread, question: question.trim(), cards: cardList,
      notes: notes.trim(), tags, ts: Date.now(),
      moonPhase: getMoonPhase(new Date()).name,
    };
    saveReadings([reading, ...readings]);
    setView("journal");
  };

  const logCardOfDay = (draw) => {
    const reading = {
      id: makeId(), spread: "single",
      question: "Card of the Day",
      cards: [{ position: "The Card", card: draw.card, reversed: draw.reversed }],
      notes: draw.notes || "", tags: ["card of the day"], ts: Date.now(),
      moonPhase: getMoonPhase(new Date()).name,
      isCardOfDay: true,
    };
    saveReadings([reading, ...readings]);
  };

  const deleteReading = (id) => {
    if (!window.confirm("Remove this reading?")) return;
    saveReadings(readings.filter(r => r.id !== id));
    if (selectedReading?.id === id) setView("journal");
  };

  // ── Search & Filter ────────────────────────────────────────
  const filteredReadings = useMemo(() => {
    let result = readings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.question?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.cards.some(c => c.card.toLowerCase().includes(q)) ||
        r.tags?.some(t => t.includes(q))
      );
    }
    if (filterTag) result = result.filter(r => r.tags?.includes(filterTag));
    return result;
  }, [readings, searchQuery, filterTag]);

  // ── Stats ──────────────────────────────────────────────────
  const cardFrequency = useMemo(() => {
    const freq = {};
    readings.forEach(r => r.cards.forEach(c => { if (c.card) freq[c.card] = (freq[c.card] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [readings]);

  const reversalRate = useMemo(() => {
    let total = 0, reversed = 0;
    readings.forEach(r => r.cards.forEach(c => { if (c.card) { total++; if (c.reversed) reversed++; } }));
    return total ? Math.round((reversed / total) * 100) : 0;
  }, [readings]);

  const suitDistribution = useMemo(() => {
    const suits = { Major: 0, Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 };
    readings.forEach(r => r.cards.forEach(c => {
      if (!c.card) return;
      if (MAJOR_ARCANA.includes(c.card)) suits.Major++;
      else if (c.card.includes("Wands")) suits.Wands++;
      else if (c.card.includes("Cups")) suits.Cups++;
      else if (c.card.includes("Swords")) suits.Swords++;
      else if (c.card.includes("Pentacles")) suits.Pentacles++;
    }));
    return suits;
  }, [readings]);

  const cardPairs = useMemo(() => getCardPairs(readings), [readings]);
  const moonDist = useMemo(() => getMoonDistribution(readings), [readings]);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    readings.forEach(r => r.tags?.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [readings]);

  const getCardHistory = useCallback((cardName) => {
    return readings.filter(r => r.cards.some(c => c.card === cardName)).length;
  }, [readings]);

  const getLastSeen = useCallback((cardName) => {
    const found = readings.find(r => r.cards.some(c => c.card === cardName));
    return found ? formatDateShort(found.ts) : null;
  }, [readings]);

  const canSave = SPREADS[spread].positions.every((_, i) => cards[i]?.trim());
  const moods = [
    { emoji: "🌿", label: "Grounded" },
    { emoji: "🔥", label: "Energized" },
    { emoji: "🌊", label: "Emotional" },
    { emoji: "☁️", label: "Foggy" },
    { emoji: "⚡", label: "Restless" },
    { emoji: "🌙", label: "Reflective" },
    { emoji: "🕯️", label: "Quiet" },
    { emoji: "✨", label: "Magical" },
  ];

  const moodDistribution = useMemo(() => {
    const dist = {};
    Object.values(journal).forEach(entry => {
      if (entry.mood) dist[entry.mood] = (dist[entry.mood] || 0) + 1;
    });
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [journal]);

  // ══════════════════════════════════════════════════════════
  return (
    <div className={`grimoire-root theme-${theme}`} style={paper.style}>

      <main className="folio">
      {/* ════ Header ════ */}
      <header className={`folio-header ${view === "home" ? "" : "compact"}`}>
        <div className="folio-fern" aria-hidden="true"><Fern /></div>
        <div className="folio-topline">
          <span className="h-label">Herbarium of cards · folio {roman(dayOfYear(new Date())).toLowerCase()}</span>
          <button className="theme-toggle" onClick={() => setTheme(theme === "lamplit" ? "vellum" : "lamplit")}
            aria-label={`Switch to ${theme === "lamplit" ? "vellum (light)" : "lamplit (dark)"} paper`}>
            {theme === "lamplit" ? "☼ vellum" : "☾ lamplit"}
          </button>
        </div>
        <h1 className="folio-title">The Reading Room</h1>
        <div className="folio-date">{longDate(new Date())}</div>
        <div className="folio-rule" aria-hidden="true"><span className="rule-short" /><span className="rule-diamond" /><span className="rule-long" /></div>
        <nav className="folio-nav">
          {[["home", "Home"], ["cotd", "Card of the Day"], ["daily", "Daily Page"], ["journal", "Readings"], ["stats", "Patterns"], ["library", "Card Library"], ["calendar", "Calendar"]].map(([id, label]) => {
            const active = view === id || (id === "journal" && view === "detail");
            return <button key={id} className={`folio-nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => go(id)}>{label}</button>;
          })}
          <button className={`folio-nav-link begin ${view === "new" ? "active" : ""}`} onClick={() => go("new")}>✦ Begin a reading</button>
        </nav>
      </header>

      {/* ════ Home ════ */}
      {view === "home" && (
        <HerbariumHome
          readings={readings} journal={journal} cardPairs={cardPairs}
          onLog={logCardOfDay} onUpdateNotes={updateReadingNotes} onTodayText={saveTodayText}
          onOpenReading={r => { setSelectedReading(r); setView("detail"); window.scrollTo({ top: 0 }); }}
          onNavigate={go}
        />
      )}

      {view !== "home" && view !== "detail" && (
        <h2 className="page-heading">{{ journal: "Register of readings", new: "Of a new reading", daily: "The Daily Page", calendar: "Calendar of days", library: "Card Library", stats: "Patterns" }[view]}</h2>
      )}

      {/* ════ Journal / Card Readings List ════ */}
      {view === "journal" && (
        <div className="page">
          <div className="search-bar">
            <input className="search-input" placeholder="Search cards, questions, notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {(searchQuery || filterTag) && (
              <button className="cancel-btn" style={{ padding: "0.35rem 0.6rem", fontSize: "0.5rem" }} onClick={() => { setSearchQuery(""); setFilterTag(null); }}>Clear</button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="filter-tags">
              {allTags.map(t => (
                <button key={t} className={`filter-tag ${filterTag === t ? "active" : ""}`} onClick={() => setFilterTag(filterTag === t ? null : t)}>{t}</button>
              ))}
            </div>
          )}
          {!loaded ? (
            <div className="empty">the veil is thin tonight...</div>
          ) : filteredReadings.length === 0 ? (
            <div className="empty">
              {readings.length === 0 ? <>no readings yet.<br /><span style={{ fontSize: "0.82rem" }}>the cards are waiting.</span></> : "no readings match your search."}
            </div>
          ) : (
            <div className="reading-list">
              {filteredReadings.map(r => (
                <div key={r.id} className="reading-card" onClick={() => { setSelectedReading(r); setView("detail"); }}>
                  <div className="reading-header">
                    <div style={{ flex: 1 }}>
                      <p className="reading-date">
                        <MoonBadge timestamp={r.ts} />
                        {formatDate(r.ts)} · <span className="reading-spread-badge">{SPREADS[r.spread]?.label}</span>
                      </p>
                      {r.question ? <p className="reading-question">“{r.question}”</p> : <p className="reading-question-empty">no question asked</p>}
                      <div className="card-preview">
                        {r.cards.filter(c => c.card).map((c, i) => (
                          <span key={i} className={`card-chip ${c.reversed ? "reversed" : ""}`} style={{ color: suitColor(c.card) }}>
                            {suitSymbol(c.card)} {c.card}{c.reversed ? " ↓" : ""}
                            {i < r.cards.filter(x => x.card).length - 1 && <span style={{ color: "var(--gilt)", margin: "0 0.15rem" }}>·</span>}
                          </span>
                        ))}
                      </div>
                      {r.tags?.length > 0 && (
                        <div className="reading-tags">
                          {r.tags.map(t => <span key={t} className="reading-tag-pill">{t}</span>)}
                        </div>
                      )}
                    </div>
                    <button className="delete-btn" onClick={e => { e.stopPropagation(); deleteReading(r.id); }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ Detail ════ */}
      {view === "detail" && selectedReading && (
        <div className="page">
          <button className="detail-back" onClick={() => setView("journal")}>← Back</button>
          <div className="detail-meta">
            <MoonBadge timestamp={selectedReading.ts} size="lg" />
            <span>{formatDate(selectedReading.ts)}</span>
            <span>{SPREADS[selectedReading.spread]?.label}</span>
          </div>
          {selectedReading.question
            ? <p className="detail-question">“{selectedReading.question}”</p>
            : <p className="detail-question" style={{ color: "var(--soft)" }}>no question asked</p>
          }
          {selectedReading.tags?.length > 0 && (
            <div className="reading-tags" style={{ marginBottom: "0.5rem" }}>
              {selectedReading.tags.map(t => <span key={t} className="reading-tag-pill">{t}</span>)}
            </div>
          )}
          <hr className="divider" />

          {selectedReading.spread === "cross" ? (
            <CelticCrossLayout cards={selectedReading.cards} getCardHistory={getCardHistory} />
          ) : (
            <div className="cards-layout">
              {selectedReading.cards.filter(c => c.card).map((c, i) => {
                const count = getCardHistory(c.card);
                const meaning = getCardMeaning(c.card, c.reversed);
                return (
                  <div key={i} className="card-row-with-meaning" style={{ "--suit-color": suitColor(c.card) }}>
                    <div className="card-row-main">
                      <span className="suit-sym" style={{ color: suitColor(c.card) }}>{suitSymbol(c.card)}</span>
                      <span className="card-position">{c.position}</span>
                      <span className={`card-name ${c.reversed ? "reversed" : ""}`}>
                        {c.card}
                        {c.reversed && <span className="reversed-tag">reversed</span>}
                      </span>
                      {count > 1 && <span className="card-whisper-inline">({count}×)</span>}
                    </div>
                    {meaning && <div className="card-meaning-row">{meaning}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {selectedReading.notes && (
            <div className="notes-section">
              <p className="notes-label">Reflections</p>
              <p className="notes-text">{selectedReading.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ════ New Reading ════ */}
      {view === "new" && (
        <div className="page">
          <div className="form-section">
            <span className="form-label">Spread</span>
            <div className="spread-tabs">
              {Object.values(SPREADS).map(s => (
                <div key={s.id} className={`spread-tab ${spread === s.id ? "active" : ""}`} onClick={() => { setSpread(s.id); setCards({}); setReversals({}); }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <div className="form-section">
            <label className="form-label">Question or Intention</label>
            <input className="q-input" placeholder="What did you ask the cards? (optional)" value={question} onChange={e => setQuestion(e.target.value)} />
          </div>
          <div className="form-section">
            <span className="form-label">Cards</span>
            <div className="positions-list">
              {SPREADS[spread].positions.map((pos, i) => {
                const cardVal = cards[i] || "";
                const isValid = cardVal && ALL_CARDS.includes(cardVal);
                const count = isValid ? getCardHistory(cardVal) : 0;
                const lastDate = isValid ? getLastSeen(cardVal) : null;
                const meaning = isValid ? getCardMeaning(cardVal, reversals[i] || false) : null;
                return (
                  <div key={i} className="position-row">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="position-label">{pos}</span>
                      {count > 0 && (
                        <span className="h-note" style={{ fontSize: "14px" }}>
                          seen {count}× {lastDate && `· last ${lastDate}`}
                        </span>
                      )}
                    </div>
                    <CardInput
                      value={cards[i] || ""} reversed={reversals[i] || false}
                      onChange={val => setCards(c => ({ ...c, [i]: val }))}
                      onReversedChange={val => setReversals(r => ({ ...r, [i]: val }))}
                      placeholder={`Card for ${pos}...`}
                    />
                    {meaning && (
                      <div className="inline-meaning" style={{ animation: "fadeIn 0.2s ease" }}>
                        <span className="inline-meaning-icon" style={{ color: suitColor(cardVal) }}>{suitSymbol(cardVal)}</span>
                        <span className="inline-meaning-text">{meaning}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="form-section">
            <label className="form-label">Tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          <div className="form-section">
            <label className="form-label">Reflections & Notes</label>
            <textarea className="n-textarea" rows={4} placeholder="What came up? What felt significant?..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={saveReading} disabled={!canSave}>Record Reading</button>
            <button className="cancel-btn" onClick={() => setView("journal")}>Cancel</button>
          </div>
        </div>
      )}

      {/* ════ Daily Journal ════ */}
      {view === "daily" && (
        <div className="page">
          <div className="daily-date-nav" style={{ marginBottom: "1rem" }}>
            <button className="daily-date-btn" onClick={() => {
              const d = new Date(dailyDate + "T12:00:00"); d.setDate(d.getDate() - 1); setDailyDate(toDateKey(d));
            }}>←</button>
            <span className="daily-date-display">{formatDate(new Date(dailyDate + "T12:00:00"))}</span>
            <button className="daily-date-btn" onClick={() => {
              const d = new Date(dailyDate + "T12:00:00"); d.setDate(d.getDate() + 1);
              if (toDateKey(d) <= toDateKey(new Date())) setDailyDate(toDateKey(d));
            }}>→</button>
            {dailyDate !== toDateKey(new Date()) && (
              <button className="daily-today-btn" onClick={() => setDailyDate(toDateKey(new Date()))}>Today</button>
            )}
          </div>

          {(() => {
            const phase = getMoonPhase(new Date(dailyDate + "T12:00:00"));
            return (
              <div className="daily-moon-block">
                <span className="daily-moon-sym"><MoonGlyph angle={moonAngle(new Date(dailyDate + "T12:00:00"))} size={44} title={phase.name} /></span>
                <div>
                  <p className="daily-moon-text">{phase.name}</p>
                  <p className="daily-moon-desc">{getMoonDescription(phase.name)}</p>
                </div>
              </div>
            );
          })()}

          <div className="form-section">
            <span className="form-label">How are you feeling?</span>
            <div className="mood-picker">
              {moods.map(m => (
                <button key={m.label} className={`mood-btn ${dailyMood === m.label ? "active" : ""}`} onClick={() => setDailyMood(dailyMood === m.label ? null : m.label)}>
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection prompt nudge */}
          {!showPrompt ? (
            <button className="prompt-nudge" onClick={() => setShowPrompt(true)}>
              ✦ need a nudge?
            </button>
          ) : (
            <div className="prompt-text">
              {getReflectionPrompts(getMoonPhase(new Date(dailyDate + "T12:00:00")).name)}
            </div>
          )}

          <div className="form-section">
            <span className="form-label">Today's Page</span>
            <textarea
              className="daily-textarea"
              placeholder="What's moving through you today? What do you want to remember?..."
              value={dailyText}
              onChange={e => setDailyText(e.target.value)}
            />
          </div>

          {readings.filter(r => toDateKey(new Date(r.ts)) === dailyDate).length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <span className="form-label">Readings on this day</span>
              {readings.filter(r => toDateKey(new Date(r.ts)) === dailyDate).map(r => (
                <div key={r.id} className="reading-card" style={{ marginTop: "0.4rem" }} onClick={() => { setSelectedReading(r); setView("detail"); }}>
                  <p className="reading-date"><span className="reading-spread-badge">{SPREADS[r.spread]?.label}</span></p>
                  {r.question && <p className="reading-question" style={{ fontSize: "0.85rem" }}>“{r.question}”</p>}
                  <div className="card-preview">
                    {r.cards.filter(c => c.card).map((c, i) => (
                      <span key={i} className="card-chip" style={{ color: suitColor(c.card), fontSize: "0.72rem" }}>
                        {suitSymbol(c.card)} {c.card}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="daily-save-row">
            <button className="daily-save-btn" onClick={saveDailyEntry}>Save Entry</button>
            {dailySaving && <span className="daily-saved">✓ saved</span>}
          </div>
        </div>
      )}

      {/* ════ Calendar ════ */}
      {view === "calendar" && (
        <div className="page">
          <GrimoireCalendar
            journal={journal}
            readings={readings}
            onSelectDate={(dateKey) => {
              setDailyDate(dateKey);
              setView("daily");
            }}
            onSelectReading={(r) => {
              setSelectedReading(r);
              setView("detail");
            }}
          />
        </div>
      )}

      {/* ════ Card Library ════ */}
      {view === "library" && (
        <div className="page">
          <div className="form-section">
            <p className="h-note" style={{ marginBottom: "1rem" }}>
              Search any card to see its meaning — upright and reversed.
            </p>
            <LibrarySearch readings={readings} getCardHistory={getCardHistory} />
          </div>

          {/* Browse by suit */}
          <div className="form-section" style={{ marginTop: "1.5rem" }}>
            <span className="form-label">Browse by Suit</span>
            <LibraryBrowse readings={readings} getCardHistory={getCardHistory} />
          </div>
        </div>
      )}

      {/* ════ Patterns ════ */}
      {view === "stats" && (
        <div className="page">
          {readings.length === 0 ? (
            <div className="empty">no readings yet to find patterns in.<br /><span style={{ fontSize: "0.82rem" }}>the cards are waiting.</span></div>
          ) : (
            <>
              <div className="stats-tabs">
                <div className={`stats-tab ${statsTab === "overview" ? "active" : ""}`} onClick={() => setStatsTab("overview")}>Overview</div>
                <div className={`stats-tab ${statsTab === "pairs" ? "active" : ""}`} onClick={() => setStatsTab("pairs")}>Pairs</div>
                <div className={`stats-tab ${statsTab === "timeline" ? "active" : ""}`} onClick={() => setStatsTab("timeline")}>Timeline</div>
                <div className={`stats-tab ${statsTab === "moons" ? "active" : ""}`} onClick={() => setStatsTab("moons")}>Moons & Moods</div>
              </div>

              {/* ── Overview ── */}
              {statsTab === "overview" && (
                <>
                  <div className="stats-summary">
                    {[
                      { label: "Readings", value: readings.length },
                      { label: "Cards Drawn", value: readings.reduce((a, r) => a + r.cards.filter(c => c.card).length, 0) },
                      { label: "Reversal Rate", value: `${reversalRate}%` },
                    ].map(s => (
                      <div key={s.label} className="stat-box">
                        <p className="stat-box-label">{s.label}</p>
                        <p className="stat-box-value">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="stat-label">Suit Distribution</p>
                  <div className="suit-dist">
                    {Object.entries(suitDistribution).map(([suit, count]) => {
                      const colors = SUIT_COLORS;
                      const syms = { Major: "✶", Wands: "🜂", Cups: "🜄", Swords: "🜁", Pentacles: "🜃" };
                      return (
                        <div key={suit} className="suit-dist-item">
                          <span className="suit-dist-sym" style={{ color: colors[suit] }}>{syms[suit]}</span>
                          <span className="suit-dist-count">{count}</span>
                          <span className="suit-dist-name">{suit}</span>
                        </div>
                      );
                    })}
                  </div>

                  <hr className="divider" />

                  <p className="stat-label">Cards that keep finding you</p>
                  <div className="stats-grid">
                    {cardFrequency.map(([card, count]) => {
                      const max = cardFrequency[0]?.[1] || 1;
                      return (
                        <div key={card} className="stat-row" style={{ "--suit-color": suitColor(card) }}>
                          <span className="suit-sym" style={{ color: suitColor(card), fontSize: "0.75rem", minWidth: "1rem" }}>{suitSymbol(card)}</span>
                          <span className="stat-card">{card}</span>
                          <div className="stat-bar-wrap">
                            <div className="stat-bar" style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                          <span className="stat-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  {Object.keys(journal).length > 0 && (
                    <>
                      <hr className="divider" />
                      <div className="stat-box" style={{ display: "inline-block" }}>
                        <p className="stat-box-label">Journal Entries</p>
                        <p className="stat-box-value">{Object.keys(journal).filter(k => journal[k].text?.trim()).length}</p>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Pairs ── */}
              {statsTab === "pairs" && (
                <>
                  <p className="stat-label">Cards that keep finding each other</p>
                  <p className="h-note" style={{ marginBottom: "1rem" }}>
                    Pairs that appeared together in 2 or more readings
                  </p>
                  {cardPairs.length === 0 ? (
                    <div className="pair-empty">
                      not enough multi-card readings yet to find pairs.<br />
                      <span style={{ fontSize: "0.78rem" }}>keep pulling — the patterns will emerge.</span>
                    </div>
                  ) : (
                    <div className="pair-list">
                      {cardPairs.map(([pair, count]) => {
                        const [card1, card2] = pair.split(" ⟷ ");
                        return (
                          <div key={pair} className="pair-row">
                            <div className="pair-cards">
                              <span style={{ color: suitColor(card1) }}>{suitSymbol(card1)} {card1}</span>
                              <span className="pair-arrow">⟷</span>
                              <span style={{ color: suitColor(card2) }}>{suitSymbol(card2)} {card2}</span>
                            </div>
                            <span className="pair-count">{count}×</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── Timeline ── */}
              {statsTab === "timeline" && (
                <>
                  <p className="stat-label">Your readings over time</p>
                  <p className="h-note" style={{ marginBottom: "0.5rem" }}>
                    Suit colors show what energy dominated each month. Top card listed below.
                  </p>
                  <CardTimeline readings={readings} />

                  <hr className="divider" />

                  <div className="suit-dist" style={{ marginTop: "0.5rem" }}>
                    {[
                      { suit: "Major", color: SUIT_COLORS.Major, sym: "✶" },
                      { suit: "Wands", color: SUIT_COLORS.Wands, sym: "🜂" },
                      { suit: "Cups", color: SUIT_COLORS.Cups, sym: "🜄" },
                      { suit: "Swords", color: SUIT_COLORS.Swords, sym: "🜁" },
                      { suit: "Pentacles", color: SUIT_COLORS.Pentacles, sym: "🜃" },
                    ].map(s => (
                      <div key={s.suit} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ color: s.color, fontSize: "0.7rem" }}>{s.sym}</span>
                        <span className="h-label sm" style={{ color: "var(--soft)" }}>{s.suit}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Moons & Moods ── */}
              {statsTab === "moons" && (
                <>
                  <p className="stat-label">When you read</p>
                  <p className="h-note" style={{ marginBottom: "1rem" }}>
                    Which moon phases draw you to the cards
                  </p>
                  {moonDist.length > 0 && (
                    <div className="moon-dist-list">
                      {moonDist.map(([phase, count]) => {
                        const max = moonDist[0]?.[1] || 1;
                        return (
                          <div key={phase} className="moon-dist-row">
                            <div className="moon-dist-phase">
                              <MoonGlyph phase={phase} size={16} />
                              <span className="moon-dist-phase-name">{phase}</span>
                            </div>
                            <div className="moon-dist-bar-wrap">
                              <div className="moon-dist-bar" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                            <span className="stat-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {moodDistribution.length > 0 && (
                    <>
                      <hr className="divider" />
                      <p className="stat-label">How you've been feeling</p>
                      <div className="mood-dist">
                        {moodDistribution.map(([mood, count]) => {
                          const m = moods.find(x => x.label === mood);
                          return (
                            <div key={mood} className="mood-dist-item">
                              <span className="mood-dist-emoji">{m?.emoji || "·"}</span>
                              <span className="mood-dist-count">{count}</span>
                              <span className="mood-dist-label">{mood}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {moodDistribution.length === 0 && moonDist.length === 0 && (
                    <div className="empty">track some moods in your daily journal to see patterns here.</div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
      </main>
    </div>
  );
}
