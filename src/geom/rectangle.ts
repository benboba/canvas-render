/*
 * 矩形
 * 主要用于hitTest
 */

interface IPoint {
	x: number;
	y: number;
}

export class Rectangle {
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	x: number;
	y: number;
	width: number;
	height: number;

	hitTest(target: IPoint | Rectangle) {
		if (target instanceof Rectangle) {
			let tgt = target as Rectangle;
			return !(tgt.x > this.x + this.width || tgt.x + tgt.width < this.x || tgt.y > this.y + this.height || tgt.y + tgt.height < this.y);
		} else {
			return target.x >= this.x && target.x <= this.x + this.width && target.y >= this.y && target.y <= this.y + this.height;
		}
	}
}
