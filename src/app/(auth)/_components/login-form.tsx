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
import { useState } from "react";

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    westAfricanCountries[0]!,
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCountrySelect = (countryCode: string) => {
    const country = westAfricanCountries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-6">
            <a
              href="#"
              className="flex flex-col items-center gap-6 font-medium"
            >
              <Logo />
              <span className="sr-only">Numberspay.</span>
            </a>
            <h1 className="text-4xl font-bold">Welcome back</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
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
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
