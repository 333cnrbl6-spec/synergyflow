import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 0,
    title: 'Welcome to SynergyFlow',
    description: 'A unified platform with 6 industry-specific SaaS products. Let me show you around.',
    target: 'hero-section',
    position: 'bottom',
    highlight: true
  },
  {
    id: 1,
    title: 'Six Powerful Products',
    description: 'Each product is purpose-built for a specific industry. Case management, AI, litigation, conveyancing, charity governance, and conservation research.',
    target: 'products-section',
    position: 'top',
    highlight: true
  },
  {
    id: 2,
    title: 'Why SynergyFlow Wins',
    description: 'Industry-specific design, scale as you grow, unified data intelligence, and enterprise-grade security.',
    target: 'value-props-section',
    position: 'top',
    highlight: true
  },
  {
    id: 3,
    title: 'Flexible Pricing',
    description: 'Start with Starter (£149), grow to Professional (£449), or go Enterprise (£1,299). Perfect pricing for every size.',
    target: 'pricing-section',
    position: 'top',
    highlight: true
  },
  {
    id: 4,
    title: 'Ready to Start?',
    description: 'Choose a plan and start your free 14-day trial. No credit card required.',
    target: 'final-cta-section',
    position: 'top',
    highlight: true
  }
];

export default function LandingTour({ currentStep, onClose, onNext, onPrev }) {
  const [targetRect, setTargetRect] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isValidStep = step && currentStep >= 0 && currentStep < TOUR_STEPS.length;

  useEffect(() => {
    setIsReady(false);
    if (!isValidStep) {
      setTargetRect(null);
      return;
    }

    // Debounce to avoid excessive DOM queries
    const timeoutId = setTimeout(() => {
      const target = document.getElementById(step.target);
      if (target) {
        try {
          const rect = target.getBoundingClientRect();
          setTargetRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: Math.max(rect.width, 1),
            height: Math.max(rect.height, 1)
          });

          // Smooth scroll with error handling
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setIsReady(true);
        } catch (e) {
          console.warn('Tour scroll error:', e);
          setIsReady(true);
        }
      } else {
        console.warn(`Tour target not found: ${step.target}`);
        setIsReady(true);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [step, isValidStep]);

  if (!isValidStep) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 pointer-events-none transition-opacity" />

      {/* Spotlight - only render if ready and has rect */}
      {targetRect && isReady && (
        <div
          className="fixed z-40 pointer-events-none border-4 border-blue-500 rounded-lg shadow-lg transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 8),
            left: Math.max(0, targetRect.left - 8),
            width: Math.max(targetRect.width + 16, 32),
            height: Math.max(targetRect.height + 16, 32),
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl max-w-sm"
        style={{
          top: targetRect
            ? step.position === 'bottom'
              ? targetRect.top + targetRect.height + 20
              : Math.max(20, targetRect.top - 200)
            : '50%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{step.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 ml-4 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-1 my-4">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full ${
                  idx <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 items-center justify-between">
            <span className="text-xs text-slate-500">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={isFirst}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={isLast ? onClose : onNext}
                className="gap-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLast ? 'Finish Tour' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}