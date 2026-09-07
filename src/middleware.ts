import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware runs in the Edge runtime. It imports ONLY authConfig (no DB/bcrypt),
// so no native Node module is pulled into the Edge bundle. The `authorized`
// callback in authConfig allows/denies and redirects to pages.signIn.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
