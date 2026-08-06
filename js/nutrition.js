// ─── Nutrition plan generator ────────────────────────────────────────────────
// Mifflin-St Jeor estimate → activity factor → goal adjustment → macros.

function buildDiet(person) {
  const w = Number(person.weight);   // kg
  const h = Number(person.height);   // cm
  const a = Number(person.age);
  const sexTerm = person.sex === "m" ? 5 : person.sex === "f" ? -161 : -78;
  const bmr = 10 * w + 6.25 * h - 5 * a + sexTerm;

  const days = Number(person.days) || 3;
  const activity = days <= 2 ? 1.35 : days <= 4 ? 1.5 : 1.65;
  const tdee = bmr * activity;

  const adjust = { fatloss: 0.8, muscle: 1.1, strength: 1.05, athletic: 1.05 }[person.goal] || 1.0;
  const calories = Math.round((tdee * adjust) / 50) * 50;

  const proteinPerKg = { muscle: 2.0, strength: 1.8, fatloss: 2.2, athletic: 1.8 }[person.goal] || 1.6;
  const protein = Math.round(w * proteinPerKg);
  const fatPct = person.goal === "endurance" ? 0.25 : 0.3;
  const fat = Math.round((calories * fatPct) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return {
    calories, protein, fat, carbs,
    headline: dietHeadline(person.goal),
    meals: mealPlan(person.goal),
    guidelines: dietGuidelines(person.goal),
  };
}

function dietHeadline(goal) {
  return {
    fatloss: "A modest deficit — around 20% below maintenance. Enough to lose steadily, not enough to feel wrecked in the gym.",
    muscle: "A small surplus — about 10% above maintenance. Enough to build with, not enough to get sloppy.",
    strength: "A touch above maintenance to fuel heavy lifting.",
    endurance: "Maintenance calories with carbs doing the heavy lifting — they're your fuel tank.",
    athletic: "Slightly above maintenance on training days. Fuel the engine.",
  }[goal] || "Maintenance calories — eat to support training and recovery.";
}

function mealPlan(goal) {
  const base = [
    { name: "Breakfast", items: {
      fatloss: "Greek yoghurt with berries and a handful of granola, or 3-egg omelette with vegetables.",
      muscle: "3-egg omelette + oats with banana and peanut butter.",
      endurance: "Big bowl of oats with banana, honey and a scoop of yoghurt.",
    }[goal] || "Eggs or Greek yoghurt + oats or wholegrain toast with fruit." },
    { name: "Lunch", items: {
      fatloss: "Big salad or bowl: palm-sized portion of chicken/fish/tofu, lots of vegetables, light on dressing, fist of rice or potatoes.",
      muscle: "Chicken, beef or tofu with rice or pasta and vegetables — don't skimp on the carbs.",
      endurance: "Wholegrain wrap or rice bowl with lean protein and plenty of carbs.",
    }[goal] || "Protein + carb + vegetables: e.g. chicken and rice bowl, tuna pasta, or a loaded wrap." },
    { name: "Dinner", items: {
      fatloss: "Lean protein with roasted vegetables; keep starches to a fist-sized portion.",
      muscle: "Salmon, steak or lentil curry with potatoes or rice — your biggest meal of the day is fine here.",
      endurance: "Pasta, rice or potato-based dinner with a solid portion of protein.",
    }[goal] || "Any protein + vegetable dinner; pasta, curry, stir-fry, roast — variety keeps it sustainable." },
    { name: "Snacks", items: {
      fatloss: "Fruit, veg sticks, a protein shake, or a small handful of nuts. Watch liquid calories.",
      muscle: "Protein shake with milk, nuts, cheese, fruit — easy calories between meals.",
      endurance: "Banana or toast with honey before longer cardio sessions.",
    }[goal] || "Fruit, nuts, yoghurt, or a protein shake on training days." },
  ];
  return base;
}

function dietGuidelines(goal) {
  const g = [
    "Protein at every meal — it's the target that matters most.",
    "Drink water through the day; a glass before each meal is an easy habit.",
    "Weigh in once a week at the same time of day, not daily.",
  ];
  if (goal === "fatloss") g.push("If weight stalls for 2+ weeks, trim ~200 kcal from carbs or fat — not protein.");
  if (goal === "muscle") g.push("If the scale hasn't moved in 2+ weeks, add ~200 kcal, mostly carbs.");
  if (goal === "endurance") g.push("Eat carbs before and after longer sessions — that's when they count double.");
  g.push("These numbers are estimates to start from, not medical advice — adjust to how you feel and perform.");
  return g;
}
