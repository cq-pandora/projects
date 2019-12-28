import config from '../../config';

export default (filename: string): string => `${config.localImagePrefix}${filename}${config.imageSuffix}`;
