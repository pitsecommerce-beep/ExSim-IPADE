export const EMPRESAS = ["ECO-KLIN","DUSTBUSTERS","APEX","COCALLA","TEKANI"] as const;
export const ZONAS = ["Centro","Oeste","Norte","Este","Sur"] as const;

export const FASE = { Centro:"growth", Oeste:"growth", Norte:"growth",
                      Este:"rollout", Sur:"rollout" } as const;

export const DISTRIBUIDORES = { Centro:10, Oeste:10, Norte:8, Este:7, Sur:7 } as const;

export const PRECIO = {
  Centro:[77,75,75,79,80], Oeste:[77,75,76,79,78], Norte:[105,100,99,105,105],
  Este:[129,140,120,130,140], Sur:[0,100,90,0,83],
} as const;

export const VENDEDORES = {
  Centro:[17,22,17,26,18], Oeste:[18,16,13,23,13], Norte:[17,13,14,25,17],
  Este:[12,11,3,17,10], Sur:[0,10,6,0,10],
} as const;

export const SPOTS_TV        = [35,10,20,50,70] as const;
export const ENFOQUE_MARCA_TV = [0.80,0.50,0.70,0.70,0.90] as const;

export const SPOTS_RADIO = {
  Centro:[20,60,20,45,0], Oeste:[22,50,20,35,0], Norte:[15,50,10,35,0],
  Este:[20,65,10,0,100], Sur:[0,65,10,0,150],
} as const;
export const ENFOQUE_MARCA_RADIO = {
  Centro:[0.85,0.70,0.70,0.70,0], Oeste:[0.85,0.70,0.70,0.70,0],
  Norte:[0.90,0.70,0.50,0.70,0], Este:[0.60,0.70,0.30,0,0.50],
  Sur:[0,0.70,0.30,0,0.50],
} as const;

export const CONOCIMIENTO = {
  Centro:{ alto:[54.63,33.38,45.09,63.22,55.25], bajo:[30.25,24.00,26.73,40.07,30.19] },
  Oeste: { alto:[49.98,28.40,40.40,58.29,50.56], bajo:[26.36,19.57,22.79,35.73,26.25] },
  Norte: { alto:[45.22,23.76,35.63,53.65,45.92], bajo:[26.77,20.13,23.18,36.30,26.82] },
  Este:  { alto:[29.36, 9.09,20.02,40.07,32.35], bajo:[13.19, 7.58, 9.69,23.57,18.99] },
  Sur:   { alto:[    0, 9.09,20.02,    0,34.33], bajo:[    0, 7.58, 9.69,    0,22.21] },
} as const;

export const PRODUCTO = {
  growth:   { alto:[42.93,59.97,40.68,58.57,76.06], bajo:[47.69,73.01,41.56,62.42,80.29] },
  rollout:  { alto:[46.53,67.92,48.67,73.83,82.61], bajo:[54.59,80.96,48.02,68.37,85.64] },
} as const;

export const CANTIDAD = {
  Centro:{ alto:2519.8, bajo:5354.6 }, Oeste:{ alto:1260.2, bajo:2677.8 },
  Norte: { alto:1364.6, bajo:2624.6 }, Este: { alto: 210.0, bajo: 629.8 },
  Sur:   { alto: 314.8, bajo: 325.6 },
} as const;

export const LIMITE_PRECIO = {
  Centro:{ alto:111.85, bajo:91.25 }, Oeste:{ alto:112.42, bajo:91.82 },
  Norte: { alto:141.68, bajo:121.08 }, Este:{ alto:178.19, bajo:157.59 },
  Sur:   { alto:163.41, bajo:142.81 },
} as const;

export const CUOTA_PREVIA = { Centro:0.20, Oeste:0.20, Norte:0.20 } as const;
export const ZONAS_SIN_HISTORIA = ["Este","Sur"] as const;

export const CUOTA_ASIGNADA_REAL = {
  Centro:{ alto:[18.16,17.87,16.90,22.19,24.88], bajo:[19.05,21.14,18.97,21.59,19.26] },
  Oeste: { alto:[18.22,17.39,16.54,22.36,25.49], bajo:[19.08,20.31,17.77,21.85,20.99] },
  Norte: { alto:[17.90,17.05,16.89,22.60,25.56], bajo:[17.57,20.47,19.39,21.98,20.59] },
  Este:  { alto:[15.57, 8.58,10.85,34.98,30.02], bajo:[19.61,11.66,13.28,33.24,22.20] },
  Sur:   { alto:[    0,13.93,18.10,    0,67.96], bajo:[    0,16.70,17.76,    0,65.54] },
} as const;

export const KAPPA_PRECIO = { alto:0.20, bajo:0.15 } as const;
export const CANAL = { alfa:1.0, kappa:2.0 } as const;
export const EXPONENTE_PRESUPUESTO = 15;

export const LOYALTY = {
  rollout:{ alto:0.25, bajo:0.25 }, growth:{ alto:0.50, bajo:0.25 },
  maturity:{ alto:0.55, bajo:0.30 }, hypermaturity:{ alto:0.40, bajo:0.20 },
} as const;

export const EXPONENTES = {
  growth:   { alto:{ precio:0.268, publicidad:0.895, producto:1.266, canal:0.225,
                     presupuesto:1.0, correccion:1.0 },
              bajo:{ precio:0.511, publicidad:0.760, producto:0.495, canal:0.225,
                     presupuesto:1.0, correccion:1.7 } },
  rollout:  { alto:{ precio:0.173, publicidad:0.866, producto:1.181, canal:0.250,
                     presupuesto:1.0, correccion:1.0 },
              bajo:{ precio:0.404, publicidad:0.684, producto:0.595, canal:0.250,
                     presupuesto:1.0, correccion:1.7 } },
} as const;
