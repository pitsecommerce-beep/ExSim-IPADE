import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import type { WorldData } from "@/lib/storage/types";

export async function GET() {
  const storage = getStorage();
  const worlds = await storage.listWorlds();
  return NextResponse.json(worlds);
}

export async function POST(request: Request) {
  const body = await request.json() as Partial<WorldData>;
  const storage = getStorage();

  const world: WorldData = {
    id: body.id ?? crypto.randomUUID(),
    name: body.name ?? "Mundo sin nombre",
    currentPeriod: body.currentPeriod ?? 7,
    empresas: body.empresas ?? [],
    zonas: body.zonas ?? [],
    config: body.config ?? {
      kappaPrecioAlto: 0.20,
      kappaPrecioBajo: 0.15,
      canalAlfa: 1,
      canalKappa: 2,
      valorInicialDimension: 0.2,
    },
    periodos: body.periodos ?? [],
  };

  await storage.saveWorld(world);
  return NextResponse.json(world, { status: 201 });
}
