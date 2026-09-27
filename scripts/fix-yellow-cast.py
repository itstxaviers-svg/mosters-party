#!/usr/bin/env python3
"""Conservative per-image yellow-cast correction for Monsters' Party assets.

PNG alpha and animated GIF timing/looping are preserved. The correction is
derived from each image's own colour distribution; it is not a fixed hue shift.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageEnhance, ImageSequence, ImageStat

SUPPORTED = {'.png', '.jpg', '.jpeg', '.gif'}


def image_stats(image: Image.Image) -> dict[str, float]:
    rgba = image.convert('RGBA')
    rgba.thumbnail((320, 320))
    rgb = Image.new('RGB', rgba.size, (127, 127, 127))
    rgb.paste(rgba.convert('RGB'), mask=rgba.getchannel('A'))
    mean = ImageStat.Stat(rgb).mean
    warmth = max(0.0, ((mean[0] + mean[1]) / 2 - mean[2]) / 255)
    red_bias = max(0.0, (mean[0] - mean[1]) / 255)
    return {'red': mean[0], 'green': mean[1], 'blue': mean[2], 'warmth': warmth, 'red_bias': red_bias}


def correct_frame(frame: Image.Image, stats: dict[str, float]) -> Image.Image:
    rgba = frame.convert('RGBA')
    alpha = rgba.getchannel('A')
    r, g, b, _ = rgba.split()

    warmth = stats['warmth']
    blue_gain = 1.0 + min(0.16, warmth * 0.52)
    red_gain = 1.0 - min(0.065, warmth * 0.19 + stats['red_bias'] * 0.08)
    green_gain = 1.0 - min(0.025, warmth * 0.06)
    blue_lift = min(5.0, warmth * 12)

    r = r.point(lambda x: max(0, min(255, round(x * red_gain))))
    g = g.point(lambda x: max(0, min(255, round(x * green_gain))))
    b = b.point(lambda x: max(0, min(255, round(x * blue_gain + blue_lift))))
    corrected = Image.merge('RGBA', (r, g, b, alpha))
    rgb = ImageEnhance.Color(corrected.convert('RGB')).enhance(0.98)
    out = rgb.convert('RGBA')
    out.putalpha(alpha)
    return out


def save_gif(source: Path, target: Path) -> dict[str, object]:
    with Image.open(source) as image:
        frames = [frame.convert('RGBA') for frame in ImageSequence.Iterator(image)]
        stats = image_stats(frames[0])
        corrected = [correct_frame(frame, stats) for frame in frames]
        durations = [frame.info.get('duration', image.info.get('duration', 100)) for frame in ImageSequence.Iterator(image)]
        loop = image.info.get('loop', 0)
        target.parent.mkdir(parents=True, exist_ok=True)
        corrected[0].save(
            target,
            save_all=True,
            append_images=corrected[1:],
            duration=durations,
            loop=loop,
            disposal=2,
            optimize=False,
        )
        return {**stats, 'frames': len(frames), 'animated': len(frames) > 1}


def save_still(source: Path, target: Path) -> dict[str, object]:
    with Image.open(source) as image:
        stats = image_stats(image)
        corrected = correct_frame(image, stats)
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix.lower() in {'.jpg', '.jpeg'}:
            corrected.convert('RGB').save(target, quality=94, subsampling=0, optimize=True)
        else:
            corrected.save(target, optimize=True)
        return {**stats, 'frames': 1, 'animated': False}


def files_in(source: Path) -> Iterable[Path]:
    if source.is_file():
        yield source
        return
    yield from (path for path in source.rglob('*') if path.is_file() and path.suffix.lower() in SUPPORTED)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()

    source_root = args.source if args.source.is_dir() else args.source.parent
    report: list[dict[str, object]] = []
    for source in files_in(args.source):
        relative = source.relative_to(source_root)
        target = args.destination / relative
        try:
            details = save_gif(source, target) if source.suffix.lower() == '.gif' else save_still(source, target)
            report.append({'source': str(source), 'corrected': str(target), **details})
            print(f'corrected {relative}')
        except Exception as error:
            report.append({'source': str(source), 'corrected': None, 'error': str(error)})
            print(f'failed {relative}: {error}')

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
