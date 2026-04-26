import { NextResponse } from "next/server";
import { getSections } from "@/lib/sections";

export async function GET() {
  const map = await getSections();
  return NextResponse.json(map);
}
