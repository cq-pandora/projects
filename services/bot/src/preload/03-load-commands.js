const fs = require('fs');
const { promisify } = require('util');
const { join: pathJoin, basename: pathBasename } = require('path');

const logger = require('../logger');

const { commands } = require('../config');

const readdir = promisify(fs.readdir).bind(fs);

const EXTENSION = '.js';
const commandsDir = pathJoin(__dirname, '../commands/');

module.exports = async () => {
	logger.verbose(`Looking for commands in ${commandsDir}`);

	for (const file of await readdir(commandsDir)) {
		if (!file.endsWith(EXTENSION)) {
			continue;
		}

		const command = require(pathJoin(commandsDir, file));
		command.name = pathBasename(file, EXTENSION).toLowerCase();

		if (!command.category) {
			throw new Error(`Not category set for ${command.name}`);
		}

		commands[command.name] = command;
	}

	logger.verbose(`Loaded ${Object.keys(commands).length} commands`);
};

module.exports.errorCode = 4;
