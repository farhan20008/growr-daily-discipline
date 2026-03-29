import { TrendingUp, Scale, Flame, Beef, Dumbbell, Zap, Camera } from 'lucide-react';
import { weeklyData, userProfile } from '@/data/mockData';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';

export default function ProgressPage() {
  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const avgCal = avg(weeklyData.map(d => d.calories));
  const avgPro = avg(weeklyData.map(d => d.protein));
  const workoutDays = weeklyData.filter(d => d.workoutCompleted).length;
  const avgEnergy = (weeklyData.reduce((s, d) => s + (d.energy || 0), 0) / weeklyData.length).toFixed(1);

  const weightData = weeklyData.filter(d => d.weight).map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    weight: d.weight,
  }));

  const calData = weeklyData.map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    calories: d.calories,
    goal: userProfile.calorieGoal,
  }));

  return (
    <div className="px-5 pt-12 pb-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Progress</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Weekly overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Avg Calories', value: `${avgCal}`, icon: Flame, sub: `Goal: ${userProfile.calorieGoal}` },
          { label: 'Avg Protein', value: `${avgPro}g`, icon: Beef, sub: `Goal: ${userProfile.proteinGoal}g` },
          { label: 'Workouts', value: `${workoutDays}/7`, icon: Dumbbell, sub: 'This week' },
          { label: 'Energy', value: `${avgEnergy}/5`, icon: Zap, sub: 'Avg this week' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Weight Trend */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Weight Trend</h3>
          <span className="text-xs text-muted-foreground ml-auto">{userProfile.currentWeight}kg → {userProfile.goalWeight}kg</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={weightData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3.5, fill: 'hsl(var(--primary))' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calorie Trend */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Daily Calories</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={calData} barCategoryGap="20%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
              {calData.map((entry, i) => (
                <Cell key={i} fill={entry.calories >= entry.goal ? 'hsl(var(--success))' : 'hsl(var(--primary))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Photos Placeholder */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Progress Photos</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square rounded-xl bg-muted flex items-center justify-center">
              <Camera className="h-6 w-6 text-muted-foreground/40" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">Coming soon — track your visual progress</p>
      </div>
    </div>
  );
}
