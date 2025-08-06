import { Button } from "#/components/ui/button";
import { Loader2 } from "lucide-react";
import { memo } from "react";

type LoginWalletProps = {
  isLoading: boolean;
  isRedirecting: boolean;
  disabled: boolean;
};
export function LoginWalletButton({
  isLoading,
  isRedirecting,
  disabled,
  text = "Sign in",
}: {
  isLoading: boolean;
  isRedirecting: boolean;
  disabled: boolean;
  text?: string;
}) {
  return (
    <Button className="relative w-full" type="submit" variant={"ghost"}>
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="loading loading-spinner loading-sm"></span>
        </span>
      ) : isRedirecting ? (
        <span className="flex items-center justify-center">
          <span className="loading loading-dots loading-sm"></span>
        </span>
      ) : (
        "I already have a wallet"
      )}
    </Button>
  );
}
