import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { join } from "path";
import { writeFile } from "fs/promises";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 3MB limit" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WebP, and AVIF are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${uuidv4()}.webp`;
    const filepath = join(process.cwd(), "public", "uploads", filename);
    
    await writeFile(filepath, optimizedBuffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error(JSON.stringify({ route: "/api/admin/upload", method: "POST", error: String(err) }));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}