import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "../../../../validationSchema/userSchema";
import prisma from "../../../../prisma/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(options);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      _count: {
        select: {
          recipes: true,
        },
      },
    },
  });

  return NextResponse.json(users);
}
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = userSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.issues },
      { status: 400 },
    );
  }
  const duplicate = await prisma.user.findFirst({
    where: { OR: [{ username: body.username }, { email: body.email }] },
  });

  if (duplicate) {
    if (duplicate.username === body.username) {
      return NextResponse.json(
        { message: "Username već postoji" },
        { status: 409 },
      );
    }

    if (duplicate.email === body.email) {
      return NextResponse.json(
        { message: "Email već postoji" },
        { status: 409 },
      );
    }
  }

  const hashPassword = await bcrypt.hash(body.password, 10);
  body.password = hashPassword;

  const newUser = await prisma.user.create({
    data: { ...body },
  });

  return NextResponse.json(newUser, { status: 201 });
}
