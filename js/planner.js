// ─── Workout plan generator ──────────────────────────────────────────────────
// Builds a weekly plan from: goal, experience level, days/week, session length,
// the equipment currently enabled, and keywords found in the person's own words.

function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Work out the primary training focus purely from the person's own words.
const GOAL_SIGNALS = {
  fatloss:  [/\bl(o|oo)se\b|\blosing\b|\bshed\b|\bdrop\b/, /\bfat\b|\bweight\b|\blbs?\b|\bpounds?\b/, /\blean(er)?\b|\btone[d]?\b|\bslim/, /\bcut(ting)?\b|\bdeficit\b/],
  muscle:   [/\bmuscle|\bbuild|\bgrow|\bbigger|\bbulk|\bsize\b|\bhypertrophy/, /\bglutes?\b|\barms?\b|\bchest\b|\bshoulders?\b|\bsculpt|\bshapely|\bdefin(ed|ition)/],
  strength: [/\bstrength\b|\bstronger\b|\bstrong\b/, /\bheavier\b|\bheavy\b|\b1rm\b|\bpr\b|\bpowerlift/, /\bdeadlift|\bsquat.{0,12}(more|heavier|weight)/],
  athletic: [/\bathletic|\bexplosive|\bpower\b|\bspeed\b|\bagil/, /\bbox(e|i)|\bfight|\bspar|\bmartial|\bsport/, /\bcondition(ing)?\b/],
  endurance:[/\bendurance|\bstamina\b|\bcardio\b|\bengine\b/, /\brun(ning)?\b|\bjog|\b5k\b|\b10k\b|\bmarathon|\bcycle|\bhik(e|ing)/, /\bbreath|\bwinded\b/],
  fitness:  [/\bhealth|\bfit(ter|ness)?\b|\benergy\b|\bfeel\s+(good|better)/, /\bmobility|\bmove\s+better|\bflexib/, /\bgeneral\b|\bmaintain/],
};
const GOAL_PRIORITY = ["fatloss", "muscle", "strength", "athletic", "endurance", "fitness"];

function inferGoal(text) {
  const t = (text || "").toLowerCase();
  let best = "fitness", bestScore = 0;
  for (const goal of GOAL_PRIORITY) {
    const score = GOAL_SIGNALS[goal].filter(rx => rx.test(t)).length;
    if (score > bestScore) { best = goal; bestScore = score; }
  }
  return best;
}

// Decide days/week and session length from the goal — the app prescribes the
// week; the person doesn't have to know how much training a goal needs.
// Explicit asks in their own words ("3 days", "30 minutes") always win.
function prescribe(goal, level, text) {
  const base = {
    fatloss:   { days: 5, session: 45 },
    muscle:    { days: 4, session: 60 },
    strength:  { days: 4, session: 60 },
    fitness:   { days: 3, session: 45 },
    endurance: { days: 5, session: 45 },
    athletic:  { days: 5, session: 45 },
  }[goal] || { days: 3, session: 45 };

  let { days, session } = base;
  const lvl = Number(level) || 1;
  if (lvl === 1) { days = Math.max(3, days - 1); session = Math.min(session, 45); }
  if (lvl === 3 && (goal === "muscle" || goal === "strength")) days = Math.min(5, days + 1);

  const t = (text || "").toLowerCase();
  const dayAsk = t.match(/(\d)\s*(?:days?|x)\s*(?:a|per|\/)?\s*week|only\s+(\d)\s*days?/);
  if (dayAsk) days = Math.min(6, Math.max(2, Number(dayAsk[1] || dayAsk[2])));
  const minAsk = t.match(/(\d{2,3})\s*min/);
  if (minAsk) {
    const m = Number(minAsk[1]);
    if (m >= 20 && m <= 120) session = m <= 35 ? 30 : m <= 50 ? 45 : 60;
  }
  return { days, session };
}

// Scan the person's own words for things worth honouring in the plan.
function readGoalText(text) {
  const t = (text || "").toLowerCase();
  const prefs = { bag: false, run: false, core: false, pullup: false, kb: false, glutes: false };
  if (/box|punch|bag|fight|spar/.test(t)) prefs.bag = true;
  if (/run|jog|5k|10k|marathon|sprint/.test(t)) prefs.run = true;
  if (/abs|core|belly|stomach|tummy|waist/.test(t)) prefs.core = true;
  if (/pull.?up|chin.?up/.test(t)) prefs.pullup = true;
  if (/kettlebell|kb\b/.test(t)) prefs.kb = true;
  if (/glute|butt|booty|\bbum\b|peach/.test(t)) prefs.glutes = true;
  return prefs;
}

const GLUTE_BUILDERS = new Set([
  "Barbell Hip Thrust", "Cable Pull-Through", "Kettlebell Swing",
  "Barbell Romanian Deadlift", "Dumbbell Romanian Deadlift",
  "Bulgarian Split Squat", "Reverse Lunge", "Step-Up",
  "Cable Glute Kickback", "Glute Bridge",
]);

const REP_SCHEMES = {
  strength:  { main: "4 × 5 (heavy)",  second: "3 × 6–8",   iso: "2 × 10–12", core: "3 × 10–12", rest: "2–3 min on main lifts" },
  muscle:    { main: "4 × 6–8",        second: "3 × 8–12",  iso: "3 × 10–15", core: "3 × 12–15", rest: "90 s between sets" },
  fatloss:   { main: "3 × 10–12",      second: "3 × 12–15", iso: "2 × 15",    core: "3 × 15",    rest: "45–60 s — keep moving" },
  fitness:   { main: "3 × 8–10",       second: "3 × 10–12", iso: "2 × 12",    core: "3 × 12",    rest: "60–90 s" },
  endurance: { main: "2–3 × 12–15",    second: "2 × 15",    iso: "2 × 15",    core: "3 × 15",    rest: "45–60 s" },
  athletic:  { main: "4 × 5 (crisp & fast)", second: "3 × 8", iso: "2 × 12", core: "3 × 10–12", rest: "As needed — quality over burn" },
};

// slot → {pattern, role} where role picks the rep scheme line
const DAY_TEMPLATES = {
  fullA: { title: "Full Body A", slots: [
    ["squat", "main"], ["hpush", "second"], ["hpull", "second"], ["hinge", "second"], ["core", "core"]] },
  fullB: { title: "Full Body B", slots: [
    ["hinge", "main"], ["vpush", "second"], ["vpull", "second"], ["lunge", "second"], ["core", "core"]] },
  fullC: { title: "Full Body C", slots: [
    ["squat", "main"], ["vpull", "second"], ["hpush", "second"], ["isoLower", "iso"], ["core", "core"]] },
  upperA: { title: "Upper Body", slots: [
    ["hpush", "main"], ["hpull", "second"], ["vpush", "second"], ["vpull", "second"], ["isoUpper", "iso"], ["isoUpper", "iso"], ["core", "core"]] },
  lowerA: { title: "Lower Body", slots: [
    ["squat", "main"], ["hinge", "second"], ["lunge", "second"], ["isoLower", "iso"], ["isoLower", "iso"], ["core", "core"]] },
  push: { title: "Push", slots: [
    ["hpush", "main"], ["vpush", "second"], ["hpush", "second"], ["isoUpper:triceps", "iso"], ["isoUpper:shoulders", "iso"], ["core", "core"]] },
  pull: { title: "Pull", slots: [
    ["vpull", "main"], ["hpull", "second"], ["hpull", "second"], ["isoUpper:biceps", "iso"], ["isoUpper:shoulders", "iso"], ["core", "core"]] },
  legs: { title: "Legs", slots: [
    ["squat", "main"], ["hinge", "second"], ["lunge", "second"], ["isoLower", "iso"], ["isoLower", "iso"]] },
  conditioning: { title: "Conditioning", slots: [
    ["condition", "main"], ["condition", "second"], ["condition", "second"], ["core", "core"]] },
  cardio: { title: "Cardio", slots: [
    ["cardio", "main"], ["core", "core"]] },
};

// Which day templates make up a week, per days/week and goal flavour.
function weekLayout(days, goal) {
  const cardioDay = ["fatloss", "endurance", "fitness"].includes(goal) ? "cardio" : "conditioning";
  switch (days) {
    case 2: return ["fullA", "fullB"];
    case 3: return goal === "endurance" ? ["fullA", "cardio", "fullB"] : ["fullA", "fullB", "fullC"];
    case 4: return goal === "endurance"
      ? ["fullA", "cardio", "fullB", "cardio"]
      : ["upperA", "lowerA", cardioDay, "fullA"];
    case 5: return goal === "endurance"
      ? ["fullA", "cardio", "fullB", "cardio", "conditioning"]
      : ["push", "pull", "legs", cardioDay, "fullA"];
    default: return goal === "endurance"
      ? ["fullA", "cardio", "fullB", "cardio", "conditioning", "cardio"]
      : ["push", "pull", "legs", "conditioning", "upperA", "lowerA"];
  }
}

function availableExercises(equipmentOn) {
  return EXERCISES.filter(ex => ex.equip.every(id => equipmentOn[id]));
}

function pickExercise(pool, slotPattern, level, rng, usedNames, prefs) {
  let [pattern, group] = slotPattern.split(":");
  let candidates = pool.filter(ex => ex.pattern === pattern && (!group || ex.group === group));
  if (!candidates.length) candidates = pool.filter(ex => ex.pattern === pattern);
  if (!candidates.length) return null;

  // Prefer level-appropriate movements (allow one level above for a stretch goal).
  let fit = candidates.filter(ex => ex.level <= level + 1);
  if (fit.length) candidates = fit;

  // Honour things the person asked for in their own words.
  if (prefs) {
    const boosted = candidates.filter(ex =>
      (prefs.bag && ex.equip.includes("bag")) ||
      (prefs.run && (ex.equip.includes("treadmill") || ex.equip.includes("curved"))) ||
      (prefs.pullup && ex.equip.includes("rig") && ex.pattern === "vpull") ||
      (prefs.glutes && GLUTE_BUILDERS.has(ex.name)) ||
      (prefs.kb && ex.equip.includes("kb")));
    if (boosted.length && rng() < 0.7) candidates = boosted;
  }

  const fresh = candidates.filter(ex => !usedNames.has(ex.name));
  if (fresh.length) candidates = fresh;
  return candidates[Math.floor(rng() * candidates.length)];
}

function schemeFor(role, goal, ex) {
  const s = REP_SCHEMES[goal] || REP_SCHEMES.fitness;
  if (ex.name === "Pull-Up") return "4 × max reps (leave 1 in the tank)";
  if (ex.unit === "time") {
    if (ex.pattern === "cardio") {
      const mins = { fatloss: "30–40 min", endurance: "35–45 min", fitness: "25–30 min" }[goal] || "20 min";
      return mins;
    }
    if (ex.pattern === "condition") return "4–6 rounds";
    return "3 × 30–45 s";
  }
  return s[role] || s.second;
}

function modalityOf(ex) {
  if (ex.pattern === "cardio") return "cardio";
  if (ex.pattern === "condition") return "condition";
  if (ex.pattern === "core") return "core";
  return "strength";
}

function buildPlan(person, equipmentOn) {
  const goal = person.goal;
  const level = Number(person.level) || 1;
  const days = Math.min(6, Math.max(2, Number(person.days) || 3));
  const prefs = readGoalText(person.goalText);
  const rng = mulberry32(hashString(person.name + "|" + goal + "|" + days + "|" + (person.planVersion || 0)));
  const pool = availableExercises(equipmentOn);

  const layout = weekLayout(days, goal);
  const short = Number(person.session) <= 30;

  const daysOut = layout.map((key, i) => {
    const tpl = DAY_TEMPLATES[key];
    const usedToday = new Set();
    let slots = tpl.slots;
    if (short) slots = slots.slice(0, Math.max(3, slots.length - 2));

    const blocks = [];
    for (const [slotPattern, role] of slots) {
      const ex = pickExercise(pool, slotPattern, level, rng, usedToday, prefs);
      if (!ex) continue;
      usedToday.add(ex.name);
      blocks.push({
        name: ex.name,
        ref: ex.name,
        scheme: schemeFor(role, goal, ex),
        cue: ex.cue || "",
        modality: modalityOf(ex),
        main: role === "main",
      });
    }

    // Finisher for fat-loss / athletic strength days.
    const isLifting = !["cardio", "conditioning"].includes(key);
    if (isLifting && !short && ["fatloss", "athletic"].includes(goal)) {
      const fin = pickExercise(pool, "condition", level, rng, usedToday, prefs);
      if (fin) blocks.push({
        name: "Finisher — " + fin.name,
        ref: fin.name,
        scheme: fin.unit === "time" ? "5–8 min" : "3 rounds of 10–15",
        cue: fin.cue || "",
        modality: "condition",
        main: false,
      });
    }

    // Extra core if their own words asked for it.
    if (prefs.core && isLifting && !blocks.some(b => b.modality === "core")) {
      const c = pickExercise(pool, "core", level, rng, usedToday, prefs);
      if (c) blocks.push({ name: c.name, ref: c.name, scheme: schemeFor("core", goal, c), cue: c.cue || "", modality: "core", main: false });
    }

    return { title: tpl.title, blocks };
  });

  const s = REP_SCHEMES[goal] || REP_SCHEMES.fitness;
  return {
    days: daysOut,
    rest: s.rest,
    warmup: "5 min easy cardio (any machine), then 2 light sets of the first exercise.",
    notes: planNotes(goal, prefs),
  };
}

function planNotes(goal, prefs) {
  const notes = [];
  const byGoal = {
    muscle: "Add a little weight or a rep each week — that steady climb is what builds muscle.",
    strength: "The first lift of the day is the one that matters. Warm up to it properly and keep 1–2 reps in the tank.",
    fatloss: "Keep rests short and honest. The plan works if the fork co-operates — see the nutrition tab.",
    fitness: "Consistency beats intensity. A relaxed session you finish beats a perfect one you skip.",
    endurance: "Most cardio should feel easy enough to talk through. Save the hard efforts for interval days.",
    athletic: "Move fast, rest fully, stop each set while the reps are still crisp.",
  };
  notes.push(byGoal[goal] || byGoal.fitness);
  if (prefs.bag) notes.push("You mentioned boxing — bag work is prioritised in your conditioning slots.");
  if (prefs.run) notes.push("You mentioned running — treadmill work is prioritised in your cardio slots.");
  if (prefs.pullup) notes.push("You mentioned pull-ups — pull days start at the rig. Assisted reps count.");
  if (prefs.glutes) notes.push("You mentioned glutes — hip thrusts, RDLs and lunges are prioritised. Squeeze hard at the top of every rep.");
  return notes;
}
