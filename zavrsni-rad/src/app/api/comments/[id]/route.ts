import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  const { id } = await params;

  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commentId = Number(id);

  if (!id || isNaN(commentId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = comment.userId === Number(session.user.id);
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (comment.image) {
    const filePath = path.join(process.cwd(), "public", comment.image);
    fs.unlink(filePath, (err) => {
      if (err) console.log("File delete error:", err);
    });
  }
  await prisma.comment.delete({
    where: { id: commentId },
  });

  return NextResponse.json({ message: "Deleted" });
}
