import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

const prisma = new PrismaClient();

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT session strategy
    maxAge: 60 * 60 * 24, // session expires in 24 hours (in seconds)
  },
  callbacks: {
    async session({ session, token }) {
      // Add the role to the session object
      if (token?.user) {
        session.user.role = token.user.role; // assuming the user object has a `role` property
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Add the role to the JWT token when the user is authenticated
        token.user = { ...user, role: user.role }; // assuming the `user` object has a `role` property
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
