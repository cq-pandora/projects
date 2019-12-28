import FishingGearBaseCommand from './abstract/FishingGearBaseCommand';

export class BaitListCommand extends FishingGearBaseCommand {
	constructor() {
		super('bait');
	}
}

export default new BaitListCommand();
