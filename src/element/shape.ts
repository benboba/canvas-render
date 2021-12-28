import { IHitTestResult } from '../mixins/hit-test';
import { ICoodinate, TPathItem } from '../types/geom';
import { Sprite } from './sprite';

export interface IShapeItem {
	stroke: string;
	fill: string;
	path: TPathItem[];
}

const shapeKey = Symbol();

export class Shape extends Sprite {
	constructor() {
		super();
		this[shapeKey] = [];
	}

	[shapeKey]: IShapeItem[];

	addShape(shape: IShapeItem) {
		this[shapeKey].push(shape);
	};

	removeShape(item: IShapeItem) {
		const index = this[shapeKey].indexOf(item);
		if (index !== -1) {
			this[shapeKey].splice(index, 1);
		}
	};

	clearShape() {
		this[shapeKey].length = 0;
	};

	override render() {
		if (!this.stage) return;
		const ctx = this.stage.ctx;
		for (const shape of this[shapeKey]) {
			ctx.fillStyle = shape.fill;
			ctx.strokeStyle = shape.stroke;
			for (const pathItem of shape.path) {
				switch (pathItem.type) {
					case 'M':
						ctx.beginPath();
						ctx.moveTo(pathItem.val[0], pathItem.val[1]);
						break;
					case 'L':
						ctx.lineTo(pathItem.val[0], pathItem.val[1]);
						break;
					case 'C':
						ctx.bezierCurveTo(pathItem.val[0], pathItem.val[1], pathItem.val[2], pathItem.val[3], pathItem.val[4], pathItem.val[5]);
						break;
					case 'Q':
						ctx.quadraticCurveTo(pathItem.val[0], pathItem.val[1], pathItem.val[2], pathItem.val[3]);
						break;
					case 'A':
						ctx.arcTo(pathItem.val[0], pathItem.val[1], pathItem.val[2], pathItem.val[3], pathItem.val[4]);
						break;
					case 'Z':
						ctx.closePath();
						break;
				}
			}
			ctx.fill();
			ctx.stroke();
		}

		super.render();
	}

	override hitTest(target: Sprite): IHitTestResult {
		return { target: null };
	}

	override hitTestPoint(point: ICoodinate): IHitTestResult {
		return { target: null };
	}
}