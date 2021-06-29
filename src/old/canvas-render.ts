import { CImage } from './display/image';
import { HitTestResult, Sprite } from './display/sprite';
import { Stage, StageOption } from './display/stage';
import { TextContent } from './display/textcontent';
import { CEvent } from './event/event';
import { CTouchEvent } from './event/touchevent';
import { Matrix } from './geom/matrix';
import { Point } from './geom/point';
import { Rectangle } from './geom/rectangle';
import { Anime } from './utils/anime';

export { Anime, Sprite, Stage, TextContent, CImage as Image, Matrix, Rectangle, Point, CEvent as Event, CTouchEvent as TouchEvent };

interface Size {
	width: number;
	height: number;
}

interface CanvasRenderOption extends StageOption {
	global_scale?: number;
	noTouchMove?: boolean;
}

interface TouchCache {
	target: Sprite | null;
	moved: boolean;
	timeout: boolean;
}

const docElem = document.documentElement;

let touchCache: TouchCache = {
	target: null,
	moved: false,
	timeout: false
};
let touchTimer: number;

function touchStart(x: number, y: number, eventTarget: HitTestResult) {
	const touchStartEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHSTART);
	touchStartEv.attr({
		bubble: true,
		x,
		y,
		target: eventTarget.target
	});
	eventTarget.target!.dispatchEvent(touchStartEv);

	touchCache.target = eventTarget.target;
	touchCache.moved = false;
	touchCache.timeout = false;

	clearTimeout(touchTimer);
	touchTimer = window.setTimeout(function () {
		touchCache.timeout = true;
	}, 500);
}

function wrapTouchStart(this: CanvasRender, ev: TouchEvent): void {
	if (touchCache.target) return;
	const rect = (ev.target as HTMLElement).getBoundingClientRect();
	const _touch = ev.changedTouches[0];
	const _x: number = _touch.pageX - rect.x;
	const _y: number = _touch.pageY - rect.y;
	const eventTarget: HitTestResult = this.hitTest(new Point(_x, _y));
	touchStart(_x, _y, eventTarget);
}

function wrapMouseStart(this: CanvasRender, ev: MouseEvent): void {
	if (touchCache.target) return;
	const rect = (ev.target as HTMLElement).getBoundingClientRect();
	const _x = ev.pageX - rect.x;
	const _y = ev.pageY - rect.y;
	const eventTarget: HitTestResult = this.hitTest(new Point(_x, _y));
	touchStart(_x, _y, eventTarget);
}

function touchMove(x: number, y: number): void {
	let touchMoveEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHMOVE);
	touchMoveEv.attr({
		bubble: true,
		x,
		y,
		target: touchCache.target
	});
	touchCache.target!.dispatchEvent(touchMoveEv);
}

function wrapMouseMove(this: CanvasRender, ev: MouseEvent): void {
	const rect = (ev.target as HTMLElement).getBoundingClientRect();
	const _x = ev.pageX - rect.x;
	const _y = ev.pageY - rect.y;

	let mouseMoveEv: CTouchEvent = new CTouchEvent(CTouchEvent.MOUSEMOVE);
	mouseMoveEv.attr({
		bubble: true,
		x: _x,
		y: _y,
		target: this,
	});
	this.dispatchEvent(mouseMoveEv);

	if (!touchCache.target) return;

	touchCache.moved = true;

	if (!this.noTouchMove) {
		ev.preventDefault();
		touchMove(_x, _y);
	}
}

function wrapTouchMove(this: CanvasRender, ev: TouchEvent): void {
	if (!touchCache.target) return;

	let _touch = ev.changedTouches[0];

	touchCache.moved = true;

	if (!this.noTouchMove) {
		ev.preventDefault();
		const rect = (ev.target as HTMLElement).getBoundingClientRect();
		const _x = _touch.pageX - rect.x;
		const _y = _touch.pageY - rect.y;
		touchMove(_x, _y);
	}
}

function touchEnd(x: number, y: number, which?: number): void {
	clearTimeout(touchTimer);

	const touchEndEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHEND);
	touchEndEv.attr({
		bubble: true,
		x,
		y,
		which,
		target: touchCache.target
	});
	touchCache.target!.dispatchEvent(touchEndEv);

	if (!touchCache.moved && !touchCache.timeout) {
		let tapEv: CTouchEvent = new CTouchEvent(CTouchEvent.TAP);
		tapEv.attr({
			bubble: true,
			x,
			y,
			which,
			target: touchCache.target
		});
		touchCache.target!.dispatchEvent(tapEv);
	}

	touchCache.target = null;
	touchCache.moved = false;
	touchCache.timeout = false;
}

function wrapMouseEnd(ev: MouseEvent): void {
	if (!touchCache.target) return;

	ev.preventDefault();

	const rect = (ev.target as HTMLElement).getBoundingClientRect();
	const _x = ev.pageX - rect.x;
	const _y = ev.pageY - rect.y;
	touchEnd(_x, _y, ev.which);
}

function wrapTouchEnd(ev: TouchEvent): void {
	if (!touchCache.target) return;

	ev.preventDefault();

	const _touch = ev.changedTouches[0];
	const rect = (ev.target as HTMLElement).getBoundingClientRect();
	const _x = _touch.pageX - rect.x;
	const _y = _touch.pageY - rect.y;
	touchEnd(_x, _y);
}

function wrapClick(this: CanvasRender, ev: MouseEvent): void {
	const rect = (ev.target as HTMLElement).getBoundingClientRect();
	const _x = ev.pageX - rect.x;
	const _y = ev.pageY - rect.y;
	const eventTarget = this.hitTest(new Point(_x, _y));
	const clickEv = new CTouchEvent(CTouchEvent.CLICK);

	clickEv.attr({
		bubble: true,
		x: _x,
		y: _y,
		which: ev.which,
		target: eventTarget.target
	});
	eventTarget.target!.dispatchEvent(clickEv);
	ev.preventDefault();
}

export class CanvasRender extends Stage {
	constructor(option: any = {}) {
		super(option);
		this.noTouchMove = option.noTouchMove || false;
		const canvas = this.canvas;
		const globalScale = option.global_scale || 2;
		this.ratioX = globalScale;
		this.ratioY = globalScale;

		this.calcResize(parseFloat(option.width), parseFloat(option.height));

		canvas.addEventListener('touchstart', wrapTouchStart.bind(this));
		canvas.addEventListener('touchmove', wrapTouchMove.bind(this));
		canvas.addEventListener('touchend', wrapTouchEnd.bind(this));
		canvas.addEventListener('touchcancel', wrapTouchEnd.bind(this));
		canvas.addEventListener('mousedown', wrapMouseStart.bind(this));
		document.documentElement.addEventListener('mousemove', wrapMouseMove.bind(this));
		document.documentElement.addEventListener('mouseup', wrapMouseEnd.bind(this));
		canvas.addEventListener('click', wrapClick.bind(this));
	}

	noTouchMove: boolean;

	protected keyReg = /x|y|name|alpha|visible|pointerEvents|parent|stage|extraRender|extraHitTest|transform|width|height|ratioX|ratioY/;

	calcResize(w: number, h: number) {
		const canvas = this.canvas;
		const elem = canvas.parentElement || docElem;
		const elemStyles = window.getComputedStyle(elem);
		const width = w || elem.clientWidth - parseFloat(elemStyles.paddingLeft) - parseFloat(elemStyles.paddingRight);
		const height = h || elem.clientHeight - parseFloat(elemStyles.paddingTop) - parseFloat(elemStyles.paddingBottom);

		this.width = width;
		this.height = height;

		canvas.style.cssText += `width:${width}px;height:${height}px;`;
		canvas.setAttribute('width', `${width * this.ratioX}`);
		canvas.setAttribute('height', `${height * this.ratioY}`);
	}

	resize(w: number = 0, h: number = 0) {
		this.calcResize(w, h);
		for (let i: number = 0, l: number = this.numChildren; i < l; i++) {
			this.children[i].dispatchEvent(CEvent.RESIZE);
		}
		this.dispatchEvent(CEvent.RESIZE);
		this.repaint = true;
		return this;
	}

	destroy() {
		let canvas = this.canvas;

		canvas.removeEventListener('touchstart', wrapTouchStart.bind(this));
		canvas.removeEventListener('touchmove', wrapTouchMove.bind(this));
		canvas.removeEventListener('touchend', wrapTouchEnd.bind(this));
		canvas.removeEventListener('touchcancel', wrapTouchEnd.bind(this));
		canvas.removeEventListener('mousedown', wrapMouseStart.bind(this));
		document.documentElement.removeEventListener('mousemove', wrapMouseMove.bind(this));
		document.documentElement.removeEventListener('mouseup', wrapMouseEnd.bind(this));
		canvas.removeEventListener('click', wrapClick.bind(this));

		super.remove();
		return this;
	}
}
