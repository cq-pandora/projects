import { Message } from 'discord.js';

import config from '../../config';

export default (message: Message): string => (!config.prefix ? `@${message.client.user?.username} ` : config.prefix);
