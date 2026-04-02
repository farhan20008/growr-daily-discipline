import { useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';

export default function ConsistencyHeatmap() {
  const { disciplineCalendar } = useAppStore();

  const days = useMemo(() => {
    const result: { date: Date; dateStr: string; success: boolean; hasData: boolean }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const success = disciplineCalendar[dateStr] === true;
      const hasData = disciplineCalendar.hasOwnProperty(dateStr);
      result.push({ date: d, dateStr, success, hasData });
    }
    return result;
  }, [disciplineCalendar]);

  // Group into weeks (rows)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getCellColor = (hasData: boolean, success: boolean) => {
    if (!hasData) return 'bg-muted/30';
    return success ? 'bg-success' : 'bg-destructive/60';
  };

  const getTextColor = (hasData: boolean) => hasData ? 'text-white' : 'text-muted-foreground';

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-3">Consistency Heatmap</h3>
      <div className="space-y-2">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1.5">
            {week.map(day => {
              const dayNum = day.date.getDate();
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];
              return (
                <div
                  key={day.dateStr}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${getCellColor(day.hasData, day.success)} ${getTextColor(day.hasData)} ${isToday ? 'ring-2 ring-primary' : ''}`}
                  title={`${day.date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}: ${day.hasData ? (day.success ? 'Score ≥70' : 'Score <70') : 'No data'}`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success"></div>
          <span>≥70 (streak)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-destructive/60"></div>
          <span>&lt;70</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-muted/30"></div>
          <span>No data</span>
        </div>
      </div>
    </div>
  );
}
