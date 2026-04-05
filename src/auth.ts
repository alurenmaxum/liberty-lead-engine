import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.AUTH_ADMIN_EMAIL;
        const adminHash = process.env.AUTH_ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) return null;
        if (credentials?.email !== adminEmail) return null;
        const valid = await bcrypt.compare(
          String(credentials.password),
          adminHash
        );
        if (!valid) return null;
        return { id: "1", email: adminEmail };
      },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" },
});
