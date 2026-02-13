import { useState } from 'react';
import { NerdIcon } from '../NerdIcon';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Oh My Posh Configurator 5000! 🎨',
    description: 'This visual tool helps you create and customize your terminal prompt configuration. Let\'s take a quick tour of the features.',
    icon: 'misc-lightbulb',
  },
  {
    title: 'Drag & Drop Segments',
    description: 'Browse segments in the left sidebar and drag them onto your canvas. Each segment represents different information like path, git status, or system info.',
    icon: 'ui-grip-vertical',
  },
  {
    title: 'Customize Properties',
    description: 'Click any segment to edit its properties in the right panel. Change colors, templates, icons, and behavior to match your style.',
    icon: 'ui-palette',
  },
  {
    title: 'Live Preview',
    description: 'The preview panel at the bottom shows how your prompt will look. This is a rough estimate with mock data - actual appearance may vary in your terminal.',
    icon: 'ui-eye',
  },
  {
    title: 'Export Your Config',
    description: 'When you\'re happy with your design, export it as JSON, YAML, or TOML from the bottom bar. Then use it with Oh My Posh in your terminal!',
    icon: 'ui-code',
  },
];

export function OnboardingTutorial() {
  // Check if user has already seen the tutorial on initial render
  const [isVisible, setIsVisible] = useState(() => {
    const tutorialCompleted = localStorage.getItem('onboardingTutorialCompleted');
    return !tutorialCompleted;
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('onboardingTutorialCompleted', 'true');
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) {
    return null;
  }

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#1a1a2e] border border-[#0f3460] rounded-lg shadow-xl max-w-xl w-full p-6 relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Skip tutorial"
        >
          <NerdIcon icon="ui-close" size={20} />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="bg-[#e94560]/20 rounded-full p-3 flex-shrink-0">
            <NerdIcon icon={step.icon} size={32} className="text-[#e94560]" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-3">
              {step.title}
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-[#e94560]'
                  : index < currentStep
                  ? 'w-2 bg-[#e94560]/60'
                  : 'w-2 bg-[#0f3460]'
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <div className="text-center mb-4">
          <span className="text-sm text-gray-400">
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-400 hover:text-gray-200 font-medium transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-[#0f3460] hover:bg-[#1a4a7a] text-gray-200 font-medium rounded transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#e94560] hover:bg-[#d63850] text-white font-medium rounded transition-colors"
            >
              {isLastStep ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
