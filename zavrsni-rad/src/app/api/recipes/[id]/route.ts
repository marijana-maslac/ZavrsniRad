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
      include: { steps: true },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    function deleteImage(imagePath: string) {
      const fullPath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const incomingIds = body.steps.map((s: any) => s.id).filter(Boolean);

    for (const step of existingRecipe.steps) {
      if (!incomingIds.includes(step.id)) {
        if (step.image) deleteImage(step.image);

        await prisma.step.delete({
          where: { id: step.id },
        });
      }
    }

    for (const step of body.steps) {
      if (step.id) {
        const existingStep = existingRecipe.steps.find(
          (s: any) => s.id === step.id,
        );

        if (step.image === null && existingStep?.image) {
          deleteImage(existingStep.image);
        }

        if (
          step.image &&
          existingStep?.image &&
          step.image !== existingStep.image
        ) {
          deleteImage(existingStep.image);
        }

        await prisma.step.update({
          where: { id: step.id },
          data: {
            description: step.description,
            step_order: step.step_order,
            image: step.image,
          },
        });
      } else {
        await prisma.step.create({
          data: {
            recipeId,
            description: step.description,
            step_order: step.step_order,
            image: step.image,
          },
        });
      }
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
        authorId: body.authorId,

        categories: {
          set: (body.categories ?? []).map((id: number) => ({ id })),
        },

        ingredients: {
          deleteMany: {},
          create: body.ingredients,
        },
      },
      include: {
        categories: true,
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
