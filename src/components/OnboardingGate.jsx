import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingSetupWizard from './OnboardingSetupWizard';

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

export default function OnboardingGate({ children }) {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const checkOnboardingStatus = useCallback(async (retryCount = 0) => {
    try {
      setError(null);

      // Timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Onboarding check timeout')), TIMEOUT_MS)
      );

      const authPromise = (async () => {
        const user = await base44.auth.me();
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.email);

        // Check if onboarding is complete
        const progress = await base44.entities.OnboardingProgress.filter({
          user_email: user.email
        });

        // Show wizard only for new users without completed onboarding
        const shouldShowWizard = !progress.length || !progress[0]?.onboarding_completed;
        if (shouldShowWizard) {
          setShowWizard(true);
        }
      })();

      await Promise.race([authPromise, timeoutPromise]);
    } catch (e) {
      console.error('Onboarding check failed:', e);

      // Retry logic for transient failures
      if (retryCount < MAX_RETRIES && e.message !== 'Onboarding check timeout') {
        setTimeout(() => checkOnboardingStatus(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      // Timeout or final retry failure - allow graceful degradation
      setError(e.message);
      setShowWizard(false); // Don't block on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {showWizard && userId && !error && (
        <OnboardingSetupWizard
          userId={userId}
          onComplete={() => setShowWizard(false)}
          onSkip={() => setShowWizard(false)}
        />
      )}
    </>
  );
}