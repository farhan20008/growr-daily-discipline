import { useState } from 'react';
import { Plus, Search, X, Minus, Clock, Flame, Beef, UtensilsCrossed } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { commonFoods, FoodItem, MealEntry } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'] as const;
const mealEmojis = { breakfast: '🌅', lunch: '☀️', snacks: '🍌', dinner: '🌙' };

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MealsPage() {
  const { meals, addMeal, removeMeal, totalCalories, totalProtein } = useAppStore();
  const [activeMeal, setActiveMeal] = useState<typeof mealTypes[number]>('lunch');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);

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

  // Find food category color for the modal accent
  const getFoodCategory = (foodId: string) => {
    const food = commonFoods.find(f => f.id === foodId);
    return food?.category || 'snack';
  };

  const categoryColors: Record<string, string> = {
    protein: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    carb: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    dairy: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    vegetable: 'from-green-500/20 to-lime-500/20 border-green-500/30',
    snack: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    fruit: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
  };

  const categoryBadgeColors: Record<string, string> = {
    protein: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    carb: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    dairy: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    vegetable: 'bg-green-500/15 text-green-700 dark:text-green-400',
    snack: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
    fruit: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  };

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

        {/* Logged items — clickable to open detail modal */}
        <div className="space-y-2 mb-3">
          {meals.filter(m => m.mealType === activeMeal).map(m => (
            <div
              key={m.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors group"
              onClick={() => setSelectedMeal(m)}
            >
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {m.quantity > 1 ? `${m.quantity}x ` : ''}{m.foodName}
                </p>
                <p className="text-xs text-muted-foreground">{m.calories} cal · {m.protein}g protein</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeMeal(m.id); }}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
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

      {/* ── Meal Detail Modal ── */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => { if (!open) setSelectedMeal(null); }}>
        <DialogContent className="max-w-[340px] rounded-2xl p-0 overflow-hidden border-0 gap-0">
          {selectedMeal && (() => {
            const category = getFoodCategory(selectedMeal.foodId);
            const gradientClass = categoryColors[category] || categoryColors.snack;
            const badgeClass = categoryBadgeColors[category] || categoryBadgeColors.snack;
            const totalCals = selectedMeal.calories * selectedMeal.quantity;
            const totalProt = selectedMeal.protein * selectedMeal.quantity;

            return (
              <>
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${gradientClass} border-b px-5 pt-8 pb-5`}>
                  <DialogHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <DialogTitle className="text-lg font-bold font-heading text-foreground leading-snug">
                          {selectedMeal.quantity > 1 ? `${selectedMeal.quantity}x ` : ''}{selectedMeal.foodName}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(selectedMeal.timestamp)} · {formatTime(selectedMeal.timestamp)}
                        </DialogDescription>
                      </div>
                      <span className="text-3xl">{mealEmojis[selectedMeal.mealType]}</span>
                    </div>
                  </DialogHeader>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${badgeClass}`}>
                      {category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-semibold capitalize">
                      {mealEmojis[selectedMeal.mealType]} {selectedMeal.mealType}
                    </span>
                  </div>
                </div>

                {/* Nutrition stats */}
                <div className="px-5 py-5 space-y-4">
                  {/* Main stats grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-orange-500/10 dark:bg-orange-500/15 p-3.5 text-center">
                      <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1.5" />
                      <p className="text-xl font-bold font-heading text-foreground">{totalCals}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Calories</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 p-3.5 text-center">
                      <Beef className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                      <p className="text-xl font-bold font-heading text-foreground">{totalProt}g</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Protein</p>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <UtensilsCrossed className="h-3.5 w-3.5" />
                        Serving Size
                      </span>
                      <span className="text-xs font-semibold text-foreground">{selectedMeal.serving}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Quantity
                      </span>
                      <span className="text-xs font-semibold text-foreground">{selectedMeal.quantity}</span>
                    </div>
                    {selectedMeal.quantity > 1 && (
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5" />
                          Per Serving
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {selectedMeal.calories} cal · {selectedMeal.protein}g
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      removeMeal(selectedMeal.id);
                      setSelectedMeal(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive py-2.5 text-sm font-medium transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                    Remove from {selectedMeal.mealType}
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
