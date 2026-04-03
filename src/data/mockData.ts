export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  serving: string;
  category: 'protein' | 'carb' | 'dairy' | 'vegetable' | 'snack' | 'fruit';
}

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  calories: number;
  protein: number;
  quantity: number;
  serving: string;
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  timestamp: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completedSets: number[];
}

export interface WorkoutDay {
  day: string;
  label: string;
  focus: string;
  exercises: Exercise[];
}

export interface WaterEntry {
  amount: number;
  timestamp: string;
}

export interface DailyData {
  date: string;
  calories: number;
  protein: number;
  water: number;
  workoutCompleted: boolean;
  weight?: number;
  energy?: number;
}

export const commonFoods: FoodItem[] = [
  { id: 'egg', name: '1 Egg (boiled)', calories: 78, protein: 6, serving: '1 piece', category: 'protein' },
  { id: 'rice', name: '1 Cup Rice', calories: 206, protein: 4, serving: '1 cup', category: 'carb' },
  { id: 'dal', name: '1 Bowl Dal', calories: 120, protein: 9, serving: '1 bowl', category: 'protein' },
  { id: 'roti', name: '1 Roti', calories: 100, protein: 3, serving: '1 piece', category: 'carb' },
  { id: 'milk', name: '1 Glass Milk', calories: 120, protein: 8, serving: '250ml', category: 'dairy' },
  { id: 'chicken', name: '100g Chicken', calories: 165, protein: 31, serving: '100g', category: 'protein' },
  { id: 'fish', name: '100g Fish', calories: 136, protein: 26, serving: '100g', category: 'protein' },
  { id: 'banana', name: '1 Banana', calories: 89, protein: 1, serving: '1 piece', category: 'fruit' },
  { id: 'soy-chunks', name: 'Soy Chunks (50g)', calories: 170, protein: 26, serving: '50g', category: 'protein' },
  { id: 'chola', name: '1 Bowl Chola', calories: 164, protein: 9, serving: '1 bowl', category: 'protein' },
  { id: 'peanuts', name: 'Peanuts (30g)', calories: 170, protein: 7, serving: '30g', category: 'snack' },
  { id: 'bread', name: '2 Slices Bread', calories: 140, protein: 4, serving: '2 slices', category: 'carb' },
  { id: 'potato', name: '1 Potato', calories: 130, protein: 3, serving: '1 medium', category: 'vegetable' },
  { id: 'mixed-veg', name: 'Mixed Vegetables', calories: 80, protein: 3, serving: '1 bowl', category: 'vegetable' },
  { id: 'curd', name: '1 Cup Curd', calories: 98, protein: 11, serving: '1 cup', category: 'dairy' },
  { id: 'oats', name: 'Oats (50g)', calories: 190, protein: 7, serving: '50g', category: 'carb' },
];

export const workoutPlan: WorkoutDay[] = [
  {
    day: 'saturday', label: 'Day 1', focus: 'Chest & Triceps',
    exercises: [
      { id: 'e1', name: 'Push-ups', sets: 4, reps: 15, completedSets: [] },
      { id: 'e2', name: 'Dumbbell Bench Press', sets: 4, reps: 10, weight: 12, completedSets: [] },
      { id: 'e3', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 10, completedSets: [] },
      { id: 'e4', name: 'Dumbbell Flyes', sets: 3, reps: 12, weight: 8, completedSets: [] },
      { id: 'e5', name: 'Tricep Dips', sets: 3, reps: 12, completedSets: [] },
      { id: 'e6', name: 'Overhead Tricep Extension', sets: 3, reps: 12, weight: 8, completedSets: [] },
    ],
  },
  {
    day: 'sunday', label: 'Day 2', focus: 'Back & Biceps',
    exercises: [
      { id: 'e7', name: 'Pull-ups', sets: 4, reps: 8, completedSets: [] },
      { id: 'e8', name: 'Bent-over Dumbbell Rows', sets: 4, reps: 10, weight: 14, completedSets: [] },
      { id: 'e9', name: 'Lat Pulldowns', sets: 3, reps: 12, weight: 20, completedSets: [] },
      { id: 'e10', name: 'Dumbbell Curls', sets: 3, reps: 12, weight: 8, completedSets: [] },
      { id: 'e11', name: 'Hammer Curls', sets: 3, reps: 12, weight: 8, completedSets: [] },
    ],
  },
  {
    day: 'monday', label: 'Day 3', focus: 'Legs',
    exercises: [
      { id: 'e12', name: 'Bodyweight Squats', sets: 4, reps: 15, completedSets: [] },
      { id: 'e13', name: 'Dumbbell Lunges', sets: 3, reps: 12, weight: 10, completedSets: [] },
      { id: 'e14', name: 'Romanian Deadlift', sets: 4, reps: 10, weight: 16, completedSets: [] },
      { id: 'e15', name: 'Calf Raises', sets: 4, reps: 20, completedSets: [] },
      { id: 'e16', name: 'Leg Press (machine)', sets: 3, reps: 12, weight: 40, completedSets: [] },
    ],
  },
  {
    day: 'tuesday', label: 'Day 4', focus: 'Shoulders & Abs',
    exercises: [
      { id: 'e17', name: 'Overhead Dumbbell Press', sets: 4, reps: 10, weight: 10, completedSets: [] },
      { id: 'e18', name: 'Lateral Raises', sets: 4, reps: 15, weight: 5, completedSets: [] },
      { id: 'e19', name: 'Front Raises', sets: 3, reps: 12, weight: 5, completedSets: [] },
      { id: 'e20', name: 'Plank', sets: 3, reps: 45, completedSets: [] },
      { id: 'e21', name: 'Crunches', sets: 3, reps: 20, completedSets: [] },
    ],
  },
  {
    day: 'wednesday', label: 'Day 5', focus: 'Full Body / Light',
    exercises: [
      { id: 'e22', name: 'Deadlifts', sets: 3, reps: 8, weight: 20, completedSets: [] },
      { id: 'e23', name: 'Push-ups', sets: 3, reps: 15, completedSets: [] },
      { id: 'e24', name: 'Dumbbell Rows', sets: 3, reps: 10, weight: 12, completedSets: [] },
      { id: 'e25', name: 'Goblet Squats', sets: 3, reps: 12, weight: 10, completedSets: [] },
    ],
  },
];
