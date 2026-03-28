import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../prisma/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID missing" }, { status: 400 });
  }

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.username && body.username !== existingUser.username) {
      const duplicateUsername = await prisma.user.findUnique({
        where: { username: body.username },
      });
      if (duplicateUsername) {
        return NextResponse.json(
          { message: "Username već postoji" },
          { status: 409 },
        );
      }
    }

    if (body.email && body.email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (duplicateEmail) {
        return NextResponse.json(
          { message: "Email već postoji" },
          { status: 409 },
        );
      }
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name ?? existingUser.name,
        username: body.username ?? existingUser.username,
        email: body.email ?? existingUser.email,
        password: body.password ?? existingUser.password,
        role: body.role ?? existingUser.role,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
