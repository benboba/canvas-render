/*
 * 二维空间点
 * 主要用于hitTest
 */

interface IRectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class Point {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	x: number;
	y: number;

	hitTest(target: IRectangle): boolean {
		return this.x >= target.x && this.x <= target.x + target.width && this.y >= target.y && this.y <= target.y + target.height;
	}
}
