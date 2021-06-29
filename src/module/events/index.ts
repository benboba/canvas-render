/*
 * 事件
 */

import type { IEventDispatcher } from '../../mixins/event-dispatcher';

export class CREvent {
    type: string;
    bubble: boolean;
	which?: number;
	target?: IEventDispatcher;

	constructor(type = '', bubble = false) {
		this.type = type;
		this.bubble = bubble;
	}

	stopPaganation() {
		this.bubble = false;
	}
}
