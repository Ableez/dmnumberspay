import { getUser, verifySession } from "#/lib/auth/dal";

export async function GET() {
  const session = await verifySession();
  const userData = await getUser();

  if (!session) {
    return new Response(null, { status: 401 });
  }

  return new Response(JSON.stringify({ user: userData, session: session }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
