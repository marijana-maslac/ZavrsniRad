import RecipeForm from "@/components/RecipeForm";
import prisma from "../../../../../prisma/db";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecipe({ params }: Props) {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const { id } = await params;
  const recipeId = parseInt(id);

  if (isNaN(recipeId)) return <p>Invalid recipe ID</p>;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true, steps: true, categories: true },
  });

  if (!recipe) return <p>Recipe not found</p>;

  if (
    session.user.role !== "ADMIN" &&
    Number(session.user.id) !== recipe.authorId
  ) {
    return <p>Nemaš dozvolu za uređivanje ovog recepta</p>;
  }

  return <RecipeForm recipe={recipe} />;
}
