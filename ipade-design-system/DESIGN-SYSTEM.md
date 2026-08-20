# IPADE Business School · Design System

**Versión 1.0.0** · Documento maestro
Derivado del lenguaje visual de https://www.ipade.mx/

Sistema de diseño para el ecosistema digital de IPADE Business School. Documenta cada
elemento gráfico, su razón de ser, sus estados y sus reglas de uso.

> **Antes de producción:** los hexadecimales y las familias tipográficas se
> reconstruyeron por inspección del sitio público. Sustitúyalos en
> `tokens/tokens.css` por los del manual de identidad oficial. Los componentes
> consumen tokens semánticos, así que ese cambio no afecta a ninguno de ellos.

---

## Índice

- [1. Fundamentos](#1-fundamentos)
  - [1.1 Principios de diseño](#11-principios-de-diseno)
  - [1.2 Color](#12-color)
  - [1.3 Tipografía](#13-tipografia)
  - [1.4 Espaciado](#14-espaciado)
  - [1.5 Rejilla y layout](#15-rejilla-y-layout)
  - [1.6 Bordes, radios y elevación](#16-bordes-radios-y-elevacion)
  - [1.7 Iconografía](#17-iconografia)
  - [1.8 Imagen y fotografía](#18-imagen-y-fotografia)
  - [1.9 Movimiento](#19-movimiento)
- [2. Componentes](#2-componentes)
  - [2.1 Botón](#21-boton)
  - [2.2 Enlace](#22-enlace)
  - [2.3 Campo de formulario](#23-campo-de-formulario)
  - [2.4 Tarjeta](#24-tarjeta)
  - [2.5 Tarjeta de programa](#25-tarjeta-de-programa)
  - [2.6 Testimonio](#26-testimonio)
  - [2.7 Cifras institucionales](#27-cifras-institucionales)
  - [2.8 Encabezado y navegación](#28-encabezado-y-navegacion)
  - [2.9 Hero](#29-hero)
  - [2.10 Acordeón](#210-acordeon)
  - [2.11 Pestañas](#211-pestanas)
  - [2.12 Migas de pan](#212-migas-de-pan)
  - [2.13 Paginación](#213-paginacion)
  - [2.14 Etiqueta](#214-etiqueta)
  - [2.15 Aviso](#215-aviso)
  - [2.16 Modal](#216-modal)
  - [2.17 Acciones flotantes](#217-acciones-flotantes)
  - [2.18 Pie de página](#218-pie-de-pagina)
  - [2.19 Tabla](#219-tabla)
  - [2.20 Cronología](#220-cronologia)
  - [2.21 Estado de carga](#221-estado-de-carga)
  - [2.22 Estados vacíos y de error](#222-estados-vacios-y-de-error)
- [3. Patrones](#3-patrones)
  - [3.1 Portada institucional](#31-portada-institucional)
  - [3.2 Página de programa](#32-pagina-de-programa)
  - [3.3 Formulario de captación](#33-formulario-de-captacion)
  - [3.4 Listado de Newsmedia](#34-listado-de-newsmedia)
  - [3.5 Artículo](#35-articulo)
  - [3.6 Ficha de profesor](#36-ficha-de-profesor)
  - [3.7 Buscador](#37-buscador)
  - [3.8 Multilingüe](#38-multilingue)
  - [3.9 Comportamiento responsivo](#39-comportamiento-responsivo)
- [4. Accesibilidad](#4-accesibilidad)
  - [4.1 Contraste](#41-contraste)
  - [4.2 Teclado](#42-teclado)
  - [4.3 Semántica](#43-semantica)
  - [4.4 Imágenes y multimedia](#44-imagenes-y-multimedia)
  - [4.5 Formularios](#45-formularios)
  - [4.6 Movimiento y sensorial](#46-movimiento-y-sensorial)
  - [4.7 Zoom y adaptación](#47-zoom-y-adaptacion)
  - [4.8 Lista de verificación previa a publicar](#48-lista-de-verificacion-previa-a-publicar)
- [5. Contenido, voz y gobierno](#5-contenido-voz-y-gobierno)
  - [5.1 Voz de marca](#51-voz-de-marca)
  - [5.2 Reglas de redacción de interfaz](#52-reglas-de-redaccion-de-interfaz)
  - [5.3 Arquitectura de archivos](#53-arquitectura-de-archivos)
  - [5.4 Convenciones de nombres](#54-convenciones-de-nombres)
  - [5.5 Cómo agregar un componente](#55-como-agregar-un-componente)
  - [5.6 Versionado](#56-versionado)
  - [5.7 Deuda conocida](#57-deuda-conocida)
  - [5.8 Registro de cambios](#58-registro-de-cambios)
- [/goal](#goal)
  - [Objetivo](#objetivo)
  - [Contrato para el agente](#contrato-para-el-agente)
  - [Orden de precedencia ante conflictos](#orden-de-precedencia-ante-conflictos)
  - [Cómo usar este paquete en Claude Code](#como-usar-este-paquete-en-claude-code)
  - [Alcance de la versión 1.0.0](#alcance-de-la-version-100)

---

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

---

# 2. Componentes

Cada ficha sigue la misma estructura: para qué sirve, anatomía, variantes, estados, marcado de referencia, accesibilidad y errores frecuentes.

Convención de nombres: BEM con prefijo `ipd-`.

```
.ipd-card              bloque
.ipd-card__title       elemento
.ipd-card--interactive modificador
```

---

## 2.1 Botón

**Para qué sirve.** Ejecutar una acción. Si navega a otra página, es un enlace con apariencia de botón, y debe ser una etiqueta `<a>`.

**Anatomía:** contenedor, ícono opcional a la izquierda, etiqueta, ícono opcional a la derecha.

**Variantes**

| Variante | Uso | Cuántos por vista |
|---|---|---|
| `--primary` | La acción principal: inscribirse, solicitar informes, descargar folleto | Uno por sección |
| `--secondary` | Acción alterna de peso similar: conocer el programa | Sin límite estricto |
| `--accent` | Campaña o urgencia: última convocatoria | Uno por página como máximo |
| `--ghost` | Acción terciaria dentro de un grupo denso | Sin límite |
| `--danger` | Acción destructiva confirmada | Uno por diálogo |

**Tamaños.** `--sm` 36px, base 44px, `--lg` 56px. El mínimo táctil es 44×44px, incluido el móvil.

**Estados.** Reposo, hover, foco visible, activo, deshabilitado, cargando.

- El foco usa el anillo global de 2px con desplazamiento de 2px. Nunca se suprime.
- Deshabilitado usa `aria-disabled="true"` cuando el control debe seguir siendo enfocable para que un lector de pantalla explique por qué no está disponible.
- Cargando: `data-loading="true"`, la etiqueta cambia a gerundio y se anuncia con `aria-live="polite"`.

```html
<a class="ipd-btn ipd-btn--primary" href="/contactanos">
  Solicitar informes
</a>

<button class="ipd-btn ipd-btn--secondary" type="button">
  <svg class="ipd-btn__icon" aria-hidden="true">…</svg>
  Descargar folleto
</button>

<button class="ipd-btn ipd-btn--primary" data-loading="true" aria-live="polite">
  Enviando
</button>
```

**Errores frecuentes**

- Dos botones primarios juntos. El usuario deja de saber cuál es la ruta esperada.
- Etiquetas que no dicen la acción: "Enviar", "Aceptar", "Más". Use "Solicitar informes", "Guardar cambios", "Ver el plan de estudios".
- Usar `<div>` con `onclick`. No es enfocable ni se activa con teclado.

---

## 2.2 Enlace

**En texto corrido:** `.ipd-link`, subrayado siempre presente. El color por sí solo no distingue el enlace para quien no percibe el contraste cromático.

**Enlace con flecha:** `.ipd-link-arrow`, el patrón de "Ver más" del sitio. La flecha se desplaza 3px en hover.

**Enlace externo:** se indica en el texto o con ícono más `aria-label` que aclare que abre en una ventana nueva. Un `target="_blank"` sin aviso rompe la expectativa del usuario.

```html
<a class="ipd-link-arrow" href="/newsmedia/articulo">Ver más</a>
```

---

## 2.3 Campo de formulario

**Anatomía:** etiqueta, campo, texto de ayuda, mensaje de error.

**Reglas**

- La etiqueta va arriba y siempre visible. El placeholder no sustituye la etiqueta: desaparece al escribir y deja al usuario sin referencia.
- El campo obligatorio se marca con asterisco y con `required`. En formularios donde casi todo es obligatorio, marque los opcionales.
- El texto de ayuda va antes del error, ambos vinculados con `aria-describedby`.
- El error aparece al salir del campo, no en cada tecla. Dice qué pasó y cómo corregirlo.

```html
<div class="ipd-field">
  <label class="ipd-label" for="correo">
    Correo corporativo <span class="ipd-label__required" aria-hidden="true">*</span>
  </label>
  <input class="ipd-input" id="correo" type="email" name="correo" required
         aria-describedby="correo-ayuda correo-error" aria-invalid="true" />
  <p class="ipd-help" id="correo-ayuda">Usaremos este correo para enviarle la confirmación.</p>
  <p class="ipd-error" id="correo-error" role="alert">
    Falta el signo @. Ejemplo: nombre@empresa.com
  </p>
</div>
```

**Variantes de control:** `.ipd-input`, `.ipd-textarea` (redimensionable solo en vertical), `.ipd-select`, `.ipd-choice` para casillas y botones de opción.

**Errores frecuentes**

- Validar el formato del teléfono con reglas rígidas. IPADE recibe candidatos de varios países.
- Poner el mensaje de error solo en color rojo, sin texto.
- Deshabilitar el botón de envío hasta que el formulario sea válido. Es preferible permitir el envío y explicar qué falta.

---

## 2.4 Tarjeta

**Para qué sirve.** Presentar una unidad de contenido resumida que lleva a un destino: artículo, sede, profesor.

**Anatomía:** medio, cuerpo (metadato, título, extracto), pie con enlace.

**Variantes**

- `.ipd-card` estática, sin destino.
- `.ipd-card--interactive` toda la tarjeta es clicable. Se logra con un pseudoelemento sobre el enlace del título, no envolviendo la tarjeta en un `<a>`: así el texto sigue siendo seleccionable y el destino sigue siendo uno solo para el lector de pantalla.

```html
<article class="ipd-card ipd-card--interactive">
  <div class="ipd-card__media">
    <img src="…" alt="" width="585" height="295" loading="lazy" />
  </div>
  <div class="ipd-card__body">
    <p class="ipd-card__meta">
      <time datetime="2026-08-19">19 de agosto de 2026</time> · Factor humano
    </p>
    <h3 class="ipd-card__title">
      <a href="/newsmedia/articulo">La línea de vida en la empresa familiar</a>
    </h3>
    <p class="ipd-card__excerpt">El ejercicio de línea de vida ayuda a entender…</p>
    <p class="ipd-card__footer"><span class="ipd-link-arrow" aria-hidden="true">Ver más</span></p>
  </div>
</article>
```

Note que el "Ver más" del pie lleva `aria-hidden` porque el enlace real es el título. Repetirlo produce dos anuncios para un solo destino.

---

## 2.5 Tarjeta de programa

Bloque sólido en azul de marca sin imagen. Se usa en la parrilla de oferta académica, donde la consistencia importa más que el atractivo individual de cada programa.

El filete inferior en oro se despliega de izquierda a derecha en hover. Es el único adorno del componente.

```html
<a class="ipd-program-card" href="/perfeccionamiento-directivo/">
  <span class="ipd-program-card__title">Perfeccionamiento Directivo</span>
  <span class="ipd-program-card__desc">Programas de actualización para la alta dirección.</span>
</a>
```

**Reglas de la parrilla.** Todas las tarjetas de una fila comparten altura. El título no excede tres líneas; si el nombre del programa es más largo, se acorta en el CMS, no con `text-overflow`.

---

## 2.6 Testimonio

Prueba social. Es el componente donde la marca deja hablar a la persona.

**Anatomía:** retrato circular, cita en tipografía display, nombre, programa y año.

**Reglas**

- La cita va sin comillas tipográficas decorativas gigantes. La tipografía display ya la distingue.
- Siempre incluye programa y año de egreso. Sin ese dato el testimonio no es verificable y pierde valor.
- Máximo 70 palabras. Los testimonios largos se recortan con criterio editorial, no con puntos suspensivos automáticos.

```html
<figure class="ipd-testimonial">
  <img class="ipd-testimonial__avatar" src="…" alt="Retrato de Gabriela Malanco" />
  <div>
    <blockquote class="ipd-testimonial__quote">
      Mi experiencia fue de conexión y crecimiento…
    </blockquote>
    <figcaption>
      <p class="ipd-testimonial__author">Gabriela Malanco</p>
      <p class="ipd-testimonial__role">Egresada del programa AD 2025</p>
    </figcaption>
  </div>
</figure>
```

---

## 2.7 Cifras institucionales

Bloque de datos duros: años, egresados, sedes, convenios. La cifra va en display y oro; el rótulo en mayúsculas pequeñas.

**Animación de conteo.** Se dispara una sola vez, al entrar en viewport, con `IntersectionObserver`. Con `prefers-reduced-motion` el valor final aparece de inmediato. El valor real vive en el HTML, no en el script, para que sea visible sin JavaScript y para los rastreadores.

```html
<div class="ipd-stats">
  <div class="ipd-stat">
    <p class="ipd-stat__value" data-count-to="58">58</p>
    <p class="ipd-stat__label">Años</p>
  </div>
</div>
```

---

## 2.8 Encabezado y navegación

**Comportamiento.** Fijo al hacer scroll con `position: sticky`. Sobre un hero con imagen arranca transparente y adquiere fondo sólido al superar 80px de desplazamiento.

**Estructura:** logotipo, navegación principal (máximo 5 entradas), selector de idioma, buscador, botón de menú completo.

- La navegación principal aparece a partir de `lg`. Debajo, todo entra en el menú de pantalla completa.
- La sección activa se marca con `aria-current="page"` y filete en oro.
- El menú de pantalla completa atrapa el foco mientras está abierto, cierra con `Escape` y devuelve el foco al botón que lo abrió.
- El logotipo enlaza a la portada y su texto alternativo es "IPADE Business School, ir a la portada".

```html
<header class="ipd-header">
  <div class="ipd-container ipd-header__inner">
    <a class="ipd-header__logo" href="/"><img src="…" alt="IPADE Business School" /></a>
    <nav class="ipd-nav" aria-label="Navegación principal">
      <a class="ipd-nav__link" href="/conoce-ipade/">IPADE</a>
      <a class="ipd-nav__link" href="/#programas" aria-current="page">Programas</a>
      <a class="ipd-nav__link" href="/claustro-academico/">Faculty &amp; Research</a>
      <a class="ipd-nav__link" href="/alumni-egresados/">Alumni</a>
    </nav>
    <div class="ipd-cluster">
      <p class="ipd-lang"><a href="/" aria-current="true">ES</a><a href="/en/">EN</a></p>
      <button class="ipd-btn ipd-btn--ghost" aria-expanded="false" aria-controls="menu-full">Menú</button>
    </div>
  </div>
</header>
```

---

## 2.9 Hero

**Para qué sirve.** Establecer la propuesta de la página en una pantalla.

**Anatomía:** imagen de fondo, cortina de contraste, rótulo superior opcional, titular, entradilla, una acción primaria.

**Reglas**

- Un solo botón primario. Si hay una acción secundaria, va como enlace con flecha.
- El titular no pasa de 8 palabras.
- La altura es `clamp(420px, 60vh, 700px)`. No se usa `100vh`: en móvil deja el contenido siguiente invisible y da la impresión de página vacía.
- La imagen del hero es la única que no lleva `loading="lazy"`, y se precarga con `<link rel="preload">`.

---

## 2.10 Acordeón

Para preguntas frecuentes y planes de estudio por módulo.

- Se construye sobre `<button aria-expanded>` más panel, o sobre `<details>` nativo.
- Un ítem abierto por defecto solo si el contenido es imprescindible.
- No se anida. Dos niveles de acordeón esconden el contenido más de lo que lo organizan.
- El indicador cambia de `+` a `−` y el estado real vive en `aria-expanded`.

---

## 2.11 Pestañas

Para contenido paralelo del mismo nivel: modalidades de un programa, sedes.

- Rol `tablist` / `tab` / `tabpanel`, navegación con flechas, `Home` y `End`.
- No se usan para pasos secuenciales; para eso va un indicador de progreso.
- En móvil el listado hace scroll horizontal con el primer elemento alineado al margen.

---

## 2.12 Migas de pan

Aparecen desde el tercer nivel de profundidad. La página actual se muestra sin enlace y con `aria-current="page"`. Van dentro de `<nav aria-label="Ruta de navegación">`.

---

## 2.13 Paginación

Para listados largos como Newsmedia. Anterior, números, siguiente. La página actual con `aria-current="page"`. Los controles mantienen 44×44px.

Para listados infinitos se prefiere un botón "Cargar más" antes que scroll infinito: el pie de página debe seguir siendo alcanzable.

---

## 2.14 Etiqueta

`.ipd-badge` clasifica sin ser interactiva: categoría de artículo, sede, modalidad. Si al hacer clic filtra, entonces es un botón y debe verse como tal.

Variantes: neutra, `--brand`, `--accent`, `--success`, `--warning`, `--danger`.

---

## 2.15 Aviso

`.ipd-alert` comunica un cambio de estado en contexto.

- `role="status"` para información y éxito, `role="alert"` para error.
- Lleva ícono, título opcional y cuerpo. El ícono es `aria-hidden`.
- El texto explica la consecuencia y la salida: "No se pudo enviar el formulario. Revise el correo e intente de nuevo."

---

## 2.16 Modal

Se usa solo cuando la tarea exige interrumpir: confirmar una acción destructiva o completar un dato imprescindible.

- `<dialog>` nativo con `showModal()`.
- Cierra con `Escape`, con el botón de cerrar y con clic en el fondo, salvo que haya cambios sin guardar.
- El foco entra al primer elemento interactivo y regresa al disparador al cerrar.
- El fondo de la página queda inerte y con `overflow: hidden`.
- No se usa para captación en la primera visita. Un modal de suscripción antes de que el usuario lea nada es la causa más común de abandono.

---

## 2.17 Acciones flotantes

La columna de accesos rápidos (contacto, WhatsApp, folletos) del sitio.

- Máximo tres. Cada una con `aria-label` explícito.
- No tapan contenido en móvil: se ocultan al hacer scroll hacia abajo y reaparecen al subir.
- Respetan `env(safe-area-inset-bottom)` en iOS.
- WhatsApp abre con mensaje prellenado y se anuncia como enlace externo.

---

## 2.18 Pie de página

Cuatro bloques temáticos, logotipo institucional, redes por marca y línea legal.

- Fondo `navy-900`, texto `navy-100`, encabezados de bloque en `gold-400`.
- Los enlaces del pie mantienen 44px de alto táctil en móvil, no se comprimen.
- El aviso de privacidad y el contacto nunca se quitan de este bloque.

---

## 2.19 Tabla

Para comparativas de programas y calendarios.

- Siempre con `<caption>`, `<thead>` y `scope` en los encabezados.
- En móvil, contenedor con scroll horizontal y `tabindex="0"` para que sea alcanzable con teclado, más una etiqueta que anuncie que la tabla se desplaza.
- Cifras alineadas a la derecha con `font-variant-numeric: tabular-nums`.

---

## 2.20 Cronología

Para la historia institucional. Línea vertical con hitos, año en display, marcador circular con borde en oro.

En móvil siempre es de una sola columna. La cronología alternada a dos lados se vuelve ilegible en pantallas angostas.

---

## 2.21 Estado de carga

`.ipd-skeleton` reproduce la forma del contenido que va a llegar, no un spinner genérico. Evita el salto de layout porque ocupa exactamente el mismo espacio.

Con `prefers-reduced-motion` el brillo se desactiva y queda un bloque plano.

---

## 2.22 Estados vacíos y de error

Un listado sin resultados no muestra una pantalla en blanco. Muestra:

1. Qué se buscó.
2. Por qué no hay resultados.
3. Una acción concreta para salir del callejón.

> No encontramos programas con esos filtros.
> Pruebe quitando la sede o amplíe el rango de fechas.
> [Limpiar filtros]

Para el error 404: buscador, enlaces a las cuatro secciones principales y contacto. Nunca un mensaje que culpe al usuario.

---

# 3. Patrones

Un patrón es una combinación de componentes que resuelve un problema recurrente. Los componentes se pueden mezclar; los patrones deciden en qué orden y con qué jerarquía.

---

## 3.1 Portada institucional

Secuencia canónica. El orden responde a la pregunta que el visitante trae en cada momento.

```
┌──────────────────────────────────────────┐
│ Encabezado transparente sobre el hero    │
├──────────────────────────────────────────┤
│ HERO   titular + una acción primaria     │  ¿Qué es esto?
├──────────────────────────────────────────┤
│ CIFRAS institucionales                   │  ¿Por qué debería confiar?
├──────────────────────────────────────────┤
│ DESTACADO editorial (ranking, noticia)   │  ¿Qué está pasando ahora?
├──────────────────────────────────────────┤
│ PARRILLA de programas                    │  ¿Qué puedo estudiar?
├──────────────────────────────────────────┤
│ TESTIMONIOS                              │  ¿A quién se parece esto?
├──────────────────────────────────────────┤
│ COMUNIDAD alumni + CTA                   │  ¿Qué gano después?
├──────────────────────────────────────────┤
│ ÚLTIMOS artículos de Newsmedia           │  ¿Producen ideas propias?
├──────────────────────────────────────────┤
│ Pie de página                            │
└──────────────────────────────────────────┘
```

**Reglas del patrón**

- Alternancia de fondo: blanco, `neutral-50`, blanco, azul de marca. Dos secciones sólidas de marca seguidas saturan la página.
- Una sola acción primaria por sección.
- Las cifras van inmediatamente después del hero: es el momento de mayor atención y el argumento más rápido de credibilidad.

---

## 3.2 Página de programa

Es la página que convierte. Su estructura responde a las objeciones en el orden en que surgen.

| Bloque | Contenido | Objeción que resuelve |
|---|---|---|
| Hero | Nombre, duración, modalidad, sede, CTA de informes | ¿Es para mí? |
| Resumen | Tres a cinco puntos de valor | ¿Qué me llevo? |
| Perfil del participante | A quién va dirigido, años de experiencia esperados | ¿Estoy en el nivel? |
| Plan de estudios | Acordeón por módulo | ¿Qué voy a ver? |
| Claustro | Tarjetas de profesores | ¿Quién lo imparte? |
| Metodología | Método del caso, sesiones, dinámica | ¿Cómo se estudia? |
| Logística | Fechas, sedes, horarios, inversión | ¿Me acomoda? |
| Testimonios | Egresados del mismo programa | ¿Le funcionó a alguien como yo? |
| Preguntas frecuentes | Acordeón | Dudas residuales |
| CTA final | Formulario de informes | Conversión |

**CTA persistente.** En desktop, una barra fija inferior con nombre del programa y botón de informes aparece al pasar el primer bloque. En móvil se reduce a un botón de ancho completo anclado al borde inferior, respetando el área segura.

---

## 3.3 Formulario de captación

El formulario más importante del sitio. Cada campo agregado reduce la conversión.

**Campos mínimos:** nombre, correo, teléfono, programa de interés, aviso de privacidad.

**Reglas**

- Una columna. Los formularios de dos columnas provocan errores de tabulación y saltos de lectura.
- Etiquetas arriba, siempre visibles.
- El consentimiento del aviso de privacidad es una casilla explícita, nunca premarcada, con enlace al aviso que abre en ventana nueva y lo anuncia.
- El botón dice la acción concreta: "Solicitar informes", no "Enviar".
- Al enviar: mensaje de éxito en la misma vista con `role="status"`, qué sigue y en cuánto tiempo. Redirigir a una página de gracias sin explicación desorienta.
- Si falla: el foco va al primer campo con error y se lista el resumen de errores arriba del formulario.

---

## 3.4 Listado de Newsmedia

- Rejilla de tres columnas en desktop, dos en tableta, una en móvil.
- Filtro por categoría en pestañas o etiquetas. El estado del filtro se refleja en la URL para que sea compartible.
- Paginación numerada. El pie debe seguir alcanzable.
- La imagen de tarjeta usa la proporción 585:295 que ya produce el CMS.

---

## 3.5 Artículo

- Contenedor de 760px para respetar la longitud de línea.
- Encabezado: categoría, título, autor, fecha, tiempo estimado de lectura.
- Índice flotante en desktop cuando el artículo supera cinco encabezados.
- Compartir por correo y LinkedIn, que es donde vive la audiencia directiva. No se ponen ocho botones de redes.
- Al final: tres artículos relacionados y una llamada a un programa afín, no genérica.

---

## 3.6 Ficha de profesor

Retrato en 3:4, área académica, semblanza, publicaciones, temas de interés y programas en los que imparte. Las publicaciones enlazan al directorio, no a PDFs sueltos.

---

## 3.7 Buscador

- Se abre como capa de pantalla completa desde el encabezado.
- El campo recibe el foco al abrir.
- Sugerencias por sección: programas, profesores, artículos, sedes.
- Resultado vacío con la estructura de estado vacío del punto 2.22.
- Cierra con `Escape` y devuelve el foco al ícono de búsqueda.

---

## 3.8 Multilingüe

- El selector ES/EN vive en el encabezado y en el pie.
- Cambiar de idioma conserva la página equivalente cuando existe; si no existe, lleva a la portada del otro idioma y lo advierte.
- `<html lang>` correcto en cada versión y `hreflang` recíproco entre pares de páginas.
- Los textos en inglés dentro de la versión en español se marcan con `lang="en"` para que el lector de pantalla los pronuncie bien. Esto aplica a "Faculty & Research" y a los nombres de programa en inglés.

---

## 3.9 Comportamiento responsivo

| Elemento | Móvil | Tableta | Escritorio |
|---|---|---|---|
| Navegación | Menú de pantalla completa | Menú de pantalla completa | Barra horizontal más menú ampliado |
| Parrilla de programas | 1 columna | 2 columnas | 3 columnas |
| Hero | Texto abajo, alto 420px | Alto 60vh | Alto hasta 700px |
| Cifras | 2 por fila | 3 por fila | 5 en línea |
| Testimonios | Apilado, retrato arriba | Apilado | Retrato a la izquierda |
| CTA de programa | Barra inferior fija | Barra inferior fija | Barra inferior fija con nombre |
| Tabla | Scroll horizontal | Scroll horizontal | Completa |

**Reglas transversales**

- Nada horizontal que no sea deliberado: `overflow-x: hidden` en `body` es un parche, no una solución. Se corrige el elemento que desborda.
- El objetivo táctil mínimo de 44px aplica también a los enlaces del pie.
- Se prueba a 360px de ancho y con el texto al 200% de escala.

---

# 4. Accesibilidad

Objetivo: **WCAG 2.2 nivel AA**. Es criterio de aceptación de cada componente, no una revisión posterior.

---

## 4.1 Contraste

| Elemento | Mínimo | Combinaciones validadas del sistema |
|---|---|---|
| Texto normal (< 24px) | 4.5:1 | `neutral-900` sobre blanco = 18.47:1 · `neutral-600` sobre blanco = 7.53:1 · `neutral-500` sobre blanco = 5.02:1 · `gold-800` sobre blanco = 5.04:1 |
| Texto grande (≥ 24px o ≥ 19px en negrita) | 3:1 | `navy-500` sobre blanco = 7.1:1 · `navy-400` sobre blanco = 4.04:1 |
| Componentes de interfaz y gráficos | 3:1 | `navy-700` sobre blanco = 13.34:1 · `gold-600` sobre blanco = 3.12:1 |
| Texto sobre azul de marca | 4.5:1 | blanco sobre `navy-700` = 13.34:1 · `navy-100` sobre `navy-900` = 13.87:1 · `gold-400` sobre `navy-900` = 9.3:1 |

**Combinaciones prohibidas**

- `gold-600` como texto pequeño sobre blanco (3.12:1). Use `gold-800`.
- `navy-400` como texto de cuerpo sobre blanco (4.04:1). Solo gráficos o texto de 24px o más.
- `neutral-400` como texto sobre blanco (2.55:1). Reservado a estado deshabilitado, exento del requisito, pero el motivo debe explicarse con texto.
- Texto sobre fotografía sin la cortina de contraste.

---

## 4.2 Teclado

- Todo lo que se puede hacer con el ratón se puede hacer con el teclado.
- El orden de tabulación sigue el orden visual. Si difiere, el problema está en el orden del DOM, no en `tabindex`.
- `tabindex` positivo está prohibido.
- Enlace de salto al contenido como primer elemento enfocable de la página.
- El foco es visible siempre: anillo de 2px con desplazamiento de 2px, contraste mínimo 3:1 contra el fondo adyacente.
- Componentes con trampa de foco deliberada: modal y menú de pantalla completa. Ambos devuelven el foco al disparador al cerrar.

**Atajos esperados**

| Tecla | Comportamiento |
|---|---|
| `Tab` / `Shift+Tab` | Avanzar y retroceder |
| `Enter` | Activar enlace o botón |
| `Espacio` | Activar botón, marcar casilla |
| `Escape` | Cerrar modal, menú, buscador |
| `Flechas` | Moverse entre pestañas y entre opciones de un grupo de radio |
| `Home` / `End` | Primera y última pestaña |

---

## 4.3 Semántica

- Un solo `<h1>` por página, que coincide con el tema de la página.
- Jerarquía sin saltos. El estilo visual se controla con clases, no eligiendo el nivel de encabezado por su tamaño.
- Puntos de referencia: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. Si hay dos `<nav>`, cada uno lleva `aria-label`.
- Listas reales para colecciones reales.
- ARIA solo cuando el HTML nativo no alcanza. Un `<button>` bien usado no necesita `role="button"`.

---

## 4.4 Imágenes y multimedia

- `alt` descriptivo por función. Imagen decorativa con `alt=""`.
- El texto alternativo del logotipo en el encabezado es "IPADE Business School"; en el pie, si se repite, va `alt=""` para no duplicar el anuncio.
- Los videos llevan subtítulos. Los testimonios en video llevan además transcripción.
- Nada con autoplay y sonido.
- No se transmite información solo en imagen: las cifras del hero y los datos de los infogramas también viven en texto.

---

## 4.5 Formularios

- Toda etiqueta asociada con `for` e `id`. `aria-label` solo cuando la etiqueta visible es imposible.
- Los errores se identifican con texto, color e ícono, y se vinculan con `aria-describedby`.
- El resumen de errores al inicio del formulario enlaza a cada campo afectado.
- Los grupos de opciones van en `<fieldset>` con `<legend>`.
- `autocomplete` con los valores estándar: `name`, `email`, `tel`, `organization`.
- Nada de límites de tiempo para completar un formulario.

---

## 4.6 Movimiento y sensorial

- `prefers-reduced-motion` desactiva parallax, autoplay de carrusel, conteo animado y shimmer.
- Nada parpadea más de tres veces por segundo.
- El carrusel de testimonios tiene controles de pausa, anterior y siguiente. No avanza solo sin control visible.

---

## 4.7 Zoom y adaptación

- El contenido funciona al 200% de zoom sin scroll horizontal, y al 400% en 320px de ancho reflujando a una columna.
- Se usan unidades relativas para tipografía. Nada de `px` fijos en tamaños de texto de cuerpo.
- El texto se puede espaciar (interlineado 1.5, entre letras 0.12em, entre palabras 0.16em) sin perder contenido.

---

## 4.8 Lista de verificación previa a publicar

**Diseño**

- [ ] Toda combinación de color pasa el contraste requerido
- [ ] El estado no depende solo del color
- [ ] Los objetivos táctiles miden al menos 44×44px
- [ ] Se diseñaron los estados vacío, de carga y de error
- [ ] Se revisó a 360px y a 1440px

**Código**

- [ ] Solo se consumen tokens semánticos, sin valores literales
- [ ] Jerarquía de encabezados correcta y sin saltos
- [ ] Navegación completa con teclado, con foco visible
- [ ] Recorrido con lector de pantalla (NVDA o VoiceOver) sin bloqueos
- [ ] Imágenes con `alt`, `width`, `height` y `loading` correctos
- [ ] `prefers-reduced-motion` respetado
- [ ] Sin `outline: none` sin reemplazo
- [ ] Sin `tabindex` positivo
- [ ] `lang` correcto, incluidos los fragmentos en otro idioma

**Rendimiento**

- [ ] LCP por debajo de 2.5s
- [ ] CLS por debajo de 0.1
- [ ] INP por debajo de 200ms
- [ ] Imágenes en WebP con dimensiones declaradas
- [ ] Fuentes con `font-display: swap` y precarga de la variante crítica

**Contenido**

- [ ] Títulos y botones dicen la acción concreta
- [ ] Sin jerga institucional donde cabe una palabra común
- [ ] Aviso de privacidad enlazado en todo formulario
- [ ] Fechas en formato largo y sin ambigüedad

---

# 5. Contenido, voz y gobierno

---

## 5.1 Voz de marca

Cuatro atributos, cada uno con su límite.

| Atributo | Sí suena así | No suena así |
|---|---|---|
| **Con autoridad** | "El método del caso se usa en todos los programas desde 1967." | "Somos la mejor escuela de negocios del país." |
| **Cercano** | "Le enviamos el temario y las fechas por correo." | "Se procederá al envío de la documentación correspondiente." |
| **Preciso** | "Nueve módulos, 18 meses, sesiones cada 15 días." | "Un programa integral de amplio alcance." |
| **Humanista** | "Cada participante llega con una empresa concreta y un problema real." | "Optimizamos el capital humano de las organizaciones." |

---

## 5.2 Reglas de redacción de interfaz

**Botones.** Verbo en infinitivo más objeto: "Solicitar informes", "Descargar el plan de estudios", "Guardar cambios". Nunca "Enviar", "Aceptar", "Clic aquí".

**Consistencia de la acción.** El botón que dice "Solicitar informes" produce un mensaje que dice "Solicitud enviada". El vocabulario no cambia a la mitad del flujo.

**Títulos.** Mayúscula solo inicial y en nombres propios. Sin punto final.

**Errores.** Explican qué pasó y cómo salir, en la voz de la interfaz, sin disculparse ni culpar.

> No se pudo enviar la solicitud. Revise su conexión e intente de nuevo.

En vez de:

> Lo sentimos mucho, ha ocurrido un error inesperado.

**Estados vacíos.** Son una invitación a actuar, no un aviso de fracaso.

**Cifras.** Separador de miles con coma en español de México (22,000). Los porcentajes con el símbolo pegado (85%). Las fechas en formato largo: 19 de agosto de 2026.

**Jerga.** "VUCA", "lifelong learning" y demás términos del sector se explican la primera vez que aparecen o se sustituyen. La audiencia es directiva, no académica.

**Inclusión.** Se evita el desdoblamiento constante ("los directores y las directoras") en favor de fórmulas colectivas ("la dirección", "quienes dirigen"), que se leen mejor y no excluyen.

---

## 5.3 Arquitectura de archivos

```
ipade-design-system/
├── README.md                       punto de entrada
├── DESIGN-SYSTEM.md                documento maestro consolidado
├── build/                          scripts que regeneran el maestro y el HTML
├── docs/
│   ├── 01-fundamentos.md
│   ├── 02-componentes.md
│   ├── 03-patrones.md
│   ├── 04-accesibilidad.md
│   └── 05-contenido-y-gobierno.md
├── tokens/
│   ├── tokens.css                  primitivos y semánticos
│   ├── base.css                    reset, tipografía, layout
│   ├── components.css              componentes
│   ├── tokens.json                 formato de intercambio
│   └── tailwind.preset.js          preset de Tailwind
├── html/
│   ├── index.html                  portada de la documentación
│   ├── 01-fundamentos.html         copia navegable
│   ├── 02-componentes.html
│   ├── 03-patrones.html
│   ├── 04-accesibilidad.html
│   ├── 05-contenido-y-gobierno.html
│   ├── showcase.html               componentes renderizados en vivo
│   └── assets/ds.css               estilos de la documentación
└── .claude/
    └── commands/goal.md            comando /goal para Claude Code
```

---

## 5.4 Convenciones de nombres

**Tokens CSS:** `--ipd-{categoría}-{rol}-{escala}`

```
--ipd-color-navy-700      primitivo
--ipd-bg-brand            semántico
--ipd-btn-primary-bg      componente
```

**Clases:** BEM con prefijo `ipd-`.

```
.ipd-card                bloque
.ipd-card__title         elemento
.ipd-card--interactive   modificador
```

**Prohibido en componentes**

- Valores hexadecimales literales
- Píxeles fuera de la escala de espaciado
- `!important` salvo en utilidades declaradas como tales
- `z-index` numérico fuera de la escala de capas

---

## 5.5 Cómo agregar un componente

1. **Verificar que no existe.** La mayoría de las peticiones son una variante de algo que ya está.
2. **Justificar.** Se documenta el problema que resuelve y dónde aparece al menos dos veces.
3. **Diseñar los estados completos** antes de escribir código: reposo, hover, foco, activo, deshabilitado, cargando, error, vacío.
4. **Construir solo con tokens.**
5. **Documentar** en `02-componentes.md` con la misma estructura de ficha.
6. **Revisar accesibilidad** con la lista del punto 4.8.
7. **Publicar** con nota en el registro de cambios.

---

## 5.6 Versionado

Versionado semántico.

- **Mayor:** cambio que rompe. Se renombra o elimina un token o una clase.
- **Menor:** se agrega un componente, variante o token.
- **Parche:** corrección visual, ajuste de contraste, arreglo de documentación.

Un token que se elimina se marca primero como obsoleto durante una versión menor, con la sustitución indicada en la propia declaración.

```css
/* obsoleto desde 1.2.0 · usar --ipd-bg-brand-subtle */
--ipd-bg-light-blue: var(--ipd-bg-brand-subtle);
```

---

## 5.7 Deuda conocida

Puntos que este documento resuelve con una decisión provisional y deben validarse contra fuentes oficiales.

| Punto | Estado | Acción |
|---|---|---|
| Valores hexadecimales de marca | Reconstruidos por inspección del sitio público | Contrastar con el manual de identidad y sustituir en `tokens.css` |
| Familias tipográficas | Propuesta funcional con fallbacks de métrica similar | Sustituir por las licenciadas por la institución |
| Sistema de íconos | Especificado por reglas, sin biblioteca definida | Elegir biblioteca o encargar set propio de 24×24 |
| Escudo institucional | Sin reglas de uso mínimo ni área de respeto | Documentar tamaños mínimos y usos permitidos |
| Componentes de campaña | Fuera de alcance de la versión 1.0 | Definir en 1.1 con el equipo de marketing |

Sustituir los hexadecimales de `tokens.css` por los oficiales no rompe nada: los componentes solo consumen tokens semánticos.

---

## 5.8 Registro de cambios

**1.0.0**

- Sistema inicial. Fundamentos, 22 componentes, 9 patrones, criterios de accesibilidad AA, guía de contenido y gobierno.
- Tokens en CSS, JSON y preset de Tailwind.
- Documentación en Markdown con copias navegables en HTML.

---

# /goal

Directiva operativa del sistema. Todo lo anterior describe el sistema; esta sección dice qué hacer con él.

---

## Objetivo

Que cualquier persona o agente que construya una interfaz para IPADE produzca un resultado indistinguible del resto del ecosistema digital, sin consultar a nadie y sin inventar valores.

**Medida de éxito:** una pantalla nueva pasa la lista de verificación del punto 4.8 en la primera revisión, y no introduce ni un solo valor de color, tamaño o espacio fuera de los tokens.

---

## Contrato para el agente

Al trabajar en este repositorio:

1. **Leer `tokens/tokens.css` antes de escribir CSS.** Si un valor no está ahí, no se usa. Si hace falta, se propone como token nuevo, no se escribe en línea.
2. **Consumir solo tokens semánticos** en componentes (`--ipd-bg-brand`), nunca primitivos (`--ipd-color-navy-700`).
3. **Nombrar con BEM y prefijo `ipd-`.**
4. **Diseñar los ocho estados** de cualquier componente interactivo: reposo, hover, foco, activo, deshabilitado, cargando, error, vacío. Un componente con menos estados está incompleto.
5. **Cumplir WCAG 2.2 AA** como criterio de aceptación, verificado con la lista del punto 4.8.
6. **Una acción primaria por sección.**
7. **Móvil primero**, con piso de diseño en 360px.
8. **Documentar todo componente nuevo** en `docs/02-componentes.md` con la misma estructura de ficha.
9. **No introducir dependencias** de interfaz sin justificarlo. El sistema es CSS y HTML; el JavaScript se limita a comportamiento, no a estilo.
10. **Si una petición contradice el sistema**, señalarlo, proponer la alternativa que sí lo cumple y esperar decisión. No resolverlo en silencio.

---

## Orden de precedencia ante conflictos

```
1. Accesibilidad (WCAG 2.2 AA)
2. Claridad para el usuario
3. Consistencia con el sistema
4. Preferencia estética individual
```

Una preferencia estética nunca gana sobre accesibilidad. Si chocan, gana el nivel más alto y se documenta la excepción.

---

## Cómo usar este paquete en Claude Code

```bash
# 1. Colocar el sistema en la raíz del proyecto
cp -r ipade-design-system/ ./

# 2. Referenciarlo desde CLAUDE.md
```

En el `CLAUDE.md` del proyecto:

```markdown
## Design system

Este proyecto usa el IPADE Design System v1.0.0.

Antes de escribir cualquier UI:
- Leer `ipade-design-system/DESIGN-SYSTEM.md`
- Consumir los tokens de `ipade-design-system/tokens/tokens.css`
- Cumplir el contrato de la sección `/goal`

No introducir valores de color, tipografía o espaciado fuera de los tokens.
```

El comando `/goal` queda disponible en `.claude/commands/goal.md` y devuelve este contrato en cualquier momento de la sesión.

---

## Alcance de la versión 1.0.0

**Incluye:** fundamentos, 22 componentes, 9 patrones, criterios de accesibilidad, guía de contenido, tokens en tres formatos.

**No incluye todavía:** biblioteca de íconos definitiva, componentes de campaña, reglas de uso del escudo institucional, plantillas de correo, componentes de la intranet.

**Antes de producción:** validar los hexadecimales y las familias tipográficas contra el manual de identidad oficial y sustituirlos en `tokens/tokens.css`. Es una edición en un archivo; ningún componente se ve afectado porque ninguno referencia valores literales.
