export interface CharacterProfilesRaw {
	status: string;
	character_profile: CharacterProfile[];
}

export interface CharacterProfile {
	age: string;
	birth: string;
	hobby: string;
	likes: string;
	hates: string;
	etc: string;
	// hero form id, usually the highest grade form
	id: string;
}

export interface OztalkChatInfoRaw {
	status: string;
	oztalk_chat_info: OztalkChatInfo[];
}

export interface OztalkChatInfo {
	chatid: string;
	chatimage: string;
	chatname: string;
	// hero form ids in the chat room
	chathero: string[] | null;
}
