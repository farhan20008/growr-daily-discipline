import { Flame, Beef, Droplets, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import ProgressRing from '@/components/ui/ProgressRing';
import ProgressBar from '@/components/ui/ProgressBar';
import DailyScoreCard from '@/components/dashboard/DailyScoreCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { totalCalories, totalProtein, totalWater, meals, profile } = useAppStore();

  const mealCounts = {
    breakfast: meals.filter(m => m.mealType === 'breakfast').length,
    lunch: meals.filter(m => m.mealType === 'lunch').length,
    snacks: meals.filter(m => m.mealType === 'snacks').length,
    dinner: meals.filter(m => m.mealType === 'dinner').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-5 pt-12 pb-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground font-medium">{greeting} 👋</p>
        <h1 className="text-2xl font-bold font-heading text-foreground mt-0.5">Growr</h1>
      </div>

      {/* Daily Score Card */}
      <DailyScoreCard />

      {/* Main Progress Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories */}
        <button onClick={() => navigate('/meals')} className="col-span-1 rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Flame className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Calories</span>
          </div>
          <ProgressRing value={totalCalories} max={profile.calorieGoal} size={90} strokeWidth={7}>
            <div className="text-center">
              <p className="text-lg font-bold font-heading text-foreground">{totalCalories}</p>
              <p className="text-[10px] text-muted-foreground">/ {profile.calorieGoal}</p>
            </div>
          </ProgressRing>
        </button>

        {/* Protein */}
        <button onClick={() => navigate('/meals')} className="col-span-1 rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Beef className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Protein</span>
          </div>
          <ProgressRing value={totalProtein} max={profile.proteinGoal} size={90} strokeWidth={7} color="hsl(var(--success))">
            <div className="text-center">
              <p className="text-lg font-bold font-heading text-foreground">{totalProtein}g</p>
              <p className="text-[10px] text-muted-foreground">/ {profile.proteinGoal}g</p>
            </div>
          </ProgressRing>
        </button>
      </div>

      {/* Water */}
      <button onClick={() => navigate('/water')} className="w-full rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Droplets className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Water</span>
          </div>
          <span className="text-sm font-bold font-heading text-foreground">
            {(totalWater / 1000).toFixed(1)}L
            <span className="text-muted-foreground font-normal text-xs"> / {(profile.waterGoal / 1000).toFixed(1)}L</span>
          </span>
        </div>
        <ProgressBar value={totalWater} max={profile.waterGoal} barClassName="bg-info" />
      </button>

      {/* Meal Summary */}
      <button onClick={() => navigate('/meals')} className="w-full rounded-2xl bg-card p-4 shadow-sm text-left transition-transform active:scale-[0.98]">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Meals today</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map(type => (
            <div key={type} className="text-center rounded-xl bg-secondary/50 py-2.5 px-1">
              <p className="text-lg font-bold font-heading text-foreground">{mealCounts[type]}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{type}</p>
            </div>
          ))}
        </div>
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Log meal', icon: Utensils, path: '/meals' },
          { label: 'Add water', icon: Droplets, path: '/water' },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-primary py-3.5 px-2 text-primary-foreground shadow-primary transition-transform active:scale-95"
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
