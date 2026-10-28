"""Tile QC stills into one labelled contact sheet: contact_sheet.py OUT.png IN1.png ..."""
import sys
from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
cols = min(6, len(files))
rows = (len(files) + cols - 1) // cols
tw, th = 270, 480
sheet = Image.new("RGB", (cols * tw, rows * (th + 24)), "white")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 24)
    sheet.paste(im, (x, y + 24))
    d.text((x + 6, y + 6), f.rsplit("/", 1)[-1], fill="black")
sheet.save(out)
