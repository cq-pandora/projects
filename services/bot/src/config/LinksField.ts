import { deserialize, deserializeAs } from 'cerialize';

class Link {
	@deserialize public readonly title!: string;
	@deserialize public readonly url?: string;
}

export default class LinksField {
	@deserialize public readonly title!: string;
	@deserializeAs(Link) public readonly entries!: Link[];
}
