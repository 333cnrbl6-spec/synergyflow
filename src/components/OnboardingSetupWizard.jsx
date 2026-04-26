import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Upload, Settings, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 0, title: 'Welcome', icon: '👋', label: 'Profile Setup' },
  { id: 1, title: 'Choose Product', icon: '📦', label: 'Select Product' },
  { id: 2, title: 'Configure Settings', icon: '⚙️', label: 'Settings' },
  { id: 3, title: 'Import Data', icon: '📥', label: 'Data Import' },
  { id: 4, title: 'Get Started', icon: '🚀', label: 'Complete' }
];

const PRODUCTS = [
  { id: 'case-tracker', name: 'Case Tracker Pro', emoji: '📋', desc: 'Case management for solicitors' },
  { id: 'base44-ai', name: 'Base44 AI', emoji: '🧠', desc: 'AI legal automation' },
  { id: 'case-narrative', name: 'CaseNarrative', emoji: '📖', desc: 'Litigation brief generation' },
  { id: 'premiso', name: 'Premiso', emoji: '🏠', desc: 'Conveyancing automation' },
  { id: 'charity-hub', name: 'CharityHub', emoji: '❤️', desc: 'Charity governance' },
  { id: 'species-explorer', name: 'Species Explorer', emoji: '🦁', desc: 'Conservation research' }
];

export default function OnboardingSetupWizard({ userId, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization_name: '',
    selected_product: null,
    email_notifications: true,
    auto_backup: true,
    data_file: null,
    team_size: ''
  });
  const [completedSteps, setCompletedSteps] = useState([]);

  const progressPercent = (completedSteps.length / STEPS.length) * 100;

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 0 && !formData.organization_name) {
      toast.error('Please enter your organization name');
      return;
    }
    if (currentStep === 1 && !formData.selected_product) {
      toast.error('Please select a product');
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Validate data
      if (!formData.organization_name?.trim()) {
        throw new Error('Organization name is required');
      }
      if (!formData.selected_product) {
        throw new Error('Product selection is required');
      }

      const user = await base44.auth.me();
      if (!user) {
        throw new Error('User session lost. Please refresh and try again.');
      }

      // Fetch existing progress with error handling
      const existingProgress = await base44.entities.OnboardingProgress.filter({
        user_email: user.email
      }).catch(() => []);

      const progressData = {
        user_email: user.email,
        organization_name: formData.organization_name.trim(),
        product_selected: true,
        profile_completed: true,
        customized: formData.email_notifications && formData.auto_backup,
        onboarding_completed: true,
        completion_percentage: 100,
        onboarding_completed_date: new Date().toISOString()
      };

      // Save with retry logic
      let saved = false;
      if (existingProgress?.length > 0) {
        try {
          await base44.entities.OnboardingProgress.update(existingProgress[0].id, progressData);
          saved = true;
        } catch (updateError) {
          console.warn('Update failed, attempting create:', updateError);
          await base44.entities.OnboardingProgress.create(progressData);
          saved = true;
        }
      } else {
        await base44.entities.OnboardingProgress.create(progressData);
        saved = true;
      }

      if (!saved) {
        throw new Error('Failed to save onboarding data');
      }

      toast.success('Welcome! Your account is ready to go.');
      onComplete?.();
    } catch (e) {
      console.error('Onboarding completion error:', e);
      const message = e.message || 'Failed to complete setup. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large (max 50MB). Please choose a smaller file.');
      return;
    }

    // Validate file type
    const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|json|xlsx|xls)$/i)) {
      toast.error('Invalid file type. Please upload CSV, JSON, or Excel files only.');
      return;
    }

    setFormData({ ...formData, data_file: file });
    toast.success(`File ready to import: ${file.name}`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome to SynergyFlow!</h3>
              <p className="text-slate-600">Let's get you set up in 5 minutes or less.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name *</label>
                <Input
                  placeholder="Your company or practice name"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  className="h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Team Size</label>
                <select
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Select...</option>
                  <option value="solo">Solo (just me)</option>
                  <option value="small">Small (2-10 people)</option>
                  <option value="medium">Medium (10-50 people)</option>
                  <option value="large">Large (50+ people)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Product</h3>
              <p className="text-slate-600">Start with one or add more later.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRODUCTS.map((prod) => (
                <Card
                  key={prod.id}
                  onClick={() => setFormData({ ...formData, selected_product: prod.id })}
                  className={`cursor-pointer transition ${
                    formData.selected_product === prod.id
                      ? 'ring-2 ring-slate-900 bg-slate-50'
                      : 'hover:border-slate-400'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="text-3xl mb-2">{prod.emoji}</div>
                    <h4 className="font-semibold text-slate-900">{prod.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{prod.desc}</p>
                    {formData.selected_product === prod.id && (
                      <Badge className="mt-3 bg-slate-900 text-white">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Configure Settings</h3>
              <p className="text-slate-600">Customize your experience.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Checkbox
                  id="notifications"
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, email_notifications: checked })
                  }
                />
                <label htmlFor="notifications" className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">Email Notifications</div>
                  <p className="text-sm text-slate-600">Get updates on important events</p>
                </label>
              </div>
              <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Checkbox
                  id="backup"
                  checked={formData.auto_backup}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_backup: checked })
                  }
                />
                <label htmlFor="backup" className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">Automatic Backups</div>
                  <p className="text-sm text-slate-600">Daily backups of your data</p>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Import Existing Data</h3>
              <p className="text-slate-600">Optional: Upload data from your previous system.</p>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <div className="mb-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.json"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild className="cursor-pointer">
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
              <p className="text-sm text-slate-500">CSV, XLSX, or JSON files supported</p>
              {formData.data_file && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ {formData.data_file.name} ready to import
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 text-center">You can always import data later</p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">You're All Set!</h3>
              <p className="text-slate-600">Your account is ready. Let's start using SynergyFlow.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-900">Profile created</div>
                  <p className="text-sm text-slate-600">{formData.organization_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-900">Product selected</div>
                  <p className="text-sm text-slate-600">
                    {PRODUCTS.find((p) => p.id === formData.selected_product)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-900">Ready to go</div>
                  <p className="text-sm text-slate-600">Start using your new product</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {STEPS[currentStep].title}
            </h2>
            <span className="text-sm text-slate-600">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex gap-2 justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    idx < currentStep
                      ? 'bg-green-600 text-white'
                      : idx === currentStep
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {idx < currentStep ? '✓' : idx === currentStep ? step.id + 1 : step.id + 1}
                </div>
                <span className="text-xs text-slate-600 text-center">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-8 flex-1 overflow-y-auto">
          {renderStepContent()}
        </CardContent>

        {/* Footer */}
        <div className="bg-slate-50 border-t px-8 py-6 flex gap-3 justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for now
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 gap-2"
            >
              {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Next'}
              {currentStep < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}