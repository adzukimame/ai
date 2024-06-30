export type Note = {
	id: string;
	userId: string;
	text: string | null;
	cw: string | null;
	reply: any | null;
	poll?: {
		choices: {
			votes: number;
			text: string;
		}[];
		expiredAfter: number;
		multiple: boolean;
	} | null;
	visibility: string;
};
