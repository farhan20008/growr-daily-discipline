import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/hooks/useAppStore';
import { syncMeals, syncWaterEntries, syncWorkoutLogs, syncProfile, fetchAllData } from '@/services/supabaseService';
import { getDayName, calculateDailyScore, getRank, getRankProgress } from '@/utils/disciplineEngine';
import type { MealEntry, WaterEntry } from '@/data/mockData';

interface HistoryRebuildResult {
  weeklyScores: Record<string, number>;
  disciplineCalendar: Record<string, boolean>;
  currentStreak: number;
  bestStreak: number;
  rank: ReturnType<typeof getRank>;
  rankProgress: number;
  lastScoreDate: string | null; // most recent date with a score
}

function rebuildDisciplineFromHistory(
  rawMeals: any[],
  rawWater: any[],
  rawWorkouts: any[],
  profile: any
): HistoryRebuildResult {
  const getDate = (ts: string) => ts.split('T')[0];
  const dayMap = new Map<string, {
    meals: MealEntry[];
    waterTotal: number;
    workoutState: Record<string, number[]>;
  }>();

  rawMeals.forEach(m => {
    const date = getDate(m.logged_at);
    const day = dayMap.get(date) || { meals: [], waterTotal: 0, workoutState: {} };
    day.meals.push({
      id: m.id,
      foodId: m.food_id,
      foodName: m.food_name,
      calories: m.calories,
      protein: m.protein,
      quantity: m.quantity,
      serving: m.serving,
      mealType: m.meal_type,
      timestamp: m.logged_at,
    } as MealEntry);
    dayMap.set(date, day);
  });

  rawWater.forEach(w => {
    const date = getDate(w.logged_at);
    const day = dayMap.get(date) || { meals: [], waterTotal: 0, workoutState: {} };
    day.waterTotal += w.amount;
    dayMap.set(date, day);
  });

  rawWorkouts.forEach(w => {
    const date = getDate(w.logged_at);
    const day = dayMap.get(date) || { meals: [], waterTotal: 0, workoutState: {} };
    if (!day.workoutState[w.exercise_id]) day.workoutState[w.exercise_id] = [];
    day.workoutState[w.exercise_id].push(...w.completed_sets);
    dayMap.set(date, day);
  });

  dayMap.forEach(day => {
    Object.keys(day.workoutState).forEach(exId => {
      day.workoutState[exId] = Array.from(new Set(day.workoutState[exId])).sort((a, b) => a - b);
    });
  });

  const sortedDates = Array.from(dayMap.keys()).sort();

  const weeklyScores: Record<string, number> = {};
  const disciplineCalendar: Record<string, boolean> = {};

  sortedDates.forEach(date => {
    const day = dayMap.get(date);
    if (!day) {
      console.warn(`No data found for date ${date}, skipping`);
      return;
    }
    const waterEntry: WaterEntry = { amount: day.waterTotal, timestamp: `${date}T12:00:00` };
    const dayName = getDayName(new Date(date));
    const score = calculateDailyScore(day.meals, [waterEntry], day.workoutState, profile, dayName);
    weeklyScores[date] = score;
    disciplineCalendar[date] = score >= 70;
  });

  let bestStreak = 0;
  let running = 0;
  for (const date of sortedDates) {
    if (disciplineCalendar[date]) {
      running++;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }

  let currentStreak = 0;
  if (sortedDates.length > 0) {
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (disciplineCalendar[sortedDates[i]]) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const rank = getRank(currentStreak);
  const rankProgress = getRankProgress(currentStreak);
  const lastScoreDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  return {
    weeklyScores,
    disciplineCalendar,
    currentStreak,
    bestStreak,
    rank,
    rankProgress,
    lastScoreDate,
  };
}

export function useSupabaseDataSync() {
  const { user } = useAuth();
  const { hydrate, meals, waterEntries, workoutState, profile } = useAppStore();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Initial fetch on login
  useEffect(() => {
    if (user) {
      fetchAllData(user.id)
        .then(data => {
          const transformedMeals = data.meals.map((m: any) => ({
            id: m.id,
            foodId: m.food_id,
            foodName: m.food_name,
            calories: m.calories,
            protein: m.protein,
            quantity: m.quantity,
            serving: m.serving,
            mealType: m.meal_type,
            timestamp: m.logged_at,
          }));

          const transformedWater = data.waterEntries.map((w: any) => ({
            amount: w.amount,
            timestamp: w.logged_at,
          }));

          const combinedWorkoutState: Record<string, number[]> = {};
          data.workoutLogs.forEach((w: any) => {
            if (!combinedWorkoutState[w.exercise_id]) combinedWorkoutState[w.exercise_id] = [];
            combinedWorkoutState[w.exercise_id].push(...w.completed_sets);
          });
          Object.keys(combinedWorkoutState).forEach(exId => {
            combinedWorkoutState[exId] = Array.from(new Set(combinedWorkoutState[exId])).sort((a, b) => a - b);
          });

          const mergedProfile = data.profile
            ? {
                ...profile, // keep default fields like budgetMode, workoutDays
                name: data.profile.name,
                currentWeight: data.profile.current_weight,
                calorieGoal: data.profile.calorie_goal,
                proteinGoal: data.profile.protein_goal,
                waterGoal: data.profile.water_goal,
                goalWeight: data.profile.goal_weight,
                // Additional fields
                height: data.profile.height,
                age: data.profile.age,
                activityLevel: data.profile.activity_level,
                goal: data.profile.goal,
              }
            : undefined;

          // DEBUG: Log what we fetched
          console.log('[useSupabaseDataSync] Fetched profile from Supabase:', data.profile);
          console.log('[useSupabaseDataSync] Merged profile to hydrate:', mergedProfile);

          // Build partial app updates only for tables that have data
          const appUpdates: Partial<AppState> = {};

          if (data.meals.length > 0) {
            appUpdates.meals = transformedMeals;
          }
          if (data.waterEntries.length > 0) {
            appUpdates.waterEntries = transformedWater;
          }
          if (data.workoutLogs.length > 0) {
            appUpdates.workoutState = combinedWorkoutState;
          }
          if (mergedProfile) {
            appUpdates.profile = mergedProfile;
          }

          // Discipline updates if we have any tracking data
          const disciplineUpdates: Partial<DisciplineState> = {};
          if (data.meals.length > 0 || data.waterEntries.length > 0 || data.workoutLogs.length > 0) {
            const profileForHistory = mergedProfile || profile;
            const rebuilt = rebuildDisciplineFromHistory(
              data.meals,
              data.waterEntries,
              data.workoutLogs,
              profileForHistory
            );
            disciplineUpdates.weeklyScores = rebuilt.weeklyScores;
            disciplineUpdates.disciplineCalendar = rebuilt.disciplineCalendar;
            disciplineUpdates.currentStreak = rebuilt.currentStreak;
            disciplineUpdates.bestStreak = rebuilt.bestStreak;
            disciplineUpdates.rank = rebuilt.rank;
            disciplineUpdates.rankProgress = rebuilt.rankProgress;
            disciplineUpdates.lastScoreDate = rebuilt.lastScoreDate;
          }

          // Only hydrate if there's something to update
          if (Object.keys(appUpdates).length === 0 && Object.keys(disciplineUpdates).length === 0) {
            console.log('No server data to hydrate');
            return;
          }

          hydrate({ app: appUpdates, discipline: disciplineUpdates });
        })
        .catch(err => console.error('Supabase fetch error:', err));
    }
  }, [user, hydrate]);

  // Debounced sync on any app state change
  useEffect(() => {
    if (!user) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      syncAllToSupabase(user.id, { meals, waterEntries, workoutState, profile })
        .catch(err => console.error('Supabase sync error:', err));
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [meals, waterEntries, workoutState, profile, user]);

  async function syncAllToSupabase(userId: string, appState: { meals: any[]; waterEntries: any[]; workoutState: Record<string, number[]>; profile: any }) {
    await Promise.all([
      syncMeals(userId, appState.meals),
      syncWaterEntries(userId, appState.waterEntries),
      syncWorkoutLogs(userId, appState.workoutState),
      syncProfile(userId, appState.profile),
    ]);
  }
}
