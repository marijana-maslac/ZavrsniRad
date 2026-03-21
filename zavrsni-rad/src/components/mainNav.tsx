import Link from "next/link";

const MainNav = () => {
  return (
    <div>
      <Link href={"/"}>Početna </Link>
      <Link href={"/recipes"}>Recepti </Link>
    </div>
  );
};

export default MainNav;
