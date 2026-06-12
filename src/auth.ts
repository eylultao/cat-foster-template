import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authorizeStaff } from "@/lib/authorize";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
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
