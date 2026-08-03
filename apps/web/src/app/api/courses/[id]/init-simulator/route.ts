import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getStorage } from "@/lib/storage";
import type { WorldData } from "@/lib/storage/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: courseId } = await params;
  const supabase = await createSupabaseServer();

  const { data: world, error: worldError } = await supabase
    .from("worlds")
    .select("*, teams(id, name, team_members(id, user_id))")
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  if (worldError || !world) {
    return NextResponse.json(
      { error: "Mundo no encontrado para este curso" },
      { status: 404 },
    );
  }

  const profileId = world.profile_id as string;

  const [
    { data: zones },
    { data: _segments },
    { data: demandParams },
    { data: generalParams },
  ] = await Promise.all([
    supabase.from("zones").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("segments").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("demand_params").select("*").eq("profile_id", profileId),
    supabase.from("general_params").select("*").eq("profile_id", profileId).maybeSingle(),
  ]);

  const teams = (world.teams ?? []) as {
    id: string;
    name: string;
    team_members: { id: string; user_id: string }[];
  }[];

  const activeZones = (zones ?? []).filter((z: Record<string, unknown>) => z.active !== false);

  const storage = getStorage();

  const existing = await storage.getWorld(world.id as string);
  if (existing) {
    return NextResponse.json({ worldId: existing.id, alreadyExists: true });
  }

  const params2 = (generalParams ?? {}) as Record<string, unknown>;

  const simWorld: WorldData = {
    id: world.id as string,
    name: world.name as string,
    currentPeriod: (world.current_period as number) ?? 1,
    empresas: teams.map((t) => ({
      id: t.id,
      nombre: t.name,
    })),
    zonas: activeZones.map((z: Record<string, unknown>) => {
      const zoneDemand = (demandParams ?? []).filter(
        (dp: Record<string, unknown>) => dp.zone_id === z.id || dp.zone_id === z.key,
      );
      const altoDP = zoneDemand.find((dp: Record<string, unknown>) => dp.segment_id === "alto") as Record<string, unknown> | undefined;
      const bajoDP = zoneDemand.find((dp: Record<string, unknown>) => dp.segment_id === "bajo") as Record<string, unknown> | undefined;

      return {
        id: (z.key as string) ?? (z.id as string),
        nombre: (z.name as string) ?? (z.key as string),
        fase: mapFase(z),
        distribuidores: (z.distribuidores as number) ?? 10,
        limitePrecioAlto: (altoDP?.limite_precio as number) ?? (z.limite_precio_alto as number) ?? 120,
        limitePrecioBajo: (bajoDP?.limite_precio as number) ?? (z.limite_precio_bajo as number) ?? 100,
        demandaAlto: (altoDP?.demanda_base as number) ?? (z.demanda_alto as number) ?? 500,
        demandaBajo: (bajoDP?.demanda_base as number) ?? (z.demanda_bajo as number) ?? 1000,
      };
    }),
    config: {
      kappaPrecioAlto: (params2.kappa_precio_alto as number) ?? 0.20,
      kappaPrecioBajo: (params2.kappa_precio_bajo as number) ?? 0.15,
      canalAlfa: (params2.canal_alfa as number) ?? 1,
      canalKappa: (params2.canal_kappa as number) ?? 2,
      valorInicialDimension: (params2.valor_inicial_dimension as number) ?? 0.2,
    },
    periodos: [],
  };

  if (simWorld.empresas.length === 0) {
    return NextResponse.json(
      { error: "El mundo no tiene equipos configurados" },
      { status: 400 },
    );
  }

  if (simWorld.zonas.length === 0) {
    simWorld.zonas = [
      { id: "zona1", nombre: "Zona 1", fase: "growth", distribuidores: 10, limitePrecioAlto: 120, limitePrecioBajo: 100, demandaAlto: 500, demandaBajo: 1000 },
    ];
  }

  await storage.saveWorld(simWorld);

  return NextResponse.json({ worldId: simWorld.id });
}

function mapFase(zone: Record<string, unknown>): "rollout" | "growth" | "maturity" | "hypermaturity" {
  const fase = (zone.fase ?? zone.phase ?? zone.fase_ciclo_vida ?? "growth") as string;
  const lower = fase.toLowerCase();
  if (lower.includes("rollout") || lower.includes("lanzamiento")) return "rollout";
  if (lower.includes("hyper") || lower.includes("hiper")) return "hypermaturity";
  if (lower.includes("matur") || lower.includes("madur")) return "maturity";
  return "growth";
}
