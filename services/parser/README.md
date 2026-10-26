<div align="center">
  <p>
    <img src="https://raw.githubusercontent.com/cq-pandora/projects/master/services/parser/assets/kaede_banner.png" title="Kaede" />
  </p>
</div>

## About
Kaede is set of tools to parse and structurize various ingame assets for later use in [Pandora](https://github.com/cq-pandora/projects/tree/master/services/bot/) and Fenrir (future web version)

## Usage

### Initialization

Requires Node.js 24 or newer. Yarn 4 is provided through corepack (`corepack enable`).

```
git clone https://github.com/cq-pandora/projects.git cq-pandora
cd cq-pandora
corepack enable
yarn install
yarn build
```

### Configuration
#### Change or create config files
**crypto.json**

File contains the blowfish key and init vector (`blowfish.key`, `blowfish.iv`) required to decrypt json data, and the RC4 keys for encrypted asset bundles (`lcabx`, a `{"<seed>": "<hex key>"}` map, see [Sprites](#sprites)). Not included to avoid problems with CQ dev team; `crypto.json.example` shows the shape.

**paths.json**

User dependant paths. Output dirs trees will be created if they does not exist

**images-collections.json**

Optionally, add supported sprites collections or portraits to parse. Format is `{"<scale>": {"folder": ["glob relative to paths.game_cache_path/files/Assets/"]}}`; matching bundles ending in `_cn` are skipped.

### Sprites

Sprites are extracted by the Python tool in the `sprites/` folder (a [uv](https://docs.astral.sh/uv/) project built on [UnityPy](https://github.com/K0lb3/UnityPy)); Unity is not needed. Install `uv` and have it on `PATH`; `yarn start` runs the tool through `uv run`, which installs Python 3.12 and the pinned dependencies on first use.

Each tk2d sprite in a bundle is written as `<folder>/<sprite name>.png`, one tk2d unit per pixel times the collection scale (nearest neighbour). Bundles without a tk2d sprite collection, such as the `tips*` backgrounds, have their textures exported as `<texture name>.png`.

Some bundles (`"x": "1"` in `bundlelist.txt`) carry an `LCABX` file header: 11 bytes (`LCABX`, `SV`, then a little-endian uint32) followed by the real Unity bundle encrypted with **RC4** (confirmed by disassembling `AssetBundleManager.LoadAssetBundleFromEncryptedFileInternal`: textbook RC4 KSA + PRGA + XOR). The RC4 key is a byte array looked up in a per-seed table, where `seed = headerUint XOR 0x1ADA6D37`; every current bundle uses seed `1`, whose 8-byte key goes into the `lcabx` map of `crypto.json`. `yarn start` passes `crypto.json` to the tool (`--crypto <path>`, default `./crypto.json`), which generates the RC4 keystream on demand. Without the key, `LCABX` bundles are skipped and reported as failures. A bundle whose seed is not in the map fails loudly (recover that seed's key), and a decrypted result that is not a `UnityFS` archive also fails loudly (the key is wrong / the game re-keyed). To recover a key: run the game on a rooted device or emulator and, while an encrypted bundle is loaded, scan the il2cpp GC heap for the short byte array `k` such that `RC4(k)` reproduces the bundle's keystream (the ciphertext body `file[11:]` XORed with its decrypted `UnityFS` form captured from memory).

The tool can also be run on its own:

```
uv run --project sprites cq-sprites --output /tmp/heroes --scale 2 /path/to/Assets/spritecollection_allfacecollection
```

### Running

```
yarn start
```

The run resolves the current client version from Google Play, asks Gamebase for the launch endpoint (`https://game.lc-cq.loadcomplete.com/launch/start` since the LoadComplete transfer), and reads the data sheet (`Patch_DataSheet`) and asset bundle (`NPatch_URL`) roots from it. It then downloads, decrypts, normalizes and splits sprites, with a verbose log of every processed file.

Translation sheets (`get_text*_<locale>_<n>` and `get_textdialogue*_<locale>_<n>`) are discovered from the decrypted data, so new shards are picked up without code changes.

### Automated updates

The `Update assets` workflow (`.github/workflows/update-assets.yml`) runs the parser every Thursday at 10:00 UTC and on demand, writing straight into a checkout of [cq-pandora/assets](https://github.com/cq-pandora/assets). If the generated data or sprites changed, it opens (or updates) a pull request there from the `update/game-data` branch; merging it triggers the assets repo's docker build. The full run takes about 10 minutes. It needs two repository secrets:

- `CQ_CRYPTO_JSON`: the contents of `crypto.json`.
- `ASSETS_TOKEN`: a fine-grained token for `cq-pandora/assets` with read and write access to "Contents" and "Pull requests".
