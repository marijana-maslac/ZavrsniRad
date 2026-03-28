import prisma from "../../../../prisma/db";
import RecipeDetails from "./recipeDetails";

interface Params {
  params: Promise<{ id?: string }>;
}

const RecipePage = async ({ params }: Params) => {
  const { id } = await params;

  if (!id) {
    return <p>Recept nije pronađen.</p>;
  }

  const recipeId = parseInt(id);
  if (isNaN(recipeId)) {
    return <p>Nevažeći ID recepta.</p>;
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      author: true,
      ingredients: true,
      steps: true,
      categories: true,
    },
  });

  if (!recipe) {
    return <p>Recept nije pronađen.</p>;
  }

  return <RecipeDetails recipe={recipe} />;
};

export default RecipePage;
