export const dynamic = "force-dynamic";
import options from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

const MainNav = async () => {
  const session = await getServerSession(options);
  return (
    <div>
      {session ? (
        <SignOutButton />
      ) : (
        <Link href={"/auth/signin"}>Prijavi se </Link>
      )}
      <Link href={"/"}> Početna </Link>
      <Link href={"/recipes"}>Recepti </Link>

      {session && (
        <>
          <Link href="/favorites">❤️ Omiljeni recepti</Link>
          <Link href="/profile"> Moj profil</Link>
        </>
      )}
      {session?.user.role === "ADMIN" && (
        <Link href="/admin"> Admin panel</Link>
      )}
    </div>
  );
};

export default MainNav;
