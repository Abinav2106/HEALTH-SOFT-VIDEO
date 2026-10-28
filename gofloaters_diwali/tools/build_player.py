"""Build the standalone Claude Motion player page: the composition, subset film
fonts, Tilo, the logo and the temp mix inlined into one HTML file.

Writes out/player/diwali_spark_hunt.html (needs out/audio from make_audio.py).
"""
import base64
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
M = ROOT / "motion"
OUT = ROOT / "out/player/diwali_spark_hunt.html"
SCRIPTS = ["lib/core.js", "lib/tilo.js", "lib/india.js", "lib/world.js", "config.js", "scenes.js", "film.js"]
FONTS = {"GF Display Black": "InterDisplay-Black.otf", "GF Display ExtraBold": "InterDisplay-ExtraBold.otf",
         "GF Bold": "Inter-Bold.otf", "GF SemiBold": "Inter-SemiBold.otf"}
# printable ASCII plus the few symbols the film sets
UNICODES = "U+0020-007E,U+00B7,U+2013,U+2014,U+2019,U+2026,U+20B9,U+2192"


def data_uri(path, mime):
    return f"data:{mime};base64,{base64.b64encode(Path(path).read_bytes()).decode()}"


def main():
    tmp = Path(tempfile.mkdtemp())
    faces = []
    for family, file in FONTS.items():
        out = tmp / (Path(file).stem + ".woff2")
        subprocess.run(["pyftsubset", str(M / "fonts" / file), f"--unicodes={UNICODES}", "--flavor=woff2",
                        "--layout-features=*", f"--output-file={out}"], check=True)
        faces.append(f'@font-face {{ font-family: "{family}"; src: url({data_uri(out, "font/woff2")}) format("woff2"); }}')
    audio = tmp / "mix.m4a"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ROOT / "out/audio/GoFloaters_Diwali_temp_mix.wav"),
                    "-c:a", "aac", "-b:a", "160k", str(audio)], check=True)
    brand = ROOT / "assets/brand"
    assets = ("{" + ",".join([
        f'"tilo":"{data_uri(brand / "tilo_full.png", "image/png")}"',
        f'"speedlines":"{data_uri(brand / "speedlines.png", "image/png")}"',
        f'"logo":"{data_uri(brand / "gofloaters_logo_original.webp", "image/webp")}"',
        f'"audio":"{data_uri(audio, "audio/mp4")}"',
    ]) + "}")
    js = "\n".join((M / s).read_text() for s in SCRIPTS)
    page = (M / "player.html").read_text()
    page = page.replace("/*__FILM_FONTS__*/", "\n".join(faces))
    page = page.replace("/*__ASSETS__*/null", assets)
    page = page.replace("/*__SCRIPTS__*/", js.replace("</script", "<\\/script"))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(page)
    print(f"{OUT}  {OUT.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
