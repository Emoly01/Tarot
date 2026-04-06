import { useState, useEffect, useCallback, useMemo } from "react";

// ══════════════════════════════════════════════════════════════
//  THE READING ROOM — A Digital Grimoire
//  Wave 2: Card Pairs, Timeline, Reflection Prompts,
//          Enhanced Patterns, Polish
// ══════════════════════════════════════════════════════════════

// ── Moon Phase Calculation ───────────────────────────────────
function getMoonPhase(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let c = 0, e = 0, jd = 0, b = 0;
  if (month < 3) { c = 365.25 * (year - 1); e = 30.6001 * (month + 13); }
  else { c = 365.25 * year; e = 30.6001 * (month + 1); }
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 8);
  if (b >= 8) b = 0;
  const phases = [
    { name: "New Moon", symbol: "🌑" },
    { name: "Waxing Crescent", symbol: "🌒" },
    { name: "First Quarter", symbol: "🌓" },
    { name: "Waxing Gibbous", symbol: "🌔" },
    { name: "Full Moon", symbol: "🌕" },
    { name: "Waning Gibbous", symbol: "🌖" },
    { name: "Last Quarter", symbol: "🌗" },
    { name: "Waning Crescent", symbol: "🌘" },
  ];
  return phases[b];
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
function suitColor(card) {
  if (MAJOR_ARCANA.includes(card)) return "#b8a8d0";
  if (card.includes("Wands")) return "#c9a84c";
  if (card.includes("Cups")) return "#7a9cc4";
  if (card.includes("Swords")) return "#a8c4b8";
  if (card.includes("Pentacles")) return "#9ab87a";
  return "#888";
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
  const phase = getMoonPhase(new Date(timestamp));
  const isSm = size === "sm";
  return (
    <span className={`moon-badge ${isSm ? "moon-sm" : "moon-lg"}`} title={phase.name}>
      <span className="moon-symbol">{phase.symbol}</span>
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
                <span style={{ color: "#5a7a5a", marginRight: "0.4rem", fontSize: "0.7rem" }}>◆</span>{s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Card of the Day Widget ───────────────────────────────────
function CardOfDay({ readings, onQuickLog }) {
  const [mode, setMode] = useState(null); // null | "digital" | "physical"
  const [revealed, setRevealed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [showMusings, setShowMusings] = useState(false);
  const [musings, setMusings] = useState("");
  // Physical pull state
  const [physicalCard, setPhysicalCard] = useState("");
  const [physicalReversed, setPhysicalReversed] = useState(false);

  const todayDraw = drawCardOfDay();
  const todayKey = toDateKey(new Date());
  const alreadyLogged = readings.some(r => r.isCardOfDay && toDateKey(new Date(r.ts)) === todayKey);

  const reveal = () => {
    if (revealed) return;
    setAnimating(true);
    setTimeout(() => { setRevealed(true); setAnimating(false); }, 600);
  };

  const handleLogDigital = () => {
    onQuickLog({ ...todayDraw, notes: musings.trim() });
    setShowMusings(false); setMusings("");
  };

  const handleLogPhysical = () => {
    if (!physicalCard || !ALL_CARDS.includes(physicalCard)) return;
    onQuickLog({ card: physicalCard, reversed: physicalReversed, notes: musings.trim() });
    setShowMusings(false); setMusings(""); setPhysicalCard(""); setPhysicalReversed(false);
  };

  const physicalMeaning = physicalCard && ALL_CARDS.includes(physicalCard)
    ? getCardMeaning(physicalCard, physicalReversed) : null;
  const physicalValid = physicalCard && ALL_CARDS.includes(physicalCard);

  return (
    <div className="cotd-container">
      <div className="cotd-header">
        <span className="cotd-label">Card of the Day</span>
        <span className="cotd-date">{formatDate(Date.now())}</span>
      </div>

      {alreadyLogged ? (
        <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
          <span className="cotd-logged">✓ today's card is logged</span>
        </div>
      ) : !mode ? (
        /* ── Choose mode ── */
        <div className="cotd-mode-picker">
          <button className="cotd-mode-btn" onClick={() => setMode("digital")}>
            <span className="cotd-mode-icon">✶</span>
            <span className="cotd-mode-label">Draw from the grimoire</span>
            <span className="cotd-mode-sub">let the app choose</span>
          </button>
          <button className="cotd-mode-btn" onClick={() => setMode("physical")}>
            <span className="cotd-mode-icon">🂠</span>
            <span className="cotd-mode-label">Log a physical pull</span>
            <span className="cotd-mode-sub">I pulled from my deck</span>
          </button>
        </div>
      ) : mode === "digital" ? (
        /* ── Digital draw ── */
        <>
          {!revealed ? (
            <div className={`cotd-card-back ${animating ? "flipping" : ""}`} onClick={reveal}>
              <div className="cotd-back-design">
                <div className="cotd-back-inner">
                  <span className="cotd-back-symbol">✶</span>
                  <span className="cotd-back-text">turn the card</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cotd-revealed">
              <div className="cotd-card-face" style={{ "--suit-color": suitColor(todayDraw.card) }}>
                <span className="cotd-suit" style={{ color: suitColor(todayDraw.card) }}>{suitSymbol(todayDraw.card)}</span>
                <span className="cotd-card-name">{todayDraw.card}</span>
                {todayDraw.reversed && <span className="reversed-tag">reversed</span>}
              </div>
              <p className="card-meaning-text">{getCardMeaning(todayDraw.card, todayDraw.reversed)}</p>
              {!showMusings ? (
                <button className="cotd-log-btn" onClick={() => setShowMusings(true)}>+ Log to journal</button>
              ) : (
                <div className="cotd-musings" style={{ marginTop: "1rem", width: "100%", maxWidth: "380px", marginLeft: "auto", marginRight: "auto", animation: "fadeIn 0.3s ease" }}>
                  <textarea className="n-textarea" rows={3} placeholder="What does this card stir in you today?..." value={musings} onChange={e => setMusings(e.target.value)} style={{ fontSize: "0.82rem", textAlign: "left" }} autoFocus />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "center" }}>
                    <button className="save-btn" style={{ fontSize: "0.5rem", padding: "0.35rem 1rem" }} onClick={handleLogDigital}>Record</button>
                    <button className="cancel-btn" style={{ fontSize: "0.5rem", padding: "0.35rem 0.7rem" }} onClick={() => { setShowMusings(false); setMusings(""); }}>Skip & log</button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button className="cotd-switch-mode" onClick={() => { setMode(null); setRevealed(false); setShowMusings(false); setMusings(""); }}>← choose differently</button>
        </>
      ) : (
        /* ── Physical pull ── */
        <div className="cotd-physical">
          <div className="form-section" style={{ marginBottom: "0.8rem" }}>
            <span className="form-label">What did you pull?</span>
            <CardInput
              value={physicalCard}
              reversed={physicalReversed}
              onChange={setPhysicalCard}
              onReversedChange={setPhysicalReversed}
              placeholder="Type the card you drew..."
            />
          </div>

          {physicalMeaning && (
            <div className="inline-meaning" style={{ marginBottom: "0.8rem", animation: "fadeIn 0.2s ease" }}>
              <span className="inline-meaning-icon" style={{ color: suitColor(physicalCard) }}>{suitSymbol(physicalCard)}</span>
              <span className="inline-meaning-text">{physicalMeaning}</span>
            </div>
          )}

          <div className="form-section" style={{ marginBottom: "0.8rem" }}>
            <span className="form-label">Musings</span>
            <textarea className="n-textarea" rows={3} placeholder="What does this card stir in you today?..." value={musings} onChange={e => setMusings(e.target.value)} style={{ fontSize: "0.82rem" }} />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button className="save-btn" style={{ fontSize: "0.5rem", padding: "0.35rem 1rem" }} onClick={handleLogPhysical} disabled={!physicalValid}>Record</button>
            <button className="cotd-switch-mode" onClick={() => { setMode(null); setPhysicalCard(""); setPhysicalReversed(false); setMusings(""); }}>← choose differently</button>
          </div>
        </div>
      )}
    </div>
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

  const suitColors = { Major: "#b8a8d0", Wands: "#c9a84c", Cups: "#7a9cc4", Swords: "#a8c4b8", Pentacles: "#9ab87a" };
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
                      opacity: 0.6,
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
                    <p className="cal-detail-preview" style={{ fontStyle: "italic" }}>"{r.question}"</p>
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
              <p className="cal-detail-preview" style={{ color: "#3a4a3a" }}>nothing recorded this day</p>
              <span className="cal-detail-link">start a journal entry →</span>
            </div>
          )}
        </div>
      )}
    </div>
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
            <span style={{ color: suitColor(selected), fontSize: "1.5rem" }}>{suitSymbol(selected)}</span>
            <div>
              <span className="library-card-name" style={{ color: suitColor(selected) }}>{selected}</span>
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
    { name: "Major Arcana", cards: MAJOR_ARCANA, color: "#b8a8d0", sym: "✶" },
    { name: "Wands", cards: MINOR_ARCANA.filter(c => c.includes("Wands")), color: "#c9a84c", sym: "🜂" },
    { name: "Cups", cards: MINOR_ARCANA.filter(c => c.includes("Cups")), color: "#7a9cc4", sym: "🜄" },
    { name: "Swords", cards: MINOR_ARCANA.filter(c => c.includes("Swords")), color: "#a8c4b8", sym: "🜁" },
    { name: "Pentacles", cards: MINOR_ARCANA.filter(c => c.includes("Pentacles")), color: "#9ab87a", sym: "🜃" },
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

  // ── New reading ────────────────────────────────────────────
  const startNew = () => {
    setSpread("single"); setQuestion(""); setCards({}); setReversals({}); setNotes(""); setTags([]);
    setView("new");
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
  const today = getMoonPhase();
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
    <div className="grimoire-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Cinzel+Decorative:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #090c09; }
        ::-webkit-scrollbar-thumb { background: #1e2a1e; border-radius: 2px; }

        .grimoire-root {
          min-height: 100vh; background: #090c09; color: #c8c4b0;
          font-family: 'IM Fell English', Georgia, serif; position: relative;
        }
        .grimoire-root::before {
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(138,170,138,0.03) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(184,168,208,0.02) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }

        .header {
          background: linear-gradient(180deg, #0d120d 0%, rgba(9,12,9,0.95) 100%);
          border-bottom: 1px solid #1e2a1e; padding: 1rem 1.5rem;
          position: sticky; top: 0; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(12px);
        }
        .app-title {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.95rem; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #8aaa8a; margin: 0;
          text-shadow: 0 0 30px rgba(138,170,138,0.15);
        }
        .app-sub { font-family: 'IM Fell English', serif; font-style: italic; font-size: 0.72rem; color: #3a4a3a; margin: 0.15rem 0 0; }

        .nav { display: flex; gap: 0.15rem; }
        .nav-btn {
          font-family: 'Cinzel', serif; font-size: 0.5rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.3rem 0.6rem; background: none; border: 1px solid transparent;
          color: #3a4a3a; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:hover { color: #6a8a6a; border-color: #2a3a2a; }
        .nav-btn.active { color: #8aaa8a; border-color: #3a5a3a; background: rgba(138,170,138,0.05); }

        .new-btn {
          font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #090c09; background: linear-gradient(135deg, #6a8a6a, #9ab89a);
          border: none; padding: 0.4rem 1rem; cursor: pointer; transition: all 0.2s;
        }
        .new-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }

        .page { padding: 1.2rem 1.5rem; max-width: 720px; margin: 0 auto; position: relative; z-index: 1; animation: fadeIn 0.3s ease; }

        /* Home */
        .home-grid { display: flex; flex-direction: column; gap: 1.2rem; }
        .home-moon {
          background: linear-gradient(135deg, #0d120d, #101810);
          border: 1px solid #1e2a1e; padding: 1.2rem 1.5rem;
          display: flex; align-items: center; gap: 1.2rem;
        }
        .home-moon-symbol { font-size: 2rem; line-height: 1; }
        .home-moon-info { flex: 1; }
        .home-moon-name { font-family: 'Cinzel', serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #b8a8d0; }
        .home-moon-desc { font-style: italic; font-size: 0.8rem; color: #5a6a5a; margin-top: 0.2rem; }
        .home-moon-date { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.1em; color: #3a4a3a; text-transform: uppercase; }

        /* COTD */
        .cotd-container { background: linear-gradient(135deg, #0d120d, #0f1510); border: 1px solid #1e2a1e; padding: 1.2rem 1.5rem; }
        .cotd-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .cotd-label { font-family: 'Cinzel', serif; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #5a7a5a; }
        .cotd-date { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase; color: #3a4a3a; }
        .cotd-card-back {
          width: 120px; height: 180px; margin: 0 auto;
          cursor: pointer; perspective: 600px; transition: transform 0.3s;
        }
        .cotd-card-back:hover { transform: scale(1.03); }
        .cotd-card-back.flipping { animation: cardFlip 0.6s ease; }
        .cotd-back-design {
          width: 100%; height: 100%;
          background: linear-gradient(145deg, #141c14, #1a241a);
          border: 1px solid #2a3a2a;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .cotd-back-design::before { content: ''; position: absolute; inset: 4px; border: 1px solid #2a3a2a; }
        .cotd-back-design::after {
          content: ''; position: absolute; inset: 8px;
          border: 1px solid rgba(58,90,58,0.2);
          background: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(58,90,58,0.03) 8px, rgba(58,90,58,0.03) 9px);
        }
        .cotd-back-inner { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; z-index: 1; }
        .cotd-back-symbol { font-size: 1.5rem; color: #3a5a3a; }
        .cotd-back-text { font-family: 'Cinzel', serif; font-size: 0.4rem; letter-spacing: 0.2em; text-transform: uppercase; color: #2a3a2a; }
        .cotd-revealed { text-align: center; animation: fadeIn 0.4s ease; }
        .cotd-card-face {
          padding: 1rem; display: inline-flex; flex-direction: column;
          align-items: center; gap: 0.3rem;
          border: 1px solid #1e2a1e; background: #0d120d; min-width: 160px;
        }
        .cotd-suit { font-size: 1.5rem; }
        .cotd-card-name { font-family: 'Cinzel', serif; font-size: 0.85rem; font-weight: 600; color: var(--suit-color); }
        .cotd-log-btn {
          font-family: 'Cinzel', serif; font-size: 0.5rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #5a7a5a; background: none; border: 1px solid #2a3a2a;
          padding: 0.3rem 0.8rem; cursor: pointer; margin-top: 0.8rem; transition: all 0.2s;
        }
        .cotd-log-btn:hover { color: #8aaa8a; border-color: #3a5a3a; }
        .cotd-logged { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3a5a3a; display: block; margin-top: 0.8rem; }

        .cotd-mode-picker { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
        .cotd-mode-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          padding: 1rem 1.2rem; background: #0d120d; border: 1px solid #1e2a1e;
          cursor: pointer; transition: all 0.2s; min-width: 140px;
          font-family: inherit; color: inherit;
        }
        .cotd-mode-btn:hover { background: #0f150f; border-color: #3a5a3a; transform: translateY(-1px); }
        .cotd-mode-icon { font-size: 1.3rem; }
        .cotd-mode-label {
          font-family: 'Cinzel', serif; font-size: 0.5rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: #8aaa8a;
        }
        .cotd-mode-sub { font-size: 0.72rem; font-style: italic; color: #3a4a3a; }

        .cotd-switch-mode {
          font-family: 'Cinzel', serif; font-size: 0.42rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: #3a4a3a; background: none; border: none;
          cursor: pointer; padding: 0; margin-top: 0.8rem; transition: color 0.2s;
        }
        .cotd-switch-mode:hover { color: #5a7a5a; }

        .cotd-physical { animation: fadeIn 0.3s ease; }

        @keyframes cardFlip {
          0% { transform: scale(1) rotateY(0); }
          50% { transform: scale(1.05) rotateY(90deg); }
          100% { transform: scale(1) rotateY(180deg); opacity: 0; }
        }

        .home-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
        .home-tile {
          background: #0d120d; border: 1px solid #1a221a;
          padding: 1rem; cursor: pointer; transition: all 0.2s;
          display: flex; flex-direction: column; gap: 0.3rem;
        }
        .home-tile:hover { background: #0f150f; border-color: #2a3a2a; transform: translateY(-1px); }
        .home-tile-icon { font-size: 1.2rem; }
        .home-tile-label { font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #6a8a6a; }
        .home-tile-sub { font-size: 0.75rem; color: #3a4a3a; font-style: italic; }

        /* Search */
        .search-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
        .search-input {
          flex: 1; background: #0d120d; border: 1px solid #1e2a1e;
          color: #c8c4b0; font-family: 'IM Fell English', serif;
          font-size: 0.85rem; padding: 0.45rem 0.7rem; outline: none; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #3a5a3a; }
        .search-input::placeholder { color: #2a3a2a; }

        .filter-tags { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
        .filter-tag {
          font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 0.2rem 0.5rem;
          border: 1px solid #1e2a1e; color: #3a4a3a; cursor: pointer;
          transition: all 0.2s; background: none;
        }
        .filter-tag:hover { color: #5a7a5a; border-color: #2a3a2a; }
        .filter-tag.active { color: #8aaa8a; border-color: #3a5a3a; background: rgba(138,170,138,0.06); }

        .reading-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .reading-card {
          background: #0d120d; border: 1px solid #1a221a; border-left: 2px solid #3a5a3a;
          padding: 0.9rem 1rem; cursor: pointer; transition: all 0.2s; animation: fadeIn 0.2s ease;
        }
        .reading-card:hover { background: #0f150f; border-left-color: #6a8a6a; }
        .reading-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
        .reading-date { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase; color: #3a4a3a; margin: 0 0 0.3rem; display: flex; align-items: center; gap: 0.4rem; }
        .reading-question { font-size: 0.92rem; color: #c8c4b0; margin: 0 0 0.4rem; line-height: 1.4; font-style: italic; }
        .reading-question-empty { font-size: 0.85rem; color: #3a4a3a; font-style: italic; margin: 0 0 0.4rem; }
        .reading-spread-badge { font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.1em; text-transform: uppercase; color: #5a7a5a; border: 1px solid #2a3a2a; padding: 0.1rem 0.35rem; display: inline-block; }
        .card-preview { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.4rem; }
        .card-chip { font-size: 0.75rem; color: #8a9a8a; }
        .card-chip.reversed { opacity: 0.6; text-decoration: line-through; text-decoration-color: #5a6a5a; }
        .reading-tags { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.4rem; }
        .reading-tag-pill { font-family: 'Cinzel', serif; font-size: 0.4rem; letter-spacing: 0.08em; text-transform: uppercase; color: #5a6a5a; border: 1px solid #1e2a1e; padding: 0.08rem 0.3rem; background: rgba(138,170,138,0.03); }
        .delete-btn { background: none; border: none; color: #2a3a2a; cursor: pointer; font-size: 0.75rem; padding: 0.1rem 0.3rem; transition: color 0.2s; flex-shrink: 0; }
        .delete-btn:hover { color: #8a4a4a; }

        /* Detail */
        .detail-back { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.12em; text-transform: uppercase; color: #5a7a5a; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.3rem; }
        .detail-back:hover { color: #8aaa8a; }
        .detail-question { font-size: 1.05rem; font-style: italic; color: #d8d4c0; line-height: 1.5; margin: 0 0 0.3rem; }
        .detail-meta { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase; color: #3a4a3a; margin: 0 0 0.4rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

        .cards-layout { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
        .card-row {
          display: flex; align-items: flex-start; gap: 0.8rem;
          padding: 0.6rem 0.8rem; background: #0d120d;
          border: 1px solid #1a221a; border-left: 2px solid var(--suit-color);
          position: relative;
        }
        .card-position { font-family: 'Cinzel', serif; font-size: 0.48rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3a4a3a; min-width: 85px; margin-top: 0.15rem; flex-shrink: 0; }
        .card-name { font-size: 0.9rem; color: var(--suit-color); flex: 1; }
        .card-name.reversed { font-style: italic; opacity: 0.75; }
        .reversed-tag { font-family: 'Cinzel', serif; font-size: 0.4rem; letter-spacing: 0.08em; text-transform: uppercase; color: #6a4a4a; border: 1px solid #4a2a2a; padding: 0.08rem 0.25rem; margin-left: 0.4rem; vertical-align: middle; }
        .reversed-tag-sm { font-family: 'Cinzel', serif; font-size: 0.35rem; letter-spacing: 0.08em; text-transform: uppercase; color: #6a4a4a; border: 1px solid #4a2a2a; padding: 0.05rem 0.2rem; margin-left: 0.3rem; vertical-align: middle; }
        .suit-sym { font-size: 0.85rem; flex-shrink: 0; }
        .card-whisper { font-size: 0.68rem; color: #3a4a3a; font-style: italic; position: absolute; right: 0.8rem; bottom: 0.25rem; }
        .card-whisper-inline { font-size: 0.68rem; color: #3a4a3a; font-style: italic; flex-shrink: 0; }

        .card-meaning-text {
          font-size: 0.8rem; font-style: italic; color: #7a8a6a;
          margin-top: 0.7rem; line-height: 1.5; max-width: 320px;
          margin-left: auto; margin-right: auto;
        }

        .card-row-with-meaning {
          background: #0d120d; border: 1px solid #1a221a;
          border-left: 2px solid var(--suit-color);
          padding: 0.6rem 0.8rem; position: relative;
        }
        .card-row-main {
          display: flex; align-items: flex-start; gap: 0.8rem;
        }
        .card-meaning-row {
          font-size: 0.75rem; font-style: italic; color: #5a6a5a;
          margin-top: 0.3rem; padding-left: 1.65rem; line-height: 1.4;
        }

        /* Celtic Cross */
        .celtic-cross-container { margin-bottom: 1.5rem; overflow-x: auto; }
        .celtic-cross-grid { display: flex; gap: 1.5rem; min-width: 500px; align-items: flex-start; }
        .cross-section {
          display: grid;
          grid-template-areas: ".      crown   ." "past   center  future" ".      found   .";
          grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto auto;
          gap: 0.4rem; flex: 1;
        }
        .cross-pos { display: flex; justify-content: center; align-items: center; min-height: 70px; }
        .cross-pos.crown { grid-area: crown; }
        .cross-pos.past { grid-area: past; }
        .cross-pos.center { grid-area: center; position: relative; min-height: 100px; }
        .cross-pos.future { grid-area: future; }
        .cross-pos.foundation { grid-area: found; }
        .cross-challenge-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); opacity: 0.85; z-index: 2; }
        .staff-section { display: flex; flex-direction: column; gap: 0.4rem; min-width: 140px; }
        .cross-card-spatial {
          background: #0d120d; border: 1px solid #1a221a;
          border-left: 2px solid var(--suit-color);
          padding: 0.4rem 0.6rem; width: 100%;
          display: flex; flex-direction: column; gap: 0.1rem;
        }
        .cross-position-label { font-family: 'Cinzel', serif; font-size: 0.38rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3a4a3a; }
        .cross-suit-sym { font-size: 0.7rem; }
        .cross-card-name { font-size: 0.78rem; color: var(--suit-color); }
        .cross-card-name.reversed { font-style: italic; opacity: 0.75; }
        .cross-whisper { font-size: 0.55rem; color: #3a4a3a; font-style: italic; }
        .cross-meaning { font-size: 0.55rem; color: #5a6a5a; font-style: italic; line-height: 1.4; margin-top: 0.1rem; }

        .notes-section { margin-top: 1rem; }
        .notes-label { font-family: 'Cinzel', serif; font-size: 0.5rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #5a7a5a; margin: 0 0 0.4rem; }
        .notes-text { font-size: 0.88rem; color: #9a9a88; line-height: 1.7; white-space: pre-wrap; font-style: italic; }

        /* Form */
        .form-section { margin-bottom: 1.2rem; }
        .form-label { font-family: 'Cinzel', serif; font-size: 0.5rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #5a7a5a; margin: 0 0 0.4rem; display: block; }
        .spread-tabs { display: flex; gap: 0; border: 1px solid #1e2a1e; width: fit-content; margin-bottom: 1rem; }
        .spread-tab {
          font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.35rem 0.8rem; cursor: pointer;
          border-right: 1px solid #1e2a1e; color: #3a4a3a;
          background: transparent; transition: all 0.2s;
        }
        .spread-tab:last-child { border-right: none; }
        .spread-tab.active { color: #8aaa8a; background: rgba(138,170,138,0.06); }
        .spread-tab:hover:not(.active) { color: #5a7a5a; }

        .q-input { width: 100%; background: #0d120d; border: 1px solid #1e2a1e; color: #d8d4c0; font-family: 'IM Fell English', serif; font-style: italic; font-size: 0.95rem; padding: 0.5rem 0.7rem; outline: none; transition: border-color 0.2s; }
        .q-input:focus { border-color: #3a5a3a; }
        .q-input::placeholder { color: #2a3a2a; }

        .positions-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .position-row { display: flex; flex-direction: column; gap: 0.2rem; }
        .inline-meaning {
          display: flex; align-items: flex-start; gap: 0.35rem;
          padding: 0.35rem 0.5rem; margin-top: 0.1rem;
          background: rgba(138,170,138,0.03);
          border-left: 2px solid #2a3a2a;
        }
        .inline-meaning-icon { font-size: 0.65rem; flex-shrink: 0; margin-top: 0.05rem; }
        .inline-meaning-text { font-size: 0.73rem; font-style: italic; color: #6a7a5a; line-height: 1.4; }
        .position-label { font-family: 'Cinzel', serif; font-size: 0.45rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #4a6a4a; }
        .card-input { background: #0d120d; border: 1px solid #1e2a1e; color: #d8d4c0; font-family: 'IM Fell English', serif; font-size: 0.88rem; padding: 0.4rem 0.7rem; outline: none; transition: border-color 0.2s; width: 100%; }
        .card-input:focus { border-color: #3a5a3a; }
        .card-input::placeholder { color: #2a3a2a; }
        .card-dropdown { position: absolute; left: 0; right: 0; top: calc(100% + 2px); background: #141c14; border: 1px solid #2a3a2a; z-index: 50; max-height: 200px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.7); }
        .card-option { font-family: 'IM Fell English', serif; font-size: 0.85rem; padding: 0.35rem 0.7rem; cursor: pointer; color: #9a9a88; transition: background 0.1s; display: flex; align-items: center; }
        .card-option:hover { background: rgba(138,170,138,0.06); color: #c8c4b0; }
        .rev-toggle { font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.3rem 0.45rem; border: 1px solid #1e2a1e; color: #3a4a3a; cursor: pointer; white-space: nowrap; transition: all 0.2s; background: #0d120d; }
        .rev-toggle.active { color: #8a6a6a; border-color: #4a2a2a; background: rgba(138,106,106,0.08); }

        .n-textarea { width: 100%; background: #0d120d; border: 1px solid #1e2a1e; color: #c8c4b0; font-family: 'IM Fell English', serif; font-size: 0.88rem; padding: 0.5rem 0.7rem; outline: none; resize: vertical; line-height: 1.6; transition: border-color 0.2s; }
        .n-textarea:focus { border-color: #3a5a3a; }
        .n-textarea::placeholder { color: #2a3a2a; }

        .tag-input-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
        .tags-display { display: flex; gap: 0.3rem; flex-wrap: wrap; }
        .tag-pill { font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.1em; text-transform: uppercase; color: #8aaa8a; border: 1px solid #3a5a3a; padding: 0.15rem 0.5rem; background: rgba(138,170,138,0.06); display: inline-flex; align-items: center; gap: 0.3rem; }
        .tag-remove { cursor: pointer; color: #5a7a5a; font-size: 0.65rem; }
        .tag-remove:hover { color: #8a4a4a; }

        .form-actions { display: flex; gap: 0.6rem; margin-top: 1.2rem; }
        .save-btn { font-family: 'Cinzel', serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #090c09; background: linear-gradient(135deg, #6a8a6a, #9ab89a); border: none; padding: 0.45rem 1.3rem; cursor: pointer; }
        .save-btn:disabled { opacity: 0.3; cursor: default; }
        .save-btn:not(:disabled):hover { filter: brightness(1.12); }
        .cancel-btn { font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3a4a3a; background: none; border: 1px solid #1e2a1e; padding: 0.45rem 1rem; cursor: pointer; transition: all 0.2s; }
        .cancel-btn:hover { border-color: #3a5a3a; color: #5a7a5a; }

        /* Daily Journal */
        .daily-moon-block { display: flex; align-items: center; gap: 0.8rem; background: linear-gradient(135deg, #0d120d, #101810); border: 1px solid #1e2a1e; padding: 0.8rem 1rem; margin-bottom: 1.2rem; }
        .daily-moon-sym { font-size: 1.5rem; }
        .daily-moon-text { font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #b8a8d0; }
        .daily-moon-desc { font-size: 0.75rem; font-style: italic; color: #5a6a5a; margin-top: 0.1rem; }
        .daily-date-nav { display: flex; align-items: center; gap: 0.6rem; }
        .daily-date-btn { background: none; border: 1px solid #1e2a1e; color: #5a7a5a; cursor: pointer; padding: 0.2rem 0.5rem; font-size: 0.8rem; transition: all 0.2s; font-family: 'Cinzel', serif; }
        .daily-date-btn:hover { border-color: #3a5a3a; color: #8aaa8a; }
        .daily-date-display { font-family: 'Cinzel', serif; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #8aaa8a; min-width: 140px; text-align: center; }
        .daily-today-btn { font-family: 'Cinzel', serif; font-size: 0.4rem; letter-spacing: 0.1em; text-transform: uppercase; background: none; border: 1px solid #1e2a1e; color: #3a4a3a; padding: 0.15rem 0.4rem; cursor: pointer; transition: all 0.2s; }
        .daily-today-btn:hover { color: #5a7a5a; border-color: #2a3a2a; }

        .mood-picker { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .mood-btn { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; padding: 0.4rem 0.5rem; border: 1px solid #1e2a1e; background: none; cursor: pointer; transition: all 0.2s; min-width: 50px; }
        .mood-btn:hover { border-color: #2a3a2a; background: rgba(138,170,138,0.03); }
        .mood-btn.active { border-color: #3a5a3a; background: rgba(138,170,138,0.08); }
        .mood-emoji { font-size: 1rem; }
        .mood-label { font-family: 'Cinzel', serif; font-size: 0.35rem; letter-spacing: 0.08em; text-transform: uppercase; color: #3a4a3a; }
        .mood-btn.active .mood-label { color: #8aaa8a; }

        .daily-textarea { width: 100%; background: #0d120d; border: 1px solid #1e2a1e; color: #c8c4b0; font-family: 'IM Fell English', serif; font-size: 0.9rem; padding: 0.8rem; outline: none; resize: vertical; line-height: 1.8; transition: border-color 0.2s; min-height: 200px; }
        .daily-textarea:focus { border-color: #3a5a3a; }
        .daily-textarea::placeholder { color: #2a3a2a; }

        .daily-save-row { display: flex; align-items: center; gap: 0.8rem; margin-top: 0.8rem; }
        .daily-save-btn { font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #090c09; background: linear-gradient(135deg, #6a8a6a, #9ab89a); border: none; padding: 0.4rem 1rem; cursor: pointer; }
        .daily-save-btn:hover { filter: brightness(1.12); }
        .daily-saved { font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.1em; text-transform: uppercase; color: #3a5a3a; animation: fadeIn 0.3s ease; }

        /* Reflection prompt */
        .prompt-nudge {
          font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: #3a4a3a; background: none;
          border: 1px dashed #1e2a1e; padding: 0.3rem 0.7rem;
          cursor: pointer; transition: all 0.2s; margin-bottom: 0.8rem;
        }
        .prompt-nudge:hover { color: #5a7a5a; border-color: #3a5a3a; }
        .prompt-text {
          font-style: italic; font-size: 0.88rem; color: #7a8a6a;
          padding: 0.7rem 1rem; margin-bottom: 1rem;
          border-left: 2px solid #3a5a3a;
          background: rgba(138,170,138,0.03);
          animation: fadeIn 0.4s ease;
          line-height: 1.6;
        }

        /* Stats */
        .stats-tabs { display: flex; gap: 0; border: 1px solid #1e2a1e; width: fit-content; margin-bottom: 1.2rem; }
        .stats-tab {
          font-family: 'Cinzel', serif; font-size: 0.5rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.35rem 0.7rem; cursor: pointer;
          border-right: 1px solid #1e2a1e; color: #3a4a3a;
          background: transparent; transition: all 0.2s;
        }
        .stats-tab:last-child { border-right: none; }
        .stats-tab.active { color: #8aaa8a; background: rgba(138,170,138,0.06); }
        .stats-tab:hover:not(.active) { color: #5a7a5a; }

        .stats-summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; margin-bottom: 1.5rem; }
        .stat-box { background: #0d120d; border: 1px solid #1a221a; padding: 0.7rem 0.8rem; }
        .stat-box-label { font-family: 'Cinzel', serif; font-size: 0.45rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3a4a3a; margin: 0 0 0.2rem; }
        .stat-box-value { font-family: 'Cinzel', serif; font-size: 1.3rem; color: #8aaa8a; margin: 0; }

        .stats-grid { display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.8rem; }
        .stat-row { display: flex; align-items: center; gap: 0.6rem; }
        .stat-card { font-size: 0.82rem; color: var(--suit-color); min-width: 150px; }
        .stat-bar-wrap { flex: 1; background: #1a221a; height: 3px; border-radius: 2px; }
        .stat-bar { height: 3px; border-radius: 2px; background: var(--suit-color); opacity: 0.6; transition: width 0.5s ease; }
        .stat-count { font-family: 'Cinzel', serif; font-size: 0.5rem; color: #3a4a3a; min-width: 20px; text-align: right; }
        .stat-label { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase; color: #3a4a3a; margin-bottom: 0.5rem; }

        .suit-dist { display: flex; gap: 0.5rem; margin-top: 0.8rem; flex-wrap: wrap; }
        .suit-dist-item { background: #0d120d; border: 1px solid #1a221a; padding: 0.5rem 0.7rem; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; min-width: 60px; }
        .suit-dist-sym { font-size: 1rem; }
        .suit-dist-count { font-family: 'Cinzel', serif; font-size: 0.9rem; color: #8aaa8a; }
        .suit-dist-name { font-family: 'Cinzel', serif; font-size: 0.38rem; letter-spacing: 0.08em; text-transform: uppercase; color: #3a4a3a; }

        /* Card pairs */
        .pair-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .pair-row {
          background: #0d120d; border: 1px solid #1a221a;
          padding: 0.6rem 0.8rem; display: flex; align-items: center;
          gap: 0.6rem; animation: fadeIn 0.2s ease;
        }
        .pair-cards { flex: 1; font-size: 0.85rem; color: #c8c4b0; }
        .pair-arrow { color: #3a5a3a; font-size: 0.75rem; margin: 0 0.2rem; }
        .pair-count { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.1em; color: #5a7a5a; min-width: 40px; text-align: right; }
        .pair-empty { font-style: italic; color: #2a3a2a; font-size: 0.85rem; padding: 1.5rem 0; text-align: center; }

        /* Timeline */
        .timeline-container { margin: 1rem 0; overflow-x: auto; }
        .timeline-scroll { display: flex; gap: 0.3rem; align-items: flex-end; min-height: 180px; padding-bottom: 0.5rem; }
        .timeline-month {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.2rem; min-width: 55px; flex-shrink: 0;
        }
        .timeline-month-label { font-family: 'Cinzel', serif; font-size: 0.38rem; letter-spacing: 0.08em; text-transform: uppercase; color: #3a4a3a; order: 3; }
        .timeline-bar-stack {
          width: 28px; display: flex; flex-direction: column;
          border-radius: 2px; overflow: hidden; order: 1;
          border: 1px solid #1a221a;
        }
        .timeline-bar-segment { width: 100%; transition: height 0.4s ease; }
        .timeline-count { font-family: 'Cinzel', serif; font-size: 0.45rem; color: #5a7a5a; order: 2; }
        .timeline-top { font-size: 0.55rem; white-space: nowrap; order: 4; max-width: 80px; overflow: hidden; text-overflow: ellipsis; }

        /* Moon distribution */
        .moon-dist-list { display: flex; flex-direction: column; gap: 0.3rem; }
        .moon-dist-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.3rem 0; }
        .moon-dist-phase { font-size: 0.85rem; min-width: 130px; color: #b8a8d0; display: flex; align-items: center; gap: 0.4rem; }
        .moon-dist-phase-name { font-size: 0.78rem; }
        .moon-dist-bar-wrap { flex: 1; background: #1a221a; height: 3px; border-radius: 2px; }
        .moon-dist-bar { height: 3px; border-radius: 2px; background: #b8a8d0; opacity: 0.5; transition: width 0.5s ease; }

        /* Mood distribution in stats */
        .mood-dist { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
        .mood-dist-item { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; background: #0d120d; border: 1px solid #1a221a; padding: 0.4rem 0.6rem; min-width: 50px; }
        .mood-dist-emoji { font-size: 1rem; }
        .mood-dist-count { font-family: 'Cinzel', serif; font-size: 0.8rem; color: #8aaa8a; }
        .mood-dist-label { font-family: 'Cinzel', serif; font-size: 0.35rem; letter-spacing: 0.08em; text-transform: uppercase; color: #3a4a3a; }

        /* Calendar */
        .cal-container { }
        .cal-nav { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem; }
        .cal-month-label {
          font-family: 'Cinzel', serif; font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase; color: #8aaa8a;
          min-width: 160px; text-align: center;
        }
        .cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
          margin-bottom: 0.8rem;
        }
        .cal-day-header {
          font-family: 'Cinzel', serif; font-size: 0.38rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase; color: #3a4a3a;
          text-align: center; padding: 0.3rem 0;
        }
        .cal-cell {
          aspect-ratio: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0.15rem;
          background: #0d120d; border: 1px solid #141c14;
          cursor: pointer; transition: all 0.15s; position: relative;
          min-height: 40px;
        }
        .cal-cell.empty { background: transparent; border-color: transparent; cursor: default; }
        .cal-cell.future { opacity: 0.3; cursor: default; }
        .cal-cell:not(.empty):not(.future):hover { background: #0f150f; border-color: #2a3a2a; }
        .cal-cell.today { border-color: #3a5a3a; }
        .cal-cell.today .cal-day-num { color: #8aaa8a; }
        .cal-cell.selected { background: #0f150f; border-color: #5a8a5a; box-shadow: 0 0 8px rgba(138,170,138,0.1); }
        .cal-cell.has-entry { background: #0e140e; }

        .cal-day-num {
          font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 600; color: #5a6a5a;
        }
        .cal-dots { display: flex; gap: 3px; }
        .cal-dot {
          width: 4px; height: 4px; border-radius: 50%; display: inline-block;
        }
        .cal-dot.journal-dot { background: #7a9cc4; }
        .cal-dot.reading-dot { background: #c9a84c; }
        .cal-mood-mini { font-size: 0.5rem; line-height: 1; position: absolute; bottom: 2px; right: 3px; }

        .cal-legend {
          display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.2rem;
        }
        .cal-legend-item {
          font-family: 'Cinzel', serif; font-size: 0.4rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: #3a4a3a;
          display: flex; align-items: center; gap: 0.3rem;
        }

        .cal-detail {
          background: #0d120d; border: 1px solid #1e2a1e; padding: 1rem;
        }
        .cal-detail-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.8rem;
        }
        .cal-detail-date {
          font-family: 'Cinzel', serif; font-size: 0.55rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: #8aaa8a;
        }
        .cal-detail-label {
          font-family: 'Cinzel', serif; font-size: 0.48rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: #5a7a5a;
        }
        .cal-detail-section {
          padding: 0.6rem 0.8rem; background: rgba(138,170,138,0.02);
          border: 1px solid #1a221a; transition: all 0.15s;
        }
        .cal-detail-section.clickable { cursor: pointer; }
        .cal-detail-section.clickable:hover { background: rgba(138,170,138,0.05); border-color: #2a3a2a; }
        .cal-detail-preview {
          font-size: 0.8rem; color: #9a9a88; line-height: 1.5;
          margin: 0.3rem 0 0.2rem; font-style: normal;
        }
        .cal-detail-link {
          font-family: 'Cinzel', serif; font-size: 0.42rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: #5a7a5a; display: block; margin-top: 0.3rem;
        }

        /* Library */
        .library-card-detail {
          margin-top: 1.2rem; background: #0d120d; border: 1px solid #1a221a; padding: 1.2rem;
        }
        .library-card-header {
          display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;
        }
        .library-card-name {
          font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 600; display: block;
        }
        .library-card-count {
          font-size: 0.7rem; color: #3a4a3a; font-style: italic; display: block; margin-top: 0.1rem;
        }
        .library-meanings { display: flex; flex-direction: column; gap: 0.8rem; }
        .library-meaning-block {
          padding: 0.7rem 0.9rem;
          border-left: 2px solid #3a5a3a;
          background: rgba(138,170,138,0.03);
        }
        .library-meaning-block.reversed {
          border-left-color: #5a3a3a;
          background: rgba(138,106,106,0.03);
        }
        .library-meaning-label {
          font-family: 'Cinzel', serif; font-size: 0.45rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase; color: #5a7a5a;
          display: block; margin-bottom: 0.3rem;
        }
        .library-meaning-block.reversed .library-meaning-label { color: #7a5a5a; }
        .library-meaning-text {
          font-size: 0.88rem; font-style: italic; color: #9a9a88; line-height: 1.5; margin: 0;
        }

        .library-suits { display: flex; flex-direction: column; gap: 0.3rem; }
        .library-suit-group { }
        .library-suit-header {
          width: 100%; display: flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 0.8rem; background: #0d120d; border: 1px solid #1a221a;
          cursor: pointer; transition: all 0.2s; font-family: inherit;
          color: inherit;
        }
        .library-suit-header:hover { background: #0f150f; border-color: #2a3a2a; }
        .library-suit-header.open { border-color: #2a3a2a; background: #0f150f; }
        .library-suit-name {
          font-family: 'Cinzel', serif; font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: #8aaa8a; flex: 1; text-align: left;
        }
        .library-suit-count {
          font-family: 'Cinzel', serif; font-size: 0.42rem; letter-spacing: 0.08em;
          text-transform: uppercase; color: #3a4a3a;
        }
        .library-suit-arrow {
          font-size: 0.8rem; color: #3a4a3a; flex-shrink: 0; min-width: 1rem; text-align: center;
        }

        .library-suit-cards { padding-left: 0.5rem; border-left: 1px solid #1a221a; margin-left: 0.8rem; }
        .library-browse-card { }
        .library-browse-btn {
          width: 100%; display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.6rem; background: none; border: none; border-bottom: 1px solid #121812;
          cursor: pointer; transition: all 0.15s; font-family: inherit; color: inherit;
        }
        .library-browse-btn:hover { background: rgba(138,170,138,0.03); }
        .library-browse-name { font-size: 0.82rem; color: #c8c4b0; flex: 1; text-align: left; }
        .library-browse-count {
          font-family: 'Cinzel', serif; font-size: 0.42rem; letter-spacing: 0.08em;
          color: #3a4a3a;
        }
        .library-browse-meanings { padding: 0.6rem 0.6rem 0.8rem; }

        .divider { border: none; border-top: 1px solid #1a221a; margin: 1rem 0; }
        .empty { text-align: center; padding: 3rem 2rem; font-style: italic; color: #2a3a2a; font-size: 0.9rem; line-height: 1.8; }

        .moon-badge { display: inline-flex; align-items: center; gap: 0.25rem; }
        .moon-sm .moon-symbol { font-size: 0.7rem; }
        .moon-lg .moon-symbol { font-size: 1rem; }
        .moon-lg .moon-name { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.08em; text-transform: uppercase; color: #b8a8d0; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 600px) {
          .header { flex-direction: column; gap: 0.6rem; align-items: flex-start; }
          .stats-summary { grid-template-columns: 1fr; }
          .home-tiles { grid-template-columns: 1fr; }
          .celtic-cross-grid { min-width: 400px; }
          .page { padding: 1rem; }
          .stats-tabs { flex-wrap: wrap; }
        }
      `}</style>

      {/* ════ Header ════ */}
      <div className="header">
        <div>
          <p className="app-title">The Reading Room</p>
          <p className="app-sub">a digital grimoire</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <div className="nav">
            <button className={`nav-btn ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>Home</button>
            <button className={`nav-btn ${view === "journal" ? "active" : ""}`} onClick={() => setView("journal")}>Cards</button>
            <button className={`nav-btn ${view === "daily" ? "active" : ""}`} onClick={() => { setDailyDate(toDateKey(new Date())); setView("daily"); }}>Journal</button>
            <button className={`nav-btn ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>Calendar</button>
            <button className={`nav-btn ${view === "library" ? "active" : ""}`} onClick={() => setView("library")}>Library</button>
            <button className={`nav-btn ${view === "stats" ? "active" : ""}`} onClick={() => setView("stats")}>Patterns</button>
          </div>
          <button className="new-btn" onClick={startNew}>+ Reading</button>
        </div>
      </div>

      {/* ════ Home ════ */}
      {view === "home" && (
        <div className="page">
          <div className="home-grid">
            <div className="home-moon">
              <span className="home-moon-symbol">{today.symbol}</span>
              <div className="home-moon-info">
                <p className="home-moon-name">{today.name}</p>
                <p className="home-moon-desc">{getMoonDescription(today.name)}</p>
              </div>
              <span className="home-moon-date">{formatDate(Date.now())}</span>
            </div>

            <CardOfDay readings={readings} onQuickLog={logCardOfDay} />

            <div className="home-tiles">
              <div className="home-tile" onClick={startNew}>
                <span className="home-tile-icon">✶</span>
                <span className="home-tile-label">New Reading</span>
                <span className="home-tile-sub">draw the cards</span>
              </div>
              <div className="home-tile" onClick={() => { setDailyDate(toDateKey(new Date())); setView("daily"); }}>
                <span className="home-tile-icon">🕯️</span>
                <span className="home-tile-label">Daily Journal</span>
                <span className="home-tile-sub">{journal[toDateKey(new Date())] ? "continue writing..." : "what's on your mind?"}</span>
              </div>
              <div className="home-tile" onClick={() => setView("journal")}>
                <span className="home-tile-icon">📖</span>
                <span className="home-tile-label">Past Readings</span>
                <span className="home-tile-sub">{readings.length} reading{readings.length !== 1 ? "s" : ""} recorded</span>
              </div>
              <div className="home-tile" onClick={() => setView("stats")}>
                <span className="home-tile-icon">🔮</span>
                <span className="home-tile-label">Patterns</span>
                <span className="home-tile-sub">what keeps finding you</span>
              </div>
            </div>

            {readings.length > 0 && (
              <>
                <p className="stat-label" style={{ marginTop: "0.5rem" }}>Recent</p>
                {readings.slice(0, 3).map(r => (
                  <div key={r.id} className="reading-card" onClick={() => { setSelectedReading(r); setView("detail"); }}>
                    <p className="reading-date">
                      <MoonBadge timestamp={r.ts} />
                      {formatDateShort(r.ts)} · <span className="reading-spread-badge">{SPREADS[r.spread]?.label}</span>
                    </p>
                    {r.question ? <p className="reading-question">"{r.question}"</p> : <p className="reading-question-empty">no question asked</p>}
                    <div className="card-preview">
                      {r.cards.filter(c => c.card).map((c, i) => (
                        <span key={i} className={`card-chip ${c.reversed ? "reversed" : ""}`} style={{ color: suitColor(c.card) }}>
                          {suitSymbol(c.card)} {c.card}{c.reversed ? " ↓" : ""}
                          {i < r.cards.filter(x => x.card).length - 1 && <span style={{ color: "#2a3a2a", margin: "0 0.15rem" }}>·</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
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
                      {r.question ? <p className="reading-question">"{r.question}"</p> : <p className="reading-question-empty">no question asked</p>}
                      <div className="card-preview">
                        {r.cards.filter(c => c.card).map((c, i) => (
                          <span key={i} className={`card-chip ${c.reversed ? "reversed" : ""}`} style={{ color: suitColor(c.card) }}>
                            {suitSymbol(c.card)} {c.card}{c.reversed ? " ↓" : ""}
                            {i < r.cards.filter(x => x.card).length - 1 && <span style={{ color: "#2a3a2a", margin: "0 0.15rem" }}>·</span>}
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
            ? <p className="detail-question">"{selectedReading.question}"</p>
            : <p className="detail-question" style={{ color: "#3a4a3a" }}>no question asked</p>
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
                        <span style={{ fontSize: "0.62rem", color: "#3a4a3a", fontStyle: "italic" }}>
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
                <span className="daily-moon-sym">{phase.symbol}</span>
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
                  {r.question && <p className="reading-question" style={{ fontSize: "0.85rem" }}>"{r.question}"</p>}
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
            <span className="form-label">Card Library</span>
            <p style={{ fontSize: "0.8rem", color: "#3a4a3a", fontStyle: "italic", marginBottom: "1rem" }}>
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
                      const colors = { Major: "#b8a8d0", Wands: "#c9a84c", Cups: "#7a9cc4", Swords: "#a8c4b8", Pentacles: "#9ab87a" };
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
                  <p style={{ fontSize: "0.75rem", color: "#3a4a3a", fontStyle: "italic", marginBottom: "1rem" }}>
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
                  <p style={{ fontSize: "0.75rem", color: "#3a4a3a", fontStyle: "italic", marginBottom: "0.5rem" }}>
                    Suit colors show what energy dominated each month. Top card listed below.
                  </p>
                  <CardTimeline readings={readings} />

                  <hr className="divider" />

                  <div className="suit-dist" style={{ marginTop: "0.5rem" }}>
                    {[
                      { suit: "Major", color: "#b8a8d0", sym: "✶" },
                      { suit: "Wands", color: "#c9a84c", sym: "🜂" },
                      { suit: "Cups", color: "#7a9cc4", sym: "🜄" },
                      { suit: "Swords", color: "#a8c4b8", sym: "🜁" },
                      { suit: "Pentacles", color: "#9ab87a", sym: "🜃" },
                    ].map(s => (
                      <div key={s.suit} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ color: s.color, fontSize: "0.7rem" }}>{s.sym}</span>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.38rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3a4a3a" }}>{s.suit}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Moons & Moods ── */}
              {statsTab === "moons" && (
                <>
                  <p className="stat-label">When you read</p>
                  <p style={{ fontSize: "0.75rem", color: "#3a4a3a", fontStyle: "italic", marginBottom: "1rem" }}>
                    Which moon phases draw you to the cards
                  </p>
                  {moonDist.length > 0 && (
                    <div className="moon-dist-list">
                      {moonDist.map(([phase, count]) => {
                        const max = moonDist[0]?.[1] || 1;
                        const sym = getMoonPhase(new Date()).name === phase ? getMoonPhase(new Date()).symbol :
                          ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"][
                            ["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"].indexOf(phase)
                          ] || "🌑";
                        return (
                          <div key={phase} className="moon-dist-row">
                            <div className="moon-dist-phase">
                              <span>{sym}</span>
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
    </div>
  );
}
