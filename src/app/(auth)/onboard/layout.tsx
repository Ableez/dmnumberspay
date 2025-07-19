import type { Doc } from "#/convex/_generated/dataModel";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

const OnboardLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = (await cookies()).get("user_session");
  const userData = cookieStore?.value
    ? (JSON.parse(cookieStore?.value) as Doc<"users">)
    : null;
  console.log("userData", userData);

  if (!userData) {
    return redirect("/sign-in");
  }

  return <div>{children}</div>;
};

export default OnboardLayout;
