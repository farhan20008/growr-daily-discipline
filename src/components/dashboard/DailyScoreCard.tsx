import { useAppStore } from '@/hooks/useAppStore';
import ProgressRing from '@/components/ui/ProgressRing';
import ProgressBar from '@/components/ui/ProgressBar';

const PRIORITY_EMOJI: Record<string, string> = {
  perfect: '🎯',
  protein: '🥩',
  calories: '🍽️',
  hydration: '💧',
  workout: '🏋️',
  macros: '⚖️',
};

const RANK_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  consistent: 'Consistent',
  focused: 'Focused',
  disciplined: 'Disciplined',
};

export default function DailyScoreCard() {
  const { todayScore, currentStreak, rank, rankProgress, bestStreak, coachAdvice } = useAppStore();

  // Determine color based on score
  const getScoreColor = () => {
    if (todayScore >= 70) return 'hsl(var(--success))';
    if (todayScore >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getStatus = () => {
    if (todayScore >= 70) return 'On track';
    if (todayScore >= 50) return 'Almost there';
    return 'Behind';
  };

  const getNextRank = (): string => {
    const ranks = ['beginner', 'consistent', 'focused', 'disciplined'];
    const idx = ranks.indexOf(rank);
    return idx < ranks.length - 1 ? ranks[idx + 1].charAt(0).toUpperCase() + ranks[idx + 1].slice(1) : 'Master';
  };

  const isMaxRank = rank === 'disciplined';

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Daily Score</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentStreak > 0 && `${currentStreak}-day streak 🔥`}
            {currentStreak === 0 && 'Build your streak'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {RANK_LABELS[rank]}
          </span>
        </div>
      </div>

      {/* Score Ring */}
      <div className="flex items-center justify-center mb-4">
        <ProgressRing
          value={todayScore}
          max={100}
          size={140}
          strokeWidth={10}
          color={getScoreColor()}
        >
          <div className="text-center">
            <p className={`text-4xl font-bold font-heading ${todayScore >= 70 ? 'text-success' : todayScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {todayScore}
            </p>
            <p className="text-xs text-muted-foreground">/ 100</p>
            <p className={`text-xs font-medium mt-1 ${getStatus() === 'On track' ? 'text-success' : getStatus() === 'Almost there' ? 'text-warning' : 'text-destructive'}`}>
              {getStatus()}
            </p>
          </div>
        </ProgressRing>
      </div>

      {/* Streak & Rank */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <p className="text-lg font-bold font-heading text-foreground">{currentStreak}</p>
          <p className="text-[10px] text-muted-foreground">Current Streak</p>
          <p className="text-[10px] text-muted-foreground">Best: {bestStreak} days</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <p className="text-lg font-bold font-heading text-foreground">{rank.charAt(0).toUpperCase() + rank.slice(1)}</p>
          <p className="text-[10px] text-muted-foreground">Rank</p>
          {!isMaxRank && (
            <p className="text-[10px] text-primary mt-1">{Math.round(rankProgress)}% to {getNextRank()}</p>
          )}
        </div>
      </div>

      {/* Rank Progress Bar */}
      {!isMaxRank && (
        <div className="mt-3">
          <ProgressBar value={rankProgress} max={100} barClassName="bg-primary" />
        </div>
      )}

      {/* Coach Advice */}
      <div className={`mt-4 p-3 rounded-xl border ${
        coachAdvice.priority === 'perfect'
          ? 'bg-success/10 border-success/20'
          : coachAdvice.priority === 'protein'
          ? 'bg-primary/10 border-primary/20'
          : coachAdvice.priority === 'hydration'
          ? 'bg-blue-500/10 border-blue-500/20'
          : coachAdvice.priority === 'calories'
          ? 'bg-amber-500/10 border-amber-500/20'
          : 'bg-accent/50 border-accent'
      }`}>
        <p className="text-xs font-medium text-accent-foreground mb-1">
          {PRIORITY_EMOJI[coachAdvice.priority]} Coach says
        </p>
        <p className="text-sm text-foreground">{coachAdvice.message}</p>
        {coachAdvice.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {coachAdvice.suggestions.map((s, i) => (
              <span key={i} className="text-xs bg-background/50 px-2 py-1 rounded-full text-foreground">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
