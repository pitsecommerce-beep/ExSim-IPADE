# Decisiones Arquitectonicas - Resoluciones Logicas

Cada pregunta abierta del brief se resuelve aqui con evidencia del caso (P 24 C 02/B),
la nota docente, las capturas de la plataforma de referencia, y logica de dominio.

---

## 1. Como avanza una zona de fase del ciclo de vida

**Decision: Por periodo, configurado por zona en el perfil.**

**Evidencia:**
- El profesor disena la `demand_curve` a mano por periodo x zona x segmento (captura de Comercial).
- Las fases afectan los pesos del modelo (w_precio, w_publicidad, etc.) que cambian la dinamica competitiva.
- Si las fases avanzaran por penetracion (dinamicamente), el profesor no podria pre-disenar la curva de demanda de forma coherente con los pesos — la curva asume un contexto de fase.
- La nota docente dice "8 periodos por defecto" y describe patrones predecibles por periodo (P1: varianza amplia, P2: inflexion, P4: spread 3-4x). Esto solo es posible si el profesor controla exactamente cuando cambia cada fase.
- El caso base tiene 3 zonas en Growth (Centro/Occidente/Norte llevan 2 anos), y 2 sin explorar (Oriente/Sur empezarian en Roll-out al entrar).

**Implementacion:**
```
zone_phase_schedule(
  profile_id, zone_id, phase_id,
  period_from INT,  -- periodo desde el cual aplica esta fase
  period_to INT     -- periodo hasta el cual aplica (NULL = hasta el final)
)
```
El profesor configura para cada zona en que periodo transiciona. Ejemplo caso base:
- Centro: Roll-out P1-2, Growth P3-6, Maturity P7-12
- Oriente: Roll-out desde que una empresa entre (configurable), Growth +3 periodos despues

Para zonas nuevas (Oriente/Sur), la fase puede arrancar automaticamente cuando la primera empresa pone precio > 0, o en un periodo fijo. Ambas opciones con un toggle:
`zone_phase_trigger: 'fixed_period' | 'first_entry'`.

---

## 2. Formas funcionales del modelo de demanda

### f_precio — Modelo Lineal

**Evidencia:**
- La captura dice literalmente `modelo_precio = 'LINEAL'`.
- `kappa_precio` = 0.2 (Alto) / 0.15 (Bajo).
- `tipo_precio = 'AVG_MENOS_STDDEV'` — el precio de referencia se calcula como Avg - StdDev.
- El caso dice: "el segmento alto suele ser menos sensible al precio" — coherente con que w_precio(Alto)=0.5 vs w_precio(Bajo)=2.0 en las capturas. La sensibilidad se controla por el PESO, no por kappa.
- `limite_precio` existe y decrece ~0.36/periodo — un techo absoluto.

**Forma funcional:**
```
precio_ref = avg(precios_mercado) - stddev(precios_mercado)
f_precio(i) = max(epsilon, 1 + kappa * (precio_ref - precio_i) / precio_ref)
```

Logica: si tu precio = referencia, f_precio = 1. Si tu precio < referencia, f_precio > 1 (eres mas atractivo). Si > referencia, f_precio < 1. Kappa controla cuanto cambia por unidad de desviacion porcentual. El epsilon (0.01) evita negativos.

Si `precio_i > limite_precio`: f_precio = 0 (los distribuidores suspenden pedidos, como dice el caso).

Los pesos w_precio por segmento (0.5 Alto, 2.0 Bajo) amplifican: `f_precio ^ (w_seg * w_fase)`.

### f_canal — Esfuerzo relativo con rendimientos decrecientes

**Evidencia:**
- El caso: "El tamano de la fuerza de ventas que comprometas, en comparacion con la de tus competidores, influira en el esfuerzo de tu distribuidor."
- Tipo `salespeople`: el esfuerzo se mide en personas.
- Parametros: alfa (rendimiento decreciente) y kappa (escala).
- La nota docente: "asignacion de fuerza de ventas y publicidad interactuan con las decisiones de los competidores."

**Forma funcional:**
```
esfuerzo_i = vendedores_i (para tipo salespeople) o inversion_i (para tipo monetary)
f_canal(i) = kappa * (esfuerzo_i ^ alfa)
```

Con alfa < 1 (rendimientos decrecientes) y kappa como factor de escala. Esto produce que duplicar vendedores no duplica atractivo — coherente con el caso que dice "es posible que los distribuidores no requieran tanta supervision" cuando ya estas bien posicionado.

No hacemos share-of-effort aqui porque la utilidad ya se normaliza via cuota: `Cuota(i) = U(i) / sum(U(j))`.

### f_producto — Distancia al ideal ponderada por dimension

**Evidencia:**
- 5 dimensiones: Sostenibilidad, Conveniencia, Rendimiento, Funcionalidades, Eficiencia.
- Cada segmento tiene `desired_value` y `propension` por dimension y por fase.
- El caso: "los diferentes segmentos del mercado podrian dar mas importancia a unas dimensiones que a otras y estas preferencias podrian evolucionar en el tiempo."
- Valor inicial = 0.2 para todas las dimensiones. Las mejoras de I+D suman deltas.

**Forma funcional:**
```
Para cada dimension d:
  ofrecido_d = valor_inicial + sum(deltas de mejoras activas para d)
  ofrecido_d = clamp(ofrecido_d, valor_min, valor_max)
  similitud_d = 1 - |ofrecido_d - desired_value[seg,fase,d]|

f_producto = product(similitud_d ^ propension[seg,fase,d]) para d = 1..D
```

La propension actua como peso exponencial: propension alta (0.9) amplifica la importancia de esa dimension para ese segmento. Propension baja (0.3) la atenua.

Esto produce comportamientos reales: el segmento Bajo con propension 0.9 a Eficiencia y desired_value 0.7 penaliza fuertemente a empresas que ignoren esa dimension.

### Curva de saturacion de medios

**Evidencia:**
- Parametros: `lambda`, `k`, `qlim_max`, `m_inf`, `m_sup`, `forma`, `valor_min`.
- TV: limite 20 spots, coste $3,000/spot = saturacion rapida y cara.
- Radio: limite 200 spots, coste $300/spot = saturacion lenta y barata.
- El caso: "efecto por saturacion de informacion si la publicidad resulta excesiva, por lo que podrias observar un retorno decreciente."
- `max_alcanzable`: TV llega al 80% del Alto, 50% del Bajo. Radio 90% Bajo, 80% Alto.

**Forma funcional (Hill function):**
```
Si forma = 'hill' (default):
  saturacion(spots) = valor_min + (qlim_max - valor_min) * spots^k / (spots^k + lambda^k)
  resultado = clamp(saturacion, m_inf, m_sup)
```

La Hill function (Modelo de Hill) es el estandar en ciencias del marketing para respuesta publicitaria:
- lambda = punto de semi-saturacion (donde alcanzas 50% del efecto maximo)
- k = pendiente de la curva (k=1: hiperbola, k>1: sigmoide con umbral)
- qlim_max = techo de efecto
- valor_min = efecto base (0 si no hay publicidad)
- m_inf/m_sup = limites duros de salida

Para TV con limite 20: lambda~10, k~1.5 produce saturacion visible a 15 spots.
Para Radio con limite 200: lambda~100, k~1.2 produce saturacion mas gradual.

### Combinacion de alcances de multiples medios

**Evidencia:**
- `exclusivo[m,s]`: fraccion del segmento alcanzable SOLO por ese medio.
- Radio tiene exclusivo=0.5 en segmento Bajo.

**Forma funcional (independencia probabilistica con exclusividad):**
```
Para segmento s:
  // Parte exclusiva de cada medio (no se solapa)
  alcance_exclusivo = sum_m(exclusivo[m,s] * alcance_bruto[m,s])

  // Parte compartida de cada medio
  shared[m] = alcance_bruto[m,s] * (1 - exclusivo[m,s])

  // Combinacion por independencia probabilistica (evita doble conteo)
  alcance_compartido = 1 - product_m(1 - shared[m] / max_alcanzable[m,s])

  alcance_total(s) = min(1, alcance_exclusivo + alcance_compartido)
```

Esto reproduce exactamente el patron descrito: la mitad del segmento Bajo solo se alcanza por radio (exclusivo=0.5). La otra mitad se puede alcanzar por TV o radio, y ambos medios se combinan sin doble conteo via independencia probabilistica.

---

## 3. Modelo FPR (Productividad)

**Evidencia del caso:**
- "La combinacion de salarios y beneficios definira el nivel de satisfaccion de los empleados."
- "Niveles mas altos de satisfaccion conduzcan a una mayor productividad."
- "Los salarios son una fuente principal de satisfaccion o insatisfaccion. Las diferencias significativas en salarios o beneficios entre empresas pueden causar absentismo y disminuir la productividad."
- Beneficios laborales (Tabla 5.2): dias libres, formacion, prevencion de riesgos, liberados sindicales, reduccion de jornada, reparto de beneficios, seguro medico — cada uno con impacto en satisfaccion.
- Campos del perfil: fpr_base, fpr_max, fpr1, fpr2, fpr3, fpr4.
- Campos de beneficio: x_min, x_max, y_min, y_max, weight, type.

**Modelo en dos etapas:**

**Etapa 1 — Satisfaccion (0 a 1):**
```
Para cada beneficio b:
  valor_elegido = decision del equipo (entre x_min y x_max)
  normalizacion = (valor_elegido - x_min) / (x_max - x_min)

  Segun type:
    'linear':    contribucion_b = y_min + (y_max - y_min) * normalizacion
    'concave':   contribucion_b = y_min + (y_max - y_min) * sqrt(normalizacion)
    'convex':    contribucion_b = y_min + (y_max - y_min) * normalizacion^2
    'threshold': contribucion_b = normalizacion > 0.5 ? y_max : y_min

satisfaccion_beneficios = sum(contribucion_b * weight_b) / sum(weight_b)
```

El salario afecta la satisfaccion por comparacion competitiva:
```
salario_relativo = salario_empresa / avg(salarios_zona)
factor_salario = clamp((salario_relativo - 0.8) / 0.4, 0, 1)
// Si pagas 80% del promedio: factor=0, si pagas 120%: factor=1
```

Satisfaccion total:
```
satisfaccion = 0.6 * factor_salario + 0.4 * satisfaccion_beneficios
// Pesos 60/40 porque el caso dice que el salario es "fuente principal"
```

**Etapa 2 — Satisfaccion a FPR:**
```
fpr1..4 son puntos de control en satisfaccion = 0.25, 0.50, 0.75, 1.00
FPR = interpolacion_lineal_por_tramos(satisfaccion, [
  (0.00, fpr_base),
  (0.25, fpr1),
  (0.50, fpr2),
  (0.75, fpr3),
  (1.00, fpr4)
])
FPR = clamp(FPR, fpr_base, fpr_max)
```

Valores por defecto razonables: fpr_base=0.85, fpr1=0.90, fpr2=0.95, fpr3=1.00, fpr4=1.05, fpr_max=1.10.

**PROVISIONAL** — se marcara como tal en el codigo. Los coeficientes (peso salario vs beneficios, tipos de curva, puntos fpr) son todos configurables en el perfil.

---

## 4. Estado inicial de las empresas (Decisiones Iniciales)

**Esto NO falta — el caso lo documenta exhaustivamente.** Solo falta la UI para que el profesor lo capture. Datos del caso al inicio del periodo 7:

**Maquinas por zona y seccion (Tabla 4.1):**
| | M1 | M2 | M3a | M3b | M4 | Cuadrilla |
|---|---|---|---|---|---|---|
| Centro S1 | 7 | | | | | |
| Centro S2 | | 22 | | | | |
| Centro S3 | | | 3 | 0 | 4 | |
| Centro S4 | | | | | 10 | |
| Centro S5 | | | | | 11 | 25 cuadr. |
| Occ. S1 | 3 | | | | | |
| Occ. S2 | | 9 | | | | |
| Occ. S3 | | | 1 | 0 | 2 | |
| Occ. S4 | | | | | 3 | |
| Occ. S5 | | | | | 3 | 7 cuadr. |

**Trabajadores por zona (Tabla 5.1):** Centro: 219, Occidente: 71.
**Inventarios (Tabla 6.2):** Completos para 8 materias primas + 4 ensambles x 2 zonas.
**Balance (Tabla 9.2):** Efectivo $219,615.58, CxC $295,885.30, Inventario $511,817.44, Planta $1,059,500, Hipoteca $500,000, Capital $850,000, Utilidades Retenidas $183,281.96.
**CxP (Tabla 9.5):** Q2=$17,468, Q3=$61,630, Q5=$11,620, Q6=$53,250.
**CxC (Tabla 9.6):** Q2=$295,885.30.
**Finanzas (Tabla 9.3):** Linea credito al 10%, deposito al 4%, hipoteca al 6%, emergencia al 30%.
**Almacenes:** Centro 48, Occidente 25, Norte 20 modulos.
**Modulos planta:** Centro 4, Occidente 2.
**Fuerza de ventas:** 44 vendedores, salario $93.75/quincena.
**Precio P6:** $68 (Centro/Occ), $91 (Norte).

**Implementacion:** La pantalla "Decisiones Iniciales" del profesor es un formulario con secciones que replican estas tablas. Para el perfil semilla, todos estos valores se cargan del caso.

---

## 5. Pestana Marcas

**Deduccion logica:**

El caso describe UN solo producto (Electroclean) con dimensiones de atributo. No hay multimarca. Las capturas muestran `w_caracteristicas_marca` en segmentos y `actualizacion_instantanea_percepcion` en parametros comerciales.

En simuladores tipo EXSIM, "Marcas" configura:
1. **Percepcion de marca vs realidad de producto** — los consumidores no conocen instantaneamente las mejoras de producto. La percepcion se actualiza gradualmente (parametro `actualizacion_percepcion` por segmento/fase, valor 0-1).
2. **Efecto de la publicidad de marca** — la publicidad de marca (vs generica) construye brand equity que se acumula como un stock similar al conocimiento.
3. **Diferenciacion percibida** — como los consumidores perciben las diferencias entre empresas.

**Implementacion para la pestana:**
```
brand_params(
  profile_id,
  multi_brand_enabled BOOL DEFAULT false,  -- caso base: false
  perception_lag BOOL DEFAULT true,        -- la percepcion no es instantanea
  brand_equity_decay DECIMAL,              -- tasa de deterioro del equity
  brand_equity_initial DECIMAL,            -- valor inicial para todas las empresas
)

brand_dimensions(
  profile_id, dimension_id,
  peso_en_marca DECIMAL,  -- cuanto contribuye esta dimension al brand equity
  activo BOOL
)
```

Se marca como `PENDIENTE_DEFINIR` hasta obtener la captura real. La UI muestra campos ambar con "(Sin captura de referencia — configuracion provisional)".

---

## 6. ESG Components

**Resuelto completamente por el caso (Capitulo X, Tabla 10.2):**

| Componente | Inversion | Costo recurrente | Impacto CO2 |
|---|---|---|---|
| Panel solar | $420/panel (vida 25 anos) | $7/periodo/panel (5% mantenimiento) | 266.4 kWh/periodo, 106.4 kg CO2/periodo |
| Energia verde | N/A | +20% sobre $0.06/kWh | 0 emisiones por kWh verde, -0.4 kgCO2/kWh |
| Arboles | $6.25/arbol | $50/ano por 80 arboles | 1 ton CO2 por 80 arboles (333 kg CO2/periodo) |
| Creditos CO2 | Variable (1, 2 o 3 periodos) | No hay | 1 ton CO2 por credito |

**Fuentes de emision (Tabla 10.1):**
- Transporte: Avion 800, Tren 65, Camion 250 grCO2/ton/km
- Electricidad: 400 grCO2/kWh
- Construccion: 500 grCO2/m2
- Materias primas: por proveedor (Prov.A Parte-A: 3.67 kgCO2, Prov.B: 6.18, etc.)
- Mejoras de producto: de -6.0 a +11.4 kgCO2 por mejora
- Modulos nuevos: 405,000 kgCO2/modulo (distribuidos en 12 periodos)
- Desecho: 12 kgCO2/unidad reciclaje + 1.2 kgCO2/unidad transporte

**Implementacion:**
```sql
esg_components(
  profile_id, tipo: 'solar_panel'|'green_energy'|'tree'|'co2_credit',
  nombre_en, nombre_es,
  inversion_unitaria, vida_util_periodos,
  costo_mantenimiento_pct, costo_mantenimiento_fijo,
  kwh_generados_periodo,    -- solo paneles
  co2_offset_periodo,       -- kg CO2 compensados por unidad por periodo
  sobrecosto_energia_pct,   -- solo energia verde
  horizonte_credito,        -- solo creditos CO2 (1, 2 o 3 periodos)
  arboles_por_lote,         -- solo arboles
  activo BOOL
)

esg_emission_factors(
  profile_id,
  factor_transporte_avion, factor_transporte_camion, factor_transporte_tren,
  factor_electricidad, factor_construccion,
  kg_co2_desecho_reciclaje, kg_co2_desecho_transporte,
  periodos_amortizacion_construccion  -- 12 periodos
)

esg_material_emissions(
  profile_id, material_id, supplier_id,
  kg_co2_por_unidad
)

esg_improvement_emissions(
  improvement_id, kg_co2_por_unidad  -- puede ser negativo
)
```

---

## 7. Volumen esperado

**Evidencia de la nota docente:**
- "12-48 participantes en equipos de 4-6."
- "4-5 empresas compitiendo" por mundo.
- Formatos: intensivo (6h, 4 periodos) o semestral (8 semanas, 8 periodos).
- IPADE EMBA: cohortes de ~50 personas.

**Calculo:**
- 1 curso tipico: 48 participantes, 3 mundos x 5 equipos = 15 equipos.
- Maximo simultaneo realista: 3 cursos (EMBA + 2 programas ejecutivos) = 150 participantes.
- Pico de simulacion: 3 cursos x 3 mundos = 9 mundos simulando a la vez.
- Una simulacion de 5 equipos x 1 periodo (8 subperiodos x 5 secciones x produccion + demanda + contabilidad) = ~2-5 segundos en TypeScript puro sin I/O.
- 9 simulaciones concurrentes = 18-45 segundos en cola secuencial.

**Decision: Un solo worker de Railway es suficiente.** Sin auto-scaling. Si crece a 10+ cursos simultaneos, se escala a 2-3 workers manualmente compartiendo la cola `pg-boss`.

La latencia aceptable es < 60 segundos para que el profesor no se incomode en clase. Con 9 simulaciones secuenciales de 5s cada una = 45 segundos. Dentro del margen.

---

## 8. Marca IPADE — Tokens provisionales

**Evidencia observable:**
- Logo: escudo con letras "IPADE" + "BUSINESS SCHOOL" + "UNIVERSIDAD PANAMERICANA".
- Pagina 1 del caso: el logo usa azul oscuro/navy sobre fondo blanco.
- Las capturas de la plataforma de referencia: barra lateral verde oliva oscuro, barra superior negra, fondo blanco, acentos azules.
- El sitio ipade.mx usa una paleta limpia, institucional.

**Tokens provisionales (PENDIENTE_DEFINIR):**
```css
--ipade-primary: #1B365D;       /* Navy oscuro — del logo */
--ipade-primary-dark: #0F2340;  /* Navy mas oscuro */
--ipade-surface: #FFFFFF;       /* Fondo principal */
--ipade-surface-alt: #F5F5F5;   /* Fondo secundario */
--ipade-sidebar: #2C3E2D;       /* Verde oliva — de las capturas */
--ipade-sidebar-text: #E8E8E0;
--ipade-accent: #2563EB;        /* Azul para acciones */
--ipade-text: #1A1A1A;
--ipade-text-muted: #6B7280;
--ipade-success: #16A34A;
--ipade-warning: #D97706;
--ipade-danger: #DC2626;
--font-display: system-ui, -apple-system, sans-serif; /* PENDIENTE */
--font-body: system-ui, -apple-system, sans-serif;    /* PENDIENTE */
```

No se asumira ninguna fuente comercial. Se usara la pila de sistema hasta tener el manual oficial.

---

## 9. Captura de negociaciones

**Evidencia de la nota docente:**
- Las negociaciones son presenciales — "Pre-comparte la matriz de plazos por tipo de cliente."
- El profesor o un designado hace de banquero/sindicalista.
- El resultado modifica parametros laborales y financieros del mundo.
- Los periodos de negociacion estan configurados en el perfil (en v2: rondas entre P10 y P12).

**Decision: El profesor teclea el resultado.**

No hay mesa digital. La negociacion ocurre en persona, cara a cara. Despues, el profesor abre un formulario:

1. **Selecciona tipo:** Bancaria o Sindical.
2. **Ve los valores actuales** de los parametros afectados.
3. **Edita los nuevos valores** (salario minimo, dias personales, horas extra, beneficios, tasa de linea de credito, limite de hipoteca, etc.).
4. **Define el periodo efectivo** desde el cual aplican.
5. **Confirma** — el sistema guarda el acuerdo y actualiza los parametros del mundo.

El acuerdo queda en `negotiation_results(world_id, tipo, periodo_negociacion, periodo_efectivo, parametros_nuevos JSONB, aplicado_por, created_at)`.

Los equipos ven un mensaje: "El sindicato/banco ha comunicado nuevas condiciones para el periodo N." con los cambios visibles.

---

## 10. Canales y medios desactivados

**Evidencia:**
- Nota docente, Seccion 9 "Variantes y usos avanzados": la plataforma soporta variantes como "Solo marketing" o "Multi-region" que cambian que esta activo.
- Las capturas muestran Grandes Almacenes, E-commerce, Exterior y Digital como canales/medios desactivados pero presentes en la tabla.
- El caso base solo usa Distribuidores, TV y Radio.

**Decision: Son capacidad latente del perfil, no se activan como evento mid-game.**

Razon: activar un canal o medio nuevo a mitad de juego cambiaria fundamentalmente la dinamica competitiva de forma impredecible. Los profesores que quieran usar mas canales crean un perfil diferente con ellos activos desde el inicio.

Sin embargo, el sistema de eventos del profesor SI debe soportar:
- Cambiar parametros de canales existentes (ej. coste de distribuidores).
- Activar/desactivar zonas (apertura de mercado).
- Cambiar condiciones financieras.

La activacion de un canal nuevo es una operacion de perfil (clonar + editar), no un evento in-game.

---

## Preguntas adicionales resueltas

### Tasa de credito de emergencia
**Confirmado por el caso (p.27):** 30% por periodo. La nota docente lo refuerza: "Si es muy alto, se producira muy probablemente la bancarrota de la compania."

### Informes de pago
El caso no menciona informes con costo, pero la columna existe en v2. **Implementar con costo=0 en el perfil semilla** y UI completa. Es una palanca pedagogica valiosa que el profesor puede activar clonando el perfil.

### channel_zone values (10/8/7)
**Deduccion:** Son el numero de distribuidores disponibles en esa zona. El caso dice "mayoristas presentes en cada region". Las zonas mas grandes (Centro: 10, Occidente: 10) tienen mas distribuidores; las menos desarrolladas (Oriente: 7, Sur: 7) tienen menos. Esto actua como tope de esfuerzo comercial: no puedes asignar mas vendedores que distribuidores tienen capacidad de absorber.

### I+D Max en tabla de medios
**Deduccion:** Es un tope de gasto total en ese medio por periodo, NO un tope de spots. 15,000 para TV / 2,250 por spot = 6.67 spots, pero el limite de saturacion es 20 spots. Probablemente es un campo legacy de la plataforma de referencia que no se usa en v2 (los topes reales son los limites de saturacion). **Implementar como campo opcional** con default NULL (sin tope de gasto si no se configura).

### Conocimiento: por empresa-zona-segmento
**Deduccion:** Debe ser por empresa-zona-segmento, no solo empresa-zona. Razon: los medios tienen impacto diferente por segmento (TV alcanza 80% de Alto y 50% de Bajo). Si el conocimiento fuera por empresa-zona, ambos segmentos estarian igualmente "concientes" de una empresa que solo anuncia en TV, lo cual contradice el modelo.
