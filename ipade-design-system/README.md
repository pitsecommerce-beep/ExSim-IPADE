# IPADE Business School · Design System

**Versión 1.0.0** · Derivado del lenguaje visual de [ipade.mx](https://www.ipade.mx/)

Sistema de diseño documentado para el ecosistema digital de IPADE Business School: fundamentos, componentes, patrones, accesibilidad, contenido y gobierno.

---

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `DESIGN-SYSTEM.md` | **Documento maestro.** Todo el sistema en un solo archivo. Este es el que se carga en un proyecto de Claude Code. |
| `docs/` | El mismo contenido dividido por tema, para lectura y edición |
| `html/index.html` | Documentación navegable en el navegador |
| `html/showcase.html` | Componentes renderizados en vivo, no solo descritos |
| `tokens/tokens.css` | Variables CSS: primitivos y semánticos |
| `tokens/base.css` | Reset, tipografía, rejilla y utilidades |
| `tokens/components.css` | Los 22 componentes implementados |
| `tokens/tokens.json` | Tokens en formato de intercambio, para Figma y herramientas |
| `tokens/tailwind.preset.js` | Preset de Tailwind con los mismos valores |
| `.claude/commands/goal.md` | Comando `/goal` para Claude Code |

---

## Uso en un proyecto web

```html
<link rel="stylesheet" href="tokens/tokens.css" />
<link rel="stylesheet" href="tokens/base.css" />
<link rel="stylesheet" href="tokens/components.css" />
```

El orden importa: `tokens` define las variables, `base` las aplica a los elementos HTML, `components` construye sobre ambos.

Con Tailwind:

```js
// tailwind.config.js
module.exports = {
  presets: [require('./ipade-design-system/tokens/tailwind.preset.js')],
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
};
```

---

## Uso en Claude Code

1. Copie la carpeta a la raíz del proyecto.
2. Agregue esto a su `CLAUDE.md`:

```markdown
## Design system

Este proyecto usa el IPADE Design System v1.0.0.

Antes de escribir cualquier UI:
- Leer `ipade-design-system/DESIGN-SYSTEM.md`
- Consumir los tokens de `ipade-design-system/tokens/tokens.css`
- Cumplir el contrato de la sección `/goal`

No introducir valores de color, tipografía o espaciado fuera de los tokens.
```

3. Use `/goal` en cualquier momento para que el agente audite el trabajo contra el sistema.

---

## Advertencia sobre los valores de marca

Los hexadecimales y las familias tipográficas se reconstruyeron por inspección del sitio público, porque el manual de identidad de IPADE no es de acceso abierto. **Antes de producción, sustitúyalos en `tokens/tokens.css` por los oficiales.**

Ese cambio no rompe nada: los componentes consumen tokens semánticos, no valores literales. Es una edición en un solo archivo.

La estructura, las reglas, la accesibilidad y los patrones sí son válidos tal cual.

---

## Índice del documento maestro

1. Fundamentos: principios, color, tipografía, espaciado, rejilla, elevación, iconografía, imagen, movimiento
2. Componentes: 22 fichas con anatomía, variantes, estados, marcado y accesibilidad
3. Patrones: portada, página de programa, captación, listados, artículo, buscador, multilingüe, responsivo
4. Accesibilidad: WCAG 2.2 AA, contraste, teclado, semántica, listas de verificación
5. Contenido y gobierno: voz, redacción de interfaz, arquitectura de archivos, versionado, deuda conocida
6. `/goal`: contrato operativo
