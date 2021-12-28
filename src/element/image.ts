import { IHitTestResult } from '../mixins/hit-test';
import { ICoodinate } from '../types/geom';
import { Sprite } from './sprite';

export interface IImageOption {
    src: string;
    width?: number;
    height?: number;
    clipX?: number;
    clipY?: number;
    clipWidth?: number;
    clipHeight?: number;
}

const CoreImg = window.Image;
const imgKey = Symbol();

export class Image extends Sprite {
	constructor(option: IImageOption) {
		super();
        this[imgKey] = new CoreImg();
        this[imgKey].src = option.src;
	}

    [imgKey]: HTMLImageElement;

    override render() {
        if (!this.stage) return;
        this.stage.ctx.drawImage(this[imgKey], 0, 0);
    }

	override hitTest(target: Sprite): IHitTestResult {
		return { target: null };
	}

	override hitTestPoint(point: ICoodinate): IHitTestResult {
		return { target: null };
	}
}