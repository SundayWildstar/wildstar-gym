// ─── Custom coached programs, referenced by person.program key ───────────────
// A program replaces the auto-generated week with a fixed day-by-day calendar.
// Every item is checkable; `ref` links an item to the exercise how-to library.

function progItem(t, k, ref) { return { t, k, ref: ref || null }; }

function buildAmelia30() {
  const L = (t, ref) => progItem(t, "lift", ref);
  const C = (t, ref) => progItem(t, "cardio", ref);
  const K = (t, ref) => progItem(t, "core", ref);
  const F = t => progItem(t, "food");
  const H = t => progItem(t, "habit");

  const stdFood = cal => F(`Eat to plan — ~${cal.toLocaleString()} kcal, 135–145 g protein`);
  const steps = () => H("10,000–12,000 steps");

  // ── Reusable session blocks (adapted to the Wildstar gym: rack not Smith,
  //    kneeling cable pulldown, elliptical/treadmill/Excite for Zone 2).
  const heavyGluteHam = () => [
    L("Hip thrust (rack) — 4 × 10", "Barbell Hip Thrust"),
    L("Romanian deadlift — 4 × 10", "Barbell Romanian Deadlift"),
    L("Leg press, feet high & slightly wide — 4 × 10", "Leg Press"),
    L("Leg curl — 3 × 12", "Lying / Seated Leg Curl"),
    L("Cable glute kickback — 3 × 15 each leg", "Cable Glute Kickback"),
    L("Cable hip abduction — 3 × 20 each side", "Cable Hip Abduction"),
    C("Incline walk — 15 min", "Treadmill Incline Walk"),
  ];
  const upperBody = (zone2min) => [
    L("Kneeling cable lat pulldown — 3 × 10", "Kneeling Cable Lat Pulldown"),
    L("Cable row — 3 × 10", "Cable Row"),
    L("Dumbbell floor press — 3 × 10", "Dumbbell Floor Press"),
    L("Dumbbell shoulder press — 3 × 10", "Dumbbell Shoulder Press"),
    L("Dumbbell curls — 2 × 12", "Dumbbell Biceps Curl"),
    L("Cable triceps pressdown — 2 × 12", "Cable Triceps Pressdown"),
    C(`Zone 2 cardio — ${zone2min} min (elliptical / treadmill / Excite)`, "Elliptical Steady State"),
  ];
  const gluteQuad = () => [
    L("Squat (rack) — 4 × 8–10", "Barbell Back Squat"),
    L("Bulgarian split squat — 3 × 10 each leg", "Bulgarian Split Squat"),
    L("Leg press — 3 × 12", "Leg Press"),
    L("Reverse lunges with dumbbells — 3 × 10 each leg", "Reverse Lunge"),
    L("Leg extension — 3 × 12", "Leg Extension"),
    L("Cable glute kickback — 3 × 15", "Cable Glute Kickback"),
    C("Incline walk — 10 min", "Treadmill Incline Walk"),
  ];
  const recovery = (zone2) => [
    C(`Zone 2 cardio — ${zone2} (incline walk or elliptical)`, "Treadmill Incline Walk"),
    K("Core — 10–15 min: ab machine, planks, cable work", "Total Ab Machine Crunch"),
  ];
  const heavyGluteB = () => [
    L("Hip thrust (rack) — 5 × 6–8", "Barbell Hip Thrust"),
    L("Romanian deadlift — 3 × 8", "Barbell Romanian Deadlift"),
    L("Leg press, glute-biased — 4 × 10", "Leg Press"),
    L("Bulgarian split squat — 3 × 8 each leg", "Bulgarian Split Squat"),
    L("Leg curl — 3 × 10", "Lying / Seated Leg Curl"),
    L("Cable glute kickback — 3 × 12 each", "Cable Glute Kickback"),
    L("Cable hip abduction — 3 × 20", "Cable Hip Abduction"),
  ];
  const fullBodyPump = (zone2min) => [
    L("Kettlebell swings — 3 × 15", "Kettlebell Swing"),
    L("Goblet squat — 3 × 12", "Goblet Squat"),
    L("Dumbbell walking lunges — 3 × 12 each leg", "Walking Lunge"),
    L("Cable row — 3 × 12", "Cable Row"),
    L("Push-ups or dumbbell press — 3 × 10", "Push-Up"),
    L("Glute bridges — 3 × 20", "Glute Bridge"),
    C(`Zone 2 cardio — ${zone2min} min`, "Elliptical Steady State"),
  ];
  const restDay = (note) => [
    H(note || "Easy walking, stretching, mobility — no lifting"),
  ];
  const gluteStrengthW3 = () => [
    L("Hip thrust (rack) — 5 × 6–8", "Barbell Hip Thrust"),
    L("Romanian deadlift — 4 × 8", "Barbell Romanian Deadlift"),
    L("Leg press — 4 × 8", "Leg Press"),
    L("Leg curl — 3 × 10", "Lying / Seated Leg Curl"),
    L("Cable glute kickback — 3 × 15", "Cable Glute Kickback"),
    L("Cable hip abduction — 3 × 20", "Cable Hip Abduction"),
  ];
  const gluteQuadW3 = () => [
    L("Squat (rack) — 4 × 8", "Barbell Back Squat"),
    L("Bulgarian split squat — 4 × 8 each leg", "Bulgarian Split Squat"),
    L("Leg press — 3 × 10", "Leg Press"),
    L("Reverse lunge — 3 × 10 each leg", "Reverse Lunge"),
    L("Leg extension — 3 × 12", "Leg Extension"),
    L("Cable glute kickback — 3 × 15", "Cable Glute Kickback"),
  ];

  const D = (title, cal, items, food, note) => ({
    title, cal, food: food || "", note: note || "",
    items: [...items, stdFood(cal), steps()],
  });

  const days = [
    // ── Week 1 — establish the routine
    D("Heavy glutes + hamstrings", 1750, heavyGluteHam(),
      "11:00 Greek yogurt + berries + 2 eggs · 2:00 chicken, rice & vegetables · pre/post-workout banana + protein shake · 6:30 salmon, potato & salad.",
      "Hip thrust is THE lift to progress this month. Every set: 2–3 good reps left in the tank."),
    D("Upper body + cardio", 1650, upperBody(35),
      "Egg-white omelet + fruit · turkey/chicken salad bowl · Greek yogurt · lean steak + vegetables + potato.",
      "Zone 2 = breathing harder but still able to speak in sentences."),
    D("Glutes + quads", 1750, gluteQuad(),
      "Greek yogurt/oats/berries · chicken-rice bowl · protein shake + banana · shrimp or white fish + potatoes + vegetables."),
    D("Recovery + cardio", 1650, recovery("45–50 min"),
      "Eggs + avocado toast · large chicken salad · cottage cheese + berries · white fish + vegetables + rice.",
      "No hard leg work today."),
    D("Heavy glutes", 1750, heavyGluteB(),
      "Greek yogurt + fruit · turkey/rice bowl · banana + protein shake · lean steak + potato + broccoli."),
    D("Full body + glute pump", 1700, fullBodyPump(25),
      "Omelet + fruit · chicken wrap + salad · Greek yogurt · salmon + vegetables + potato.",
      "Keep this lighter and faster."),
    D("Recovery", 1650, restDay("10k easy steps, mobility & stretching — no lifting"),
      "Protein still 140 g, slightly less starch: eggs/yogurt · chicken salad · cottage cheese/fruit · salmon + vegetables.",
      "Record your 7-day average weight."),

    // ── Week 2 — add load
    D("Heavy glutes + hamstrings", 1750, heavyGluteHam(), "",
      "Add 5–10 lb to hip thrust / RDL / leg press if Week 1 felt comfortable."),
    D("Upper body + cardio", 1650, upperBody(40), "", "Zone 2 up to 40 min this week."),
    D("Glutes + quads", 1750, gluteQuad(), "", "Add weight or 1 rep per set vs last week."),
    D("Recovery + cardio", 1650, recovery("50–55 min"), "", "Protein 140 g."),
    D("Heavy glutes", 1750, heavyGluteB(), "", "Try to beat last week's hip thrust performance."),
    D("Full body + glute pump", 1700, fullBodyPump(30), "",
      "Rotate foods: chicken ↔ turkey/shrimp/tuna/lean beef · rice ↔ potatoes/oats · yogurt ↔ cottage cheese/eggs."),
    D("Rest", 1650, restDay("10–12k steps + mobility"), ""),

    // ── Week 3 — hardest training week
    D("Glute strength", 1750, gluteStrengthW3(), "",
      "Performance week, not starvation week. Last 1–2 reps hard but technically clean."),
    D("Upper body + cardio", 1650, upperBody(40), ""),
    D("Glutes + quads", 1750, gluteQuadW3(), ""),
    D("Recovery + cardio", 1650, recovery("55–60 min"), ""),
    D("Glute strength", 1750, [
      L("Hip thrust (rack) — 5 × 6", "Barbell Hip Thrust"),
      L("Romanian deadlift — 4 × 8", "Barbell Romanian Deadlift"),
      L("Leg press — 4 × 8", "Leg Press"),
      L("Bulgarian split squat — 3 × 8 each leg", "Bulgarian Split Squat"),
      L("Leg curl — 3 × 10", "Lying / Seated Leg Curl"),
      L("Cable hip abduction — 3 × 20", "Cable Hip Abduction"),
    ], "", "Don't take heavy squats/RDLs to failure."),
    D("Full body + glute pump", 1700, fullBodyPump(30), ""),
    D("Complete lifting rest", 1650, restDay("10k easy steps"), ""),

    // ── Week 4 — lean while retaining strength
    D("Glutes + hamstrings", 1750, gluteStrengthW3(), "",
      "Don't slash calories because the deadline is close. Try to equal or slightly beat Week 3."),
    D("Upper body + cardio", 1650, upperBody(40), ""),
    D("Glutes + quads", 1750, gluteQuadW3(), ""),
    D("Recovery + cardio", 1650, recovery("50 min"), ""),
    D("Heavy glutes", 1750, heavyGluteB(), "", "Keep your Week-3 weights — no maxing out."),
    D("Full body + glute pump", 1700, fullBodyPump(30), ""),
    D("Rest", 1650, restDay("Walking and mobility only"), ""),

    // ── Days 29–30 — finish
    D("Final glute workout", 1750, [
      L("Hip thrust (rack) — 4 × 8", "Barbell Hip Thrust"),
      L("Romanian deadlift — 3 × 8", "Barbell Romanian Deadlift"),
      L("Bulgarian split squat — 3 × 10 each leg", "Bulgarian Split Squat"),
      L("Leg press — 3 × 10", "Leg Press"),
      L("Cable glute kickback — 3 × 15 each leg", "Cable Glute Kickback"),
      L("Cable hip abduction — 3 × 20", "Cable Hip Abduction"),
      C("Easy incline walk — 20 min", "Treadmill Incline Walk"),
    ], "Yogurt/berries/eggs · chicken/rice/vegetables · protein shake/banana · salmon/potato/salad."),
    D("Recovery + assessment", 1650, [
      C("Optional easy Zone 2 — 30–45 min if recovered", "Elliptical Steady State"),
      H("Weight, waist/hip measurements & progress photos — same conditions as Day 1"),
    ], "", "No brutal 'last chance' workout needed."),
  ];

  return {
    title: "30-Day Glute Cut",
    subtitle: "Fat loss + glute strength · 30 days",
    weeks: [
      "Week 1 — Establish the routine",
      "Week 2 — Add load",
      "Week 3 — Hardest training week",
      "Week 4 — Lean while retaining strength",
      "Days 29–30 — Finish & assess",
    ],
    days,
    nutrition: {
      headline: "A controlled cut: big enough deficit to see real change in 30 days, small enough to keep your glutes and strength. Realistic scale outcome: roughly 135–139 lb by Day 30 — leaner, more defined and stronger beats crash-dieting to 130.",
      targets: [
        ["Calories", "1,650–1,750 kcal"],
        ["Protein", "130–145 g"],
        ["Carbohydrate", "140–175 g"],
        ["Fat", "45–55 g"],
        ["Fiber", "25–35 g"],
        ["Steps", "10,000–12,000"],
        ["Water", "~2–3 L"],
        ["Sleep", "8+ hours"],
      ],
      meals: [
        { name: "11:00", items: "Greek yogurt + berries + eggs/egg whites — ~35–40 g protein." },
        { name: "2:00", items: "Chicken breast, rice or potatoes, big serving of vegetables — ~40–45 g protein." },
        { name: "Post-workout", items: "Protein shake + banana — ~25–30 g protein." },
        { name: "6:30", items: "Salmon / lean steak / chicken + vegetables + potato or rice — ~40 g protein." },
      ],
      guidelines: [
        "Consistently hitting ~140 g protein matters more than the exact carb/fat split.",
        "Optional 16:8 eating window (e.g. 11 a.m.–7 p.m.) — only if it makes the deficit easier. No 24-h fasts or OMAD with this training load.",
        "Water, sparkling water, tea and coffee as default drinks; alcohol near zero this month.",
        "Budget ~100–150 kcal/day of chocolate deliberately rather than banning it — measure the portion.",
        "Weigh daily (morning, after bathroom), but decide from the 7-day average only. Cycle-related water retention can hide real fat loss.",
        "Losing 1–2 lb/week after the first 10–14 days: change nothing. Faster + feeling weak: eat more. Stalled 2 weeks: −100–150 kcal or +2,000 steps.",
      ],
    },
    rules: [
      "Week 1: establish working weights — every set ends with 2–3 good reps left.",
      "Week 2: add ~5–10% weight or 1–2 reps where possible.",
      "Week 3: hardest week — beat Week 2 on the big lifts, ~1–2 reps in reserve on final sets.",
      "Week 4: hold the weights; recovery matters more while dieting.",
      "Write down every weight and rep — the goal is to get measurably stronger, not just to exercise.",
    ],
  };
}

const PROGRAMS = { amelia30: buildAmelia30() };
