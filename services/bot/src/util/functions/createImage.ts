import Jimp from 'jimp';

export default async (width: number, height: number): Promise<Jimp> => new Jimp(width, height, 0x0);
