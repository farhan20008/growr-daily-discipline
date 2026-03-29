import { useState, useEffect, useCallback } from 'react';
import { Check, Timer, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { workoutPlan } from '@/data/mockData';

export default function WorkoutPage() {
  const { workoutState, toggleSet } = useAppStore();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIdx = workoutPlan.findIndex(w => w.day === dayNames[new Date().getDay()]);
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 ? todayIdx : 0);
  const [restTimer, setRestTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const workout = workoutPlan[selectedDay];

  const startRest = useCallback((seconds: number = 90) => {
    setRestTimer(seconds);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    if (!timerActive || restTimer <= 0) {
      if (restTimer <= 0) setTimerActive(false);
      return;
    }
    const t = setTimeout(() => setRestTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, restTimer]);

  const totalSets = workout.exercises.reduce((s, e) => s + e.sets, 0);
  const completedSets = workout.exercises.reduce((s, e) => s + (workoutState[e.id]?.length || 0), 0);

  return (
    <div className="px-5 pt-12 pb-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Workout</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{completedSets}/{totalSets} sets completed</p>
      </div>

      {/* Day selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
        {workoutPlan.map((w, i) => (
          <button
            key={w.day}
            onClick={() => setSelectedDay(i)}
            className={`flex flex-col items-center rounded-xl px-4 py-2.5 min-w-[70px] transition-all ${
              i === selectedDay
                ? 'bg-primary text-primary-foreground shadow-primary'
                : 'bg-card text-muted-foreground'
            }`}
          >
            <span className="text-[10px] font-medium uppercase">{w.label}</span>
            <span className="text-xs font-semibold mt-0.5">{w.focus.split(' & ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Rest Timer */}
      {timerActive && (
        <div className="rounded-2xl bg-primary/10 p-4 flex items-center justify-between animate-scale-in">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Rest Timer</p>
              <p className="text-xs text-muted-foreground">Take a breather</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-heading text-primary">
              {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => { setTimerActive(false); setRestTimer(0); }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Workout header */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="text-lg font-bold font-heading text-foreground">{workout.focus}</h2>
        <p className="text-sm text-muted-foreground">{workout.exercises.length} exercises · {totalSets} sets</p>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {workout.exercises.map(exercise => {
          const completed = workoutState[exercise.id] || [];
          const allDone = completed.length >= exercise.sets;

          return (
            <div
              key={exercise.id}
              className={`rounded-2xl bg-card p-4 shadow-sm transition-all ${allDone ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`text-sm font-semibold text-foreground ${allDone ? 'line-through' : ''}`}>
                    {exercise.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.sets} × {exercise.reps} {exercise.name === 'Plank' ? 'sec' : 'reps'}
                    {exercise.weight ? ` · ${exercise.weight}kg` : ''}
                  </p>
                </div>
                {!allDone && (
                  <button
                    onClick={() => startRest(90)}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Timer className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Set buttons */}
              <div className="flex gap-2">
                {Array.from({ length: exercise.sets }).map((_, i) => {
                  const done = completed.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        toggleSet(exercise.id, i);
                        if (!done && completed.length + 1 < exercise.sets) startRest(90);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                        done
                          ? 'bg-success text-success-foreground'
                          : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : null}
                      Set {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
