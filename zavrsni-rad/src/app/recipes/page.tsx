import Link from "next/link";
import prisma from "../../../prisma/db";
import DataTable from "./DataTable";
import { getServerSession } from "next-auth";
import options from "../api/auth/[...nextauth]/options";

const Recipes = async () => {
  const recipes = await prisma.recipe.findMany({
    include: {
      author: true,
      ingredients: true,
      steps: true,
      categories: true,
    },
  });
  const session = await getServerSession(options);

  return (
    <div>
      <br></br>
      {session && <Link href={"/recipes/new"}>Dodaj novi recept</Link>}
      <DataTable recipes={recipes} />
    </div>
  );
};

export default Recipes;
