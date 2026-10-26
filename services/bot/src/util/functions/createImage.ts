import { Jimp, JimpInstance } from 'jimp';

export default async (width: number, height: number): Promise<JimpInstance> => new Jimp({ width, height, color: 0x0 });
