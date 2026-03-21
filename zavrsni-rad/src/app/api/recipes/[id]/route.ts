import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
import path from "path";
import fs from "fs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID missing" }, { status: 400 });
  }

  const recipeId = parseInt(id);
  if (isNaN(recipeId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();

  try {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    if (
      body.image &&
      existingRecipe.image &&
      body.image !== existingRecipe.image
    ) {
      const oldPath = path.join(process.cwd(), "public", existingRecipe.image);

      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.error("Greška pri brisanju stare slike:", err);
      }
    }
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        difficulty: body.difficulty,
        cooking_time: body.cooking_time,
        servings: body.servings,
        category: body.category,
        authorId: body.authorId,

        ingredients: {
          deleteMany: {},
          create: body.ingredients,
        },

        steps: {
          deleteMany: {},
          create: body.steps,
        },
      },
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID missing" }, { status: 400 });
  }

  const recipeId = parseInt(id);
  if (isNaN(recipeId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.image) {
      const oldPath = path.join(process.cwd(), "public", existingRecipe.image);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.error("Greška pri brisanju slike:", err);
      }
    }
    // ako napravim prisma migrate dev onCascade mogu obrisat ovi dio i ostavit samo prisma.recipe.delete do tad tribam sve pojedinacno imenovat!
    await prisma.ingredient.deleteMany({ where: { recipeId } });
    await prisma.step.deleteMany({ where: { recipeId } });
    await prisma.comment.deleteMany({ where: { recipeId } });
    await prisma.rating.deleteMany({ where: { recipeId } });
    await prisma.favorite.deleteMany({ where: { recipeId } });

    await prisma.recipe.delete({ where: { id: recipeId } });

    return NextResponse.json({ message: "Recipe deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" + error },
      { status: 500 },
    );
  }
}
