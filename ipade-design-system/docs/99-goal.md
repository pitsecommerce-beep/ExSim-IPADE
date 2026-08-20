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
