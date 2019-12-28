import { ExtractedMentions, MentionType } from '../../common-types';

export default function extractMentions(messageText: string): ExtractedMentions[] {
	const res: ExtractedMentions[] = [];
	const regexes: Record<MentionType, RegExp> = {
		user: /<@!?(\d+)>/gm,
		channel: /<#(\d+)>/gm,
		role: /<@&(\d+)>/gm,
		emoji: /<a?:.*:(\d+)>/gm,
	};

	for (const [mentionType, regex] of Object.entries(regexes)) {
		let match;
		const type = mentionType as MentionType;

		// eslint-disable-next-line no-cond-assign
		while (match = regex.exec(messageText)) {
			res.push({
				type,
				id: match[1],
				text: match[0],
			});
		}
	}

	return res;
}
