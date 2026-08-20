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
