import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MealsPage from "./pages/MealsPage";
import WorkoutPage from "./pages/WorkoutPage";
import WaterPage from "./pages/WaterPage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import ScanPage from "./pages/ScanPage";
import OnboardingPage, { hasCompletedOnboarding } from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={
            hasCompletedOnboarding() ? <Navigate to="/" replace /> : <OnboardingPage />
          } />
          <Route element={<AppLayout />}>
            <Route path="/" element={
              hasCompletedOnboarding() ? <Dashboard /> : <Navigate to="/onboarding" replace />
            } />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/water" element={<WaterPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/scan" element={<ScanPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
