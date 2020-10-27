/*
 * 精灵类，实现子对象管理相关功能
 */
import { EventDispatcher } from '../base/eventdispatcher';
import { CEvent } from '../event/event';
import { CTouchEvent } from '../event/touchevent';
import { Matrix } from '../geom/matrix';
import { Point } from '../geom/point';
import { Rectangle } from '../geom/rectangle';
import { IEventObject, IFn, ISprite, IStage, TEmptyFn } from '../types';

export interface HitTestResult {
	target: Sprite | null;
}

interface Pos {
	x: number;
	y: number;
	touchX: number;
	touchY: number;
}

export interface SpriteOption {
	name?: string;
	x?: number;
	y?: number;
	alpha?: number;
	visible?: boolean;
	pointerEvents?: boolean;
	extraRender?: TEmptyFn;
	extraHitTest?: IFn<any[], HitTestResult>;
	hitTestArea?: Rectangle;
	transform?: string;
}

export class Sprite extends EventDispatcher implements ISprite {
	constructor(option: SpriteOption = {}) {
		super();

		this._children = [];

		this.name = option.name || '';
		this.x = option.x || 0;
		this.y = option.y || 0;
		this._alpha = option.alpha || 1;
		this.visible = option.visible || true;
		this.pointerEvents = option.pointerEvents || true;
		this._extraRender = option.extraRender || null;
		this._extraHitTest = option.extraHitTest || null;
		this.hitTestArea = option.hitTestArea;
		if (option.transform) {
			this.setTransform(option.transform);
		}
		this.addEventListener(CEvent.ADDED_TO_STAGE, this.addedToStage);
	}

	protected keyReg = /x|y|name|alpha|visible|pointerEvents|parent|stage|extraRender|extraHitTest|transform/;

	private _children: ISprite[];
	get children() {
		return this._children;
	}

	get numChildren(): number {
		return this.children.length;
	}

	set repaint(_r: boolean) {
		if (this.stage) {
			this.stage._repaint = _r;
		}
	}

	get depth() {
		if (this.parent === null) {
			return 0;
		} else {
			for (let d: number = this.parent!.numChildren; d--;) {
				if (this.parent!.children[d] === this) {
					return d;
				}
			}
			return 0;
		}
	}

	name: string;
	x: number;
	y: number;

	private _alpha: number;
	get alpha(): number {
		return this._alpha;
	}
	set alpha(_a: number) {
		this._alpha = Math.min(Math.max(_a, 0), 1);
	}

	visible: boolean;
	pointerEvents: boolean;
	parent?: ISprite | null;
	stage?: IStage | null;
	hitTestArea?: Rectangle;

	private _extraRender;
	get extraRender() {
		return this._extraRender;
	}
	set extraRender(_eR) {
		if (_eR === null || typeof _eR === 'function') {
			this._extraRender = _eR;
		}
	}

	private _extraHitTest;
	get extraHitTest() {
		return this._extraHitTest;
	}
	set extraHitTest(_eH) {
		if (_eH === null || typeof _eH === 'function') {
			this._extraHitTest = _eH;
		}
	}

	private _transform: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
	get transform() {
		return this._transform;
	}

	attr(key: string | Record<string, string>, val: string | null = null) {
		if (typeof key === 'object') {
			for (let k in key) {
				this.attr(k, key[k]);
			}
		} else if (typeof key === 'string') {
			if (val && this.keyReg.test(key)) {
				if (key === 'transform') {
					this.setTransform(val);
				} else {
					this[key as 'name'] = val;
				}
			} else {
				if (this.keyReg.test(key)) {
					return this[key as 'name'];
				}
				return null;
			}
		}
		return this;
	}

	setTransform(newtransform: string): Sprite {
		var mtx = /matrix\((.+?)\)/.exec(newtransform);
		if (mtx) {
			this._transform = mtx[1].split(/\s*,\s*/).map(function (n) { return parseFloat(n); }) as Sprite['_transform'];
		} else {
			var translate = /translate\((.+?)\)/.exec(newtransform);
			var scale = /scale\((.+?)\)/.exec(newtransform);
			var rotate = /rotate\((.+?)\)/.exec(newtransform);
			var matrix = new Matrix();
			if (translate) {
				var translate_arg = translate[1].split(/\s*,\s*/);
				matrix.translate(parseFloat(translate_arg[0]), parseFloat(translate_arg[1]));
			}
			if (scale) {
				var scale_arg = scale[1].split(/\s*,\s*/);
				if (!scale_arg[1]) {
					matrix.scale(parseFloat(scale_arg[0]));
				}
				else {
					matrix.scale(parseFloat(scale_arg[0]), parseFloat(scale_arg[1]));
				}
			}
			if (rotate) {
				var rotate_arg = rotate[1];
				if (rotate_arg.indexOf('deg') > 0) {
					matrix.rotate(parseFloat(rotate_arg) * Math.PI / 180);
				}
				else {
					matrix.rotate(parseFloat(rotate_arg));
				}
			}
			this._transform = matrix.vals as Sprite['_transform'];
		}
		return this;
	}

	/*
	 * 放入场景时，处理所有子对象
	 */
	addedToStage(): void {
		const l = this.numChildren;
		const stage = this.stage;

		if (l && stage) {
			for (let i = 0; i < l; i++) {
				this.children[i].stage = stage;
			}
		}
	}

	/*
	 * 渲染方法，逐级传入父元素的偏移量和透明度
	 * @param x, y {Number} 偏移量
	 * @param alpha {Number} 实际透明度
	 */
	prepareRender(): void {
		let stage = this.stage;

		// 未在场景中，或不可见，则不渲染
		if (!stage || !this.visible) return;

		// 完全透明不渲染
		if (this.alpha <= 0) {
			return;
		}

		let ctx = stage.ctx;

		ctx.save();
		ctx.globalAlpha = this.alpha;
		if (this.transform) {
			ctx.translate(this.x, this.y);
			ctx.transform.apply(ctx, this.transform);
			ctx.translate(-this.x, -this.y);
		}
		ctx.translate(this.x, this.y);
		this.render();

		if (this.extraRender) {
			this.extraRender();
		}

		/*
		 * 渲染每个子类
		 */
		for (let i: number = 0, l: number = this.numChildren; i < l; i++) {
			let child = this.children[i];
			// 此处修正所有子对象的parent属性
			if (child.parent !== this) {
				child.parent = this;
			}
			child.prepareRender();
		}

		ctx.restore();
	}

	/*
	 * 用于复写的实际渲染方法
	 */
	render(): void {}

	hitTest(point: Point, x: number = 0, y: number = 0): HitTestResult {
		if (!this.stage || !this.visible || !this.pointerEvents) return {
			target: null
		};

		const [a, b, c, d, e, f] = this.transform;

		// NOTE：此循环顺序不可逆，从最上面开始判断
		for (let i: number = this.numChildren; i--;) {
			let hit_test: HitTestResult = this.children[i].hitTest(point, x + this.x, y + this.y);
			if (hit_test.target !== null) {
				return hit_test;
			}
		}

		if (this.hitTestArea) {
			const w = a * this.hitTestArea.width + c * this.hitTestArea.height + e;
			const h = b * this.hitTestArea.width + d * this.hitTestArea.height + f;
			const _x = a * this.hitTestArea.x + c * this.hitTestArea.y + e;
			const _y = b * this.hitTestArea.x + d * this.hitTestArea.y + f;
			console.log(this.x, x, _x, w);
			console.log(this.y, y, _y, h);
			if (point.hitTest(new Rectangle(this.x + x + _x, this.y + y + _y, w, h))) {
				return {
					target: this
				};
			}
		}

		if (this.extraHitTest) {
			let extra_test: HitTestResult = this.extraHitTest(point, x, y);
			if (extra_test && extra_test.target !== null) {
				return extra_test;
			}
		}

		return {
			target: null
		};
	}

	getHitTestArea(x: number = 0, y: number = 0): Rectangle {
		let width: number = 0,
			height: number = 0;

		x += this.x;
		y += this.y;

		for (let i: number = this.numChildren; i--;) {
			let area: Rectangle = this.children[i].getHitTestArea(x, y);
			x = Math.min(x, area.x);
			y = Math.min(y, area.y);
			width = Math.max(width, area.width + area.x - x);
			height = Math.max(height, area.height + area.y - y);
		}
		const [a, b, c, d, e, f] = this.transform;
		const w = a * width + c * height + e;
		const h = b * width + d * height + f;
		return new Rectangle(x, y, w, h);
	}

	appendChild(...children: Sprite[]) {
		let depth: number = this.numChildren;
		for (let i: number = 0, l: number = children.length; i < l; i++) {
			let child: any = children[i];
			if (child instanceof Sprite) {
				this.appendChildAt(children[i], depth++);
			}
		}
		return this;
	}

	appendChildAt(el: Sprite, i: number) {
		if (!isNaN(i)) {
			if (el.parent) {
				el.parent.removeChild(el);
			}
			let l: number = this.numChildren;
			i = Math.max(0, Math.min(i, l));
			el.parent = this;
			this.children.splice(i, 0, el);

			if (el.stage !== this.stage) {
				el.stage = this.stage;
			}
			this.repaint = true;
		}
		return this;
	}

	remove() {
		this.destroyEvent();
		this.stage = null;

		let parent = this.parent;
		if (parent) {
			parent.removeChild(this);
			this.parent = null;
		}
		this.removeChildren();
		return this;
	}

	removeChild(el: Sprite) {
		let children = this.children;
		for (let d = this.numChildren; d--;) {
			if (children[d] === el) {
				children.splice(d, 1);
				el.parent = null;
				el.stage = null;
				break;
			}
		}
		return this;
	}

	removeChildAt(i: number) {
		if (!isNaN(i) && i >= 0 && i < this.numChildren) {
			let el = this.children.splice(i, 1)[0];
			el.parent = null;
			el.stage = null;
		}
		return this;
	}

	removeChildren() {
		let children = this.children;
		for (let d: number = this.numChildren; d--;) {
			let el = children.splice(d, 1)[0];
			el.parent = null;
			el.stage = null;
		}
		return this;
	}

	getChildIndex(el: Sprite): number {
		if (!el || !(el instanceof Sprite) || el.parent !== this) return -1;
		for (let d: number = this.numChildren; d--;) {
			if (this.children[d] === el) {
				return d;
			}
		}
		return -1;
	}

	setChildIndex(el: Sprite, i: number): Sprite {
		if (!el || !(el instanceof Sprite) || el.parent !== this) return this;

		let _d: number = this.getChildIndex(el),
			children = this.children;
		i = Math.max(0, Math.min(i, this.numChildren));
		if (_d === i) {
			return this;
		}
		children.splice(_d, 1);
		children.splice(i, 0, el);
		return this;
	}

	/*
	 * 判断是否处于某个对象之内
	 */
	includeBy(el: Sprite): boolean {
		if (el instanceof Sprite) {
			let parent = this.parent;
			while (parent) {
				if (parent === el) {
					return true;
				}
				parent = parent.parent;
			}
		}
		return false;
	}

	/*
	 * 判断是否包含某个子对象
	 */
	include(el: Sprite): boolean {
		for (let i = 0, l = this.numChildren; i < l; i++) {
			let child = this.children[i];
			if (child === el || child.include(el)) {
				return true;
			}
		}
		return false;
	}

	getChildAt(i: number) {
		if (!isNaN(i) && i >= 0 && i < this.numChildren) {
			return this.children[i];
		}
		return null;
	}

	/*
	 * 根据名称获取对象数组
	 * @param {String} 名称
	 * 名称可带前缀：(^=name)表示以name开头，($=name)表示以name结尾，(~=name)表示包含name
	 */
	getChildrenByName(name: string) {
		let result: ISprite[] = [];
		let prefix: string = '';

		if (/^([\^\$~])=(.+)/.test(name)) {
			prefix = RegExp.$1;
			name = RegExp.$2;
		}
		for (let d: number = this.numChildren; d--;) {
			let child = this.children[d];
			let childname = child.name;

			if (prefix) {
				switch (prefix) {
				case '^':
					if (childname.indexOf(name) === 0) {
						result.push(child);
					}
					break;
				case '$':
					let pos: number = childname.lastIndexOf(name);
					if (pos !== -1 && pos + name.length === childname.length) {
						result.push(child);
					}
					break;
				default:
					if (childname.indexOf(name) !== -1) {
						result.push(child);
					}
					break;
				}
			} else {
				if (childname === name) {
					result.push(child);
				}
			}
		}
		return result;
	}

	getChildrenByType(TypeClass: ClassDecorator) {
		let result: ISprite[] = [];
		for (let i: number = 0, l: number = this.numChildren; i < l; i++) {
			let child = this.children[i];
			if (child instanceof TypeClass) {
				result.push(child);
			}
		}
		return result;
	}

	/*
	 * 初始化拖拽
	 */
	enableDrag(rect: Rectangle, size: Point) {
		let startPos: Pos | null;
		const x1 = rect.x;
		const y1 = rect.y;

		function touchMoveHandler(this: Sprite, ev: CTouchEvent) {
			if (startPos && this.stage) {
				let x = startPos.x - startPos.touchX + ev.x;
				let y = startPos.y - startPos.touchY + ev.y;
				const x2 = rect.x + rect.width - size.x;
				const y2 = rect.y + rect.height - size.y;
				const maxX = Math.max(x1, x2);
				const minX = Math.min(x1, x2);
				const maxY = Math.max(y1, y2);
				const minY = Math.min(y1, y2);

				x = Math.min(Math.max(x, minX), maxX);
				y = Math.min(Math.max(y, minY), maxY);

				this.x = x;
				this.y = y;
				this.repaint = true;
			}
		}

		function touchEndHandler(this: Sprite) {
			startPos = null;
			this.removeEventListener(CTouchEvent.TOUCHMOVE, touchMoveHandler as IEventObject['callback']).removeEventListener(CTouchEvent.TOUCHEND, touchEndHandler);
		}

		this.addEventListener('touchstart', function(this: Sprite, ev: CTouchEvent) {
			if (!startPos) {
				startPos = {
					x: this.x,
					y: this.y,
					touchX: ev.x,
					touchY: ev.y
				};
				this.stage!.addEventListener(CTouchEvent.TOUCHMOVE, touchMoveHandler.bind(this) as IEventObject['callback']).addEventListener(CTouchEvent.TOUCHEND, touchEndHandler);
			}
		} as IEventObject['callback']);
		return this;
	}

	/*
	 * 终止
	 */
	disableDrag() {
		this.removeEventListener('touchstart');
		return this;
	}
};
