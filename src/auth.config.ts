import type { NextAuthConfig } from "next-auth";

// Edge-safe base config: NO database/bcrypt imports, so it can run in middleware
// (Edge runtime). The Credentials provider (which needs Node APIs) is added only
// in src/auth.ts for the Node-side route handler / server components.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    // Gate /admin/* (except the login page) behind a session.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoginPage = pathname === "/admin/login";
      const isAdmin = pathname.startsWith("/admin");
      if (isAdmin && !isLoginPage) return Boolean(auth?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
