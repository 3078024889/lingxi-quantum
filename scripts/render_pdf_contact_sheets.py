from __future__ import annotations

import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "output" / "pdf"
OUT_DIR = PDF_DIR / "contact-sheets"
TMP_DIR = ROOT / "tmp" / "v323-pdf-pages"
PDFTOPPM = Path(r"C:\Users\30780\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe")

OUT_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR.mkdir(parents=True, exist_ok=True)

thumb_w, thumb_h = 238, 337
gap, label_h, columns = 14, 28, 4

for pdf in sorted(PDF_DIR.glob("v323-*-qa.pdf")):
    render_dir = TMP_DIR / pdf.stem
    render_dir.mkdir(parents=True, exist_ok=True)
    prefix = render_dir / "page"
    subprocess.run([str(PDFTOPPM), "-png", "-r", "72", str(pdf), str(prefix)], check=True)
    page_files = sorted(render_dir.glob("page-*.png"))
    if not page_files:
        raise RuntimeError(f"No pages rendered for {pdf.name}")
    rows = math.ceil(len(page_files) / columns)
    sheet = Image.new("RGB", (columns * thumb_w + (columns + 1) * gap, rows * (thumb_h + label_h) + (rows + 1) * gap), "#11172d")
    draw = ImageDraw.Draw(sheet)
    for index, page_file in enumerate(page_files):
        with Image.open(page_file) as source:
            thumb = source.convert("RGB")
            thumb.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        col, row = index % columns, index // columns
        x = gap + col * (thumb_w + gap)
        y = gap + row * (thumb_h + label_h + gap)
        sheet.paste(thumb, (x + (thumb_w - thumb.width) // 2, y))
        draw.text((x + 6, y + thumb_h + 7), f"PAGE {index + 1:02d}", fill="#bff8ec", font=ImageFont.load_default())
    sheet.save(OUT_DIR / f"{pdf.stem}-contact-sheet.png", optimize=True)

print(f"PASS V323 contact sheets: {len(list(OUT_DIR.glob('v323-*-contact-sheet.png')))}")
