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

File contains blowfish key and init vector required to decrypt json data. Not included to avoid problems with CQ dev team

**paths.json**

User dependant paths. Output dirs trees will be created if they does not exist

**images-collections.json**

Optionally, add supported sprites collections or portraits to parse. Format is `{"<scale>": {"folder": ["glob relative to paths.game_cache_path/files/Assets/"]}}`; matching bundles ending in `_cn` are skipped.

### Sprites

Sprites are extracted by the Python tool in the `sprites/` folder (a [uv](https://docs.astral.sh/uv/) project built on [UnityPy](https://github.com/K0lb3/UnityPy)); Unity is not needed. Install `uv` and have it on `PATH`; `yarn start` runs the tool through `uv run`, which installs Python 3.12 and the pinned dependencies on first use.

Each tk2d sprite in a bundle is written as `<folder>/<sprite name>.png`, one tk2d unit per pixel times the collection scale (nearest neighbour). Bundles without a tk2d sprite collection, such as the `tips*` backgrounds, have their textures exported as `<texture name>.png`. Encrypted bundles (`"x": "1"` in `bundlelist.txt`, `LCABX` file header) are not supported yet and are reported as failures.

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
