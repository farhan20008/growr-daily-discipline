import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MealEntry, WaterEntry } from '@/data/mockData';
import { calculateDailyScore, getRank, getRankProgress, getDayName, type Rank } from '@/utils/disciplineEngine';
import { generateCoachAdvice, type CoachAdvice } from '@/utils/coachSystem';

interface AppState {
  meals: MealEntry[];
  waterEntries: WaterEntry[];
  workoutState: Record<string, number[]>;
  profile: {
    name: string;
    calorieGoal: number;
    proteinGoal: number;
    waterGoal: number;
    currentWeight: number;
    goalWeight: number;
    budgetMode: boolean;
    workoutDays: number;
    height: number | null;
    age: number | null;
    activityLevel: string | null;
    goal: string | null;
  };
}

interface DisciplineState {
  todayScore: number;
  weeklyScores: Record<string, number>;
  currentStreak: number;
  bestStreak: number;
  lastScoreDate: string | null;
  disciplineCalendar: Record<string, boolean>;
  rank: Rank;
  rankProgress: number;
  coachAdvice: CoachAdvice;
}

interface RootState {
  app: AppState;
  discipline: DisciplineState;
}

const DEFAULT_PROFILE = {
  name: 'User',
  calorieGoal: 2400,
  proteinGoal: 130,
  waterGoal: 3000,
  currentWeight: 0,
  goalWeight: 0,
  budgetMode: true,
  workoutDays: 5,
  height: null,
  age: null,
  activityLevel: null,
  goal: null,
};

function loadState(): AppState {
  return {
    meals: [],
    waterEntries: [],
    workoutState: {},
    profile: DEFAULT_PROFILE,
  };
}

function loadDisciplineState(): DisciplineState {
  const weeklyScores: Record<string, number> = {};
  return {
    todayScore: 0,
    weeklyScores,
    currentStreak: 0,
    bestStreak: 0,
    lastScoreDate: null,
    disciplineCalendar: {},
    rank: 'beginner',
    rankProgress: 0,
    coachAdvice: { message: "Let's get started — log your first meal!", priority: 'perfect', suggestions: [] },
  };
}

function loadRootState(): RootState {
  return {
    app: loadState(),
    discipline: loadDisciplineState(),
  };
}

interface AppStateContextValue {
  root: RootState;
  setRoot: React.Dispatch<React.SetStateAction<RootState>>;
  meals: MealEntry[];
  waterEntries: WaterEntry[];
  workoutState: Record<string, number[]>;
  profile: AppState['profile'];
  todayScore: number;
  weeklyScores: Record<string, number>;
  currentStreak: number;
  bestStreak: number;
  lastScoreDate: string | null;
  disciplineCalendar: Record<string, boolean>;
  rank: Rank;
  rankProgress: number;
  coachAdvice: CoachAdvice;
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  addWater: (amount: number) => void;
  toggleSet: (exerciseId: string, setIndex: number) => void;
  updateProfile: (updates: Partial<AppState['profile']>) => void;
  hydrate: (updates: { app?: Partial<AppState>; discipline?: Partial<DisciplineState> }) => void;
  totalCalories: number;
  totalProtein: number;
  totalWater: number;
  getMealsByType: (type: MealEntry['mealType']) => MealEntry[];
  getWeeklyData: () => { date: string; calories: number; protein: number; water: number; workoutCompleted: boolean }[];
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = useState<RootState>(loadRootState);

  const { app, discipline } = root;

  // Recalculate discipline when app state changes
  useEffect(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    const dayName = getDayName();
    const score = calculateDailyScore(app.meals, app.waterEntries, app.workoutState, app.profile, dayName);

    setRoot(prev => {
      const prevDiscipline = prev.discipline;
      const isNewDay = prevDiscipline.lastScoreDate !== todayISO;
      let currentStreak = prevDiscipline.currentStreak;
      let bestStreak = prevDiscipline.bestStreak;

      if (isNewDay) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        const yesterdayScore = prevDiscipline.weeklyScores[yStr] || 0;

        if (score >= 70) {
          currentStreak = yesterdayScore >= 70 ? prevDiscipline.currentStreak + 1 : 1;
        } else {
          currentStreak = 0;
        }
        bestStreak = Math.max(prevDiscipline.bestStreak, currentStreak);
      }

      const totalProtein = app.meals.reduce((s, m) => s + (m?.protein || 0), 0);
      const totalCalories = app.meals.reduce((s, m) => s + (m?.calories || 0), 0);
      const totalWater = app.waterEntries.reduce((s, w) => s + (w?.amount || 0), 0);

      const advice: CoachAdvice = generateCoachAdvice({
        caloriesConsumed: totalCalories,
        calorieGoal: app.profile.calorieGoal,
        proteinConsumed: totalProtein,
        proteinGoal: app.profile.proteinGoal,
        waterConsumed: totalWater,
        waterGoal: app.profile.waterGoal,
        workoutCompleted: false,
      });

      const newWeeklyScores = { ...prevDiscipline.weeklyScores, [todayISO]: score };
      const rank = getRank(currentStreak);
      const rankProgress = getRankProgress(currentStreak);

      return {
        ...prev,
        discipline: {
          ...prevDiscipline,
          todayScore: score,
          weeklyScores: newWeeklyScores,
          currentStreak,
          bestStreak,
          lastScoreDate: todayISO,
          disciplineCalendar: {
            ...prevDiscipline.disciplineCalendar,
            [todayISO]: score >= 70,
          },
          rank,
          rankProgress,
          coachAdvice: advice,
        },
      };
    });
  }, [app]);

  const addMeal = useCallback((meal: MealEntry) => {
    setRoot(prev => ({
      ...prev,
      app: { ...prev.app, meals: [...prev.app.meals, meal] },
    }));
  }, []);

  const removeMeal = useCallback((id: string) => {
    setRoot(prev => ({
      ...prev,
      app: { ...prev.app, meals: prev.app.meals.filter(m => m.id !== id) },
    }));
  }, []);

  const addWater = useCallback((amount: number) => {
    setRoot(prev => ({
      ...prev,
      app: {
        ...prev.app,
        waterEntries: [...prev.app.waterEntries, { amount, timestamp: new Date().toISOString() }],
      },
    }));
  }, []);

  const toggleSet = useCallback((exerciseId: string, setIndex: number) => {
    setRoot(prev => {
      const current = prev.app.workoutState[exerciseId] || [];
      const updated = current.includes(setIndex)
        ? current.filter(s => s !== setIndex)
        : [...current, setIndex];
      return {
        ...prev,
        app: {
          ...prev.app,
          workoutState: { ...prev.app.workoutState, [exerciseId]: updated },
        },
      };
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<AppState['profile']>) => {
    setRoot(prev => ({
      ...prev,
      app: { ...prev.app, profile: { ...prev.app.profile, ...updates } },
    }));
  }, []);

  const hydrate = useCallback((updates: { app?: Partial<AppState>; discipline?: Partial<DisciplineState> }) => {
    setRoot(prev => ({
      ...prev,
      app: { ...prev.app, ...updates.app },
      discipline: { ...prev.discipline, ...updates.discipline },
    }));
  }, []);

  const totalCalories = app.meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = app.meals.reduce((sum, m) => sum + m.protein, 0);
  const totalWater = app.waterEntries.reduce((sum, w) => sum + w.amount, 0);

  const getMealsByType = useCallback((type: MealEntry['mealType']) => {
    return app.meals.filter(m => m.mealType === type);
  }, [app.meals]);

  const getWeeklyData = useCallback(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days.map(date => {
      const dayMeals = app.meals.filter(m => {
        const mealDate = new Date(m.timestamp).toISOString().split('T')[0];
        return mealDate === date;
      });
      const dayWater = app.waterEntries.filter(w => {
        const waterDate = new Date(w.timestamp).toISOString().split('T')[0];
        return waterDate === date;
      });

      const calories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
      const protein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
      const water = dayWater.reduce((sum, w) => sum + w.amount, 0);

      return {
        date,
        calories,
        protein,
        water,
        workoutCompleted: false,
      };
    });
  }, [app.meals, app.waterEntries]);

  const value: AppStateContextValue = {
    root,
    setRoot,
    meals: app.meals,
    waterEntries: app.waterEntries,
    workoutState: app.workoutState,
    profile: app.profile,
    todayScore: discipline.todayScore,
    weeklyScores: discipline.weeklyScores,
    currentStreak: discipline.currentStreak,
    bestStreak: discipline.bestStreak,
    lastScoreDate: discipline.lastScoreDate,
    disciplineCalendar: discipline.disciplineCalendar,
    rank: discipline.rank,
    rankProgress: discipline.rankProgress,
    coachAdvice: discipline.coachAdvice,
    addMeal,
    removeMeal,
    addWater,
    toggleSet,
    updateProfile,
    hydrate,
    totalCalories,
    totalProtein,
    totalWater,
    getMealsByType,
    getWeeklyData,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStateProvider');
  }
  return context;
}
