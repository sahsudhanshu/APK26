import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      points: number;
      phone?: string;
    } & DefaultSession["user"];
  }
}
import Google from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "iit2024081@iiita.ac.in")
  .split(",")
  .map((e) => e.trim());

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email || !email.endsWith("@iiita.ac.in")) {
        return "/?error=InvalidEmail"; // Redirect with query param for client-side toast
      }

      try {
        await dbConnect();

        // Upsert user on first login
        const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";
        await User.findOneAndUpdate(
          { email },
          {
            $setOnInsert: {
              name: user.name || email.split("@")[0],
              image: user.image || "",
              email,
              points: 0,
              role,
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("DB error during signIn (user will still be logged in):", err);
        // Allow login even if DB is temporarily down — user will be created on next session
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email }).lean();
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.role = dbUser.role;
            session.user.points = dbUser.points;
            session.user.phone = dbUser.phone;
            session.user.image = dbUser.image || session.user.image;
          }
        } catch (err) {
          console.error("DB error during session:", err);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
});
