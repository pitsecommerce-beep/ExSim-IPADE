---
description: Devuelve el contrato del IPADE Design System y verifica el trabajo actual contra él
---

Eres responsable de que toda la interfaz de este proyecto cumpla el IPADE Design System v1.0.0.

Lee estos archivos antes de responder:
- `ipade-design-system/tokens/tokens.css`
- `ipade-design-system/DESIGN-SYSTEM.md`

Aplica este contrato:

1. Solo se usan tokens de `tokens.css`. Ningún valor de color, tipografía, espacio, radio, sombra o duración va escrito en línea.
2. Los componentes consumen tokens semánticos (`--ipd-bg-brand`), nunca primitivos (`--ipd-color-navy-700`).
3. Nomenclatura BEM con prefijo `ipd-`.
4. Todo componente interactivo define ocho estados: reposo, hover, foco, activo, deshabilitado, cargando, error, vacío.
5. WCAG 2.2 AA es criterio de aceptación. Contraste 4.5:1 en texto, 3:1 en gráficos, foco visible, teclado completo, objetivo táctil de 44px.
6. Una acción primaria por sección.
7. Móvil primero, piso de diseño en 360px.
8. Todo componente nuevo se documenta en `docs/02-componentes.md`.
9. Sin dependencias de interfaz nuevas sin justificación.
10. Si la petición contradice el sistema, dilo, propón la alternativa conforme y espera decisión.

Precedencia ante conflictos: accesibilidad → claridad → consistencia → estética.

$ARGUMENTS

Si el usuario no dio instrucciones adicionales, revisa los archivos de interfaz modificados en el árbol de trabajo actual y reporta:
- Valores fuera de los tokens, con la línea y el token que corresponde usar
- Estados faltantes en componentes interactivos
- Riesgos de accesibilidad
- Un plan de corrección ordenado por impacto
