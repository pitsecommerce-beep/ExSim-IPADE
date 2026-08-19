export interface SalesResult {
  readonly ventas: number;
  readonly ventasPerdidas: number;
}

export function computeSalesForZone(
  segmentDemands: ReadonlyArray<{ segmentKey: string; demandaGenerada: number }>,
  inventarioDisponible: number,
): ReadonlyArray<{ segmentKey: string; ventas: number; ventasPerdidas: number }> {
  const totalDemand = segmentDemands.reduce((s, d) => s + d.demandaGenerada, 0);

  if (totalDemand === 0) {
    return segmentDemands.map((d) => ({
      segmentKey: d.segmentKey,
      ventas: 0,
      ventasPerdidas: 0,
    }));
  }

  let remainingInventory = inventarioDisponible;
  let totalSales = 0;

  for (let q = 0; q < 4; q++) {
    const demandaQuincena = totalDemand / 4;
    const sold = Math.min(demandaQuincena, remainingInventory);
    remainingInventory -= sold;
    totalSales += sold;
  }

  const totalLost = totalDemand - totalSales;

  return segmentDemands.map((d) => {
    const proportion = d.demandaGenerada / totalDemand;
    return {
      segmentKey: d.segmentKey,
      ventas: totalSales * proportion,
      ventasPerdidas: totalLost * proportion,
    };
  });
}
