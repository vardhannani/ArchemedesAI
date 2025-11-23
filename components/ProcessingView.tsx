import React, { useEffect, useState } from 'react';
import { Loader2, Database, FileText, Cpu, CheckCircle } from 'lucide-react';

interface ProcessingViewProps {
  query: string;
}

const steps = [
  { id: 1, label: "Initializing Archimedes Agent", icon: Cpu, duration: 1500 },
  { id: 2, label: "Querying Global Patent & Journal Databases", icon: Database, duration: 3000 },
  { id: 3, label: "Analyzing Abstracts & Filtering Noise", icon: FileText, duration: 3000 },
  { id: 4, label: "Synthesizing Cross-Referenced Report", icon: Loader2, duration: 2500 },
];

const ProcessingView: React.FC<ProcessingViewProps> = ({ query }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const advanceStep = (index: number) => {
      if (index >= steps.length) return;
      
      timeout = setTimeout(() => {
        setCurrentStep(index + 1);
        advanceStep(index + 1);
      }, steps[index].duration);
    };

    advanceStep(0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-science-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-science-100">
        <h3 className="text-xl font-serif text-science-900 mb-2 text-center">Generating Research Report</h3>
        <p className="text-science-500 text-sm text-center mb-8 truncate px-4 font-mono">"{query}"</p>

        <div className="space-y-6 relative">
          {/* Connecting Line */}
          <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-science-100" style={{ zIndex: 0 }} />

          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            const Icon = isCompleted ? CheckCircle : step.icon;

            return (
              <div key={step.id} className="relative z-10 flex items-center gap-4 transition-all duration-500">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      isActive ? 'bg-white border-science-600 text-science-600 animate-pulse' : 
                      'bg-science-50 border-science-200 text-science-300'}
                  `}
                >
                  <Icon size={isCompleted ? 16 : 14} className={isActive && step.id === 4 ? "animate-spin" : ""} />
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-science-800' : 'text-science-300'}`}>
                    {step.label}
                  </span>
                  {isActive && (
                     <div className="h-1 w-full bg-science-100 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-science-600 animate-progress origin-left" style={{width: '100%', animationDuration: `${step.duration}ms`}}></div>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-science-100 text-center">
            <p className="text-xs text-science-400">
                Large datasets may take up to 2 minutes. You can navigate away; we will email you when complete.
            </p>
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-progress {
          animation-name: progress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default ProcessingView;