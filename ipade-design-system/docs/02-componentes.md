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
