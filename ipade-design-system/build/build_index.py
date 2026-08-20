#!/usr/bin/env python3
"""Genera html/index.html con la paleta y sus contrastes calculados en tiempo de build."""
from pathlib import Path

from build_html import shell, OUT

PALETTES = [
    ("Azul institucional", "El color ancla de la marca. Sostiene fondos de sección, encabezados y la acción primaria.", [
        ("navy-950", "#00152B"), ("navy-900", "#001F3D"), ("navy-800", "#00284E"),
        ("navy-700", "#00305B"), ("navy-600", "#14487A"), ("navy-500", "#1E5A96"),
        ("navy-400", "#4C82B8"), ("navy-300", "#8AAFD3"), ("navy-200", "#C0D6E9"),
        ("navy-100", "#E1ECF5"), ("navy-50", "#F0F6FB"),
    ]),
    ("Oro académico", "Acento y señalamiento. Nunca fondo de bloques grandes ni texto de párrafo.", [
        ("gold-900", "#6B5219"), ("gold-800", "#8A6A24"), ("gold-700", "#9C7A2C"),
        ("gold-600", "#B08D3F"), ("gold-500", "#C6A65C"), ("gold-400", "#D9BF86"),
        ("gold-300", "#E9DDBF"), ("gold-200", "#F3EDDC"), ("gold-100", "#FAF7EF"),
    ]),
    ("Neutrales", "Grises fríos. Un gris cálido junto a este azul se ve sucio.", [
        ("neutral-900", "#10141A"), ("neutral-800", "#20252C"), ("neutral-700", "#343B45"),
        ("neutral-600", "#4D5561"), ("neutral-500", "#66707E"), ("neutral-400", "#9AA3B0"),
        ("neutral-300", "#C2C8D1"), ("neutral-200", "#DDE1E7"), ("neutral-100", "#EFF1F4"),
        ("neutral-50", "#F7F8FA"), ("neutral-0", "#FFFFFF"),
    ]),
    ("Estado", "El color nunca es el único portador del significado: todo estado lleva ícono y texto.", [
        ("success-600", "#1E7A46"), ("warning-600", "#A96206"),
        ("danger-600", "#B3261E"), ("info-600", "#1E5A96"),
    ]),
]


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    channels = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a: str, b: str) -> float:
    l1, l2 = sorted((luminance(a), luminance(b)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def swatch(name: str, hex_color: str) -> str:
    r = ratio(hex_color, "#FFFFFF")
    if r >= 4.5:
        badge, label = "aa", f"AA · {r:.2f}:1"
    elif r >= 3:
        badge, label = "large", f"Solo grande · {r:.2f}:1"
    else:
        badge, label = "fail", f"No texto · {r:.2f}:1"
    border = ' style="border-bottom:1px solid var(--ipd-border-subtle)"' if hex_color.upper() == "#FFFFFF" else ""
    return f"""      <div class="ds-swatch">
        <div class="ds-swatch__chip" style="background:{hex_color}"{border}></div>
        <div class="ds-swatch__meta">
          <p class="ds-swatch__name">{name}</p>
          <p class="ds-swatch__hex">{hex_color}</p>
          <span class="ds-swatch__ratio" data-pass="{badge}">{label}</span>
        </div>
      </div>"""


def palette_block(title: str, note: str, colors) -> str:
    chips = "\n".join(swatch(n, h) for n, h in colors)
    return f"""    <h3>{title}</h3>
    <p>{note}</p>
    <div class="ds-swatches">
{chips}
    </div>"""


BODY = """<h1>IPADE Business School<br />Design System</h1>

<p class="ipd-lead">Sistema de diseño para el ecosistema digital de IPADE. Documenta cada elemento
gráfico, su razón de ser, sus estados y sus reglas de uso, de manera que cualquier persona o
agente pueda construir una interfaz nueva sin consultar a nadie y sin inventar valores.</p>

<blockquote>
<p><strong>Antes de producción.</strong> Los hexadecimales y las familias tipográficas se
reconstruyeron por inspección del sitio público, porque el manual de identidad no es de acceso
abierto. Sustitúyalos en <code>tokens/tokens.css</code> por los oficiales. Ningún componente se
ve afectado, porque todos consumen tokens semánticos y no valores literales.</p>
</blockquote>

<h2 id="que-contiene">Qué contiene</h2>

<table>
<thead><tr><th>Sección</th><th>Contenido</th></tr></thead>
<tbody>
<tr><td><a href="01-fundamentos.html">1. Fundamentos</a></td><td>Principios, color, tipografía, espaciado, rejilla, elevación, iconografía, imagen y movimiento</td></tr>
<tr><td><a href="02-componentes.html">2. Componentes</a></td><td>22 fichas con anatomía, variantes, estados, marcado de referencia y accesibilidad</td></tr>
<tr><td><a href="03-patrones.html">3. Patrones</a></td><td>Portada, página de programa, captación, listados, artículo, buscador, multilingüe y responsivo</td></tr>
<tr><td><a href="04-accesibilidad.html">4. Accesibilidad</a></td><td>WCAG 2.2 AA, contraste, teclado, semántica y listas de verificación</td></tr>
<tr><td><a href="05-contenido-y-gobierno.html">5. Contenido y gobierno</a></td><td>Voz de marca, redacción de interfaz, arquitectura de archivos, versionado y deuda conocida</td></tr>
<tr><td><a href="showcase.html">Showcase</a></td><td>Los componentes renderizados en vivo, no solo descritos</td></tr>
<tr><td><a href="99-goal.html">/goal</a></td><td>Contrato operativo para el equipo y para los agentes</td></tr>
</tbody>
</table>

<h2 id="paleta">Paleta completa</h2>

<p>Cada muestra indica su contraste real contra blanco y si cumple WCAG 2.2 AA. Los valores se
calculan al construir esta página, así que no pueden desviarse de los tokens.</p>

{palettes}

<h2 id="escala-tipografica">Escala tipográfica</h2>

<div class="ds-demo">
  <p class="ds-demo__label">Escala fluida · Source Serif 4 en display, Inter en texto</p>
  <div class="ds-demo__stage ds-demo__stage--plain">
    <p class="ipd-display-1" style="margin-bottom:.4em">Mejores líderes</p>
    <p class="ipd-h1" style="margin-bottom:.4em">Titular de página</p>
    <p class="ipd-h2" style="margin-bottom:.4em">Encabezado de sección</p>
    <p class="ipd-h3" style="margin-bottom:.6em">Encabezado de bloque</p>
    <p class="ipd-lead" style="margin-bottom:.6em">Entradilla en 18px con color secundario, para el primer párrafo de una sección.</p>
    <p class="ipd-body" style="margin-bottom:.6em">Cuerpo de texto en 16px con interlineado 1.65, la medida que sostiene la lectura larga sin fatigar.</p>
    <p class="ipd-caption" style="margin-bottom:.8em">Pie de foto en 13px con color terciario.</p>
    <p class="ipd-eyebrow">Rótulo de sección</p>
  </div>
</div>

<h2 id="instalacion">Instalación</h2>

<pre><code>&lt;link rel="stylesheet" href="tokens/tokens.css" /&gt;
&lt;link rel="stylesheet" href="tokens/base.css" /&gt;
&lt;link rel="stylesheet" href="tokens/components.css" /&gt;</code></pre>

<p>El orden importa: <code>tokens</code> define las variables, <code>base</code> las aplica a los
elementos HTML, <code>components</code> construye sobre ambos.</p>

<h2 id="claude-code">Uso en Claude Code</h2>

<p>Copie la carpeta a la raíz del proyecto y agregue esto a su <code>CLAUDE.md</code>:</p>

<pre><code>## Design system

Este proyecto usa el IPADE Design System v1.0.0.

Antes de escribir cualquier UI:
- Leer `ipade-design-system/DESIGN-SYSTEM.md`
- Consumir los tokens de `ipade-design-system/tokens/tokens.css`
- Cumplir el contrato de la seccion `/goal`

No introducir valores de color, tipografia o espaciado fuera de los tokens.</code></pre>

<p>El comando <code>/goal</code> queda disponible en <code>.claude/commands/goal.md</code> y audita
el trabajo contra el sistema en cualquier momento de la sesión.</p>
"""


def main() -> None:
    palettes = "\n\n".join(palette_block(t, n, c) for t, n, c in PALETTES)
    body = BODY.replace("{palettes}", palettes)
    (OUT / "index.html").write_text(shell("index.html", body), encoding="utf-8")
    print("escrito index.html")


if __name__ == "__main__":
    main()
