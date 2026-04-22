import { NextRequest, NextResponse } from "next/server";
import { recipeSchema } from "../../../../validationSchema/recipeSchema";
import prisma from "../../../../prisma/db";
import options from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json(
      { error: "Korisnik nije prijavljen" },
      { status: 401 },
    );
  }

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
      authorId: Number(session.user.id),
      categories: {
        connect: (body.categories ?? []).map((id: number) => ({ id })),
      },

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
      categories: true,
    },
  });

  return NextResponse.json(newRecipe, { status: 201 });
}
