import { IconLoader2 } from "@tabler/icons-react";
import { Suspense } from "react";
import { LoginForm } from "../_components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div
              className={
                "flex h-[300dvh] w-screen flex-col place-items-center items-center justify-center gap-4 text-center font-bold text-white/50"
              }
            >
              <IconLoader2 className="h-8 w-8 animate-spin text-purple-600" />
              Setting up authentication...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
