import type { Sprite } from '../display/sprite';

export class ParentNode {
    constructor() {
		this._children = [];
    }

    private _children: Sprite[];
	get children() {
		return this._children;
	}

	get numChildren(): number {
		return this.children.length;
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
		if (!el || el.parent !== this) return -1;
		for (let d: number = this.numChildren; d--;) {
			if (this.children[d] === el) {
				return d;
			}
		}
		return -1;
	}

	setChildIndex(el: Sprite, i: number): Sprite {
		if (!el || el.parent !== this) return this;

		let _d: number = this.getChildIndex(el);
		let children = this.children;
		i = Math.max(0, Math.min(i, this.numChildren));
		if (_d === i) {
			return this;
		}
		children.splice(_d, 1);
		children.splice(i, 0, el);
		return this;
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
		let result: Sprite[] = [];
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
		let result: Sprite[] = [];
		for (let i: number = 0, l: number = this.numChildren; i < l; i++) {
			let child = this.children[i];
			if (child instanceof TypeClass) {
				result.push(child);
			}
		}
		return result;
	}

	appendChild(...children: Sprite[]) {
		let depth: number = this.numChildren;
		for (let i: number = 0, l: number = children.length; i < l; i++) {
            this.appendChildAt(children[i], depth++);
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
		}
		return this;
	}
}