/*
 * 事件
 */

import { CREvent } from '.';

export class CRTouchEvent extends CREvent {
	constructor(type = '', bubble = false) {
		super(type, bubble);
	}

	x = 0;
	y = 0;
}
