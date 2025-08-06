"use client";

import { useState, useRef, useEffect } from "react";
import PhoneOTP from "./_screens/phone-otp";
import CreatePin from "./_screens/create-pin";
import SetUsername from "./_screens/set-username";
import { IconChevronLeft, IconInfoCircle } from "@tabler/icons-react";

const STEPS = [
  { id: 0, Component: PhoneOTP },
  { id: 1, Component: CreatePin },
  { id: 2, Component: SetUsername },
];

const OnboardPage = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextStep = () => {
    if (isAnimating || step >= STEPS.length - 1) return;
    setDirection("next");
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prevStep) => Math.min(prevStep + 1, STEPS.length - 1));
    }, 300);
  };

  const prevStep = () => {
    if (isAnimating || step === 0) return;
    setDirection("prev");
    setIsAnimating(true);
    setTimeout(() => {
      setStep((prevStep) => Math.max(prevStep - 1, 0));
    }, 300);
  };

  useEffect(() => {
    // Reset animation state after component renders
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [step]);

  const CurrentStepComponent = STEPS[step] ? STEPS[step].Component : null;

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="bg-background/80 sticky top-0 z-10 flex w-full items-center justify-between px-4 py-2 backdrop-blur-sm">
        <button
          className="cursor-pointer rounded-full p-3 hover:bg-neutral-800/60 disabled:opacity-50"
          onClick={prevStep}
          disabled={step === 0 || isAnimating}
        >
          <IconChevronLeft size={24} />
        </button>

        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                i === step ? "w-8 bg-indigo-500" : "w-4 bg-neutral-700"
              }`}
            />
          ))}
        </div>

        <button className="cursor-pointer rounded-full p-3 hover:bg-neutral-800/60">
          <IconInfoCircle size={24} />
        </button>
      </div>

      <div
        ref={containerRef}
        className={`relative transition-all duration-500 ease-in-out ${
          isAnimating
            ? direction === "next"
              ? "-translate-x-[100%]"
              : "translate-x-0"
            : "translate-x-0"
        }`}
      >
        <div
          className={`absolute top-0 left-0 w-full transform transition-all duration-500 ease-in-out ${
            isAnimating && direction === "next"
              ? "translate-x-[100%]"
              : "translate-x-0"
          }`}
        >
          {CurrentStepComponent && <CurrentStepComponent nextStep={nextStep} />}
        </div>
        {isAnimating && direction === "prev" && step < STEPS.length - 1 && (
          <div className="absolute top-0 left-0 w-full translate-x-[-100%] transform transition-all duration-500 ease-in-out">
            {STEPS[step + 1].Component({ nextStep })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardPage;
