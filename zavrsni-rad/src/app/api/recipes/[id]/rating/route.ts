import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import prisma from "../../../../../../prisma/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;

  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipeId = Number(id);
  const { value } = await req.json();

  if (value < 1 || value > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: {
      userId_recipeId: {
        userId: Number(session.user.id),
        recipeId,
      },
    },
    update: {
      value,
    },
    create: {
      userId: Number(session.user.id),
      recipeId,
      value,
    },
  });

  return NextResponse.json(rating);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ value: 0 });
  }

  const recipeId = Number(id);

  const rating = await prisma.rating.findUnique({
    where: {
      userId_recipeId: {
        userId: Number(session.user.id),
        recipeId,
      },
    },
  });

  return NextResponse.json({
    value: rating?.value ?? 0,
  });
}
