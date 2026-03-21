import RecipeForm from "@/components/RecipeForm";
import prisma from "../../../../../prisma/db";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecipe({ params }: Props) {
  const { id } = await params;
  const recipeId = parseInt(id);

  if (isNaN(recipeId)) return <p>Invalid recipe ID</p>;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true, steps: true },
  });

  if (!recipe) return <p>Recipe not found</p>;

  return <RecipeForm recipe={recipe} />;
}
