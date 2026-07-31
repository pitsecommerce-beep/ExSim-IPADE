import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { simulateCommercialPeriod } from "@exsim/engine/commercial/simulate";
import type { CommercialInput, EstadoPrevio } from "@exsim/engine/commercial/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const storage = getStorage();
  const world = await storage.getWorld(id);

  if (!world) {
    return NextResponse.json({ error: "Mundo no encontrado" }, { status: 404 });
  }

  const periodoActual = world.periodos.find((p) => p.periodo === world.currentPeriod);
  if (!periodoActual) {
    return NextResponse.json(
      { error: `No hay decisiones capturadas para el periodo ${world.currentPeriod}` },
      { status: 400 },
    );
  }

  const periodoAnterior = world.periodos.find((p) => p.periodo === world.currentPeriod - 1);

  const estadoPrevio: EstadoPrevio | undefined = periodoAnterior
    ? {
        conocimiento: periodoAnterior.conocimiento ?? {},
        cuotaAsignada: periodoAnterior.cuotaAsignada ?? {},
      }
    : undefined;

  const input = buildCommercialInput(world, periodoActual.decisiones);
  const output = simulateCommercialPeriod(input, estadoPrevio);

  periodoActual.resultados = output.resultados;
  periodoActual.conocimiento = output.conocimientoNuevo;
  periodoActual.cuotaAsignada = output.cuotaAsignadaNueva;
  world.currentPeriod += 1;

  await storage.saveWorld(world);

  return NextResponse.json({
    periodo: periodoActual.periodo,
    resultados: output.resultados,
    siguientePeriodo: world.currentPeriod,
  });
}

function buildCommercialInput(
  world: import("@/lib/storage/types").WorldData,
  decisiones: import("@/lib/storage/types").DecisionData[],
): CommercialInput {
  const decisionesPorEmpresa = new Map<string, typeof decisiones>();
  for (const d of decisiones) {
    if (!decisionesPorEmpresa.has(d.empresaId)) {
      decisionesPorEmpresa.set(d.empresaId, []);
    }
    decisionesPorEmpresa.get(d.empresaId)!.push(d);
  }

  const primeraDecision = decisiones[0];
  const spotsTV = primeraDecision?.spotsTV ?? 0;
  const enfoqueMarcaTV = primeraDecision?.enfoqueMarcaTV ?? 0.5;

  return {
    periodo: world.currentPeriod,
    kappaPrecio: {
      alto: world.config.kappaPrecioAlto,
      bajo: world.config.kappaPrecioBajo,
    },
    canalParams: {
      alfa: world.config.canalAlfa,
      kappa: world.config.canalKappa,
    },
    loyalty: {
      rollout: { alto: 0.25, bajo: 0.25 },
      growth: { alto: 0.50, bajo: 0.25 },
      maturity: { alto: 0.60, bajo: 0.40 },
      hypermaturity: { alto: 0.70, bajo: 0.50 },
    },
    pesosSegmento: {
      alto: {
        precio: 0.5, producto: 2.0, canal: 1.0,
        publicidad: 2.0, generico: 1.0, caracteristicasMarca: 1.0,
        correccionUtilidad: 1.0,
      },
      bajo: {
        precio: 2.0, producto: 1.4, canal: 1.0,
        publicidad: 1.8, generico: 1.0, caracteristicasMarca: 1.0,
        correccionUtilidad: 1.7,
      },
    },
    multFase: {
      rollout: { precio: 1.12, producto: 1, canal: 0.25, publicidad: 2.20, generico: 3.00, caracteristicasMarca: 1 },
      growth: { precio: 1.40, producto: 1, canal: 0.225, publicidad: 1.80, generico: 2.00, caracteristicasMarca: 1 },
      maturity: { precio: 1.50, producto: 1, canal: 0.16, publicidad: 1.10, generico: 0.85, caracteristicasMarca: 1 },
      hypermaturity: { precio: 1.80, producto: 1, canal: 0.08, publicidad: 0.70, generico: 0.40, caracteristicasMarca: 1 },
    },
    rotacionAdquisicion: {
      rollout: { rotacion: 0.45, adquisicion: 0.55 },
      growth: { rotacion: 0.30, adquisicion: 0.45 },
      maturity: { rotacion: 0.20, adquisicion: 0.35 },
      hypermaturity: { rotacion: 0.15, adquisicion: 0.30 },
    },
    desiredValues: {
      rollout: {
        alto: { desiredValue: { sostenibilidad: 0.4, conveniencia: 0.4, rendimiento: 0.5, funcionalidadesExtra: 0.4, eficiencia: 0.4 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.8, funcionalidadesExtra: 0.7, eficiencia: 0.5 } },
        bajo: { desiredValue: { sostenibilidad: 0.3, conveniencia: 0.5, rendimiento: 0.3, funcionalidadesExtra: 0.3, eficiencia: 0.6 }, propension: { sostenibilidad: 0.3, conveniencia: 0.8, rendimiento: 0.3, funcionalidadesExtra: 0.3, eficiencia: 0.9 } },
      },
      growth: {
        alto: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.7, funcionalidadesExtra: 0.6, eficiencia: 0.5 }, propension: { sostenibilidad: 0.5, conveniencia: 0.5, rendimiento: 0.8, funcionalidadesExtra: 0.7, eficiencia: 0.5 } },
        bajo: { desiredValue: { sostenibilidad: 0.4, conveniencia: 0.6, rendimiento: 0.4, funcionalidadesExtra: 0.4, eficiencia: 0.7 }, propension: { sostenibilidad: 0.3, conveniencia: 0.8, rendimiento: 0.3, funcionalidadesExtra: 0.3, eficiencia: 0.9 } },
      },
      maturity: {
        alto: { desiredValue: { sostenibilidad: 0.6, conveniencia: 0.6, rendimiento: 0.8, funcionalidadesExtra: 0.7, eficiencia: 0.6 }, propension: { sostenibilidad: 0.6, conveniencia: 0.6, rendimiento: 0.8, funcionalidadesExtra: 0.7, eficiencia: 0.6 } },
        bajo: { desiredValue: { sostenibilidad: 0.5, conveniencia: 0.7, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.8 }, propension: { sostenibilidad: 0.4, conveniencia: 0.8, rendimiento: 0.4, funcionalidadesExtra: 0.4, eficiencia: 0.9 } },
      },
      hypermaturity: {
        alto: { desiredValue: { sostenibilidad: 0.7, conveniencia: 0.7, rendimiento: 0.9, funcionalidadesExtra: 0.8, eficiencia: 0.7 }, propension: { sostenibilidad: 0.7, conveniencia: 0.7, rendimiento: 0.9, funcionalidadesExtra: 0.8, eficiencia: 0.7 } },
        bajo: { desiredValue: { sostenibilidad: 0.6, conveniencia: 0.8, rendimiento: 0.6, funcionalidadesExtra: 0.6, eficiencia: 0.9 }, propension: { sostenibilidad: 0.5, conveniencia: 0.9, rendimiento: 0.5, funcionalidadesExtra: 0.5, eficiencia: 0.9 } },
      },
    },
    valorInicialDimension: world.config.valorInicialDimension,
    improvements: [],
    empresas: world.empresas.map((emp) => {
      const empDecs = decisionesPorEmpresa.get(emp.id) ?? [];
      return {
        empresaId: emp.id,
        nombre: emp.nombre,
        mejorasActivas: empDecs[0]?.mejorasActivas ?? [],
        spotsTV: empDecs[0]?.spotsTV ?? spotsTV,
        enfoqueMarcaTV: empDecs[0]?.enfoqueMarcaTV ?? enfoqueMarcaTV,
        decisiones: world.zonas.map((zona) => {
          const dec = empDecs.find((d) => d.zonaId === zona.id);
          return {
            zonaId: zona.id,
            precio: dec?.precio ?? 0,
            vendedores: dec?.vendedores ?? 0,
            spotsRadio: dec?.spotsRadio ?? 0,
            enfoqueMarcaRadio: dec?.enfoqueMarcaRadio ?? 0.5,
            productoTerminado: dec?.productoTerminado ?? 0,
            previsionDemanda: dec?.previsionDemanda ?? 0,
          };
        }),
      };
    }),
    zonas: world.zonas.map((z) => ({
      zonaId: z.id,
      nombre: z.nombre,
      fase: z.fase,
      distribuidores: z.distribuidores,
      limitePrecio: { alto: z.limitePrecioAlto, bajo: z.limitePrecioBajo },
      demanda: {
        alto: { cantidadPorEmpresa: z.demandaAlto },
        bajo: { cantidadPorEmpresa: z.demandaBajo },
      },
    })),
  };
}
