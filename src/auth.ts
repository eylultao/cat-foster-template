import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authorizeStaff } from "@/lib/authorize";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "");
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        return authorizeStaff(email, password);
      },
    }),
  ],
});
