import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import prisma from "../../../prisma/db";
import UserProfile from "./UserProfile";

export default async function ProfilePage() {
  const session = await getServerSession(options);

  if (!session) {
    return <p>Moraš biti prijavljen.</p>;
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: {
      recipes: true,
    },
  });

  if (!user) return <p>Korisnik ne postoji</p>;

  return <UserProfile user={user} />;
}
