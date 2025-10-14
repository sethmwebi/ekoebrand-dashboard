import { redirect } from "react-router";
import { useAuthStore } from "~/store/auth";

// Interface matching the User type in authStore.ts
interface User {
  id: string;
  email: string;
  image: string | null;
  name: string;
  role: string;
}

export const authMiddleware = ({ request }: { request: Request }) => {
  let user: User | null = null;

  // Check if running on the client (window is defined)
  if (typeof window !== "undefined") {
    // Access Zustand store directly
    user = useAuthStore.getState().user;
  } else {
    console.warn("Window is undefined; skipping auth state access.");
  }

  // Get the current pathname from the request
  const pathname = new URL(request.url).pathname;

  // Redirect authenticated users away from /login or /register
  if (user?.id && (pathname === "/login" || pathname === "/register")) {
    throw redirect("/");
  }

  // Redirect to /login if no user or no user ID
  if (!user?.id && pathname !== "/login" && pathname !== "/register") {
    throw redirect("/login");
  }

  return user; // Return the user for use in loaders or components
};
