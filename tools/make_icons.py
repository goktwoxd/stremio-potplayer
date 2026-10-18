"""Generate the extension icons (run with the bundled Python + Pillow)."""

from pathlib import Path

from PIL import Image, ImageDraw

MASTER = 1024
OUT_DIR = Path(__file__).resolve().parent.parent / "extension" / "icons"


def build() -> Image.Image:
    img = Image.new("RGBA", (MASTER, MASTER), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded dark background
    draw.rounded_rectangle(
        (0, 0, MASTER - 1, MASTER - 1),
        radius=228,
        fill=(22, 18, 38, 255),
    )
    draw.rounded_rectangle(
        (0, 0, MASTER - 1, MASTER - 1),
        radius=228,
        outline=(123, 97, 255, 90),
        width=10,
    )

    # Purple play button
    draw.ellipse(
        (132, 132, MASTER - 132, MASTER - 132),
        fill=(108, 76, 255, 255),
        outline=(160, 140, 255, 255),
        width=8,
    )
    draw.polygon(
        [(408, 330), (408, 694), (742, 512)],
        fill=(255, 255, 255, 255),
    )
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    master = build()
    for size in (16, 48, 128):
        icon = master.resize((size, size), Image.LANCZOS)
        icon.save(OUT_DIR / f"icon{size}.png", "PNG")
        print(f"wrote {OUT_DIR / f'icon{size}.png'}")


if __name__ == "__main__":
    main()
