"""Genera los assets derivados de HorAna a partir de las piezas originales.

Uso:  python scripts/prepare_assets.py
Requiere: Pillow, numpy (incluidos en el runtime de DSH).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "horana_logo_source.jpg"


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    for name in candidates:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


SERIF = ["georgia.ttf", "times.ttf", "constan.ttf"]
SERIF_ITALIC = ["georgiai.ttf", "timesi.ttf", "constani.ttf"]
SANS = ["segoeui.ttf", "arial.ttf", "calibri.ttf"]
SANS_SEMIBOLD = ["seguisb.ttf", "segoeuib.ttf", "arialbd.ttf"]


def remove_paper_background(image: Image.Image, tolerance: int = 34) -> Image.Image:
    """Quita el papel crema conectado al borde, conservando los claros internos."""
    rgb = image.convert("RGB")
    arr = np.asarray(rgb).astype(np.int16)
    corners = np.concatenate(
        [
            arr[:8, :8].reshape(-1, 3),
            arr[:8, -8:].reshape(-1, 3),
            arr[-8:, :8].reshape(-1, 3),
            arr[-8:, -8:].reshape(-1, 3),
        ]
    )
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    candidate = (dist < tolerance).astype(np.uint8) * 255
    # ImageDraw.floodfill necesita RGB para rellenar de forma fiable.
    mask = Image.fromarray(candidate, "L").convert("RGB")

    # Relleno desde los bordes: solo el fondo exterior se vuelve transparente.
    w, h = mask.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(mask, xy, (255, 0, 0), thresh=0)

    mask_arr = np.asarray(mask)
    is_background = (
        (mask_arr[:, :, 0] == 255) & (mask_arr[:, :, 1] == 0) & (mask_arr[:, :, 2] == 0)
    )
    alpha = np.where(is_background, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.65))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(alpha_img)
    return rgba


def optimize_png(image: Image.Image, colors: int = 128) -> Image.Image:
    alpha = image.getchannel("A")
    quantized = image.convert("RGB").quantize(colors=colors, method=Image.FASTOCTREE)
    quantized = quantized.convert("RGBA")
    quantized.putalpha(alpha)
    return quantized


def content_crop(image: Image.Image, pad: int = 18) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    return image.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(image.width, right + pad),
            min(image.height, bottom + pad),
        )
    )


def make_logo() -> None:
    source = Image.open(SOURCE)
    transparent = content_crop(remove_paper_background(source), pad=10)
    optimize_png(transparent, colors=128).save(
        ASSETS / "horana_logo_transparent.png", optimize=True, compress_level=9
    )
    source.save(ASSETS / "horana_logo.jpg", quality=92, optimize=True)

    # Emblema: la parte superior, por encima del logotipo HORANA.
    alpha = np.asarray(transparent.getchannel("A"))
    rows = alpha.mean(axis=1)
    gap_start = int(transparent.height * 0.52)
    gap = next(
        (i for i in range(gap_start, int(transparent.height * 0.8)) if rows[i] < 2),
        int(transparent.height * 0.64),
    )
    emblem = transparent.crop((0, 0, transparent.width, gap))
    emblem = content_crop(emblem, pad=8)
    side = max(emblem.width, emblem.height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.alpha_composite(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))
    square.thumbnail((480, 480), Image.LANCZOS)
    square = square.resize((192, 192), Image.LANCZOS)
    optimize_png(square, colors=96).save(
        ASSETS / "horana_emblem.png", optimize=True, compress_level=9
    )

    favicon = square.resize((64, 64), Image.LANCZOS)
    optimize_png(favicon, colors=64).save(
        ASSETS / "favicon.png", optimize=True, compress_level=9
    )

    og = Image.new("RGB", (1200, 630), "#FBFBF5")
    logo = transparent.copy()
    logo.thumbnail((760, 520), Image.LANCZOS)
    og.paste(logo, ((1200 - logo.width) // 2, (630 - logo.height) // 2), logo)
    og.save(ASSETS / "og-horana.jpg", quality=90, optimize=True)


def letterspaced(draw: ImageDraw.ImageDraw, xy, text, font, fill, spacing=0, anchor_center=False):
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x, y = xy
    if anchor_center:
        x -= total / 2
    for ch, width in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += width + spacing
    return total


def make_certificate() -> None:
    w, h = 1500, 1060
    paper = Image.new("RGB", (w, h), "#FBF7EE")
    noise = np.random.default_rng(7).normal(0, 4.2, (h, w, 1)).repeat(3, axis=2)
    base = np.asarray(paper).astype(np.float32)
    tex = np.clip(base + noise, 0, 255).astype(np.uint8)
    paper = Image.fromarray(tex, "RGB")
    draw = ImageDraw.Draw(paper)

    espresso = (65, 37, 24)
    gold = (170, 135, 92)
    muted = (125, 95, 67)

    ox, oy = 0, 0
    canvas = paper

    # Doble marco fino dorado.
    draw.rectangle((ox + 46, oy + 44, ox + w - 46, oy + h - 44), outline=gold, width=2)
    draw.rectangle((ox + 58, oy + 56, ox + w - 58, oy + h - 56), outline=(198, 173, 136), width=1)

    # Esquinas botánicas minimalistas.
    def corner(cx, cy, sx, sy):
        for i in range(3):
            r = 22 + i * 15
            draw.arc(
                (cx - r, cy - r, cx + r, cy + r),
                start=0 if (sx, sy) == (1, 1) else 90,
                end=90 if (sx, sy) == (1, 1) else 180,
                fill=gold,
                width=1,
            )
        draw.line((cx, cy, cx + sx * 52, cy + sy * 52), fill=gold, width=1)

    corner(ox + 76, oy + 74, 1, 1)
    corner(ox + w - 76, oy + 74, -1, 1)
    corner(ox + 76, oy + h - 74, 1, -1)
    corner(ox + w - 76, oy + h - 74, -1, -1)

    title_font = load_font(SERIF, 94)
    subtitle_font = load_font(SERIF_ITALIC, 43)
    name_font = load_font(SERIF, 62)
    course_font = load_font(SERIF, 49)
    small_font = load_font(SANS, 23)
    tiny_font = load_font(SANS, 19)
    sig_font = load_font(SERIF_ITALIC, 33)

    center = ox + w // 2
    letterspaced(draw, (center, oy + 130), "PURO LAB  ·  ESCUELA DE BARISTAS", load_font(SANS_SEMIBOLD, 21), muted, 5, True)
    letterspaced(draw, (center, oy + 205), "CERTIFICADO", title_font, espresso, 12, True)
    subtitle = "de finalización"
    tw = draw.textlength(subtitle, font=subtitle_font)
    draw.text((center - tw / 2, oy + 315), subtitle, font=subtitle_font, fill=gold)

    draw.line((center - 135, oy + 395, center - 22, oy + 395), fill=gold, width=1)
    draw.polygon([(center, oy + 389), (center + 6, oy + 395), (center, oy + 401), (center - 6, oy + 395)], fill=espresso)
    draw.ellipse((center + 15, oy + 392, center + 21, oy + 398), fill=espresso)
    draw.line((center + 22, oy + 395, center + 135, oy + 395), fill=gold, width=1)

    for text, y, font, fill in [
        ("Se certifica que", oy + 442, small_font, muted),
        ("MARTÍN SEBASTIÁN DEL RÍO", oy + 485, name_font, espresso),
        ("completó el Curso de", oy + 585, small_font, muted),
        ("Barista y Arte Latte", oy + 625, course_font, espresso),
        ("Puro Café  ·  Escuela Gourmet Online", oy + 715, small_font, muted),
    ]:
        tw = draw.textlength(text, font=font)
        draw.text((center - tw / 2, y), text, font=font, fill=fill)

    # Firma y sello.
    draw.line((ox + 355, oy + 858, ox + 655, oy + 858), fill=gold, width=1)
    sig = "Marcos de Lauretis"
    tw = draw.textlength(sig, font=sig_font)
    draw.text((ox + 505 - tw / 2, oy + 808), sig, font=sig_font, fill=espresso)
    label = "Director · Puro Lab"
    tw = draw.textlength(label, font=tiny_font)
    draw.text((ox + 505 - tw / 2, oy + 872), label, font=tiny_font, fill=muted)

    seal_c = (ox + w - 345, oy + 835)
    for r, width in [(82, 2), (70, 1)]:
        draw.ellipse((seal_c[0] - r, seal_c[1] - r, seal_c[0] + r, seal_c[1] + r), outline=gold, width=width)
    letterspaced(draw, (seal_c[0], seal_c[1] - 34), "PURO", load_font(SANS_SEMIBOLD, 17), gold, 3, True)
    letterspaced(draw, (seal_c[0], seal_c[1] - 10), "LAB", load_font(SANS_SEMIBOLD, 17), gold, 3, True)
    draw.line((seal_c[0] - 26, seal_c[1] + 18, seal_c[0] + 26, seal_c[1] + 18), fill=gold, width=1)
    letterspaced(draw, (seal_c[0], seal_c[1] + 28), "BARISTA", load_font(SANS, 12), muted, 2, True)

    note = "Vista de referencia · la foto oficial del certificado puede reemplazar este archivo"
    tw = draw.textlength(note, font=tiny_font)
    draw.text((center - tw / 2, oy + h - 100), note, font=tiny_font, fill=(154, 129, 100))

    canvas.save(ASSETS / "certificado_barista.jpg", quality=86, optimize=True, progressive=True)


if __name__ == "__main__":
    make_logo()
    make_certificate()
    print("Assets generados en", ASSETS)
