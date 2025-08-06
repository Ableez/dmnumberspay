import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { memo } from "react";

type PhoneInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
  disabled?: boolean;
};

export const PhoneInput = memo(function PhoneInput({
  value,
  onChange,
  error,
  disabled,
}: PhoneInputProps) {
  return (
    <div className="space-y-2">
      <Input
        id="phone"
        name="phone"
        type="tel"
        value={value}
        onChange={onChange}
        placeholder="Enter phone number"
        className={cn(
          "w-full",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
        required
        disabled={disabled}
        aria-invalid={!!error}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});
