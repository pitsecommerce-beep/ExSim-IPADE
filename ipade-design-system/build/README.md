# Scripts de construcción

Regeneran el documento maestro y las copias HTML a partir de los Markdown de `docs/`.

```bash
pip install markdown
python3 build/build_master.py     # docs/*.md  → DESIGN-SYSTEM.md
python3 build/build_html.py       # docs/*.md  → html/*.html
python3 build/build_index.py      # portada con paleta y contrastes calculados
python3 build/build_showcase.py   # componentes renderizados en vivo
```

Los scripts asumen la ruta `/home/claude/ipade-design-system`. Ajuste la constante
`ROOT` en `build_master.py` y `OUT` en `build_html.py` si mueve el paquete.

La fuente de verdad es `docs/`. Editar el HTML a mano se pierde en la siguiente
construcción.
