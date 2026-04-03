import { useState } from 'react';
import { User, Target, Droplets, Dumbbell, Utensils, Moon, Bell, ChevronRight, Pencil, Check, X, LogOut, Flame, Ruler, Calendar, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/hooks/useAppStore';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { profile: storeProfile, updateProfile } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState(storeProfile);

  const openDialog = () => {
    setDraft(storeProfile);
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const save = async () => {
    try {
      const updates: Partial<typeof storeProfile> = {
        name: draft.name.trim() || 'User',
      };

      // Numeric fields
      const currentWeight = Number(draft.currentWeight);
      if (!isNaN(currentWeight)) {
        updates.currentWeight = currentWeight;
      }

      const calorieGoal = Number(draft.calorieGoal);
      if (!isNaN(calorieGoal)) {
        updates.calorieGoal = calorieGoal;
      }

      const proteinGoal = Number(draft.proteinGoal);
      if (!isNaN(proteinGoal)) {
        updates.proteinGoal = proteinGoal;
      }

      const goalWeight = Number(draft.goalWeight);
      if (!isNaN(goalWeight)) {
        updates.goalWeight = goalWeight;
      }

      const height = Number(draft.height);
      if (!isNaN(height)) {
        updates.height = height;
      }

      const age = Number(draft.age);
      if (!isNaN(age)) {
        updates.age = age;
      }

      // String fields
      if (draft.activityLevel) {
        updates.activityLevel = draft.activityLevel;
      }

      if (draft.goal) {
        updates.goal = draft.goal;
      }

      updateProfile(updates);
      closeDialog();
      toast.success('Profile updated');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const settingsSections = [
    {
      title: 'Goals',
      items: [
        { icon: Target, label: 'Daily Calorie Goal', value: `${storeProfile.calorieGoal} cal` },
        { icon: Target, label: 'Daily Protein Goal', value: `${storeProfile.proteinGoal}g` },
        { icon: Droplets, label: 'Daily Water Goal', value: `${storeProfile.waterGoal / 1000}L` },
        { icon: Target, label: 'Goal Weight', value: `${storeProfile.goalWeight}kg` },
      ],
    },
    {
      title: 'About You',
      items: [
        { icon: Ruler, label: 'Height', value: storeProfile.height ? `${storeProfile.height} cm` : 'Not set' },
        { icon: Calendar, label: 'Age', value: storeProfile.age ? `${storeProfile.age} years` : 'Not set' },
        { icon: Activity, label: 'Activity Level', value: storeProfile.activityLevel ? storeProfile.activityLevel.charAt(0).toUpperCase() + storeProfile.activityLevel.slice(1) : 'Not set' },
        { icon: Target, label: 'Goal', value: storeProfile.goal ? storeProfile.goal.charAt(0).toUpperCase() + storeProfile.goal.slice(1) : 'Not set' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Dumbbell, label: 'Workout Days', value: `${storeProfile.workoutDays} days/week` },
        { icon: Utensils, label: 'Food Preferences', value: 'Local foods' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: LogOut, label: 'LogOut Your Account', action: 'logout' },
      ],
    },
  ];

  return (
    <div className="px-5 pt-12 pb-6 space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">{storeProfile.name}</h1>
            <p className="text-sm text-muted-foreground">{storeProfile.currentWeight}kg · Lean bulk</p>
          </div>
        </div>
        <button onClick={openDialog} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Current', value: `${storeProfile.currentWeight}kg` },
          { label: 'Goal', value: `${storeProfile.goalWeight}kg` },
          { label: 'To go', value: `+${(storeProfile.goalWeight - Number(storeProfile.currentWeight)).toFixed(1)}kg` },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-card p-3 shadow-sm text-center">
            <p className="text-lg font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily Goals - Prominent Display */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Your Daily Targets</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Calories</span>
            </div>
            <p className="text-2xl font-bold font-heading text-primary">{storeProfile.calorieGoal.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">kcal/day</p>
          </div>

          {/* Protein */}
          <div className="rounded-2xl bg-success/10 p-4 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-success">Protein</span>
            </div>
            <p className="text-2xl font-bold font-heading text-success">{storeProfile.proteinGoal.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">grams/day</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      {settingsSections.map(section => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{section.title}</h3>
          <div className="rounded-2xl bg-card shadow-sm overflow-hidden divide-y divide-border">
            {section.items.map(item => (
              <div key={item.label} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.action === 'logout' ? (
                    <button
                      onClick={() => signOut().catch(() => toast.error('Failed to log out'))}
                      className="flex items-center gap-1.5 text-sm font-medium text-destructive hover:text-destructive/80"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Your name</label>
              <Input
                value={draft.name}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                className="h-12 rounded-xl"
                placeholder="Your name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Height (cm)</label>
                <Input
                  type="number"
                  value={draft.height || ''}
                  onChange={e => setDraft(d => ({ ...d, height: e.target.value ? Number(e.target.value) : null }))}
                  className="h-12 rounded-xl"
                  placeholder="170"
                  min={100}
                  max={250}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Age</label>
                <Input
                  type="number"
                  value={draft.age || ''}
                  onChange={e => setDraft(d => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))}
                  className="h-12 rounded-xl"
                  placeholder="25"
                  min={10}
                  max={100}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Activity Level</label>
              <select
                value={draft.activityLevel || ''}
                onChange={e => setDraft(d => ({ ...d, activityLevel: e.target.value }))}
                className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-base"
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="heavy">Heavy (6-7 days/week)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Goal</label>
              <select
                value={draft.goal || ''}
                onChange={e => setDraft(d => ({ ...d, goal: e.target.value }))}
                className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-base"
              >
                <option value="">Select goal</option>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Current weight (kg)</label>
                <Input
                  type="number"
                  value={draft.currentWeight}
                  onChange={e => setDraft(d => ({ ...d, currentWeight: e.target.value as any }))}
                  className="h-12 rounded-xl"
                  min={30}
                  max={200}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Goal weight (kg)</label>
                <Input
                  type="number"
                  value={draft.goalWeight}
                  onChange={e => setDraft(d => ({ ...d, goalWeight: e.target.value as any }))}
                  className="h-12 rounded-xl"
                  min={30}
                  max={200}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Daily calorie goal</label>
              <Input
                type="number"
                value={draft.calorieGoal}
                onChange={e => setDraft(d => ({ ...d, calorieGoal: e.target.value as any }))}
                className="h-12 rounded-xl"
                min={1200}
                max={5000}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Daily protein goal (g)</label>
              <Input
                type="number"
                value={draft.proteinGoal}
                onChange={e => setDraft(d => ({ ...d, proteinGoal: e.target.value as any }))}
                className="h-12 rounded-xl"
                min={30}
                max={400}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={save}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
