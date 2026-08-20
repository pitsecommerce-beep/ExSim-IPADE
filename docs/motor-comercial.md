# Motor comercial ExSim-IPADE

Documentacion tecnica del motor comercial implementado en `packages/commercial-engine`.

## Formulas

### 1. Factor Precio (lineal)

```
x = (precio - precioPromedio) / precioPromedio
factorPrecio = 50 * (1 - x / kappaPrecio)
```

- **Archivo**: `src/engine/price.ts`
- **Parametros**: `kappaPrecio` por segmento (Alto: configurable, Bajo: configurable)
- **Proveniencia**: documento de sensibilidades Mezquite v2, seccion 4.1
- **Clamping**: si `clamp_price_factor=true`, resultado en [0, 100]
- **Error max validado**: < 0.01 pp contra referencia

### 2. Factor Presupuesto (decaimiento exponencial)

```
factorPresupuesto = 100 * exp(-a * (precio / limitePrecio)^n)
```

- **Archivo**: `src/engine/budget.ts`
- **Parametros**: `a = 0.7005`, `n = 15` (coeficientes `presupuesto_a`, `presupuesto_n`)
- **Proveniencia**: ajuste por minimos cuadrados contra datos de calibracion
- **Error max validado**: < 0.05 pp contra referencia

### 3. Factor Promocion (Weibull CDF)

```
x = vendedores / (alfa * distribuidores)
factorPromocion = 100 * (1 - exp(-x^kappa))
```

- **Archivo**: `src/engine/promotion.ts`
- **Parametros**: `alfa`, `kappa` del canal (configurables por perfil)
- **Proveniencia**: modelo estandar de saturacion de fuerza de ventas
- **No modificado** en la correccion de formulas

### 4. Factor Publicidad (Weibull reach + peso de mensaje)

```
reach = M * (1 - exp(-(spots / lambda)^k))
pesoMensaje = (1 - fraccionMarca) + theta * fraccionMarca
contribucion = reach * pesoMensaje
conocimiento = (1 - rotacion) * conocimientoAnterior + contribucion
```

- **Archivo**: `src/engine/advertising.ts`
- **Parametros por medio/segmento**: `M`, `lambda`, `k` (calibrados solo para Alto)
- **Parametros globales**: `theta = 0.375` (coeficiente `publicidad_theta`)
- **Parametros por fase**: `rotacion`, definida en PhaseConfig
- **Proveniencia**: documento de sensibilidades Mezquite v2, seccion 4.2
- **Bajo no calibrado**: TV y Radio para segmento Bajo tienen `reach_m=null`, `reach_lambda=null`, `reach_k=null`. El motor salta estos segmentos. Ver S14 en SUPUESTOS.md.
- **Error max validado**: < 0.25 pp (solo Alto)
- **No modificado** en la correccion de formulas

### 5. Factor Producto (producto ponderado de similitudes)

```
nivel_d = beta + (1 - beta) * (sumMejorasActivas / maxMejoras)
credito_d = min(nivel_d / valorDeseado, 1)
factorProducto = 100 * sum(propension_d * credito_d) / sum(propension_d)
```

- **Archivo**: `src/engine/product.ts`
- **Parametros**: `beta = 0.078` (coeficiente `producto_beta`), dimensiones y propensiones por segmento/fase
- **Proveniencia**: ARCHITECTURAL-DECISIONS.md, seccion 4.3
- **Error max validado**: < 4.10 pp (desviacion inherente del modelo con beta=0.078)
- **No modificado** en la correccion de formulas

### 6. Indice Total (Cobb-Douglas modificada)

```
indiceTotalBruto = correccionUtilidad * PI((u_k / 100) ^ exponente_k) * ruido
```

Donde para cada factor k:
- Si `aplicar_mult_seg_fase_k = true`: `exponente_k = escalaGlobal * pesoSegmento * multFase`
- Si `aplicar_mult_seg_fase_k = false`: `exponente_k = escalaGlobal`
- Si `u_k <= 0` y `zero_factor_kills_total = true`: retorna 0
- Si `u_k <= 0` y `zero_factor_kills_total = false`: salta el factor (contribuye 1.0)

- **Archivo**: `src/engine/aggregate.ts`
- **Parametros**: `escalaGlobal = 0.25`, pesos por segmento, multiplicadores por fase
- **Proveniencia**: calibracion conjunta, seccion 5.1 del documento de sensibilidades
- **Cambio aplicado**: flag `zero_factor_kills_total` controla comportamiento de factores en cero

### 7. Indice Final y Cuota

```
indiceFinal = (indiceTotalBruto / promedioIndices) * 100
cuotaBruta = indiceFinal / numEmpresas
cuotaAsignada = loyalty * cuotaAnterior + (1 - loyalty) * cuotaBruta
```

- **Archivo**: `src/engine/share.ts`
- **Parametros**: `loyalty` por segmento y fase
- **Proveniencia**: seccion 5.4 del documento de sensibilidades
- **No modificado** en la correccion de formulas

### 8. Demanda Disponible

```
demandaDisponible = cantidad * (dopaje_base100 / 100) * numEmpresas
```

- **Archivo**: `src/engine/demand.ts`
- **Parametros**: `dopaje_base100 = 105`, `cantidad` por zona/segmento
- **Proveniencia**: parametro del perfil del caso
- **No modificado** en la correccion de formulas

### 9. Ruido

```
ruido = 1 - errorBase/100 + 2 * (errorBase/100) * rng()
```

- **Archivo**: `src/engine/noise.ts`
- **Parametros**: `errorBase = 10` (por fase), semilla determinista (Mulberry32)
- **Rango**: [1 - e, 1 + e] donde e = errorBase/100
- **Flag**: `ruido_activo` habilita/deshabilita

## Tabla de validacion

| Funcion | Formula | Max error | Parametros | Observaciones |
|---|---|---|---|---|
| Precio | Lineal: `50*(1-x/kappa)` | < 0.01 | kappa por segmento | Clamp a [0,100] activo |
| Presupuesto | Exp. decay: `100*exp(-a*(P/L)^n)` | < 0.05 | a=0.7005, n=15 | Sin precio_a/precio_b |
| Promocion | Weibull: `100*(1-exp(-x^k))` | -- | alfa, kappa por canal | No modificado |
| Publicidad | Weibull reach + peso | < 0.25 (Alto) | M, lambda, k por medio | Bajo sin calibrar |
| Producto | Producto ponderado | < 4.10 | beta=0.078 | Desviacion inherente |
| Agregacion | Cobb-Douglas mod. | -- | escala=0.25, pesos | zero-skip, no zero-kill |
| Cuota | Loyalty + raw share | -- | loyalty por fase | No modificado |
| Demanda | Lineal con dopaje | -- | dopaje=105 | No modificado |
| Ruido | Uniforme simetrico | -- | errorBase=10 | Semilla determinista |

## Coeficientes del motor

Los coeficientes se configuran en el array `coefficients` de `CommercialConfig`:

| Clave | Valor | Uso |
|---|---|---|
| `presupuesto_a` | 0.7005 | Parametro `a` del factor presupuesto |
| `presupuesto_n` | 15 | Exponente `n` del factor presupuesto |
| `producto_beta` | 0.078 | Piso del nivel de dimension en producto |
| `publicidad_theta` | 0.375 | Peso del mensaje de marca en publicidad |

Los coeficientes `precio_a` y `precio_b` (logisticos) fueron eliminados. El factor precio ahora usa `kappa_precio` del segmento directamente.

## Flags del motor

| Flag | Valor por defecto | Efecto |
|---|---|---|
| `ruido_activo` | true | Habilita perturbacion aleatoria |
| `clamp_price_factor` | true | Limita factor precio a [0, 100] |
| `zero_factor_kills_total` | false | false = skip (contribuye 1.0), true = anula indice |
| `aplicar_mult_seg_fase_precio` | false | Aplica mult de fase al exponente de precio |
| `aplicar_mult_seg_fase_producto` | false | Aplica mult de fase al exponente de producto |
| `aplicar_mult_seg_fase_publicidad` | true | Aplica mult de fase al exponente de publicidad |
| `aplicar_mult_seg_fase_canales` | true | Aplica mult de fase al exponente de canales |
| `aplicar_mult_seg_fase_presupuesto` | false | Aplica mult de fase al exponente de presupuesto |
| `umbral_activo` | false | Activa umbral de consideracion |
| `actualizacion_instantanea` | true | Usa conocimiento actualizado en el mismo periodo |
