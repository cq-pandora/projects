<div align="center">
  <p>
    <img src="https://raw.githubusercontent.com/cq-pandora/projects/master/services/parser/assets/pandora_banner.png" title="Pandora" />
  </p>
</div>

## About
Kaede is set of tools to parse and structurize various ingame assets for later use in [Pandora](https://github.com/cq-pandora/projects/tree/master/services/bot/) and Fenrir (future web version)

## Usage

### Initialization
```
git clone https://github.com/cq-pandora/projects.git cq-pandora
cd cq-pandora
yarn install
yarn build
```

### Configuration
#### Change or create config files
**crypto.json**

File contains blowfish key and init vector required to decrypt json data. Not included to avoid problems with CQ dev team

**paths.json**

User dependant paths. Output dirs trees will be created if they does not exist

- unity_sprite_splitter - should be set to CQ decompiler path. As it uses TK2D library, it is not included as well for licensing issues. You can contact me to get this project via discord or telegram @truelecter

**images-collections.json**

Optionally, add supported sprites collections or portraits to parse. Format is `"folder": ["glob relative to paths.game_cache_path/files/Assets/"]`

### Running

```
yarn start
```

In output you'll see full verbose log of what files were processed
