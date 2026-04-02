# 🏋️ Growr - Daily Discipline App

> **Track. Maintain. Grow.**  
> A smart fitness tracking app that calculates your daily calorie and protein goals automatically, built for consistency and real progress.

---

## ✨ Features

### 🎯 **Smart Onboarding**
- Collects basic info: weight, height, age, gender
- Selects activity level and fitness goal
- **Automatically calculates** daily calorie & protein goals using scientific formulas (Mifflin-St Jeor Equation)
- No guessing — personalized targets based on your metabolism

### 📊 **Dashboard**
- Real-time daily score (0-100)
- Weekly progress tracking
- Rank system (Beginner → Legend)
- Coach feedback messages
- Discipline streak counter

### 🍽️ **Meal Logging**
- Log desi foods: eggs, rice, dal, chicken, soy chunks, roti, and more
- Barcode scanner for packaged foods
- Photo recognition (coming soon)
- Automatic calorie & protein tracking

### 💧 **Hydration Tracking**
- One-tap water logging
- Daily water goal (3000ml default)
- Visual progress indicator

### 🏋️ **Workout Tracking**
- 5-day split workout plan (Chest, Back, Legs, Shoulders, Full Body)
- Set completion tracking
- Exercise progress visualization

### 📈 **Progress Insights**
- Consistency heatmap (7-day view)
- Weekly calorie & protein trends
- Weight progress tracking
- Performance metrics

### 👤 **Profile Management**
- View all stats in one place
- Editable goals (calories, protein, weight targets)
- Activity level & goal settings
- Real-time sync across devices

---

## 🧮 **Goal Calculation**

Using the **Mifflin-St Jeor Equation**:

```
BMR (Male) = (10 × weight) + (6.25 × height) - (5 × age) + 5
BMR (Female) = (10 × weight) + (6.25 × height) - (5 × age) - 161

TDEE = BMR × Activity Multiplier
  sedentary: 1.2
  light: 1.375
  moderate: 1.55
  heavy: 1.725

Calorie Goal = TDEE + Adjustment
  lose: -400
  maintain: 0
  gain: +300

Protein Goal = weight (kg) × 2 grams
```

---

## 🚀 **Getting Started**

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/growr.git
cd growr
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**

Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

Run the SQL schema in your Supabase SQL editor:
```sql
-- See supabase-schema.sql in this repo
```

Enable email confirmations or disable them in Supabase auth settings:
- Go to Authentication → Settings → Email
- Set "Enable email confirmations" to OFF for development

5. **Start development server**
```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

---

## 📱 **App Flow**

1. **Sign Up / Log In** → creates/auths user
2. **Onboarding** → enter weight, height, age, activity, goal → get calculated targets
3. **Dashboard** → start logging meals, water, workouts
4. **Profile** → view/edit all settings, see progress

---

## 🗄️ **Database Schema**

### `profiles` table
```sql
id uuid (PK)
user_id uuid (FK → auth.users)
name text
calorie_goal integer
protein_goal integer
water_goal integer
current_weight numeric
goal_weight numeric
height integer (optional)
age integer (optional)
activity_level text (optional) -- 'sedentary' | 'light' | 'moderate' | 'heavy'
goal text (optional) -- 'lose' | 'maintain' | 'gain'
budget_mode boolean
workout_days integer
created_at timestamptz
updated_at timestamptz
```

### `meals` table (auto-created by Supabase)
```sql
id uuid (PK)
user_id uuid (FK)
food_id text
food_name text
calories integer
protein numeric
quantity numeric
serving text
meal_type text -- 'breakfast' | 'lunch' | 'snacks' | 'dinner'
logged_at timestamptz
```

### `water_entries` table (auto-created by Supabase)
```sql
id uuid (PK)
user_id uuid (FK)
amount integer
logged_at timestamptz
```

### `workout_logs` table (auto-created by Supabase)
```sql
id uuid (PK)
user_id uuid (FK)
exercise_id text
completed_sets integer[]
logged_at timestamptz
```

---

## 🛠️ **Tech Stack**

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Components** | shadcn/ui (Radix UI primitives) |
| **Icons** | Lucide React |
| **State Management** | React Context + Custom Hooks |
| **Data Fetching** | TanStack Query |
| **Backend/Auth** | Supabase |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Notifications** | Sonner |

---

## 📂 **Project Structure**

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # AppLayout, ProtectedRoute
│   ├── dashboard/       # Dashboard widgets
│   ├── progress/        # Progress charts
│   └── scan/            # Barcode scanner
├── contexts/            # React contexts (Auth)
├── data/                # Mock data, type definitions
├── hooks/               # Custom hooks
│   ├── useAppStore.tsx      # Global state
│   └── useSupabaseDataSync.ts # Sync logic
├── integrations/        # Supabase client
├── lib/                 # Utilities (cn, etc.)
├── pages/
│   ├── auth/            # LoginPage
│   ├── OnboardingPage.tsx
│   ├── Dashboard.tsx
│   ├── MealsPage.tsx
│   ├── WaterPage.tsx
│   ├── WorkoutPage.tsx
│   ├── ScanPage.tsx
│   ├── ProgressPage.tsx
│   └── ProfilePage.tsx
├── services/            # Supabase service functions
├── utils/               # Business logic
│   ├── disciplineEngine.ts  # Scoring, ranks
│   └── goalCalculator.ts    # BMR/TDEE calculations
└── App.tsx              # Root component
```

---

## 🔧 **Development Commands**

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Lint code
pnpm lint
```

---

## 🧪 **Testing**

1. **Create a test account** in the app
2. **Complete onboarding** with your stats
3. Use the app to:
   - Log meals
   - Track water
   - Complete workouts
   - View progress on the Progress page
4. Edit profile via pencil icon

---

## 🔐 **Authentication Flow**

- Email/password auth via Supabase
- Protected routes require login
- Onboarding required for new users (no profile → redirect to onboarding)
- Session persists across refreshes

---

## 🔄 **Data Sync**

- **Real-time sync**: Profile changes sync to Supabase automatically (2s debounce)
- **Hydration**: On login, all data fetched from Supabase and loaded into local state
- **Conflict resolution**: Last write wins (updated_at timestamp)

---

## 🎨 **Design System**

- **Theme**: Light/Dark mode support (via next-themes)
- **Colors**: Primary, secondary, accent, destructive, success, warning, info
- **Typography**: Inter (default) + Lexend/Deca (headings)
- **Radius**: Consistent rounded corners (xl-2xl)
- **Spacing**: 4px grid system

---

## 📱 **Responsive**

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly targets (44×44px minimum)

---

## 🚢 **Deployment**

### Vercel / Netlify
1. Push to GitHub
2. Import project in Vercel/Netlify
3. Add environment variables
4. Deploy

### Self-hosted (Docker)
```dockerfile
# Dockerfile coming soon
```

---

## 📝 **License**

MIT © 2024 Growr

---

## 🙏 **Acknowledgments**

- Built with [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS](https://tailwindcss.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Hosted on [Supabase](https://supabase.com)
- Icons from [Lucide](https://lucide.dev)

---

## 🤝 **Contributing**

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Submit a Pull Request

For major changes, please open an issue first.

---

## 📧 **Contact**

Questions? Feedback? Reach out:
- GitHub Issues: https://github.com/yourusername/growr/issues
- Email: farhan.abir9999@gmail.com

---

**Made with ❤️ for fitness enthusiasts everywhere.**

*Track your calories. Hit your protein. Grow stronger.* 💪