import FishingGearBaseCommand from './abstract/FishingGearBaseCommand';

export class RodsListCommand extends FishingGearBaseCommand {
	constructor() {
		super('rod');
	}
}

export default new RodsListCommand();
