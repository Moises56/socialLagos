import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/user.model";
import { authConfig } from "./auth.config";
import { loginSchema } from "@/lib/utils/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectDB();
        const user = await User.findOne({ email }).select("+hashedPassword");

        if (!user || !user.hashedPassword) return null;

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          plan: user.plan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado");
  }
  return session;
}
