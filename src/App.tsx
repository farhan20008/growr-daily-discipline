import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppStateProvider } from "@/hooks/useAppStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLayout from "@/components/layout/AppLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import Dashboard from "@/pages/Dashboard";
import MealsPage from "@/pages/MealsPage";
import WaterPage from "@/pages/WaterPage";
import WorkoutPage from "@/pages/WorkoutPage";
import ScanPage from "@/pages/ScanPage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/meals" element={<MealsPage />} />
                    <Route path="/water" element={<WaterPage />} />
                    <Route path="/workout" element={<WorkoutPage />} />
                    <Route path="/scan" element={<ScanPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
