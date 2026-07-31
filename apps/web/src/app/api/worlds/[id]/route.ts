import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const storage = getStorage();
  const world = await storage.getWorld(id);

  if (!world) {
    return NextResponse.json({ error: "Mundo no encontrado" }, { status: 404 });
  }

  return NextResponse.json(world);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const storage = getStorage();
  await storage.deleteWorld(id);
  return NextResponse.json({ ok: true });
}
