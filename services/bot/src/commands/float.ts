import FishingGearBaseCommand from './abstract/FishingGearBaseCommand';

export class FloatListCommand extends FishingGearBaseCommand {
	constructor() {
		super('float');
	}
}

export default new FloatListCommand();
