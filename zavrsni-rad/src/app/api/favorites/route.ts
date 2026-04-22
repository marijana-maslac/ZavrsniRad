import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import options from "../auth/[...nextauth]/options";
import prisma from "../../../../prisma/db";

export async function POST(request: NextRequest) {
  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
  }

  const { recipeId } = await request.json();

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_recipeId: {
        userId: session.user.id,
        recipeId: recipeId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipeId,
        },
      },
    });

    return NextResponse.json({ message: "Uklonjeno iz favorita" });
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      recipeId: recipeId,
    },
  });

  return NextResponse.json({ message: "Dodano u favorite" });
}
