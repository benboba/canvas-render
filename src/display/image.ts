/*
 * 图片类
 */

import CEvent from '../event/event';
import Sprite, { SpriteOption, HitTestResult } from './sprite';
import Point from '../geom/point';
import Rectangle from '../geom/rectangle';

interface ImageOption extends SpriteOption {
	src?: string;
	width?: number | string;
	height?: number | string;
	clipX?: number;
	clipY?: number;
	clipWidth?: number;
	clipHeight?: number;
}

const imageCache: Record<string, HTMLImageElement> = {};

class CImage extends Sprite {
	constructor(option: ImageOption = {}) {
		super(option);

		this.src = option.src || '';
		this._width = option.width || 'auto';
		this._height = option.height || 'auto';
		this.clipX = option.clipX || 0;
		this.clipY = option.clipY || 0;
		this.clipWidth = option.clipWidth || 0;
		this.clipHeight = option.clipHeight || 0;
	}

	protected keyReg = /x|y|name|alpha|visible|pointerEvents|parent|stage|extraRender|extraHitTest|transform|src|width|height|clipX|clipY|clipWidth|clipHeight/;

	src: string;

	private _width: number | string;
	get width(): number | string {
		return this._width;
	}
	set width(_w: number | string) {
		if ((typeof _w === 'number' || _w === 'auto') && this._width !== _w) {
			this._width = _w;
			this.checkSize();
		}
	}

	private _height: number | string;
	get height(): number | string {
		return this._height;
	}
	set height(_h: number | string) {
		if ((typeof _h === 'number' || _h === 'auto') && this._height !== _h) {
			this._height = _h;
			this.checkSize();
		}
	}

	private realWidth: number = 0;
	private realHeight: number = 0;
	clipX: number;
	clipY: number;
	clipWidth: number;
	clipHeight: number;

	private _canvas?: HTMLCanvasElement;
	get canvas() {
		return this._canvas;
	}

	private _ctx?: CanvasRenderingContext2D;
	get ctx() {
		return this._ctx;
	}

	addedToStage(): void {
		super.addedToStage();

		if (this.src) {
			this.loadImage();
		}
	}

	loadImage(): void {
		let src: string = this.src;

		if (!src || !this.stage) return;

		if (!imageCache[src]) {

			imageCache[src] = new Image();
			imageCache[src].crossOrigin = '';
			imageCache[src].onload = () => {
				if (!imageCache[src].width || !imageCache[src].height || !imageCache[src].src) return;
				this.checkSize();
				this.dispatchEvent(CEvent.LOAD);
			};
			imageCache[src].onerror = () => {
				this.dispatchEvent(CEvent.ERROR);
				delete imageCache[src];
			};
			imageCache[src].src = src;
		} else {
			if (!imageCache[src].width || !imageCache[src].height) {
				this.dispatchEvent(CEvent.ERROR);
				delete imageCache[src];
			} else {
				this.checkSize();
				this.dispatchEvent(CEvent.LOAD);
			}
		}
	}

	checkSize(): void {
		let cacheImg = imageCache[this.src];
		if (cacheImg && cacheImg.width && cacheImg.height) {
			if (this.width === 'auto' || this.height === 'auto') {
				if (this.height !== 'auto') {
					this.realHeight = this.height as number;
					this.realWidth = Math.round(this.realHeight * cacheImg.width / cacheImg.height);
				} else if (this.width !== 'auto') {
					this.realWidth = this.width as number;
					this.realHeight = Math.round(this.realWidth * cacheImg.height / cacheImg.width);
				} else {
					this.realWidth = cacheImg.width;
					this.realHeight = cacheImg.height;
				}
			} else {
				this.realWidth = this.width as number;
				this.realHeight = this.height as number;
			}
			this.repaint = true;
		}
	}

	hitTest(point: Point, x: number, y: number): HitTestResult {
		if (!this.stage || !this.visible || !this.pointerEvents) return {
			target: null
		};

		if (point.hitTest(this.getHitTestArea(x, y))) {
			return {
				target: this
			};
		}

		return {
			target: null
		};
	}

	getHitTestArea(x: number = 0, y: number = 0): Rectangle {
		let height: number,
			width: number;

		x += this.x;
		y += this.y;

		if (this.clipWidth && this.clipHeight) {
			width = this.clipWidth;
			height = this.clipHeight;
		} else {
			width = this.realWidth;
			height = this.realHeight;
		}

		return new Rectangle(x, y, width, height);
	}

	render(): void {
		super.render();

		let src: string = this.src;
		if (!src) return;
		if (!imageCache[src]) {
			this.loadImage();
			return;
		}
		if (!this.realWidth || !this.realHeight) {
			this.checkSize();
		}

		const ctx = this.stage!.ctx;
		const clipWidth: number = this.clipWidth;
		const clipHeight: number = this.clipHeight;
		if (clipWidth && clipHeight) {
			if (this.transform) {
				// 变形之前，首先平移一半的位置
				ctx.translate(clipWidth / 2, clipHeight / 2);
				ctx.transform.apply(ctx, this.transform);
				// 变形之后，平移回一半，使变形中心对应在中心点（可能未必有用）
				ctx.translate(-clipWidth / 2, -clipHeight / 2);
			}
			ctx.drawImage(imageCache[src], this.clipX, this.clipY, clipWidth, clipHeight, 0, 0, this.realWidth, this.realHeight);
		} else {
			if (this.transform) {
				// 变形之前，首先平移一半的位置
				ctx.translate(this.realWidth / 2, this.realHeight / 2);
				ctx.transform.apply(ctx, this.transform);
				// 变形之后，平移回一半，使变形中心对应在中心点（可能未必有用）
				ctx.translate(-this.realWidth / 2, -this.realHeight / 2);
			}
			ctx.drawImage(imageCache[src], 0, 0, this.realWidth, this.realHeight);
		}
	}
}

export default CImage;
