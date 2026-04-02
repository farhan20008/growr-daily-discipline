import { supabase } from '@/integrations/supabase/client';
import type { MealEntry, WaterEntry } from '@/data/mockData';

export async function syncMeals(userId: string, meals: MealEntry[]) {
  // Delete existing meals for user and insert fresh (simple sync strategy)
  // In production, you'd do smarter upserts/patches
  const { error: deleteError } = await supabase
    .from('meals')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  if (meals.length === 0) return;

  const { error: insertError } = await supabase
    .from('meals')
    .insert(
      meals.map(m => ({
        user_id: userId,
        food_id: m.foodId,
        food_name: m.foodName,
        calories: m.calories,
        protein: m.protein,
        quantity: m.quantity,
        serving: m.serving,
        meal_type: m.mealType,
        logged_at: m.timestamp,
      }))
    );

  if (insertError) throw insertError;
}

export async function syncWaterEntries(userId: string, waterEntries: WaterEntry[]) {
  const { error: deleteError } = await supabase
    .from('water_entries')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  if (waterEntries.length === 0) return;

  const { error: insertError } = await supabase
    .from('water_entries')
    .insert(
      waterEntries.map(w => ({
        user_id: userId,
        amount: w.amount,
        logged_at: w.timestamp,
      }))
    );

  if (insertError) throw insertError;
}

export async function syncWorkoutLogs(userId: string, workoutState: Record<string, number[]>) {
  // Convert workoutState to workout_logs format
  // workoutState: { exerciseId: [setIndices] }
  const logs = Object.entries(workoutState).flatMap(([exerciseId, completedSets]) =>
    completedSets.map(setIndex => ({
      user_id: userId,
      exercise_id: exerciseId,
      completed_sets: [setIndex],
      logged_at: new Date().toISOString(),
    }))
  );

  const { error: deleteError } = await supabase
    .from('workout_logs')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  if (logs.length === 0) return;

  const { error: insertError } = await supabase
    .from('workout_logs')
    .insert(logs);

  if (insertError) throw insertError;
}

export async function upsertProfile(userId: string, profile: any) {
  console.log('[upsertProfile] UserId:', userId);
  console.log('[upsertProfile] Profile data to save:', profile);

  const upsertData = {
    user_id: userId,
    name: profile.name,
    current_weight: profile.currentWeight,
    calorie_goal: profile.calorieGoal,
    protein_goal: profile.proteinGoal,
    water_goal: profile.waterGoal,
    goal_weight: profile.goalWeight,
    height: profile.height || null,
    age: profile.age || null,
    activity_level: profile.activity_level || null,
    goal: profile.goal || null,
    updated_at: new Date().toISOString(),
  };

  console.log('[upsertProfile] Upserting with:', upsertData);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertData, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('[upsertProfile] Error:', error);
    throw error;
  }

  console.log('[upsertProfile] Success:', data);
}

export async function syncProfile(userId: string, profile: any) {
  await upsertProfile(userId, profile);
}

export async function fetchAllData(userId: string) {
  const [mealsRes, waterRes, workoutRes, profileRes] = await Promise.all([
    supabase.from('meals').select('*').eq('user_id', userId),
    supabase.from('water_entries').select('*').eq('user_id', userId),
    supabase.from('workout_logs').select('*').eq('user_id', userId),
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  // Check for errors in non-profile queries
  if (mealsRes.error) throw mealsRes.error;
  if (waterRes.error) throw waterRes.error;
  if (workoutRes.error) throw workoutRes.error;
  // profileRes.error is okay if it's "no rows" (PGRST116) - we'll treat as null

  return {
    meals: mealsRes.data || [],
    waterEntries: waterRes.data || [],
    workoutLogs: workoutRes.data || [],
    profile: profileRes.data || null,
  };
}
