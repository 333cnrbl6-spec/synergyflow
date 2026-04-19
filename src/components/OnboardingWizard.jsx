import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle, HelpCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ONBOARDING_STEPS = [
  {
    id: 0,
    title: 'Complete Your Profile',
    description: 'Set up your organization name and contact information',
    content: 'Add your company name, website, and logo for a professional look.',
    feature: 'profile_completed',
    icon: '👤'
  },
  {
    id: 1,
    title: 'Invite Your Team',
    description: 'Add team members and assign roles',
    content: 'Invite colleagues to collaborate. Assign admin or user roles.',
    feature: 'team_invited',
    icon: '👥'
  },
  {
    id: 2,
    title: 'Choose Your Products',
    description: 'Select which SaaS products to activate',
    content: 'Start with one product or bundle multiple for synergy benefits.',
    feature: 'product_selected',
    icon: '🎯'
  },
  {
    id: 3,
    title: 'Connect Integrations',
    description: 'Link external services and data sources',
    content: 'Connect CRM, payment processors, or data warehouses.',
    feature: 'integration_connected',
    icon: '🔗'
  },
  {
    id: 4,
    title: 'Import Your Data',
    description: 'Migrate existing data from your previous system',
    content: 'Upload CSV files or use our migration tools for seamless data transfer.',
    feature: 'data_imported',
    icon: '📥'
  },
  {
    id: 5,
    title: 'Customize Your Dashboard',
    description: 'Personalize your workspace and widgets',
    content: 'Add charts, reports, and shortcuts tailored to your workflow.',
    feature: 'customized',
    icon: '⚙️'
  },
  {
    id: 6,
    title: 'Watch Training Video',
    description: 'Learn the core features in 5 minutes',
    content: 'Watch our quick-start video to master key workflows.',
    feature: 'training_completed',
    icon: '🎬'
  }
];

export default function OnboardingWizard({ onComplete, isModal = false }) {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const progressData = await base44.entities.OnboardingProgress.filter({
          user_email: currentUser.email
        });

        if (progressData.length > 0) {
          setProgress(progressData[0]);
          setCurrentStep(progressData[0].current_step || 0);
        } else {
          // Create new onboarding progress record
          const newProgress = await base44.entities.OnboardingProgress.create({
            user_email: currentUser.email,
            organization_name: currentUser.full_name || 'My Organization',
            current_step: 0,
            completed_steps: [],
            onboarding_started_date: new Date().toISOString()
          });
          setProgress(newProgress);
        }
      } catch (error) {
        console.error('Error loading onboarding:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const markStepComplete = async (stepId) => {
    if (!progress) return;

    try {
      const completedSteps = [...(progress.completed_steps || [])];
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
      }

      const isAllComplete = completedSteps.length === ONBOARDING_STEPS.length;
      const completionPercentage = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

      const updatedProgress = await base44.entities.OnboardingProgress.update(progress.id, {
        completed_steps: completedSteps,
        current_step: Math.min(stepId + 1, ONBOARDING_STEPS.length - 1),
        completion_percentage: completionPercentage,
        [ONBOARDING_STEPS[stepId].feature]: true,
        last_step_timestamp: new Date().toISOString(),
        onboarding_completed: isAllComplete,
        onboarding_completed_date: isAllComplete ? new Date().toISOString() : progress.onboarding_completed_date
      });

      setProgress(updatedProgress);
      toast.success(`Step "${ONBOARDING_STEPS[stepId].title}" completed! 🎉`);

      if (isAllComplete && onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    } catch (error) {
      console.error('Error marking step complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const skipStep = async (stepId) => {
    if (!progress) return;

    try {
      const skipped = [...(progress.skipped_steps || [])];
      if (!skipped.includes(stepId)) {
        skipped.push(stepId);
      }

      await base44.entities.OnboardingProgress.update(progress.id, {
        skipped_steps: skipped,
        current_step: Math.min(stepId + 1, ONBOARDING_STEPS.length - 1)
      });

      setCurrentStep(Math.min(stepId + 1, ONBOARDING_STEPS.length - 1));
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!progress) {
    return <div className="text-center text-slate-600">Unable to load onboarding</div>;
  }

  const completionPercentage = (progress.completed_steps?.length || 0) / ONBOARDING_STEPS.length * 100;
  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isStepCompleted = progress.completed_steps?.includes(currentStep);

  const Container = isModal ? 'div' : Card;
  const containerProps = isModal ? { className: 'bg-white rounded-lg shadow-lg p-8' } : {};

  return (
    <Container {...containerProps}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Getting Started with SynergyFlow</CardTitle>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{Math.round(completionPercentage)}% Complete</p>
          </div>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps Sidebar */}
          <div className="space-y-2">
            {ONBOARDING_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  currentStep === idx
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'border border-slate-200 hover:bg-slate-50'
                } ${progress.completed_steps?.includes(idx) ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">{step.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{step.title}</p>
                    {progress.completed_steps?.includes(idx) && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Step Content */}
              <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-4xl mb-2">{currentStepData.icon}</div>
                    <h3 className="text-2xl font-bold text-slate-900">{currentStepData.title}</h3>
                    <p className="text-slate-600 mt-1">{currentStepData.description}</p>
                  </div>
                  <div className="relative group">
                    <HelpCircle
                      className="w-6 h-6 text-slate-400 cursor-help"
                      onMouseEnter={() => setHoveredTooltip(currentStep)}
                      onMouseLeave={() => setHoveredTooltip(null)}
                    />
                    {hoveredTooltip === currentStep && (
                      <div className="absolute right-0 top-8 bg-slate-900 text-white text-xs rounded-lg p-3 w-56 shadow-lg z-10">
                        {currentStepData.content}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step-specific content */}
                <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                  <div className="text-sm text-slate-600">
                    <p className="mb-3">{currentStepData.content}</p>

                    {/* Contextual hints per step */}
                    {currentStep === 0 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: Your organization name appears on shared documents</p>
                      </div>
                    )}
                    {currentStep === 1 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: Invite at least one team member to unlock collaboration features</p>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: Bundle 2+ products for a 15% discount on your first year</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: We support 50+ integrations - check our marketplace</p>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: Our migration experts can help - email support@synergyflow.io</p>
                      </div>
                    )}
                    {currentStep === 5 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: Personalize your dashboard with role-based shortcuts</p>
                      </div>
                    )}
                    {currentStep === 6 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                        <p className="font-medium mb-1">💡 Tip: Videos are available in 5 languages</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => markStepComplete(currentStep)}
                    disabled={isStepCompleted}
                    className="flex-1"
                  >
                    {isStepCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => skipStep(currentStep)}
                    variant="outline"
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>

              {/* Progress Info */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <p>
                    {progress.completed_steps?.length || 0} of {ONBOARDING_STEPS.length} steps completed
                  </p>
                </div>
                {progress.onboarding_completed && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <p className="font-medium">🎉 Onboarding complete! You're all set to use SynergyFlow.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Container>
  );
}