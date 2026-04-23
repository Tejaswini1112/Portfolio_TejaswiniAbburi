// ===============================================================
// MEMORY-AWARE NARRATOR ENGINE
// Tracks user behavior into localStorage and derives a "mode"
// (OBSERVER / INVESTIGATOR / BUILDER / ALLY) that the AI uses
// to subtly change tone, and that the UI uses for state-aware copy.
// ===============================================================

const KEY = "uf_memory_v2";

// Defaults — additive, backwards-compat with v1 fields
const DEFAULT = {
  // Trait scores (derived from actions)
  curiosity: 0,        // chat, hover, scene completion
  empathy: 0,          // forest/protect, gentle choices
  builder_energy: 0,   // project card hover / chamber log open
  investor_intent: 0,  // CTA clicks / funding
  // Path + mode
  narrative_path: [],  // scene keys visited in order
  mode: "dark",        // "dark" | "light"
  // Discrete choices (kept from v1)
  chatOpened: 0,
  themeToggled: 0,
  forestChoice: null,    // "protect" | "observe"
  chamberChoice: null,   // "decode" | "step_back"
  supported: null,       // "tip" | "create" | "founder"
  foundEasterEgg: false,
  firstVisitAt: null,
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // migrate from v1 if present
      const old = localStorage.getItem("uf_memory_v1");
      if (old) {
        const parsed = JSON.parse(old);
        return { ...DEFAULT, ...parsed, firstVisitAt: Date.now() };
      }
      return { ...DEFAULT, firstVisitAt: Date.now() };
    }
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

function write(m) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

function emit(next) {
  try { window.dispatchEvent(new CustomEvent("uf:memory", { detail: next })); } catch {}
}

export function getMemory() {
  return read();
}

export function remember(patch) {
  const m = read();
  const next = { ...m, ...patch };
  write(next);
  emit(next);
  return next;
}

export function bump(field, by = 1) {
  const m = read();
  const next = { ...m, [field]: (m[field] || 0) + by };
  write(next);
  emit(next);
  return next;
}

// Track a scene visit (unique)
export function visitScene(key) {
  const m = read();
  if (m.narrative_path.includes(key)) return m;
  const next = { ...m, narrative_path: [...m.narrative_path, key] };
  // scene discovery itself is a mild curiosity signal
  next.curiosity = (next.curiosity || 0) + 1;
  write(next);
  emit(next);
  return next;
}

export function setMode(mode) {
  return remember({ mode });
}

// ---------------------------------------------------------------
// DERIVATIONS
// ---------------------------------------------------------------

// Compute the 4 viewer modes from trait scores + discrete events.
// Priority: ALLY > BUILDER > INVESTIGATOR > OBSERVER
export function computeMode(m = read()) {
  // ALLY — they put skin in the game (stripe)
  if (m.supported || m.investor_intent >= 1) return "ALLY";
  // BUILDER — they dug into the work
  if (m.builder_energy >= 3) return "BUILDER";
  // INVESTIGATOR — they explored / made choices / chatted
  const engaged =
    (m.curiosity || 0) +
    (m.chatOpened || 0) +
    (m.forestChoice ? 1 : 0) +
    (m.chamberChoice ? 1 : 0);
  if (engaged >= 2) return "INVESTIGATOR";
  return "OBSERVER";
}

// Snapshot used to send to the backend or render UI.
export function getStateSnapshot(m = read()) {
  return {
    curiosity: m.curiosity || 0,
    empathy: m.empathy || 0,
    builder_energy: m.builder_energy || 0,
    investor_intent: m.investor_intent || 0,
    mode: m.mode || "dark",
    viewer_mode: computeMode(m),
    narrative_path: m.narrative_path || [],
    forest_choice: m.forestChoice,
    chamber_choice: m.chamberChoice,
    supported: m.supported,
    chat_opens: m.chatOpened || 0,
    found_easter_egg: !!m.foundEasterEgg,
  };
}

// Human-readable recollection lines for the final chapter UI
export function getRecollection(m = read()) {
  const lines = [];
  if (m.chatOpened) lines.push(`you whispered to the narrator ${m.chatOpened} time${m.chatOpened > 1 ? "s" : ""}`);
  if (m.forestChoice === "protect") lines.push("you chose to protect the forest");
  if (m.forestChoice === "observe") lines.push("you observed quietly in the forest");
  if (m.chamberChoice === "decode") lines.push("you asked the chamber to decode");
  if (m.chamberChoice === "step_back") lines.push("you stepped back from the chamber");
  if (m.themeToggled) lines.push("you shifted the light");
  if ((m.builder_energy || 0) >= 3) lines.push("you read the builder's blueprints");
  if ((m.empathy || 0) >= 2) lines.push("you moved with empathy through the forest");
  if (m.foundEasterEgg) lines.push("you felt it, didn't you");
  if (m.supported) lines.push(`you funded the mission (${m.supported} tier)`);
  return lines;
}

// Mood for the "System Remembers" card — maps from the computed viewer_mode.
export function getMood(m = read()) {
  const vm = computeMode(m);
  if (vm === "ALLY") return m.supported === "founder" ? "founder" : "hopeful";
  if (vm === "BUILDER") return "engaged";
  if (vm === "INVESTIGATOR") return "engaged";
  return "neutral";
}
