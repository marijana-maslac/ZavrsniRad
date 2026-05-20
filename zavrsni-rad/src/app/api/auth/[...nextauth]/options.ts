import { NextAuthOptions } from "next-auth";
import prisma from "../../../../../prisma/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const options: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      id: "password",
      name: "Email and password",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Email address",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials!.email },
        });
        if (!user) {
          return null;
        }
        const match = await bcrypt.compare(
          credentials!.password,
          user.password,
        );
        if (match) {
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id as number;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || "USER";
        session.user.id = token.id as number;
      }
      return session;
    },
  },
};

export default options;
