import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;
  const categoryId = Number(id);
  const session = await getServerSession(options);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!id || isNaN(categoryId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const fallback = await prisma.category.findFirst({
    where: { name: "RAZNO" },
  });

  if (!fallback) {
    return NextResponse.json(
      { error: "Fallback category missing" },
      { status: 400 },
    );
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      categories: {
        some: { id: categoryId },
      },
    },
    select: { id: true },
  });

  for (const recipe of recipes) {
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        categories: {
          disconnect: { id: categoryId },
          connect: { id: fallback.id },
        },
      },
    });
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return NextResponse.json({ message: "Deleted" });
}
