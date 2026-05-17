import { getServerSession } from "next-auth";
import prisma from "../../../../prisma/db";
import RecipeDetails from "./recipeDetails";
import options from "@/app/api/auth/[...nextauth]/options";

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
  const session = await getServerSession(options);

  let isFavorite = false;

  if (session) {
    const fav = await prisma.favorite.findFirst({
      where: {
        userId: Number(session.user.id),
        recipeId: recipeId,
      },
    });

    isFavorite = !!fav;
  }
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      author: true,
      ingredients: true,
      steps: true,
      categories: true,
      _count: {
        select: {
          favorites: true,
        },
      },
      comments: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!recipe) {
    return <p>Recept nije pronađen.</p>;
  }

  return (
    <RecipeDetails
      recipe={recipe}
      initialIsFavorite={isFavorite}
      session={session}
    />
  );
};

export default RecipePage;
