"""Extract Crusaders Quest sprites from Unity asset bundles.

Replaces the old Unity-editor based splitter. For every bundle:

* each tk2dSpriteCollectionData MonoBehaviour is read and every sprite
  definition is rendered the same way the old tool did (tk2d mesh rendered
  by an orthographic camera fitted to the sprite bounds): the output is
  ``bounds.size * scale`` pixels, one tk2d world unit per pixel, nearest
  neighbour sampling, saved as ``<sprite name>.png``;
* bundles without a sprite collection (e.g. ``tips_img_*`` backgrounds) get
  their Texture2D assets exported as ``<texture name>.png``, scaled by
  ``scale``.

Opaque pixels match the old tool exactly. Semi-transparent pixels keep the
atlas colour and alpha; the old tool alpha-blended onto its camera background,
which squared the alpha and tinted the colour.

The game's bundles ship with typetrees, so MonoBehaviours are read with the
embedded typetree; no hand-written tk2d layout is needed.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
from dataclasses import dataclass, field
from pathlib import Path

import UnityPy
from PIL import Image, ImageDraw
from UnityPy.classes import Material, Texture2D

# Bundles flagged "x": "1" in bundlelist.txt carry an 11-byte header ("LCABX", "SV", then a
# little-endian uint32, 0x1ADA6D36 in every current bundle) followed by the real Unity bundle
# encrypted with RC4 (confirmed by disassembling the game's
# AssetBundleManager.LoadAssetBundleFromEncryptedFileInternal: standard RC4 KSA + PRGA + XOR).
# The RC4 key is a byte[] looked up in a per-seed table, where seed = headerUint ^ 0x1ADA6D37;
# every current bundle uses seed 1. The keys come from the "lcabx" map (seed -> hex key) in the
# parser's crypto.json, which is not shipped; see the README for how to recover them.
ENCRYPTED_MAGIC = b"LCABX"
ENCRYPTED_HEADER_LEN = 11
LCABXK = 0x1ADA6D37
UNITYFS_MAGIC = b"UnityFS"


def load_rc4_keys(crypto_path: Path) -> dict[int, bytes]:
    """RC4 keys per seed from the "lcabx" map in crypto.json. Missing file or map -> no keys."""
    if not crypto_path.is_file():
        return {}
    lcabx = json.loads(crypto_path.read_text()).get("lcabx", {})
    return {int(seed): bytes.fromhex(key) for seed, key in lcabx.items()}


def rc4(key: bytes, length: int) -> bytes:
    """RC4 keystream of `length` bytes, matching the game's KSA + PRGA."""
    s = list(range(256))
    j = 0
    for i in range(256):
        j = (j + s[i] + key[i % len(key)]) & 0xFF
        s[i], s[j] = s[j], s[i]
    out = bytearray(length)
    i = j = 0
    for n in range(length):
        i = (i + 1) & 0xFF
        j = (j + s[i]) & 0xFF
        s[i], s[j] = s[j], s[i]
        out[n] = s[(s[i] + s[j]) & 0xFF]
    return bytes(out)


def decrypt_bundle(raw: bytes, keys: dict[int, bytes]) -> bytes:
    seed = struct.unpack_from("<I", raw, 7)[0] ^ LCABXK
    key = keys.get(seed)
    if key is None:
        if not keys:
            raise ValueError("encrypted bundle (LCABX header); no RC4 key available")
        raise ValueError(
            f"encrypted bundle uses RC4 key seed {seed}, which is not in the key table; "
            f"recover that seed's key (known seeds: {sorted(keys)})"
        )
    body = raw[ENCRYPTED_HEADER_LEN:]
    out = bytes(b ^ k for b, k in zip(body, rc4(key, len(body))))
    if out[: len(UNITYFS_MAGIC)] != UNITYFS_MAGIC:
        raise ValueError(
            "decrypted LCABX bundle is not a UnityFS archive; the RC4 key for this seed is wrong "
            "(game re-keyed or changed the scheme) and must be re-recovered"
        )
    return out


@dataclass
class Stats:
    written: int = 0
    failed: list[str] = field(default_factory=list)


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def material_textures(material: Material) -> tuple[Texture2D | None, Texture2D | None]:
    main = alpha = None
    for name, env in material.m_SavedProperties.m_TexEnvs:
        if not env.m_Texture or env.m_Texture.m_PathID == 0:
            continue
        if name == "_MainTex":
            main = env.m_Texture.read()
        elif name == "_AlphaTex":
            alpha = env.m_Texture.read()
    return main, alpha


class TextureCache:
    """Atlas images per material, resolved inside the collection's assets file."""

    def __init__(self, assets_file) -> None:
        self._assets_file = assets_file
        self._images: dict[int, Image.Image] = {}

    def material_image(self, material_ref: dict) -> Image.Image:
        if material_ref["m_FileID"] != 0:
            raise ValueError("material lives in another bundle")
        key = material_ref["m_PathID"]
        if key not in self._images:
            main, alpha = material_textures(self._assets_file.objects[key].read())
            if main is None:
                raise ValueError("material has no _MainTex")
            image = main.image.convert("RGBA")
            if alpha is not None:
                image.putalpha(alpha.image.convert("L").resize(image.size, Image.Resampling.BILINEAR))
            self._images[key] = image
        return self._images[key]


def affine_from_triangle(src, dst) -> tuple[float, ...]:
    """Coefficients (a, b, c, d, e, f) mapping dst points to src points:
    src.x = a*x + b*y + c, src.y = d*x + e*y + f (PIL's AFFINE convention)."""
    (x0, y0), (x1, y1), (x2, y2) = dst
    det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
    if abs(det) < 1e-9:
        raise ZeroDivisionError("degenerate triangle")
    coeffs = []
    for k in range(2):
        s0, s1, s2 = src[0][k], src[1][k], src[2][k]
        a = ((s1 - s0) * (y2 - y0) - (s2 - s0) * (y1 - y0)) / det
        b = ((s2 - s0) * (x1 - x0) - (s1 - s0) * (x2 - x0)) / det
        coeffs += [a, b, s0 - a * x0 - b * y0]
    return tuple(coeffs)


def render_sprite(definition: dict, atlas: Image.Image, scale: float) -> Image.Image | None:
    """Render a tk2d sprite definition, or return None for empty (placeholder) sprites."""
    center, size = definition["boundsData"]
    width, height = int(size["x"] * scale), int(size["y"] * scale)
    if width <= 0 or height <= 0:
        return None

    min_x = center["x"] - size["x"] / 2
    max_y = center["y"] + size["y"] / 2
    tex_w, tex_h = atlas.size

    # Vertex positions in output pixels (y down) and uvs in atlas pixels
    # (UnityPy images are already top-down, so v is flipped).
    out_pts = [((p["x"] - min_x) * scale, (max_y - p["y"]) * scale) for p in definition["positions"]]
    tex_pts = [(uv["x"] * tex_w, (1 - uv["y"]) * tex_h) for uv in definition["uvs"]]

    result = Image.new("RGBA", (width, height))
    indices = definition["indices"]
    for i in range(0, len(indices) - 2, 3):
        tri = indices[i:i + 3]
        dst = [out_pts[j] for j in tri]
        try:
            coeffs = affine_from_triangle([tex_pts[j] for j in tri], dst)
        except ZeroDivisionError:
            continue
        layer = atlas.transform((width, height), Image.Transform.AFFINE, coeffs, Image.Resampling.NEAREST)
        # Quads (the common case) map both triangles with the same affine, so
        # mask only when the geometry is complex.
        if len(indices) == 6 and len(out_pts) == 4:
            return layer
        mask = Image.new("L", (width, height))
        ImageDraw.Draw(mask).polygon(dst, fill=255)
        result.paste(layer, (0, 0), mask)
    return result


def is_sprite_collection(obj) -> bool:
    if obj.type.name != "MonoBehaviour":
        return False
    behaviour = obj.parse_as_object()
    script = behaviour.m_Script.read() if behaviour.m_Script else None
    return script is not None and script.m_ClassName == "tk2dSpriteCollectionData"


def process_bundle(path: Path, output: Path, scale: float, stats: Stats, keys: dict[int, bytes]) -> None:
    raw = path.read_bytes()
    if raw[: len(ENCRYPTED_MAGIC)] == ENCRYPTED_MAGIC:
        raw = decrypt_bundle(raw, keys)

    env = UnityPy.load(raw)
    objects = env.objects
    collections = [obj for obj in objects if is_sprite_collection(obj)]

    if not collections:
        for obj in objects:
            if obj.type.name != "Texture2D":
                continue
            texture = obj.read()
            image = texture.image
            if scale != 1:
                image = image.resize(
                    (int(image.width * scale), int(image.height * scale)), Image.Resampling.NEAREST
                )
            image.save(output / f"{texture.m_Name}.png")
            stats.written += 1
        return

    for obj in collections:
        collection = obj.read_typetree()
        textures = TextureCache(obj.assets_file)
        materials = collection["materials"]
        for definition in collection["spriteDefinitions"]:
            name = definition["name"]
            if not name:
                continue
            try:
                material_id = definition["materialId"]
                material = definition["material"]
                if collection["materialIdsValid"] and 0 <= material_id < len(materials):
                    material = materials[material_id]
                atlas = textures.material_image(material)
                image = render_sprite(definition, atlas, scale)
                if image is None:
                    log(f"  {name}: empty sprite, skipped")
                    continue
                image.save(output / f"{name}.png")
                stats.written += 1
            except Exception as error:  # keep going like the old tool did
                stats.failed.append(f"{path.name}:{name}: {error}")
                log(f"  {name}: {error}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="cq-sprites", description=__doc__.splitlines()[0])
    parser.add_argument("--output", required=True, type=Path, help="directory for the PNG files")
    parser.add_argument("--scale", type=float, default=1.0, help="output scale (nearest neighbour)")
    parser.add_argument("--files", type=Path, help="file with one bundle path per line")
    parser.add_argument(
        "--crypto", type=Path, default=Path("crypto.json"),
        help='parser crypto.json with the "lcabx" RC4 keys (default: ./crypto.json)',
    )
    parser.add_argument("bundles", nargs="*", type=Path, help="bundle files")
    args = parser.parse_args()

    bundles = list(args.bundles)
    if args.files:
        bundles += [Path(line) for line in args.files.read_text().splitlines() if line.strip()]

    args.output.mkdir(parents=True, exist_ok=True)
    keys = load_rc4_keys(args.crypto)
    stats = Stats()
    for bundle in bundles:
        log(f"Processing {bundle}")
        try:
            process_bundle(bundle, args.output, args.scale, stats, keys)
        except Exception as error:
            stats.failed.append(f"{bundle.name}: {error}")
            log(f"  failed: {error}")

    log(f"Wrote {stats.written} sprites to {args.output}, {len(stats.failed)} failed")
    for failure in stats.failed:
        print(f"FAILED {failure}", flush=True)
    sys.exit(1 if stats.failed else 0)
