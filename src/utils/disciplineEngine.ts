import { MealEntry, WaterEntry, workoutPlan } from '@/data/mockData';
import type { WorkoutDay } from '@/data/mockData';

export interface CoachMessage {
  id: string;
  type: 'protein' | 'workout' | 'water' | 'calories' | 'streak' | 'info';
  message: string;
  priority: number;
}

export const getDayName = (date: Date = new Date()): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export const calculateDailyScore = (
  meals: MealEntry[],
  waterEntries: WaterEntry[],
  workoutState: Record<string, number[]>,
  profile: any,
  dayName: string
): number => {
  const totalProtein = meals.reduce((sum, m) => sum + (m?.protein || 0), 0);
  const totalCalories = meals.reduce((sum, m) => sum + (m?.calories || 0), 0);
  const totalWater = waterEntries.reduce((sum, w) => sum + (w?.amount || 0), 0);

  const proteinGoal = profile?.proteinGoal ?? 130;
  const waterGoal = profile?.waterGoal ?? 3000;
  const calorieGoal = profile?.calorieGoal ?? 2400;

  const proteinScore = Math.min((totalProtein / proteinGoal) * 100, 100);
  const waterScore = Math.min((totalWater / waterGoal) * 100, 100);
  const caloriePercent = (totalCalories / calorieGoal) * 100;
  const calorieScore = caloriePercent >= 90 && caloriePercent <= 110 ? 100 : 0;

  const todayWorkout = workoutPlan.find(w => w.day === dayName);
  let workoutScore = 0;
  if (todayWorkout) {
    const allSets = todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completed = Object.values(workoutState).flat().length;
    workoutScore = completed >= allSets ? 100 : 0;
  } else {
    workoutScore = 100;
  }

  const finalScore = Math.round(
    proteinScore * 0.4 +
    waterScore * 0.2 +
    calorieScore * 0.1 +
    workoutScore * 0.3
  );

  return Math.min(finalScore, 100);
};

export type Rank = 'beginner' | 'consistent' | 'focused' | 'disciplined';

export const getRank = (streak: number): Rank => {
  if (streak >= 21) return 'disciplined';
  if (streak >= 11) return 'focused';
  if (streak >= 4) return 'consistent';
  return 'beginner';
};

export const getRankProgress = (streak: number): number => {
  if (streak >= 21) return 100;
  if (streak >= 11) return Math.min(((streak - 11) / 10) * 100, 100);
  if (streak >= 4) return Math.min(((streak - 4) / 7) * 100, 100);
  return Math.min((streak / 4) * 100, 100);
};

export const generateCoachFeedback = (
  meals: MealEntry[],
  waterEntries: WaterEntry[],
  workoutState: Record<string, number[]>,
  profile: any,
  score: number,
  hour: number
): CoachMessage[] => {
  const feedback: CoachMessage[] = [];

  // Defensive: ensure arrays
  if (!Array.isArray(meals)) meals = [];
  if (!Array.isArray(waterEntries)) waterEntries = [];
  if (typeof workoutState !== 'object' || workoutState === null) workoutState = {};

  const totalProtein = meals.reduce((sum, m) => sum + (m?.protein || 0), 0);
  const totalWater = waterEntries.reduce((sum, w) => sum + (w?.amount || 0), 0);
  const totalCalories = meals.reduce((sum, m) => sum + (m?.calories || 0), 0);
  const todayWorkout = workoutPlan.find(w => w.day === getDayName());

  // Safely get goals with fallbacks
  const proteinGoal = profile?.proteinGoal ?? 130;
  const waterGoal = profile?.waterGoal ?? 3000;
  const calorieGoal = profile?.calorieGoal ?? 2400;

  if (score < 50 && hour >= 14) {
    feedback.push({
      id: 'streak-risk',
      type: 'streak',
      message: `Your score is ${score}/100. You're at risk of losing your streak today!`,
      priority: 1,
    });
  }

  const proteinPercent = (totalProtein / proteinGoal) * 100;
  if (proteinPercent < 60 && hour >= 16) {
    feedback.push({
      id: 'protein-low',
      type: 'protein',
      message: `Protein is at ${Math.round(proteinPercent)}% of goal. Add: 2 eggs (+12g), dal (+9g), or soy chunks (+26g).`,
      priority: 2,
    });
  }

  const waterPercent = (totalWater / waterGoal) * 100;
  if (waterPercent < 50 && hour >= 14) {
    feedback.push({
      id: 'water-low',
      type: 'water',
      message: `Hydration at ${Math.round(waterPercent)}%. Drink 2 glasses now to stay on track.`,
      priority: 3,
    });
  }

  if (todayWorkout && hour >= 18) {
    const allSets = todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completed = Object.values(workoutState).flat().length;
    if (completed < allSets) {
      feedback.push({
        id: 'workout-pending',
        type: 'workout',
        message: `Workout not complete. Quick fallback: 3 rounds of 20 push-ups, 15 squats, 30-sec plank.`,
        priority: 2,
      });
    }
  }

  const caloriePercent = (totalCalories / calorieGoal) * 100;
  if (caloriePercent < 85 && hour >= 20) {
    feedback.push({
      id: 'calories-low',
      type: 'calories',
      message: `Calories low (${Math.round(caloriePercent)}%). Add a banana+milk shake (+300 cal) or a small snack.`,
      priority: 4,
    });
  }

  if (score >= 70 && feedback.length === 0) {
    feedback.push({
      id: 'on-track',
      type: 'info',
      message: "You're on track! Keep the momentum going.",
      priority: 5,
    });
  }

  return feedback.sort((a, b) => a.priority - b.priority).slice(0, 3);
};
