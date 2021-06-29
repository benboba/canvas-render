import { NodeType } from '../constant';
import type { IEventDispatcher } from '../mixins/event-dispatcher';
import { mixinEvent } from '../mixins/event-dispatcher';
import type { IParentNode } from '../mixins/parent-node';
import { raf } from '../module/time/raf';
import type { Sprite } from './sprite';

const repaintKey = Symbol('repaint-key');

export interface Stage extends IParentNode, IEventDispatcher {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	ratio: number;
	width: number;
	height: number;

	children: Sprite[];
}

export class Stage {
	type = NodeType.Stage;
	[repaintKey] = false;

	constructor(canvas: HTMLCanvasElement, ratio = 1) {
		this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.canvas = canvas;
		this.ratio = ratio;
		this.width = canvas.width;
		this.height = canvas.height;
		mixinEvent(this);
	}

	repaint() {
		if (!this[repaintKey]) {
			this[repaintKey] = true;
			raf(() => {
				this[repaintKey] = false;
				this.ctx.clearRect(0, 0, this.width * this.ratio, this.height * this.ratio);
				for (const child of this.children) {
					child.__render();
				}
			});
		}
	}
}
