#!/usr/bin/env python3
"""Consolida los docs por tema en DESIGN-SYSTEM.md con índice."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"

ORDER = [
    "01-fundamentos.md",
    "02-componentes.md",
    "03-patrones.md",
    "04-accesibilidad.md",
    "05-contenido-y-gobierno.md",
    "99-goal.md",
]

HEADER = """# IPADE Business School · Design System

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

{toc}

---

"""


def slugify(text: str) -> str:
    text = text.strip().lower()
    for a, b in zip("áéíóúüñ", "aeiouun"):
        text = text.replace(a, b)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    return re.sub(r"\s+", "-", text).strip("-")


def main() -> None:
    bodies, toc_lines = [], []
    for name in ORDER:
        raw = (DOCS / name).read_text(encoding="utf-8").rstrip()
        bodies.append(raw)
        in_fence = False
        for line in raw.splitlines():
            if line.lstrip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            m = re.match(r"^(#{1,2})\s+(.*)$", line)
            if not m:
                continue
            level, title = len(m.group(1)), m.group(2).strip()
            indent = "  " * (level - 1)
            toc_lines.append(f"{indent}- [{title}](#{slugify(title)})")

    master = HEADER.format(toc="\n".join(toc_lines)) + "\n\n---\n\n".join(bodies) + "\n"
    (ROOT / "DESIGN-SYSTEM.md").write_text(master, encoding="utf-8")
    words = len(master.split())
    print(f"DESIGN-SYSTEM.md · {len(master):,} caracteres · ~{words:,} palabras")


if __name__ == "__main__":
    main()
