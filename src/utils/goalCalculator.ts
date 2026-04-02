/**
 * Goal calculation utilities based on scientific formulas
 *
 * All calculations follow the Mifflin-St Jeor Equation for BMR
 * and standard TDEE multipliers for activity levels.
 */

export interface UserMeasurements {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
}

export interface ActivityLevel {
  level: 'sedentary' | 'light' | 'moderate' | 'heavy';
  label: string;
  multiplier: number;
}

export interface GoalType {
  type: 'lose' | 'maintain' | 'gain';
  label: string;
  adjustment: number; // calories to add/subtract
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  { level: 'sedentary', label: 'Sedentary', multiplier: 1.2, description: 'Little or no exercise' },
  { level: 'light', label: 'Lightly Active', multiplier: 1.375, description: '1-3 days/week' },
  { level: 'moderate', label: 'Moderately Active', multiplier: 1.55, description: '3-5 days/week' },
  { level: 'heavy', label: 'Very Active', multiplier: 1.725, description: '6-7 days/week' },
];

export const GOAL_TYPES: GoalType[] = [
  { type: 'lose', label: 'Lose Weight', adjustment: -400 },
  { type: 'maintain', label: 'Maintain Weight', adjustment: 0 },
  { type: 'gain', label: 'Gain Muscle', adjustment: 300 },
];

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5 (for males)
 * BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161 (for females)
 */
export function calculateBMR(measurements: UserMeasurements): number {
  const { weight, height, age, gender } = measurements;

  const base = (10 * weight) + (6.25 * height) - (5 * age);

  if (gender === 'male') {
    return base + 5;
  } else {
    return base - 161;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

/**
 * Adjust TDEE based on goal
 * - Lose: subtract 400 calories
 * - Maintain: keep same
 * - Gain: add 300 calories
 */
export function adjustForGoal(tdee: number, adjustment: number): number {
  return tdee + adjustment;
}

/**
 * Calculate daily protein goal
 * Protein = weight (kg) × 2 (grams)
 */
export function calculateProteinGoal(weight: number): number {
  return Math.round(weight * 2);
}

/**
 * Main function to calculate all goals
 * Returns calorie goal and protein goal based on user inputs
 */
export function calculateGoals(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'heavy',
  goal: 'lose' | 'maintain' | 'gain'
): {
  bmr: number;
  tdee: number;
  calorieGoal: number;
  proteinGoal: number;
} {
  // Calculate BMR
  const bmr = calculateBMR({ weight, height, age, gender });

  // Get activity multiplier
  const activity = ACTIVITY_LEVELS.find(a => a.level === activityLevel);
  if (!activity) {
    throw new Error(`Invalid activity level: ${activityLevel}`);
  }

  // Calculate TDEE
  const tdee = calculateTDEE(bmr, activity.multiplier);

  // Get goal adjustment
  const goalType = GOAL_TYPES.find(g => g.type === goal);
  if (!goalType) {
    throw new Error(`Invalid goal type: ${goal}`);
  }

  // Adjust for goal
  const calorieGoal = Math.round(adjustForGoal(tdee, goalType.adjustment));

  // Calculate protein (minimum 50g, maximum 400g for safety)
  const proteinGoal = calculateProteinGoal(weight);
  const clampedProtein = Math.max(50, Math.min(400, proteinGoal));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieGoal,
    proteinGoal: clampedProtein,
  };
}

/**
 * Helper to get activity level object by level key
 */
export function getActivityLevel(level: string): ActivityLevel | undefined {
  return ACTIVITY_LEVELS.find(a => a.level === level);
}

/**
 * Helper to get goal type object by type key
 */
export function getGoalType(type: string): GoalType | undefined {
  return GOAL_TYPES.find(g => g.type === type);
}
