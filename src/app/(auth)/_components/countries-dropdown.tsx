import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { worldCountries } from "#/lib/CONSTANTS/countries";
import type { Country } from "#/lib/definitions/countries";
import { memo } from "react";

type CountrySelectProps = {
  selectedCountry: Country;
  onSelect: (countryCode: string) => void;
  disabled?: boolean;
};

export const CountrySelect = memo(function CountrySelect({
  selectedCountry,
  onSelect,
  disabled,
}: CountrySelectProps) {
  return (
    <Select
      value={selectedCountry.code}
      onValueChange={onSelect}
      disabled={disabled}
    >
      <SelectTrigger className="w-full rounded-2xl">
        <SelectValue>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.name}</span>
            <span className="text-muted-foreground text-xs">
              {selectedCountry.dialCode}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {worldCountries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{country.flag}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{country.name}</span>
                <span className="text-muted-foreground text-xs">
                  {country.dialCode}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});