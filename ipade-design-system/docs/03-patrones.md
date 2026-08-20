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
