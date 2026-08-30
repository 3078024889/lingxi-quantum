from __future__ import annotations

import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "outputs" / "v333-life-archetype-v6-qa.pdf"
PAGES = ROOT / "tmp" / "pdfs" / "v333-archetype"
OUTPUT = ROOT / "tmp" / "pdfs" / "v333-life-archetype-contact-sheet.png"
PDFTOPPM = Path(r"C:\Users\30780\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe")

PAGES.mkdir(parents=True, exist_ok=True)
if len(list(PAGES.glob("page-*.png"))) != 25:
    subprocess.run([str(PDFTOPPM), "-png", "-r", "72", str(PDF), str(PAGES / "page")], check=True)
page_files = sorted(PAGES.glob("page-*.png"))
if len(page_files) != 25:
    raise RuntimeError(f"Expected 25 pages, found {len(page_files)}")

thumb_w, thumb_h, gap, label_h, columns = 190, 269, 12, 24, 5
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
    draw.text((x + 5, y + thumb_h + 5), f"PAGE {index + 1:02d}", fill="#bff8ec", font=ImageFont.load_default())
sheet.save(OUTPUT, optimize=True)
print(f"PASS V333 contact sheet: {OUTPUT}")
