import { bindThis } from '@/decorators.js';
import Module from '@/module.js';
import type { Note } from 'misskey-js/entities.js';

export default class extends Module {
	public readonly name = 'welcome';

	@bindThis
	public install() {
		const tl = this.ai.connection.useChannel('localTimeline', { withRenotes: false });

		tl.on('note', this.onLocalNote);

		return {};
	}

	@bindThis
	private onLocalNote(note: Note) {
		// @ts-expect-error
		if (note.isFirstNote) {
			setTimeout(() => {
				this.ai.api('notes/create', {
					renoteId: note.id
				});
			}, 3000);

			setTimeout(() => {
				this.ai.api('notes/reactions/create', {
					noteId: note.id,
					reaction: 'congrats'
				});
			}, 5000);
		}
	}
}
