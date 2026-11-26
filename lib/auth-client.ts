import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return apiUrl.replace(/\/api$/, "");
  }
  return (
    process.env.API_INTERNAL_URL?.replace(/\/api$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:5000"
  );
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
