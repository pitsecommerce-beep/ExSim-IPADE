#!/usr/bin/env python3
"""Genera las copias HTML de la documentación."""
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUT = ROOT / "html"

PAGES = [
    ("index.html", None, "Portada", "Índice general"),
    ("01-fundamentos.html", "01-fundamentos.md", "Fundamentos", "Color, tipografía, espacio, rejilla"),
    ("02-componentes.html", "02-componentes.md", "Componentes", "22 fichas con estados y marcado"),
    ("03-patrones.html", "03-patrones.md", "Patrones", "Plantillas y flujos"),
    ("04-accesibilidad.html", "04-accesibilidad.md", "Accesibilidad", "WCAG 2.2 AA"),
    ("05-contenido-y-gobierno.html", "05-contenido-y-gobierno.md", "Contenido y gobierno", "Voz, versionado, deuda"),
    ("showcase.html", None, "Showcase", "Componentes en vivo"),
    ("99-goal.html", "99-goal.md", "/goal", "Contrato operativo"),
]

SIDEBAR_GROUPS = [
    ("Inicio", ["index.html"]),
    ("Documentación", [
        "01-fundamentos.html", "02-componentes.html", "03-patrones.html",
        "04-accesibilidad.html", "05-contenido-y-gobierno.html",
    ]),
    ("Referencia", ["showcase.html", "99-goal.html"]),
]

TITLES = {f: t for f, _, t, _ in PAGES}
DESCS = {f: d for f, _, _, d in PAGES}
ORDER = [f for f, _, _, _ in PAGES]


def sidebar(current: str) -> str:
    out = [
        '<aside class="ds-sidebar">',
        '  <a class="ds-brand" href="index.html">',
        '    <span class="ds-brand__mark">IPADE</span>',
        '    <span class="ds-brand__sub">Design System</span>',
        '    <span class="ds-brand__version">v1.0.0</span>',
        "  </a>",
        '  <nav class="ds-nav" aria-label="Secciones de la documentación">',
    ]
    for heading, files in SIDEBAR_GROUPS:
        out.append(f'    <p class="ds-nav__heading">{heading}</p>')
        for f in files:
            aria = ' aria-current="page"' if f == current else ""
            out.append(f'    <a href="{f}"{aria}>{TITLES[f]}</a>')
    out += ["  </nav>", "</aside>"]
    return "\n".join(out)


def pager(current: str) -> str:
    i = ORDER.index(current)
    prev_f = ORDER[i - 1] if i > 0 else None
    next_f = ORDER[i + 1] if i < len(ORDER) - 1 else None
    parts = ['<nav class="ds-pager" aria-label="Paginación de la documentación">']
    if prev_f:
        parts.append(f'  <a href="{prev_f}"><small>Anterior</small><span>{TITLES[prev_f]}</span></a>')
    if next_f:
        parts.append(f'  <a class="ds-pager__next" href="{next_f}"><small>Siguiente</small><span>{TITLES[next_f]}</span></a>')
    parts.append("</nav>")
    return "\n".join(parts)


def shell(current: str, body: str) -> str:
    title = TITLES[current]
    desc = DESCS[current]
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title} · IPADE Design System</title>
<meta name="description" content="{desc} — IPADE Business School Design System v1.0.0" />
<link rel="stylesheet" href="../tokens/tokens.css" />
<link rel="stylesheet" href="../tokens/base.css" />
<link rel="stylesheet" href="../tokens/components.css" />
<link rel="stylesheet" href="assets/ds.css" />
</head>
<body>
<a class="ipd-skip-link" href="#contenido">Ir al contenido</a>
<div class="ds-layout">
{sidebar(current)}
<main class="ds-main" id="contenido">
  <div class="ds-topbar">
    <span class="ds-topbar__crumb">IPADE Design System</span>
    <span>{title}</span>
  </div>
  <div class="ds-content">
{body}
  </div>
  {pager(current)}
  <p class="ds-footnote">
    IPADE Business School Design System v1.0.0. Los valores de color y tipografía se
    reconstruyeron por inspección del sitio público y deben validarse contra el manual
    de identidad oficial antes de producción.
  </p>
</main>
</div>
</body>
</html>
"""


def convert(md_name: str) -> str:
    raw = (DOCS / md_name).read_text(encoding="utf-8")
    html = markdown.markdown(
        raw,
        extensions=["tables", "fenced_code", "attr_list", "toc", "sane_lists"],
        extension_configs={"toc": {"permalink": False}},
    )
    # anclas estables para los encabezados
    return html


def main() -> None:
    for filename, md_name, _, _ in PAGES:
        if md_name is None:
            continue
        (OUT / filename).write_text(shell(filename, convert(md_name)), encoding="utf-8")
        print("escrito", filename)


if __name__ == "__main__":
    main()
