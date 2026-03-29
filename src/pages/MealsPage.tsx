import { useState } from 'react';
import { Plus, Search, X, Minus } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { commonFoods, FoodItem, MealEntry } from '@/data/mockData';

const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'] as const;
const mealEmojis = { breakfast: '🌅', lunch: '☀️', snacks: '🍌', dinner: '🌙' };

export default function MealsPage() {
  const { meals, addMeal, removeMeal, totalCalories, totalProtein } = useAppStore();
  const [activeMeal, setActiveMeal] = useState<typeof mealTypes[number]>('lunch');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filteredFoods = commonFoods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = (food: FoodItem, mealType: typeof mealTypes[number]) => {
    const entry: MealEntry = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      foodId: food.id,
      foodName: food.name,
      calories: food.calories,
      protein: food.protein,
      quantity: 1,
      serving: food.serving,
      mealType,
      timestamp: new Date().toISOString(),
    };
    addMeal(entry);
  };

  const getMealCals = (type: typeof mealTypes[number]) =>
    meals.filter(m => m.mealType === type).reduce((s, m) => s + m.calories, 0);

  const getMealProtein = (type: typeof mealTypes[number]) =>
    meals.filter(m => m.mealType === type).reduce((s, m) => s + m.protein, 0);

  return (
    <div className="px-5 pt-12 pb-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Meals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalCalories} cal · {totalProtein}g protein today
        </p>
      </div>

      {/* Meal Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
        {mealTypes.map(type => (
          <button
            key={type}
            onClick={() => { setActiveMeal(type); setShowAdd(false); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              activeMeal === type
                ? 'bg-primary text-primary-foreground shadow-primary'
                : 'bg-card text-muted-foreground'
            }`}
          >
            <span>{mealEmojis[type]}</span>
            <span className="capitalize">{type}</span>
          </button>
        ))}
      </div>

      {/* Meal Summary */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-foreground capitalize">{activeMeal}</h3>
          <div className="text-xs text-muted-foreground">
            {getMealCals(activeMeal)} cal · {getMealProtein(activeMeal)}g protein
          </div>
        </div>

        {/* Logged items */}
        <div className="space-y-2 mb-3">
          {meals.filter(m => m.mealType === activeMeal).map(m => (
            <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/50">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {m.quantity > 1 ? `${m.quantity}x ` : ''}{m.foodName}
                </p>
                <p className="text-xs text-muted-foreground">{m.calories} cal · {m.protein}g protein</p>
              </div>
              <button onClick={() => removeMeal(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}
          {meals.filter(m => m.mealType === activeMeal).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No items logged yet</p>
          )}
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add food
        </button>
      </div>

      {/* Add Food Panel */}
      {showAdd && (
        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4 animate-scale-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-secondary pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Quick chips */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick add</p>
            <div className="flex flex-wrap gap-2">
              {filteredFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => handleQuickAdd(food, activeMeal)}
                  className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors active:scale-95"
                >
                  <Plus className="h-3 w-3 text-primary" />
                  {food.name}
                  <span className="text-muted-foreground">({food.calories})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
