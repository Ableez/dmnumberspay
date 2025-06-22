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

const westAfricanCountries: Country[] = [
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Ivory Coast", code: "CI", dialCode: "+225", flag: "🇨🇮" },
  { name: "Burkina Faso", code: "BF", dialCode: "+226", flag: "🇧🇫" },
  { name: "Togo", code: "TG", dialCode: "+228", flag: "🇹🇬" },
  { name: "Benin", code: "BJ", dialCode: "+229", flag: "🇧🇯" },
];

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, pending] = useActionState(signup, undefined);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    westAfricanCountries[0]!,
  );

  const handleCountrySelect = (countryCode: string) => {
    const country = westAfricanCountries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action={action}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-6">
            <a
              href="#"
              className="flex flex-col items-center gap-6 font-medium"
            >
              <Logo />
              <span className="sr-only">Numberspay.</span>
            </a>
            <h1 className="text-4xl font-bold">Create account</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  required
                  aria-invalid={!!state?.errors?.firstName}
                />
                {state?.errors?.firstName && (
                  <p className="text-xs text-red-500">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  aria-invalid={!!state?.errors?.lastName}
                />
                {state?.errors?.lastName && (
                  <p className="text-xs text-red-500">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>
            </div>
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
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  className="rounded-l-none"
                  required
                  aria-invalid={!!state?.errors?.phoneNumber}
                />
              </div>
              {state?.errors?.phoneNumber && (
                <p className="text-xs text-red-500">
                  {state.errors.phoneNumber[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                aria-invalid={!!state?.errors?.email}
              />
              {state?.errors?.email && (
                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                required
                aria-invalid={!!state?.errors?.username}
              />
              {state?.errors?.username && (
                <p className="text-xs text-red-500">
                  {state.errors.username[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                required
                aria-invalid={!!state?.errors?.password}
              />
              {state?.errors?.password && (
                <div className="text-xs text-red-500">
                  <p>Password must:</p>
                  <ul className="mt-1 list-inside list-disc">
                    {state.errors.password.map((error) => (
                      <li key={error}>- {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
