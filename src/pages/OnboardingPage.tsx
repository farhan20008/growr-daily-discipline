import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Dumbbell, Target, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { upsertProfile } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { calculateGoals, ACTIVITY_LEVELS, GOAL_TYPES } from '@/utils/goalCalculator';

type Step = 'basic' | 'activity' | 'goal' | 'calculating' | 'result';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isCalculating, setIsCalculating] = useState(false);

  // Form state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'heavy' | ''>('');
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain' | ''>('');
  const [goalWeight, setGoalWeight] = useState('');

  // Calculated results
  const [calorieGoal, setCalorieGoal] = useState<number>(0);
  const [proteinGoal, setProteinGoal] = useState<number>(0);

  const validateBasic = () => {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    return w > 30 && w < 300 && h > 100 && h < 250 && a > 10 && a < 100;
  };

  const validateGoal = () => {
    const gw = Number(goalWeight);
    return activityLevel && goal && gw > 30 && gw < 300;
  };

  const nextStep = () => {
    if (currentStep === 'basic') {
      setCurrentStep('activity');
    } else if (currentStep === 'activity') {
      setCurrentStep('goal');
    } else if (currentStep === 'goal') {
      // Start calculation and show loading
      setIsCalculating(true);
      setCurrentStep('calculating');
    }
  };

  const prevStep = () => {
    if (currentStep === 'activity') {
      setCurrentStep('basic');
    } else if (currentStep === 'goal') {
      setCurrentStep('activity');
    } else if (currentStep === 'calculating') {
      setCurrentStep('goal');
    }
  };

  const calculateAndSave = async () => {
    try {
      // Run calculations
      const results = calculateGoals(
        Number(weight),
        Number(height),
        Number(age),
        gender,
        activityLevel as 'sedentary' | 'light' | 'moderate' | 'heavy',
        goal as 'lose' | 'maintain' | 'gain'
      );

      setCalorieGoal(results.calorieGoal);
      setProteinGoal(results.proteinGoal);
      setIsCalculating(false);
      setCurrentStep('result');
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate goals. Please check your inputs.');
      setCurrentStep('goal');
      setIsCalculating(false);
    }
  };

  // Trigger calculation when entering calculating step
  useEffect(() => {
    if (currentStep === 'calculating') {
      const timer = setTimeout(() => {
        calculateAndSave();
      }, 1500); // Simulate brief loading for UX
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const complete = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        alert('You must be logged in to complete onboarding. Please log in again.');
        navigate('/login');
        return;
      }

      const profile = {
        name: 'User',
        currentWeight: Number(weight),
        calorieGoal,
        proteinGoal,
        waterGoal: 3000,
        goalWeight: Number(goalWeight),
        height: Number(height) || null,
        age: Number(age) || null,
        activity_level: activityLevel || null,
        goal: goal || null,
        budgetMode: true,
        workoutDays: 5,
      };

      console.log('[Onboarding] Completing with profile:', profile);
      await upsertProfile(currentUser.id, profile);
      console.log('[Onboarding] Profile saved, redirecting...');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile: ' + (error?.message || JSON.stringify(error)));
    }
  };

  const skipOnboarding = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        alert('You must be logged in to complete onboarding. Please log in again.');
        navigate('/login');
        return;
      }

      // Use calculated goals based on defaults
      const defaultWeight = 70;
      const defaultHeight = 170;
      const defaultAge = 25;
      const defaultGender: 'male' | 'female' = 'male';
      const defaultActivity: 'sedentary' | 'light' | 'moderate' | 'heavy' = 'moderate';
      const defaultGoal: 'lose' | 'maintain' | 'gain' = 'maintain';

      const results = calculateGoals(
        defaultWeight,
        defaultHeight,
        defaultAge,
        defaultGender,
        defaultActivity,
        defaultGoal
      );

      const profile = {
        name: 'User',
        currentWeight: defaultWeight,
        calorieGoal: results.calorieGoal,
        proteinGoal: results.proteinGoal,
        waterGoal: 3000,
        goalWeight: defaultWeight,
        height: defaultHeight,
        age: defaultAge,
        activity_level: defaultActivity,
        goal: defaultGoal,
        budgetMode: true,
        workoutDays: 5,
      };

      console.log('[Onboarding] Skipping with default profile:', profile);
      await upsertProfile(currentUser.id, profile);
      console.log('[Onboarding] Skip profile saved, redirecting...');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Failed to skip onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground">We'll use this to calculate your personalized goals.</p>
      </div>

      {/* Gender Selection */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={gender === 'male' ? 'default' : 'outline'}
            className="h-14 text-base"
            onClick={() => setGender('male')}
          >
            Male
          </Button>
          <Button
            type="button"
            variant={gender === 'female' ? 'default' : 'outline'}
            className="h-14 text-base"
            onClick={() => setGender('female')}
          >
            Female
          </Button>
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Current weight (kg)</label>
        <div className="relative">
          <Input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="h-12 rounded-xl pl-12"
            placeholder="e.g. 68"
            min={30}
            max={300}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Height (cm)</label>
        <div className="relative">
          <Input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="h-12 rounded-xl pl-12"
            placeholder="e.g. 170"
            min={100}
            max={250}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">cm</span>
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Age</label>
        <div className="relative">
          <Input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            className="h-12 rounded-xl pl-12"
            placeholder="e.g. 25"
            min={10}
            max={100}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">years</span>
        </div>
      </div>
    </div>
  );

  const renderActivityLevel = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">How active are you?</h2>
        <p className="text-muted-foreground">This helps us estimate your daily calorie needs.</p>
      </div>

      <div className="space-y-3">
        {ACTIVITY_LEVELS.map(activity => (
          <Button
            key={activity.level}
            type="button"
            variant={activityLevel === activity.level ? 'default' : 'outline'}
            className="w-full h-auto p-4 flex flex-col items-start gap-1"
            onClick={() => setActivityLevel(activity.level)}
          >
            <span className="text-base font-semibold">{activity.label}</span>
            <span className="text-sm text-muted-foreground text-left">{activity.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderGoal = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">What's your goal?</h2>
        <p className="text-muted-foreground">Tell us where you want to be.</p>
      </div>

      {/* Goal Type Selection */}
      <div className="space-y-3">
        {GOAL_TYPES.map(goalType => (
          <Button
            key={goalType.type}
            type="button"
            variant={goal === goalType.type ? 'default' : 'outline'}
            className="w-full h-auto p-4 flex flex-col items-start gap-1"
            onClick={() => setGoal(goalType.type)}
          >
            <span className="text-base font-semibold">{goalType.label}</span>
            <span className="text-sm text-muted-foreground text-left">
              {goalType.type === 'lose' && 'Reduce body fat'}
              {goalType.type === 'maintain' && 'Stay at current weight'}
              {goalType.type === 'gain' && 'Build muscle mass'}
            </span>
          </Button>
        ))}
      </div>

      {/* Goal Weight */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Target weight (kg)
        </label>
        <div className="relative">
          <Input
            type="number"
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
            className="h-12 rounded-xl pl-12"
            placeholder="e.g. 65"
            min={30}
            max={300}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
        </div>
        {goalWeight && Number(goalWeight) > Number(weight) && goal === 'lose' && (
          <p className="text-sm text-warning mt-2">Your target weight is higher than current weight for a "lose" goal.</p>
        )}
        {goalWeight && Number(goalWeight) < Number(weight) && goal === 'gain' && (
          <p className="text-sm text-warning mt-2">Your target weight is lower than current weight for a "gain" goal.</p>
        )}
      </div>
    </div>
  );

  const renderCalculating = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Calculating your goals...</h2>
        <p className="text-muted-foreground">We're personalizing your targets based on your profile.</p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/15 mb-4">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-2">All set!</h2>
        <p className="text-muted-foreground">Based on your profile, here are your daily targets:</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-primary/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Daily Calorie Goal</span>
          </div>
          <p className="text-4xl font-bold font-heading text-primary">{calorieGoal.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">kcal per day</p>
        </div>

        <div className="rounded-2xl bg-success/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dumbbell className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-success">Daily Protein Goal</span>
          </div>
          <p className="text-4xl font-bold font-heading text-success">{proteinGoal.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">grams per day</p>
        </div>

        <div className="rounded-2xl bg-accent p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-5 w-5 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">Goal Weight</span>
          </div>
          <p className="text-4xl font-bold font-heading text-accent-foreground">{goalWeight}</p>
          <p className="text-sm text-muted-foreground mt-1">kilograms</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 text-sm text-muted-foreground">
        <p className="text-center">
          These targets are personalized based on your metabolic rate, activity level, and goals.
          Stick to them consistently and you'll see progress!
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicInfo();
      case 'activity':
        return renderActivityLevel();
      case 'goal':
        return renderGoal();
      case 'calculating':
        return renderCalculating();
      case 'result':
        return renderResult();
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 'basic') return validateBasic();
    if (currentStep === 'activity') return !!activityLevel;
    if (currentStep === 'goal') return validateGoal();
    if (currentStep === 'calculating' || currentStep === 'result') return false;
    return true;
  };

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col bg-background">
        {/* Skip Button */}
        {currentStep !== 'calculating' && currentStep !== 'result' && (
          <div className="flex justify-end px-5 pt-6">
            <button
              onClick={skipOnboarding}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-4">
          <div className="w-full max-w-sm animate-fade-in">
            {renderStep()}
          </div>
        </div>

        {/* Bottom Navigation */}
        {(currentStep === 'basic' || currentStep === 'activity' || currentStep === 'goal') && (
          <div className="px-8 pb-10 pt-4 space-y-5">
            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2">
              {['basic', 'activity', 'goal'].map((step, index) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === step ? 'w-7 bg-primary' : 'w-2 bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-14 rounded-2xl text-base font-semibold gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 h-14 rounded-2xl text-base font-semibold gap-2"
              >
                {currentStep === 'goal' ? 'Calculate' : 'Continue'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'calculating' && (
          <div className="px-8 pb-10">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
            </div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="px-8 pb-10 pt-4 space-y-5">
            <Button
              type="button"
              onClick={complete}
              className="w-full h-14 rounded-2xl text-base font-semibold gap-2 shadow-primary"
              size="lg"
            >
              Let's start growing
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

    </>
  );
}
