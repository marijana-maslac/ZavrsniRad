import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../prisma/db";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth";
import options from "../../auth/[...nextauth]/options";

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
  const session = await getServerSession(options);
  if (!session || Number(session.user.id) !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

export async function DELETE(
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

  const session = await getServerSession(options);

  if (!session || Number(session.user.id) !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const recipes = await prisma.recipe.findMany({
      where: { authorId: userId },
    });

    for (const recipe of recipes) {
      if (recipe.image) {
        const filePath = path.join(process.cwd(), "public", recipe.image);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await prisma.recipe.deleteMany({
      where: { authorId: userId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
