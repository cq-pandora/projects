import { HeroForm, HeroSBW } from '@cquest/entities';

export default function getKey(field: string, form: HeroForm | undefined, sbw: HeroSBW | undefined): string | null {
	switch (field) {
		case 'block-name': return form!.blockName;
		case 'block-description': return form!.blockDescription;
		case 'passive-name': return form!.passiveName;
		case 'passive-description': return form!.passiveDescription;
		case 'lore': return form!.lore;
		case 'name': return form!.name;
		case 'sbw-name': return sbw!.name;
		case 'sbw-ability': return sbw!.ability;
		default: return null;
	}
}
