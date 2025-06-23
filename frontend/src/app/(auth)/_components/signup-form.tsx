"use client";

import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import Logo from "#/components/globals/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { signup } from "#/server/actions/auth";
import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";

type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

type FormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  username: string;
};

const westAfricanCountries: Country[] = [
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "🇨🇮" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬" },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯" },
];

const steps = [
  {
    id: 1,
    title: "Personal Information",
    fields: ["firstName", "lastName"] as const,
  },
  {
    id: 2,
    title: "Contact Information",
    fields: ["phoneNumber", "email"] as const,
  },
  {
    id: 3,
    title: "Account Details",
    fields: ["username"] as const,
  },
];

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(signup, undefined);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    username: "",
  });
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    westAfricanCountries[0]!,
  );
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  const handleCountrySelect = (countryCode: string) => {
    const country = westAfricanCountries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 2 && formData.email) {
      // Mock signup when email is provided
      setIsAccountCreated(true);
      setCurrentStep(3);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps.find((step) => step.id === currentStep)!;
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  const renderField = (field: keyof FormData) => {
    const commonProps = {
      id: field,
      name: field,
      value: formData[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleInputChange(field, e.target.value),
      required: true,
      "aria-invalid": !!state?.errors?.[field],
    };

    switch (field) {
      case "firstName":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input {...commonProps} type="text" placeholder="John" />
            {state?.errors?.firstName && (
              <p className="text-xs text-red-500">
                {state.errors.firstName[0]}
              </p>
            )}
          </div>
        );

      case "lastName":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input {...commonProps} type="text" placeholder="Doe" />
            {state?.errors?.lastName && (
              <p className="text-xs text-red-500">{state.errors.lastName[0]}</p>
            )}
          </div>
        );

      case "phoneNumber":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <div className="flex">
              <Select
                value={selectedCountry.code}
                onValueChange={handleCountrySelect}
              >
                <SelectTrigger className="w-[140px] rounded-2xl rounded-r-none border-r-0 border-none">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span className="text-muted-foreground text-xs">
                        {selectedCountry.dialCode}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {westAfricanCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{country.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {country.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {country.dialCode}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                {...commonProps}
                type="tel"
                placeholder="Enter phone number"
                className="rounded-l-none"
              />
            </div>
            {state?.errors?.phoneNumber && (
              <p className="text-xs text-red-500">
                {state.errors.phoneNumber[0]}
              </p>
            )}
          </div>
        );

      case "email":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input {...commonProps} type="email" placeholder="m@example.com" />
            {state?.errors?.email && (
              <p className="text-xs text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
        );

      case "username":
        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input {...commonProps} type="text" placeholder="johndoe" />
            {state?.errors?.username && (
              <p className="text-xs text-red-500">{state.errors.username[0]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Render passkey setup view
  if (isAccountCreated) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-6">
            <a
              href="#"
              className="flex flex-col items-center gap-6 font-medium"
            >
              <Logo />
              <span className="sr-only">Numberspay.</span>
            </a>
            <h1 className="text-4xl font-bold">Set up passkey</h1>
            <p className="text-muted-foreground text-center">
              Secure your account with a passkey for quick and secure sign-ins
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <span className="text-2xl">🔐</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">Passkey Authentication</h3>
                <p className="text-muted-foreground text-sm">
                  Use your device's biometric authentication or PIN
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="flex-1"
              onClick={() => console.log("Setup passkey")}
            >
              Set up passkey
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAccountCreated(false)}
            >
              Skip for now
            </Button>
          </div>
        </div>

        <div className="text-center text-sm">
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-6">
          <a href="#" className="flex flex-col items-center gap-6 font-medium">
            <Logo />
            <span className="sr-only">Numberspay.</span>
          </a>
          <h1 className="text-4xl font-bold">Create account</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-1 w-8 rounded-full",
                    currentStep > step.id ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form action={action}>
        <div className="flex flex-col gap-6">
          {/* Render current step fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            {currentStepData.fields.map((field) => (
              <div
                key={field}
                className={
                  field === "phoneNumber" || field === "email"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {!isLastStep ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={pending}>
                {pending ? "Creating account..." : "Create account"}
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:underline">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
