// ── Desi food database for coach suggestions ────────────────────────────────

interface FoodSuggestion {
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  tags: string[];
}

const PROTEIN_FOODS: FoodSuggestion[] = [
  { name: '2 Boiled eggs', emoji: '🥚', calories: 156, protein: 12, tags: ['quick', 'anytime'] },
  { name: 'Soy chunks (50g)', emoji: '🫘', calories: 170, protein: 26, tags: ['high-protein'] },
  { name: '1 bowl Dal', emoji: '🍲', calories: 120, protein: 9, tags: ['vegetarian'] },
  { name: '100g Grilled chicken', emoji: '🍗', calories: 165, protein: 31, tags: ['lean'] },
  { name: '100g Fish curry', emoji: '🐟', calories: 136, protein: 26, tags: ['bengali'] },
  { name: '1 cup Curd', emoji: '🥛', calories: 98, protein: 11, tags: ['light'] },
  { name: '1 glass Milk', emoji: '🥛', calories: 120, protein: 8, tags: ['simple'] },
  { name: 'Chola (1 bowl)', emoji: '🫘', calories: 164, protein: 9, tags: ['filling'] },
];

const CALORIE_FOODS: FoodSuggestion[] = [
  { name: 'Banana + Milk shake', emoji: '🍌', calories: 300, protein: 12, tags: ['quick'] },
  { name: '2 Roti + Dal', emoji: '🫓', calories: 320, protein: 15, tags: ['filling'] },
  { name: 'Rice + Chicken curry', emoji: '🍚', calories: 450, protein: 30, tags: ['complete-meal'] },
  { name: 'Peanut butter toast (2 slices)', emoji: '🥜', calories: 280, protein: 14, tags: ['snack'] },
  { name: 'Paratha + Aloo bhaji', emoji: '🫓', calories: 350, protein: 8, tags: ['comfort'] },
  { name: '1 plate Rice + Dal', emoji: '🍚', calories: 380, protein: 15, tags: ['bengali'] },
];

const COMBO_MEALS: FoodSuggestion[] = [
  { name: 'Rice + Dal + Egg', emoji: '🥘', calories: 460, protein: 30, tags: ['balanced'] },
  { name: 'Roti + Chicken + Salad', emoji: '🍗', calories: 400, protein: 35, tags: ['lean'] },
  { name: 'Rice + Fish + Dal', emoji: '🐟', calories: 410, protein: 32, tags: ['protein-rich'] },
];

// ── Coach Advice type ───────────────────────────────────────────────────────

export interface CoachAdvice {
  message: string;
  priority: 'perfect' | 'calories' | 'protein' | 'hydration' | 'workout' | 'macros';
  suggestions: string[];
}

export interface DailyCoachData {
  caloriesConsumed: number;
  calorieGoal: number;
  proteinConsumed: number;
  proteinGoal: number;
  waterConsumed: number;
  waterGoal: number;
  workoutCompleted: boolean;
  macros?: { carbs: number; protein: number; fat: number; fiber: number };
}

// ── Core engine: structured coach message ───────────────────────────────────

export function generateCoachAdvice(data: DailyCoachData): CoachAdvice {
  const caloriePct = (data.caloriesConsumed / data.calorieGoal) * 100;
  const proteinPct = (data.proteinConsumed / data.proteinGoal) * 100;
  const waterPct = (data.waterConsumed / data.waterGoal) * 100;

  const calorieDeficit = data.calorieGoal - data.caloriesConsumed;
  const proteinDeficit = data.proteinGoal - data.proteinConsumed;
  const waterDeficit = data.waterGoal - data.waterConsumed;

  const hour = new Date().getHours();

  // ── Priority 0: All goals met ──
  if (caloriePct >= 90 && caloriePct <= 110 && proteinPct >= 90 && waterPct >= 80 && data.workoutCompleted) {
    return {
      message: "You're crushing it today! Every goal hit — stay consistent and the gains will follow.",
      priority: 'perfect',
      suggestions: [],
    };
  }

  if (caloriePct >= 90 && caloriePct <= 110 && proteinPct >= 90 && waterPct >= 80) {
    return {
      message: "All macros looking good! Quick workout and the day is a 10.",
      priority: 'workout',
      suggestions: [],
    };
  }

  // ── Priority 1: Protein critically low ──
  const proteinSuggestions: string[] = [];
  let remaining = proteinDeficit;
  for (const food of PROTEIN_FOODS) {
    if (food.protein >= remaining) {
      proteinSuggestions.push(`${food.emoji} ${food.name} (+${food.protein}g protein)`);
      break;
    }
  }
  if (proteinSuggestions.length === 0) {
    // Show top 2 highest protein foods
    const top = [...PROTEIN_FOODS].sort((a, b) => b.protein - a.protein).slice(0, 2);
    proteinSuggestions.push(...top.map(f => `${f.emoji} ${f.name} (+${f.protein}g protein)`));
  }

  if (proteinPct < 60) {
    return {
      message: `Protein is critically low at ${Math.round(proteinPct)}% — add ${Math.round(proteinDeficit)}g ASAP.`,
      priority: 'protein',
      suggestions: proteinSuggestions,
    };
  }

  if (proteinPct < 80) {
    return {
      message: `Still need ${Math.round(proteinDeficit)}g protein — ${proteinSuggestions[0] || 'add eggs or soy chunks'} would do it.`,
      priority: 'protein',
      suggestions: proteinSuggestions.slice(0, 3),
    };
  }

  // ── Priority 2: Hydration critically low ──
  if (waterPct < 40) {
    const glassesNeeded = Math.ceil(waterDeficit / 250);
    return {
      message: `You're only at ${Math.round(waterPct)}% hydration — drink ${glassesNeeded} glasses (${glassesNeeded * 250}ml) now.`,
      priority: 'hydration',
      suggestions: ['💧 1 glass = 250ml — sip, don\'t chug!'],
    };
  }

  if (waterPct < 60) {
    const glassesNeeded = Math.ceil(waterDeficit / 250);
    return {
      message: `Hydration at ${Math.round(waterPct)}% — keep a bottle nearby. ${glassesNeeded} glasses to go.`,
      priority: 'hydration',
      suggestions: ['💧 Set a reminder to drink every hour'],
    };
  }

  // ── Priority 3: Calories too low ──
  const calorieSuggestions: string[] = [];
  for (const food of CALORIE_FOODS) {
    if (food.calories >= calorieDeficit * 0.7) {
      calorieSuggestions.push(`${food.emoji} ${food.name} (+${food.calories} kcal)`);
    }
  }
  if (calorieSuggestions.length === 0) {
    const top = [...CALORIE_FOODS].slice(0, 3);
    calorieSuggestions.push(...top.map(f => `${f.emoji} ${f.name} (+${f.calories} kcal)`));
  }

  if (caloriePct < 70) {
    return {
      message: `You're ${Math.round(calorieDeficit)} kcal behind — your body needs fuel. Eat something real, not just snacks.`,
      priority: 'calories',
      suggestions: calorieSuggestions.slice(0, 3),
    };
  }

  // ── Priority 4: Macro imbalance ──
  if (data.macros) {
    const totalMacroCals = data.macros.carbs * 4 + data.macros.protein * 4 + data.macros.fat * 9;
    if (totalMacroCals > 0) {
      const fatPct = (data.macros.fat * 9 / totalMacroCals) * 100;
      if (fatPct > 40 && hour >= 18) {
        return {
          message: `Fat intake is a bit high today (${Math.round(fatPct)}%). Tomorrow, balance it with leaner protein like chicken or fish.`,
          priority: 'macros',
          suggestions: ['🥩 Lean chicken', '🐟 Fish', '🫘 Soy chunks'],
        };
      }
    }
  }

  // ── Default: Progress message ──
  const parts = [];
  if (proteinPct >= 90) parts.push('Protein looks good!');
  if (waterPct >= 80) parts.push('Hydration is on track.');
  if (parts.length === 0) {
    return {
      message: `You're at ${Math.round(caloriePct)}% calories, ${Math.round(proteinPct)}% protein. Keep going — every meal counts.`,
      priority: 'calories',
      suggestions: calorieSuggestions.length > 0 ? calorieSuggestions.slice(0, 2) : [],
    };
  }
  return {
    message: parts.join(' '),
    priority: 'perfect',
    suggestions: [],
  };
}

// ── Weekly AI review (optional Gemini call) ─────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateWeeklyReview(
  weekData: {
    date: string;
    calories: number;
    protein: number;
    water: number;
    score: number;
    workoutCompleted: boolean;
  }[]
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const dataPoints = weekData
    .map((d, i) => `Day ${i + 1} (${d.date}): ${d.calories} kcal, ${d.protein}g protein, ${d.water}ml water, score: ${d.score}/100${d.workoutCompleted ? ', workout done' : ''}`)
    .join('\n');

  const prompt = `You are a friendly fitness coach reviewing someone's week. Keep it to 2-3 sentences max. Be specific, encouraging, and honest — not generic.

Here are their daily stats:
${dataPoints}

Give a brief weekly review with specific observations and one actionable tip for next week.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error('Weekly review failed:', err);
    return null;
  }
}
