export interface ScarecrowsRaw {
	status: string;
	dummy:  Dummy[];
}

export interface Dummy {
	priority:      number;
	visualid:      string;
	nametext:      string;
	desctext:      string;
	acquirestage:  string;
	standoffskill: string;
	notyettext:    null | string;
	id:            string;
}
