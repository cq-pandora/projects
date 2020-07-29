<div align="center">
  <p>
    <img src="https://raw.githubusercontent.com/cq-pandora/projects/master/services/bot/assets/pandora_banner.png" title="Pandora" />
  </p>

  <a href="https://www.npmjs.com/package/discord.js">
    <img src="https://img.shields.io/badge/discord.js-v11.4.2-blue.svg" title="Discord.js" />
  </a>
  <a href="https://david-dm.org/cq-pandora/projects">
    <img src="https://david-dm.org/cq-pandora/projects.svg" title="Dependencies" />
  </a>
</div>

## About
Pandora is a database [Discord](https://discordapp.com/) bot for Crusaders Quest ([Android](https://play.google.com/store/apps/details?id=com.nhnent.SKQUEST)/[iOS](https://itunes.apple.com/app/crusaders-quest/id901858272?mt=8)).

Invite her to your server using [this link](https://discordapp.com/oauth2/authorize?client_id=482249831709016064&scope=bot&permissions=44032) or try her out first in either of the three servers listed below!

<div align="center">
  <a href="https://discord.gg/6TRnyhj">
    <img src="https://discordapp.com/api/guilds/206599473282023424/embed.png?style=banner2" title="Official Server"/>
  </a>
  <a href="https://discord.gg/pK9qsJY">
    <img src="https://discordapp.com/api/guilds/490860087095853069/embed.png?style=banner2" title="Irc server"/>
  </a>  
  <a href="https://discord.gg/WjEFnzC">
    <img src="https://discordapp.com/api/guilds/258167954913361930/embed.png?style=banner2" title="Irc server"/>
  </a>
</div>

## Usage

### Initialization
```
git clone https://github.com/cq-pandora/projects.git cq-pandora
cd cq-pandora
yarn install
yarn build
```

### Running

#### Before first run
- Create database 
- Migrate database using `yarn workspaces @cquest/db migrate:up`

#### General start
Running configuration is set through environment variables. Best to be used with pm2.
Example ecosystem.config.js (place in root of the monorepo):
```
module.exports = {
	apps: [{
		name: 'pandora',
		script: './services/bot/lib/index.js',
		autorestart: true,
		node_args: '--harmony',
		watch: ['./services/bot/lib/', './services/bot/node_modules/', './node_modules/'],
		env: {
			PANDORA_TOKEN: '<bot token>',
			PANDORA_PREFIX: '!',
			PANDORA_CQ_NORMALIZED_DATA_PATH: '<path to the output of kaede information folder>',
			PANDORA_LOCAL_IMAGES_PREFIX: '<path to the output of kaede images>',
			PANDORA_URL_IMAGES_PREFIX: '<hosted output of kaede images (used for discord images references)', // Official is https://data.fenrir.moe/
			PANDORA_IMAGES_SUFFIX: '.png',
			PANDORA_OWNER_ID: '136069690446446592', // It's me!

			PANDORA_DB_USER: 'root',
			PANDORA_DB_PASSWORD: 'root',
			PANDORA_DB_HOST: 'localhost',
			PANDORA_DB_PORT: '',
			PANDORA_DB_DATABASE: 'cqdata',
		},
	}],
};

```

Or, you can set all required environment variables in any other way and run bot using `yarn workspaces @cquest/bot start`
