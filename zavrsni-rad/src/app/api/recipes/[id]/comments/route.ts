import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../prisma/db";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;

  const recipeId = Number(id);

  if (!id || isNaN(recipeId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { recipeId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(comments);
}

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

  if (!id || isNaN(recipeId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { content, image } = await req.json();
  if (!content || content.trim() === "") {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json(
      { error: "Comment too long (max 1000 characters)" },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      image,
      recipeId,
      userId: Number(session.user.id),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json(comment);
}
