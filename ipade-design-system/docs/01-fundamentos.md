# 1. Fundamentos

Los fundamentos son las decisiones que no se negocian por pantalla. Todo componente se construye consumiendo estos valores; ninguno inventa los suyos.

---

## 1.1 Principios de diseño

Cinco principios que resuelven discusiones cuando dos soluciones parecen igual de válidas.

| Principio | Qué significa en la práctica | Cómo se verifica |
|---|---|---|
| **Autoridad sobria** | La marca comunica prestigio con contención: mucho espacio en blanco, tipografía firme, color usado como acento y no como decoración. | Una pantalla no debe tener más de un elemento compitiendo por atención. |
| **La persona al centro** | El contenido habla de personas concretas (egresados, profesores, participantes), no de la institución en abstracto. La foto humana antecede al dato. | Toda sección de prueba social lleva nombre, programa y año. |
| **Claridad antes que sorpresa** | El usuario objetivo es un directivo con poco tiempo. La navegación es predecible, las etiquetas dicen lo que hacen. | Ningún rótulo depende de una metáfora para entenderse. |
| **Una decisión por pantalla** | Cada vista tiene una acción primaria evidente. Las secundarias no compiten en peso visual. | Un solo botón `--primary` visible por sección. |
| **Accesible por defecto** | La accesibilidad es criterio de aceptación, no una fase posterior. | WCAG 2.2 AA en todo componente antes de mezclarse a `main`. |

---

## 1.2 Color

### 1.2.1 Arquitectura de tokens

El sistema usa tres capas. Nunca se referencia un primitivo directamente en un componente.

```
Primitivo            Semántico              Componente
--ipd-color-navy-700  →  --ipd-bg-brand   →  --ipd-btn-primary-bg
(valor crudo)            (intención)          (alias local)
```

La razón: cambiar el azul de marca debe ser una edición en un lugar, no una búsqueda global.

### 1.2.2 Paleta de marca · Azul IPADE

El azul institucional sostiene toda la identidad. Es el color de la autoridad académica y ocupa fondos completos de sección, encabezados y la acción primaria.

| Token | Hex | Uso principal | Contraste sobre blanco |
|---|---|---|---|
| `--ipd-color-navy-950` | `#00152B` | Cortinas de imagen, overlays | 18.39:1 |
| `--ipd-color-navy-900` | `#001F3D` | Pie de página, secciones inmersivas | 16.62:1 |
| `--ipd-color-navy-800` | `#00284E` | Hover de superficies de marca | 14.86:1 |
| `--ipd-color-navy-700` | `#00305B` | **Color ancla.** Botón primario, títulos de marca | 13.34:1 |
| `--ipd-color-navy-600` | `#14487A` | Enlaces en texto corrido | 9.38:1 |
| `--ipd-color-navy-500` | `#1E5A96` | Anillo de foco, estado informativo | 7.1:1 |
| `--ipd-color-navy-400` | `#4C82B8` | Gráficos y texto grande, nunca texto de cuerpo | 4.04:1 |
| `--ipd-color-navy-300` | `#8AAFD3` | Texto secundario sobre fondo oscuro | — |
| `--ipd-color-navy-200` | `#C0D6E9` | Bordes sobre fondo oscuro | — |
| `--ipd-color-navy-100` | `#E1ECF5` | Fondo de sección suave | — |
| `--ipd-color-navy-50` | `#F0F6FB` | Fondo de tarjeta destacada | — |

### 1.2.3 Paleta de acento · Oro académico

El oro es el segundo color de la institución y funciona como señalador: subraya la cifra que importa, el rótulo de sección, el filete bajo un enlace activo. No se usa como fondo de bloques grandes ni para texto de párrafo.

| Token | Hex | Uso |
|---|---|---|
| `--ipd-color-gold-800` | `#8A6A24` | Texto de acento sobre blanco (5.04:1, cumple AA) |
| `--ipd-color-gold-600` | `#B08D3F` | **Acento ancla.** Filetes, íconos, subrayados, cifras |
| `--ipd-color-gold-400` | `#D9BF86` | Acento sobre fondo azul oscuro |
| `--ipd-color-gold-100` | `#FAF7EF` | Fondo de bloque destacado |

> **Regla de contraste del oro:** `gold-600` sobre blanco da 3.12:1. Sirve para gráficos y bordes, no para texto menor a 24px. Para texto de acento sobre blanco use `gold-800`.

### 1.2.4 Neutrales

Grises fríos, ligeramente azulados, para que no choquen con el azul de marca. Un gris cálido junto a este azul se ve sucio.

`neutral-0` a `neutral-900`. Los tres de uso más frecuente:

- `neutral-900` `#10141A` texto principal (18.47:1)
- `neutral-600` `#4D5561` texto secundario (7.53:1)
- `neutral-200` `#DDE1E7` bordes y separadores

### 1.2.5 Colores de estado

| Estado | Token | Hex | Cuándo |
|---|---|---|---|
| Éxito | `--ipd-color-success-600` | `#1E7A46` | Confirmación de envío de formulario, inscripción registrada |
| Advertencia | `--ipd-color-warning-600` | `#A96206` | Fecha límite próxima, cupo bajo |
| Error | `--ipd-color-danger-600` | `#B3261E` | Validación fallida, envío rechazado |
| Información | `--ipd-color-info-600` | `#1E5A96` | Aviso neutro, cambio de sede |

El color nunca es el único portador del significado: todo estado lleva ícono y texto.

### 1.2.6 Proporción de uso

Una pantalla equilibrada reparte el color así:

```
60 %  neutral claro (blanco y neutral-50)   superficie
30 %  azul de marca                          estructura, encabezados, CTA
 7 %  neutrales medios                       texto secundario, bordes
 3 %  oro                                    acentos y señalamiento
```

### 1.2.7 Superficie oscura

La clase `.ipd-theme-dark` redefine los tokens semánticos dentro de su contenedor. Sirve para el pie de página, secciones de campaña y encabezados sobre video. No es un modo oscuro del sistema operativo; es una superficie de marca.

```html
<footer class="ipd-theme-dark ipd-footer"> ... </footer>
```

---

## 1.3 Tipografía

### 1.3.1 Familias y roles

| Rol | Familia | Uso | Por qué |
|---|---|---|---|
| Display | `Source Serif 4` | Titulares, citas, cifras destacadas | La serifa transmite tradición académica y separa la voz institucional del texto de interfaz |
| Texto | `Inter` | Cuerpo, navegación, formularios, botones | Alta legibilidad en tamaños pequeños y buen soporte de acentos y "ñ" |
| Utilitaria | `IBM Plex Mono` | Códigos de programa, tablas de datos, fragmentos técnicos | Ancho fijo para alinear cifras |

> Sustituya estas familias por las licenciadas en el manual de marca cuando estén disponibles. Los fallbacks están ordenados por métrica similar para que el cambio no altere el layout.

### 1.3.2 Escala tipográfica

Base 16px, razón 1.25 en desktop, fluida con `clamp()` para no necesitar media queries por tamaño.

| Token | Móvil → Desktop | Interlineado | Uso |
|---|---|---|---|
| `--ipd-size-6xl` | 44 → 72 px | 1.12 | Titular de hero |
| `--ipd-size-5xl` | 36 → 52 px | 1.12 | Titular de página, cifras de estadística |
| `--ipd-size-4xl` | 32 → 40 px | 1.12 | H1 interno |
| `--ipd-size-3xl` | 26 → 32 px | 1.28 | H2 de sección |
| `--ipd-size-2xl` | 22 → 26 px | 1.28 | H3, título de tarjeta de programa |
| `--ipd-size-xl` | 21 px | 1.28 | H4, título de tarjeta de artículo |
| `--ipd-size-lg` | 18 px | 1.65 | Entradilla, cita |
| `--ipd-size-md` | 16 px | 1.65 | **Cuerpo base** |
| `--ipd-size-sm` | 14 px | 1.5 | Texto de interfaz, botones, metadatos |
| `--ipd-size-xs` | 13 px | 1.5 | Pie de foto, ayuda de campo |
| `--ipd-size-2xs` | 12 px | 1.5 | Rótulo superior, etiquetas |

### 1.3.3 Reglas de composición

- **Longitud de línea:** 65 a 75 caracteres en texto corrido. El contenedor `--ipd-container-narrow` (760px) lo resuelve.
- **Interlineado:** cuanto mayor el tamaño, menor el interlineado. Nunca menos de 1.5 en cuerpo.
- **Tracking:** negativo en display (`-0.02em`), neutro en cuerpo, muy abierto en rótulos superiores (`0.12em`).
- **Jerarquía sin salto:** no se salta de H2 a H4. La jerarquía visual y la semántica del HTML deben coincidir.
- **Versalitas falsas:** no se usan. Los rótulos van en `text-transform: uppercase` con tracking abierto.
- **Viudas:** `text-wrap: balance` en titulares, `text-wrap: pretty` en párrafos.

### 1.3.4 Estilos nombrados

| Clase | Composición |
|---|---|
| `.ipd-display-1` | display, 6xl, 700, tracking -0.02em |
| `.ipd-h2` | display, 3xl, 600, tracking -0.01em |
| `.ipd-lead` | sans, lg, 400, color secundario, máx 60ch |
| `.ipd-body` | sans, md, 400, interlineado 1.65 |
| `.ipd-caption` | sans, xs, 400, color terciario |
| `.ipd-overline` | sans, 2xs, 600, mayúsculas, tracking 0.12em, color acento |
| `.ipd-eyebrow` | igual que overline más filete de 32px en oro antes del texto |

---

## 1.4 Espaciado

Escala de base 4px. Los valores intermedios no existen: si algo necesita 18px, la respuesta es 16 o 20.

```
1→4    2→8    3→12   4→16   5→20   6→24
8→32   10→40  12→48  16→64  20→80  24→96  32→128  40→160
```

**Ritmo vertical de secciones:** `--ipd-section-y` es fluido, de 48px en móvil a 120px en desktop. Una sección nunca define su propio padding vertical arbitrario.

**Regla de proximidad:** el espacio entre elementos relacionados siempre es menor que el espacio con el grupo vecino. Un rótulo pegado a su campo, el grupo separado del siguiente.

```
label          ← 8px  →  input          ← 24px →  siguiente campo
```

---

## 1.5 Rejilla y layout

### 1.5.1 Puntos de quiebre

| Nombre | Ancho | Contexto |
|---|---|---|
| `xs` | 360px | Móvil pequeño, piso de diseño |
| `sm` | 600px | Móvil grande |
| `md` | 768px | Tableta vertical |
| `lg` | 1024px | Tableta horizontal, laptop pequeña, aparece la navegación completa |
| `xl` | 1280px | Escritorio |
| `2xl` | 1440px | Escritorio ancho, tope del contenedor |

Se diseña primero a 360px. El breakpoint se agrega cuando el contenido se rompe, no en un ancho arbitrario.

### 1.5.2 Contenedores

| Token | Ancho | Uso |
|---|---|---|
| `--ipd-container-narrow` | 760px | Artículo, texto legal, formulario de una columna |
| `--ipd-container-max` | 1200px | Contenedor estándar de página |
| `--ipd-container-wide` | 1440px | Hero, galerías, tablas anchas |

Márgenes laterales: 16px en móvil, 24px desde `sm`, 32px desde `lg`.

### 1.5.3 Rejilla

12 columnas en `lg`, 8 en `md`, 4 abajo. Canal de 24px.

```
lg (1024+)   │1│2│3│4│5│6│7│8│9│10│11│12│   gap 24
md (768+)    │1│2│3│4│5│6│7│8│                gap 24
sm (<768)    │1│2│3│4│                        gap 16
```

Distribuciones canónicas:

- **Artículo con barra lateral:** 8 + 4
- **Colección de tarjetas:** 4 + 4 + 4 en desktop, 6 + 6 en tableta, 12 en móvil
- **Bloque partido texto/imagen:** 6 + 6, con la imagen alternando de lado entre secciones consecutivas

---

## 1.6 Bordes, radios y elevación

**Radio.** El sistema es de esquinas discretas: `--ipd-radius-sm` (4px) es el valor por defecto de botones y campos, `md` (8px) para tarjetas, `pill` solo para etiquetas y botones circulares flotantes. Las esquinas muy redondeadas restan formalidad a la marca.

**Grosor de borde.** 1px separador, 2px énfasis o estado activo, 4px filete de acento.

**Elevación.** Cinco niveles, todos con sombra fría en azul, nunca negro puro.

| Nivel | Token | Uso |
|---|---|---|
| 0 | `none` | Superficie de página |
| 1 | `xs` | Tarjeta en reposo con borde |
| 2 | `sm` | Encabezado fijo al hacer scroll |
| 3 | `md` | Tarjeta en hover, menú desplegable |
| 4 | `lg` | Panel lateral, popover |
| 5 | `xl` | Modal |

La elevación indica distancia respecto al plano, no importancia. Un elemento no sube de nivel solo por ser relevante.

---

## 1.7 Iconografía

- **Trazo:** 1.5px, extremos redondeados, rejilla de 24×24.
- **Formato:** SVG en línea con `currentColor` para que herede el color del contexto.
- **Tamaños:** 16px en línea de texto, 20px en botones, 24px en navegación, 32px o más para íconos ilustrativos de sección.
- **Etiquetado:** un ícono decorativo lleva `aria-hidden="true"`. Un ícono que es la única etiqueta de un control lleva `aria-label` con el texto de la acción.
- **Prohibido:** mezclar familias de íconos, rellenar íconos de trazo, usar emoji en interfaz de producto.

---

## 1.8 Imagen y fotografía

**Dirección de arte.** Personas reales en contexto de trabajo o aula, mirada natural, luz cálida. Nada de banco de imágenes genérico con manos apretando gráficas.

**Proporciones normalizadas**

| Token | Proporción | Uso |
|---|---|---|
| `--ipd-ratio-hero` | 16:7 | Banner principal |
| `--ipd-ratio-card` | 585:295 | Tarjeta de artículo, coincide con el recorte del CMS |
| `--ipd-ratio-portrait` | 3:4 | Retrato de profesor o egresado |
| `--ipd-ratio-square` | 1:1 | Avatar, redes sociales |

**Cortina de contraste.** Todo texto sobre fotografía se coloca sobre `.ipd-hero__scrim`, un degradado vertical de `rgba(0,21,43,0.15)` a `rgba(0,21,43,0.85)`. Sin cortina no se garantiza el contraste mínimo y el titular deja de ser legible cuando cambia la imagen.

**Rendimiento.** `loading="lazy"` salvo la imagen del hero, `decoding="async"`, `width` y `height` explícitos para reservar espacio, formato WebP con respaldo JPG.

**Texto alternativo.** Describe la función de la imagen en el contexto, no su contenido literal. Una foto decorativa lleva `alt=""`.

---

## 1.9 Movimiento

El movimiento explica qué cambió y de dónde vino. Si no comunica nada, se elimina.

| Token | Duración | Uso |
|---|---|---|
| `--ipd-duration-instant` | 80ms | Cambio de color en hover |
| `--ipd-duration-fast` | 140ms | Botones, campos, subrayados |
| `--ipd-duration-base` | 220ms | Tarjetas, acordeones, desplegables |
| `--ipd-duration-slow` | 340ms | Modales, paneles laterales |
| `--ipd-duration-deliberate` | 520ms | Entrada de hero, contadores de cifras |

**Curvas.** `--ipd-ease-standard` para casi todo. `entrance` para lo que aparece, `exit` para lo que se va, `emphasis` solo en el contador de cifras del hero.

**Qué se anima.** `transform` y `opacity`. Animar `width`, `height` o `top` provoca recálculo de layout y saltos.

**Reducción de movimiento.** `@media (prefers-reduced-motion: reduce)` lleva todas las duraciones a 1ms y desactiva parallax, autoplay de carrusel y el shimmer del esqueleto de carga. Esto ya está resuelto en `tokens.css`; no debe reimplementarse por componente.
