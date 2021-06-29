/*
 * 事件
 */

import { CEvent } from './event';

export class CTouchEvent extends CEvent {
	constructor(eventname: string = '', bubble: boolean = false) {
		super(eventname, bubble);
	}

	protected keyReg = /type|bubble|target|which|x|y|pageX|pageY/;

	x: number = 0;
	y: number = 0;

	// 事件常量
	static TOUCHSTART = 'touchstart';
	static MOUSEMOVE = 'mousemove';
	static TOUCHMOVE = 'touchmove';
	static TOUCHEND = 'touchend';
	static TAP = 'tap';
	static CLICK = 'click';
}
