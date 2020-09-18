/*
 * 事件
 */

export class CEvent {
	constructor(eventname: string = '', bubble: boolean = false) {
		this._type = eventname;
		this._bubble = bubble;
	}

	protected keyReg = /type|bubble|target/;

	private _type: string;
	get type(): string {
		return this._type;
	}
	set type(_type: string) {
		this._type = _type;
	}

	private _bubble: boolean;
	get bubble(): boolean {
		return this._bubble;
	}
	set bubble(_b: boolean) {
		this._bubble = _b;
	}

	target: any;

	stopPaganation() {
		this.bubble = false;
	}

	attr(key: string | Record<string, any>, val?: any) {
		if (typeof key === 'object') {
			for (const k in key) {
				if (key.hasOwnProperty(k) && this.keyReg.test(k)) {
					this[k as keyof this] = key[k as keyof CEvent];
				}
			}
		} else {
			if (val) {
				if (this.keyReg.test(key)) {
					this[key as keyof this] = val;
				}
			} else {
				if (this.keyReg.test(key)) {
					return this[key as keyof this];
				}
				return null;
			}
		}
		return this;
	}

	// 事件常量
	static ENTER_FRAME = 'enter_frame'; // 每次渲染时触发
	static ADDED_TO_STAGE = 'added_to_stage'; // 插入场景时触发
	static TOUCHSTART = 'touchstart';
	static TOUCHMOVE = 'touchmove';
	static TOUCHEND = 'touchend';
	static TAP = 'tap';
	static CLICK = 'click';
	static LOAD = 'load';
	static ERROR = 'error';
	static RESIZE = 'resize';
}
