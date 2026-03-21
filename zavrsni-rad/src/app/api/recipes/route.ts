import { NextRequest, NextResponse } from "next/server";
import { recipeSchema } from "../../../../validationSchema/recipeSchema";
import prisma from "../../../../prisma/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = recipeSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.issues },
      { status: 400 },
    );
  }

  const newRecipe = await prisma.recipe.create({
    data: {
      title: body.title,
      description: body.description,
      image: body.image,
      difficulty: body.difficulty,
      cooking_time: body.cooking_time,
      servings: body.servings,
      category: body.category,
      authorId: Number(body.authorId),
      ingredients: {
        create: body.ingredients,
      },

      steps: {
        create: body.steps,
      },
    },
    include: {
      ingredients: true,
      steps: true,
    },
  });

  return NextResponse.json(newRecipe, { status: 201 });
}
