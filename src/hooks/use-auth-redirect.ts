import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthRedirectState = {
  redirectUrl?: string;
  isRedirecting: boolean;
};

export function useAuthRedirect(
  authResult: AuthRedirectState,
  callbackUrl: string | null,
) {
  const router = useRouter();

  useEffect(() => {
    if (authResult.isRedirecting) {
      if (authResult.redirectUrl) {
        router.push(authResult.redirectUrl);
      } else if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
      } else {
        router.push("/");
      }
    }
  }, [authResult, router, callbackUrl]);
}
