import { redirect } from "react-router";
import { getAuth } from "~/helpers/fetcher";

export async function authClientMiddleware(
  { request }: { request: Request },
  next: () => Promise<unknown>
) {
  const pathname = new URL(request.url).pathname;
  const auth = getAuth();
  const user = auth?.user;

  if (user?.id && (pathname === "/login" || pathname === "/register")) {
    throw redirect("/");
  }

  if (!user?.id && pathname !== "/login" && pathname !== "/register") {
    throw redirect("/login");
  }

  return next();
}
