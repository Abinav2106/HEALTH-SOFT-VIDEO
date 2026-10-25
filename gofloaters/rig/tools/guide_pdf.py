"""CONTROL_GUIDE.md -> Tilo_Control_Guide.pdf (images from guide/), via the pre-installed Chromium."""
import subprocess
import sys
from pathlib import Path

import markdown

RIG = Path(__file__).resolve().parents[1]
md = (RIG / "CONTROL_GUIDE.md").read_text()
body = markdown.markdown(md, extensions=["tables"])
html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 16mm 14mm; }}
body {{ font-family: Arial, Helvetica, sans-serif; color: #111110; font-size: 10.5pt; line-height: 1.45; }}
h1 {{ font-size: 22pt; margin: 0 0 8pt; }} h2 {{ font-size: 14pt; margin: 18pt 0 6pt; border-bottom: 2px solid #6FC7D8; padding-bottom: 3pt; }}
h3 {{ font-size: 12pt; margin: 12pt 0 4pt; }}
table {{ border-collapse: collapse; width: 100%; font-size: 9pt; margin: 6pt 0 10pt; }}
th, td {{ border: 1px solid #cfd8dc; padding: 4pt 5pt; vertical-align: top; text-align: left; }}
th {{ background: #E9F6F9; }} code {{ background: #f2f4f5; padding: 0 2pt; border-radius: 2pt; font-size: 9pt; }}
img {{ width: 100%; border: 1px solid #e3e8ea; border-radius: 4pt; margin: 4pt 0; }} tr {{ page-break-inside: avoid; }}
</style></head><body>{body}</body></html>"""
out_html = RIG / "build" / "guide.html"
out_html.parent.mkdir(parents=True, exist_ok=True)
out_html.write_text(html.replace('src="guide/', f'src="{(RIG / "guide").as_uri()}/'))
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto(process.argv[1],{waitUntil:'load'});await p.pdf({path:process.argv[2],format:'A4',printBackground:true});await b.close()})();"""
subprocess.run(["node", "-e", js, out_html.as_uri(), str(RIG / "Tilo_Control_Guide.pdf")], check=True)
print("wrote", RIG / "Tilo_Control_Guide.pdf")
