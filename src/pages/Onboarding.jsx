import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingWizard from '@/components/OnboardingWizard';
import { base44 } from '@/api/base44Client';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleOnboardingComplete = async () => {
    // Redirect to admin dashboard after onboarding
    setTimeout(() => {
      navigate('/admin');
    }, 1500);
  };

  useEffect(() => {
    // Check if user is authenticated
    base44.auth.isAuthenticated().then((authed) => {
      if (!authed) {
        navigate('/');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    </div>
  );
}