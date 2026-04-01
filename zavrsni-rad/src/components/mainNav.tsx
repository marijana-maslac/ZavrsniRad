import options from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Link from "next/link";

const MainNav = async () => {
  const session = await getServerSession(options);
  console.log(session);
  return (
    <div>
      {session ? (
        <Link href={"/api/auth/signout?callbackUrl=/"}>Odjavi se </Link>
      ) : (
        <Link href={"/api/auth/signin"}>Prijavi se </Link>
      )}
      <Link href={"/"}>Početna </Link>
      <Link href={"/recipes"}>Recepti </Link>
    </div>
  );
};

export default MainNav;
