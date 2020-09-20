import { CImage } from './display/image';
import { HitTestResult, Sprite } from './display/sprite';
import { Stage, StageOption } from './display/stage';
import { TextContent } from './display/textcontent';
import { CEvent } from './event/event';
import { CTouchEvent } from './event/touchevent';
import { Matrix } from './geom/matrix';
import { Point } from './geom/point';

export { Sprite, Stage, TextContent, CImage, Matrix };

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
let touchTimer: ReturnType<typeof setTimeout>;

function wrapTouchStart(this: CanvasRender, ev: TouchEvent): void {
	if (touchCache.target) return;
	let _touch = ev.changedTouches[0];
	const _x: number = _touch.pageX;
	const _y: number = _touch.pageY;
	const eventTarget: HitTestResult = this.hitTest(new Point(_x, _y));
	const touchStartEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHSTART);

	touchStartEv.attr({
		bubble: true,
		x: _x,
		y: _y,
		target: eventTarget.target
	});
	eventTarget.target!.dispatchEvent(touchStartEv);

	touchCache.target = eventTarget.target;
	touchCache.moved = false;
	touchCache.timeout = false;

	clearTimeout(touchTimer);
	touchTimer = setTimeout(function () {
		touchCache.timeout = true;
	}, 500);
}

function wrapTouchMove(this: CanvasRender, ev: TouchEvent): void {
	if (!touchCache.target) return;

	let _touch = ev.changedTouches[0];

	touchCache.moved = true;

	if (!this.noTouchMove) {
		ev.preventDefault();
		let touchMoveEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHMOVE);
		touchMoveEv.attr({
			bubble: true,
			x: _touch.pageX,
			y: _touch.pageY,
			target: touchCache.target
		});
		touchCache.target.dispatchEvent(touchMoveEv);
	}
}

function wrapTouchEnd(ev: TouchEvent): void {
	if (!touchCache.target) return;

	ev.preventDefault();

	let _touch = ev.changedTouches[0],
		_x: number = _touch.pageX,
		_y: number = _touch.pageY;

	clearTimeout(touchTimer);
	touchTimer = 0;

	let touchEndEv: CTouchEvent = new CTouchEvent(CTouchEvent.TOUCHEND);
	touchEndEv.attr({
		bubble: true,
		x: _x,
		y: _y,
		target: touchCache.target
	});
	touchCache.target.dispatchEvent(touchEndEv);

	if (!touchCache.moved && !touchCache.timeout) {
		let tapEv: CTouchEvent = new CTouchEvent(CTouchEvent.TAP);
		tapEv.attr({
			bubble: true,
			x: _x,
			y: _y,
			target: touchCache.target
		});
		touchCache.target.dispatchEvent(tapEv);
	}

	touchCache.target = null;
	touchCache.moved = false;
	touchCache.timeout = false;
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
		const width = parseFloat(option.width) || (canvas.parentElement || docElem).clientWidth;
		const height = parseFloat(option.height) || (canvas.parentElement || docElem).clientHeight;

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
		canvas.removeEventListener('click', wrapClick.bind(this));
		window.removeEventListener('resize', wrapResize);

		super.remove();
		return this;
	}
}
