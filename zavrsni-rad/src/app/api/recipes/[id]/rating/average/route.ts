import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../../prisma/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;
  const recipeId = Number(id);

  const result = await prisma.rating.aggregate({
    where: { recipeId },
    _avg: {
      value: true,
    },
    _count: {
      value: true,
    },
  });

  return NextResponse.json({
    average: result._avg.value ?? 0,
    count: result._count.value ?? 0,
  });
}
