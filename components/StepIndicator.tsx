"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  animatingStep?: number | null;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  animatingStep = null,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
              index + 1 === currentStep
                ? "bg-primary text-white"
                : index + 1 < currentStep
                ? "bg-green-500 text-white"
                : "bg-box text-foreground"
            } ${
              animatingStep === index + 1
                ? "scale-110 animate-pulse"
                : "scale-100"
            }`}
          >
            {index + 1 < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-8 h-0.5 mx-2 transition-all duration-200 ${
                index + 1 < currentStep ? "bg-green-500" : "bg-box"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
