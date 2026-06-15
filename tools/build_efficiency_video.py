from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "site.json"
MEDIA = ROOT / "media"
VIDEO = MEDIA / "work4_libero10_efficiency.mp4"
POSTER = MEDIA / "work4_libero10_efficiency_poster.png"
WIDTH = 1280
HEIGHT = 720
FPS = 24
DURATION_SECONDS = 12


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


F_TITLE = font(48, True)
F_HEAD = font(28, True)
F_BODY = font(21)
F_SMALL = font(16)
F_TINY = font(14)


def draw_round(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def bar(draw: ImageDraw.ImageDraw, x, y, w, h, pct, label, value, color):
    draw_round(draw, (x, y, x + w, y + h), 8, "#eef1f5", "#d9dee7")
    fill_w = int(w * max(0.0, min(1.0, pct)))
    if fill_w > 0:
        draw_round(draw, (x, y, x + fill_w, y + h), 8, color)
    draw.text((x, y - 22), label, font=F_TINY, fill="#303846")
    draw.text((x + w + 16, y - 1), value, font=F_TINY, fill="#303846")


def make_frame(data, frame_idx: int, total_frames: int) -> Image.Image:
    t = frame_idx / max(1, total_frames - 1)
    img = Image.new("RGB", (WIDTH, HEIGHT), "#f6f7f9")
    draw = ImageDraw.Draw(img)

    draw.text((72, 48), "LIBERO-10 Public VLA Reproduction Matrix", font=F_TITLE, fill="#1b1f24")
    draw.text(
        (75, 108),
        "Generated from work4 logs. Main rows use 10 tasks x 10 episodes unless marked as smoke or running.",
        font=F_BODY,
        fill="#5b6472",
    )

    rows = [r for r in data["reproduction_rows"] if r["state"] == "completed main"]
    smoke = [r for r in data["reproduction_rows"] if "smoke" in r["state"]]
    running = [r for r in data["reproduction_rows"] if "running" in r["state"]]

    draw_round(draw, (70, 158, 1210, 612), 16, "#ffffff", "#d9dee7")
    draw.text((104, 188), "Completed main rows", font=F_HEAD, fill="#1b1f24")

    available = min(1.0, max(0.0, (t - 0.14) / 0.70))
    max_rate = max(r["success_rate"] for r in rows)
    y = 248
    colors = ["#315a9b", "#1f7a5c", "#8a5a00", "#7b4ab1", "#237b8a", "#c4513a", "#2d7c4b", "#5f6f85"]
    for idx, row in enumerate(rows):
        row_progress = min(1.0, max(0.0, available * len(rows) - idx))
        rate = row["success_rate"] or 0.0
        pct = 0.0 if max_rate == 0 else (rate / max_rate) * row_progress
        label = f"{row['run']}  {row['algorithm']}"
        value = f"{row['successes']}/{row['episodes']}  {rate:.2f}"
        bar(draw, 104, y + idx * 45, 660, 18, pct, label, value, colors[idx % len(colors)])

    side_x = 880
    draw.text((side_x, 208), "Current snapshot", font=F_HEAD, fill="#1b1f24")
    facts = [
        ("Main rows", "8 completed"),
        ("Best row", "VLANeXt N260E 0.26"),
        ("Smoke row", f"{smoke[0]['run']} no main metric"),
        ("Running row", f"{running[0]['run']} server_starting"),
        ("Claim boundary", "No public SOTA claim"),
    ]
    sy = 260
    for key, value in facts:
        draw.text((side_x, sy), key, font=F_TINY, fill="#5b6472")
        draw.text((side_x, sy + 20), value, font=F_SMALL, fill="#1b1f24")
        sy += 64

    draw_round(draw, (70, 636, 1210, 676), 10, "#eef5ff", "#bdd0ef")
    draw.text(
        (92, 645),
        "Efficiency video means fast visual inspection of queue progress and metric spread. It is not a robot rollout recording.",
        font=F_SMALL,
        fill="#244b8a",
    )
    return img


def main() -> None:
    MEDIA.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA.read_text(encoding="utf-8"))
    total = FPS * DURATION_SECONDS
    writer = cv2.VideoWriter(
        str(VIDEO),
        cv2.VideoWriter_fourcc(*"mp4v"),
        FPS,
        (WIDTH, HEIGHT),
    )
    if not writer.isOpened():
        raise RuntimeError("Could not open mp4 writer")
    poster = None
    for idx in range(total):
        frame = make_frame(data, idx, total)
        if idx == int(total * 0.82):
            poster = frame.copy()
        array = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
        writer.write(array)
    writer.release()
    if poster is None:
        poster = make_frame(data, total - 1, total)
    poster.save(POSTER)
    if VIDEO.stat().st_size <= 0:
        raise RuntimeError("Generated video is empty")
    print(f"wrote {VIDEO} ({VIDEO.stat().st_size} bytes)")
    print(f"wrote {POSTER} ({POSTER.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
