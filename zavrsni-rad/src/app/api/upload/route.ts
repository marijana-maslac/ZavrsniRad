import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // ⚠️ Ograničenje veličine na 5 MB
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File is too large. Max size is 5MB." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const dateFolder = new Date().toISOString().split("T")[0];
  const uploadDir = path.join(process.cwd(), "public/uploads", dateFolder);

  await import("fs").then((fs) => fs.mkdirSync(uploadDir, { recursive: true }));

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const publicPath = `/uploads/${dateFolder}/${fileName}`;

  return NextResponse.json({
    message: "Image uploaded successfully",
    filePath: publicPath,
  });
}
