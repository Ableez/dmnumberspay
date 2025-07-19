import React, { useState, useRef, useEffect } from "react";
import { Button } from "#/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  nextStep: () => void;
};

const CreatePin = ({ nextStep }: Props) => {
  const [pin, setPin] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newPin = [...pin];

    digits.forEach((digit, index) => {
      if (index < 6) {
        newPin[index] = digit;
      }
    });

    setPin(newPin);

    if (digits.length > 0 && digits.length < 6) {
      inputRefs.current[digits.length]?.focus();
    }
  };

  const verifyPin = async () => {
    const enteredPin = pin.join("");
    if (enteredPin.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (enteredPin === "444444") {
      nextStep();
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-white">
      <div className="flex w-full max-w-md flex-col items-center">
        <h1 className="mb-1 text-4xl font-bold">Create PIN</h1>
        <p className="mb-6 text-center text-base text-neutral-400">
          Set a 6-digit PIN to secure your wallet
        </p>

        <div className="mb-6 w-full">
          <div className="flex justify-center gap-2">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) {
                    inputRefs.current[index] = el;
                  }
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="h-14 w-12 rounded-xl bg-white/5 text-center text-2xl font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                maxLength={1}
              />
            ))}
          </div>
          {error && (
            <p className="mt-2 text-center text-sm text-red-500">{error}</p>
          )}
        </div>

        <Button
          onClick={verifyPin}
          className="mb-3 w-full bg-indigo-500 py-3 text-white"
          disabled={isLoading || pin.some((digit) => digit === "")}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            "Confirm PIN"
          )}
        </Button>

        <p className="text-sm text-neutral-400">For testing, use PIN: 444444</p>
      </div>
    </div>
  );
};

export default CreatePin;
