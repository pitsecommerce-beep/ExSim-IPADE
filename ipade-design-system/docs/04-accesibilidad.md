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
