import { Droplets, Plus } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { userProfile, weeklyData } from '@/data/mockData';
import ProgressRing from '@/components/ui/ProgressRing';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

export default function WaterPage() {
  const { totalWater, addWater } = useAppStore();
  const goal = userProfile.waterGoal;
  const glasses = Math.floor(totalWater / 250);

  const chartData = weeklyData.map(d => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    water: d.water / 1000,
    isToday: d.date === '2026-03-29',
  }));

  return (
    <div className="px-5 pt-12 pb-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Water</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Stay hydrated, stay strong</p>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center">
        <ProgressRing value={totalWater} max={goal} size={180} strokeWidth={12} color="hsl(var(--info))">
          <div className="text-center">
            <Droplets className="h-6 w-6 text-info mx-auto mb-1" />
            <p className="text-3xl font-bold font-heading text-foreground">{(totalWater / 1000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">of {(goal / 1000).toFixed(1)}L goal</p>
            <p className="text-xs text-muted-foreground mt-1">{glasses} glasses</p>
          </div>
        </ProgressRing>
      </div>

      {/* Quick Add */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '+1 Glass', sub: '250ml', amount: 250 },
          { label: '+500ml', sub: '2 glasses', amount: 500 },
          { label: '+1 Liter', sub: '4 glasses', amount: 1000 },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={() => addWater(btn.amount)}
            className="flex flex-col items-center gap-1 rounded-2xl bg-card p-4 shadow-sm transition-transform active:scale-95 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
              <Plus className="h-5 w-5 text-info" />
            </div>
            <span className="text-sm font-semibold text-foreground">{btn.label}</span>
            <span className="text-[10px] text-muted-foreground">{btn.sub}</span>
          </button>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">7-Day Hydration</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Bar dataKey="water" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? 'hsl(var(--info))' : 'hsl(var(--muted))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-accent/50 p-4">
        <p className="text-xs text-accent-foreground font-medium mb-1">Rule of thumb</p>
        <p className="text-sm text-foreground/80">1 glass = 250ml. Aim for 10–12 glasses daily for lean bulk.</p>
      </div>
    </div>
  );
}
