import { CImage } from './display/image';
import { HitTestResult, Sprite } from './display/sprite';
import { Stage, StageOption } from './display/stage';
import { TextContent } from './display/textcontent';
import { CEvent } from './event/event';
import { CTouchEvent } from './event/touchevent';
import { Matrix } from './geom/matrix';
import { Point } from './geom/point';
import { Rectangle } from './geom/rectangle';

export { Sprite, Stage, TextContent, CImage as Image, Matrix, Rectangle, Point, CEvent as Event, CTouchEvent as TouchEvent };

interface Size {
	width: number;
	height: number;
}

interface CanvasRenderOption extends StageOption {
	global_scale?: number;
	noResize?: boolean;
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
	const _touch = ev.changedTouches[0];
	const _x: number = _touch.pageX;
	const _y: number = _touch.pageY;
	const eventTarget: HitTestResult = this.hitTest(new Point(_x, _y));
	touchStart(_x, _y, eventTarget);
}

function wrapMouseStart(this: CanvasRender, ev: MouseEvent): void {
	if (touchCache.target) return;
	const _x: number = ev.pageX;
	const _y: number = ev.pageY;
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
	if (!touchCache.target) return;

	touchCache.moved = true;

	if (!this.noTouchMove) {
		ev.preventDefault();
		touchMove(ev.pageX, ev.pageY);
	}
}

function wrapTouchMove(this: CanvasRender, ev: TouchEvent): void {
	if (!touchCache.target) return;

	let _touch = ev.changedTouches[0];

	touchCache.moved = true;

	if (!this.noTouchMove) {
		ev.preventDefault();
		touchMove(_touch.pageX, _touch.pageY);
	}
}

function touchEnd(x: number, y: number): void {
	clearTimeout(touchTimer);

	const touchEndEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHEND);
	touchEndEv.attr({
		bubble: true,
		x,
		y,
		target: touchCache.target
	});
	touchCache.target!.dispatchEvent(touchEndEv);

	if (!touchCache.moved && !touchCache.timeout) {
		let tapEv: CTouchEvent = new CTouchEvent(CTouchEvent.TAP);
		tapEv.attr({
			bubble: true,
			x,
			y,
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

	touchEnd(ev.pageX, ev.pageY);
}

function wrapTouchEnd(ev: TouchEvent): void {
	if (!touchCache.target) return;

	ev.preventDefault();

	const _touch = ev.changedTouches[0];
	touchEnd(_touch.pageX, _touch.pageY);
}

function wrapClick(this: CanvasRender, ev: MouseEvent): void {
	const _x = ev.pageX;
	const _y = ev.pageY;
	const eventTarget = this.hitTest(new Point(_x, _y));
	const clickEv = new CTouchEvent(CTouchEvent.CLICK);

	clickEv.attr({
		bubble: true,
		x: _x,
		y: _y,
		target: eventTarget.target
	});
	eventTarget.target!.dispatchEvent(clickEv);
}

function wrapResize(this: CanvasRender): void {
	this.resize({
		width: docElem.clientWidth,
		height: docElem.clientHeight
	});
}

export class CanvasRender extends Stage {
	constructor(option: any = {}) {

		super(option);

		let canvas = this.canvas;
		const globalScale = option.global_scale || 2;
		const elem = canvas.parentElement || docElem;
		const elemStyles = window.getComputedStyle(elem);
		const width = parseFloat(option.width) || elem.clientWidth - parseFloat(elemStyles.paddingLeft) - parseFloat(elemStyles.paddingRight);
		const height = parseFloat(option.height) || elem.clientHeight - parseFloat(elemStyles.paddingTop) - parseFloat(elemStyles.paddingBottom);

		this.noResize = option.noResize || false;
		this.noTouchMove = option.noTouchMove || false;

		this.width = width;
		this.height = height;
		this.ratioX = globalScale;
		this.ratioY = globalScale;

		canvas.style.cssText += `width:${width}px;height:${height}px;`;
		canvas.setAttribute('width', `${width * globalScale}`);
		canvas.setAttribute('height', `${height * globalScale}`);

		canvas.addEventListener('touchstart', wrapTouchStart.bind(this));
		canvas.addEventListener('touchmove', wrapTouchMove.bind(this));
		canvas.addEventListener('touchend', wrapTouchEnd.bind(this));
		canvas.addEventListener('touchcancel', wrapTouchEnd.bind(this));
		canvas.addEventListener('mousedown', wrapMouseStart.bind(this));
		document.documentElement.addEventListener('mousemove', wrapMouseMove.bind(this));
		document.documentElement.addEventListener('mouseup', wrapMouseEnd.bind(this));
		canvas.addEventListener('click', wrapClick.bind(this));

		if (!this.noResize && !width && !height) {
			window.addEventListener('resize', wrapResize.bind(this));
		}
	}

	private noResize: boolean;
	noTouchMove: boolean;

	protected keyReg = /x|y|name|alpha|visible|pointerEvents|parent|stage|extraRender|extraHitTest|transform|width|height|ratioX|ratioY/;

	resize(option: Size = { width: 0, height: 0 }) {
		let width: number = option.width || docElem.clientWidth,
			height: number = option.height || docElem.clientHeight,
			canvas = this.canvas;

		// docElem.scrollTop = document.body.scrollTop = 0;

		this.width = width;
		this.height = height;

		canvas.style.cssText += `width:${width}px;height:${height}px;`;
		canvas.setAttribute('width', `${width * this.ratioX}`);
		canvas.setAttribute('height', `${height * this.ratioY}`);

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
		canvas.removeEventListener('touchend', wrapTouchEnd);
		canvas.removeEventListener('touchcancel', wrapTouchEnd);
		canvas.removeEventListener('mousedown', wrapMouseStart.bind(this));
		canvas.removeEventListener('mousemove', wrapMouseMove.bind(this));
		canvas.removeEventListener('mouseup', wrapMouseEnd.bind(this));
		canvas.removeEventListener('click', wrapClick.bind(this));
		window.removeEventListener('resize', wrapResize);

		super.remove();
		return this;
	}
}
