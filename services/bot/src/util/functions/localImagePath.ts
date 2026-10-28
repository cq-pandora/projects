import { join as pathJoin } from 'node:path';

import config from '../../config';

export default (filename: string): string => pathJoin(config.localImagePrefix, `${filename}${config.imageSuffix}`);
