import config from '../../config';

export default (filename: string): string => `${config.imagePrefix}${filename}${config.imageSuffix}`;
