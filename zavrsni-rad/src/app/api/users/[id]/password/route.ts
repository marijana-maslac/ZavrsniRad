import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../../../prisma/db";
import { getServerSession } from "next-auth";
import options from "@/app/api/auth/[...nextauth]/options";
import { changePasswordSchema } from "../../../../../../validationSchema/changePasswordSchema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await getServerSession(options);

  if (!session || Number(session.user.id) !== Number(id)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const validation = changePasswordSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.issues },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Korisnik nije pronađen" },
      { status: 404 },
    );
  }

  const validPassword = await bcrypt.compare(
    body.currentPassword,
    user.password,
  );

  if (!validPassword) {
    return NextResponse.json(
      { message: "Trenutna lozinka nije točna" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(body.newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return NextResponse.json({
    message: "Lozinka uspješno promijenjena",
  });
}
