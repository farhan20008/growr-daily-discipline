import { useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

export default function DisciplineTrend() {
  const { weeklyScores } = useAppStore();

  const chartData = useMemo(() => {
    const dates = Object.keys(weeklyScores).sort();
    // Show last 14 days or all if less
    const recentDates = dates.slice(-14);
    return recentDates.map(date => {
      const d = new Date(date);
      return {
        date,
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        score: weeklyScores[date] || 0,
      };
    });
  }, [weeklyScores]);

  if (chartData.length < 2) {
    return (
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Discipline Score Trend</h3>
        <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
          Complete more days to see your trend
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-semibold text-foreground">Discipline Score Trend</span>
        <span className="text-xs text-muted-foreground">(last 14 days)</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fontSize: 10 }} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Your score above 70 builds your streak. Consistency beats perfection.
      </p>
    </div>
  );
}
