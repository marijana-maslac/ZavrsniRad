import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(
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

  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Ime kategorije je obavezno" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (category.name === "RAZNO") {
    return NextResponse.json(
      { error: "Ne možete mijenjati RAZNO kategoriju" },
      { status: 400 },
    );
  }

  const exists = await prisma.category.findFirst({
    where: {
      name: name.trim(),
      NOT: { id: categoryId },
    },
  });

  if (exists) {
    return NextResponse.json(
      { error: "Kategorija već postoji" },
      { status: 400 },
    );
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}

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
