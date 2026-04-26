import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingSetupWizard from './OnboardingSetupWizard';

export default function OnboardingGate({ children }) {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setUserId(user.email);
          
          // Check if onboarding is complete
          const progress = await base44.entities.OnboardingProgress.filter({
            user_email: user.email
          });

          // Show wizard only for new users without completed onboarding
          if (progress.length === 0 || !progress[0].onboarding_completed) {
            setShowWizard(true);
          }
        }
      } catch (e) {
        console.error('Failed to check onboarding status', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      {showWizard && userId && (
        <OnboardingSetupWizard
          userId={userId}
          onComplete={() => setShowWizard(false)}
          onSkip={() => setShowWizard(false)}
        />
      )}
    </>
  );
}