import { deserialize, deserializeAs } from 'cerialize';

export default class EmojisConfig {
	@deserializeAs('weapon_ticket') public readonly weaponTicket: string;
	@deserializeAs('sbw_ticket') public readonly sbwTicket: string;
	@deserializeAs('premium_contract') public readonly premiumContract: string;
	@deserializeAs('option_ticket') public readonly optionTicket: string;
	@deserialize public readonly key: string;
	@deserialize public readonly iron: string;
	@deserialize public readonly honor: string;
	@deserializeAs('hero_select') public readonly heroSelect: string;
	@deserialize public readonly gold: string;
	@deserialize public readonly gem: string;
	@deserialize public readonly fishcoin: string;
	@deserializeAs('fergus_ticket') public readonly fergusTicket: string;
	@deserializeAs('crystal_dust') public readonly crystalDust: string;
	@deserializeAs('crystal_chard') public readonly crystalChard: string;
	@deserialize public readonly crystal: string;
	@deserializeAs('costume_ticket') public readonly costumeTicket: string;
	@deserializeAs('contract_only_contract') public readonly contractOnlyContract: string;
	@deserializeAs('colo_ticket') public readonly coloTicket: string;
	@deserializeAs('mossy_cat_chest') public readonly mossyCatChest: string;
	@deserializeAs('intact_cat_chest') public readonly intactCatChest: string;
	@deserializeAs('mini_promotable') public readonly miniPromotable: string;
	@deserializeAs('mini_contract') public readonly miniContract: string;
	@deserializeAs('mini_brown') public readonly miniBrown: string;
	@deserializeAs('mini_supply') public readonly miniSupply: string;
	@deserializeAs('mini_event') public readonly miniEvent: string;

	constructor(
		weaponTicket: string, sbwTicket: string, premiumContract: string, optionTicket: string, key: string,
		iron: string, honor: string, heroSelect: string, gold: string, gem: string, fishcoin: string,
		fergusTicket: string, crystalDust: string, crystalChard: string, crystal: string, costumeTicket: string,
		contractOnlyContract: string, coloTicket: string, mossyCatChest: string, intactCatChest: string,
		miniPromotable: string, miniContract: string, miniBrown: string, miniSupply: string, miniEvent: string
	) {
		this.weaponTicket = weaponTicket;
		this.sbwTicket = sbwTicket;
		this.premiumContract = premiumContract;
		this.optionTicket = optionTicket;
		this.key = key;
		this.iron = iron;
		this.honor = honor;
		this.heroSelect = heroSelect;
		this.gold = gold;
		this.gem = gem;
		this.fishcoin = fishcoin;
		this.fergusTicket = fergusTicket;
		this.crystalDust = crystalDust;
		this.crystalChard = crystalChard;
		this.crystal = crystal;
		this.costumeTicket = costumeTicket;
		this.contractOnlyContract = contractOnlyContract;
		this.coloTicket = coloTicket;
		this.mossyCatChest = mossyCatChest;
		this.intactCatChest = intactCatChest;
		this.miniPromotable = miniPromotable;
		this.miniContract = miniContract;
		this.miniBrown = miniBrown;
		this.miniSupply = miniSupply;
		this.miniEvent = miniEvent;
	}
}
