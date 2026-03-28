import Link from "next/link";
import prisma from "../../../prisma/db";
import DataTable from "./DataTable";

const Recipes = async () => {
  const recipes = await prisma.recipe.findMany({
    include: {
      author: true,
      ingredients: true,
      steps: true,
      categories: true,
    },
  });

  return (
    <div>
      <br></br>
      <Link href={"/recipes/new"}>Dodaj novi recept</Link>
      <DataTable recipes={recipes} />
    </div>
  );
};

export default Recipes;
