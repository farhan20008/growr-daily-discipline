import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DataSync from './DataSync';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileChecked(true);
      return;
    }

    const checkProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) {
          console.error('Profile check error:', error);
          setHasProfile(false);
        } else {
          setHasProfile(!!data);
        }
      } catch (err) {
        console.error('Profile check failed:', err);
        setHasProfile(false);
      } finally {
        setProfileChecked(true);
      }
    };

    checkProfile();
  }, [user]);

  if (authLoading || !profileChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if user hasn't completed it
  if (!hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user already has profile but is on onboarding page, redirect to home
  if (hasProfile && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <DataSync />
      {children ? children : <Outlet />}
    </>
  );
}
