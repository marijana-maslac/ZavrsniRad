import NextAuth from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";

const handeler = NextAuth(options);

export { handeler as GET, handeler as POST };
