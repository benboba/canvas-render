/*
 * 精灵类，实现基础的渲染功能
 */

import { NodeType } from '../constant';
import type { IAttrNode } from '../mixins/attr';
import { mixinAttr } from '../mixins/attr';
import type { IChildNode } from '../mixins/child-node';
import { mixinChild } from '../mixins/child-node';
import type { IDragable } from '../mixins/dragable';
import { mixinDrag } from '../mixins/dragable';
import type { IEventDispatcher } from '../mixins/event-dispatcher';
import { mixinEvent } from '../mixins/event-dispatcher';
import type { IHitTest } from '../mixins/hit-test';
import { mixinHitTest } from '../mixins/hit-test';
import type { IParentNode } from '../mixins/parent-node';
import { mixinParent } from '../mixins/parent-node';
import type { IStyleNode } from '../mixins/style';
import { mixinStyle } from '../mixins/style';
import type { Stage } from './stage';

export interface Sprite extends IParentNode, IChildNode, IEventDispatcher, IAttrNode, IStyleNode, IDragable, IHitTest {
	name: string;
	children: Sprite[];
	parent: Sprite | Stage | null;
}

export class Sprite {
	type = NodeType.Sprite;
	visible = true;
	x = 0;
	y = 0;
	transform: string | null = null;

	constructor() {
		mixinChild(this);
		mixinParent(this);
		mixinEvent(this);
		mixinAttr(this);
		mixinStyle(this);
		mixinDrag(this);
		mixinHitTest(this);
	}

	get stage(): Stage | null {
		const parent = this.parent;
		if (!parent) return null;
		if (parent.type === NodeType.Stage) {
			return parent as Stage;
		}
		return (parent as Sprite).stage;
	}

	repaint() {
		this.stage?.repaint();
	}

	/*
	 * 内部渲染方法
	 */
	__render(): void {
		// 未在场景中，或不可见，则不渲染
		if (!this.stage) return;
		if (!this.visible) return;

		this.__beforeRender();
		this.render();

		/*
		 * 渲染每个子对象
		 */
		for (const child of this.children) {
			child.__render();
		}

		this.__afterRender();
	}

	__beforeRender() {
		const stage = this.stage;
		if (!stage) return;
		const ctx = stage.ctx;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.globalAlpha = this.getStyle('opacity') ?? 1;
		if (this.transform) {
			// ctx.transform(...transform);
		}
	}

	__afterRender() {
		const stage = this.stage;
		if (!stage) return;
		stage.ctx.restore();
	}

	/*
	 * 用于复写的实际渲染方法
	 */
	render(): void {}
};
