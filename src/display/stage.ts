import { IStage } from 'src/types';
/*
 * 舞台，Canvas渲染的根元素
 */

import { Point } from '../geom/point';
import { Anime } from '../utils/anime';
import { HitTestResult, Sprite, SpriteOption } from './sprite';

export interface StageOption extends SpriteOption {
	width?: number;
	height?: number;
	canvas: HTMLCanvasElement;
	ratioX?: number;
	ratioY?: number;
	debug?: boolean;
}

export class Stage extends Sprite implements IStage {
	constructor(option: StageOption) {
		super(option);

		let canvas = option.canvas;
		if (!canvas || !canvas.nodeType || canvas.nodeType !== 1 || !canvas.tagName || canvas.tagName !== 'CANVAS') {
			throw ('请传入canvas对象！');
		}

		this._canvas = canvas;
		let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this._ctx = ctx;
		this.stage = this;
		this.width = option.width || 0;
		this.height = option.height || 0;
		this.ratioX = option.ratioX || 1;
		this.ratioY = option.ratioY || 1;
		this._repaint = true;

		let now: number = +new Date,
			fps: number = 0,
			len: number = 0,
			self: Stage = this;

		this.paintFn = option.debug ? function () {
			let repaint = self._repaint,
				_now: number = +new Date;

			self.paint();
			if (repaint) {
				let _fps: number = Math.floor(1000 / (_now - now));
				fps += _fps, len++;

				let _average: number = Math.round(fps / len);
				ctx.fillStyle = '#000';
				ctx.font = '24px 微软雅黑';
				ctx.fillText('FPS : ' + Math.floor(1000 / (_now - now)) + ' / ' + _average, 10, 30);
			}
			now = _now;
		} : function () {
			self.paint();
		};
		Anime.listen(this.paintFn);
	}

	protected keyReg = /x|y|name|alpha|visible|pointerEvents|parent|stage|extraRender|extraHitTest|transform|width|height|ratioX|ratioY|canvas|ctx|repaint/;

	private paintFn: () => void;

	private _canvas;
	get canvas() {
		return this._canvas;
	}

	private _ctx;
	get ctx() {
		return this._ctx;
	}

	width: number;
	height: number;
	ratioX: number;
	ratioY: number;
	_repaint: boolean;

	/*
	 * 舞台的渲染规则单独处理
	 * 1、舞台自身不进行渲染
	 * 2、舞台在渲染子类前进行一次缩放
	 */
	prepareRender(x: number, y: number, alpha: number): void {
		let ctx = this.ctx;
		if (!ctx) return;

		ctx.save();
		ctx.scale(this.ratioX, this.ratioY);
		/*
		 * 渲染每个子类
		 */
		for (let i: number = 0, l: number = this.numChildren; i < l; i++) {
			this.children[i].prepareRender(x + this.x, y + this.y, alpha * this.alpha);
		}
		ctx.restore();
	}

	/*
	 * 如果没有任何子对象触发碰撞，舞台自身将响应碰撞
	 */
	hitTest(point: Point, x: number = 0, y: number = 0): HitTestResult {
		let child_hit_test: HitTestResult = super.hitTest(point, x, y);
		if (child_hit_test.target !== null) {
			return child_hit_test;
		} else {
			return {
				target: this
			};
		}
	}

	paint(): void {
		if (this._repaint) {
			const canvas = this.canvas;
			this._repaint = false;
			this.ctx.clearRect(0, 0, +(canvas.getAttribute('width') as string), +(canvas.getAttribute('height') as string));
			this.prepareRender(0, 0, 1);
		}
	}

	// stage不可以真正被remove
	remove() {
		this.destroyEvent();
		this.removeChildren();
		Anime.unlisten(this.paintFn, null);
		return this;
	}
}
