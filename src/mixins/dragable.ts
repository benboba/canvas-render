import type { Sprite } from '../element/sprite';
import type { CRTouchEvent } from '../module/events/touch';
import type { ICoodinate, IRectangle } from '../types';
import type { IEventDispatcher } from './event-dispatcher';

export interface IDragable {
	enableDrag(rect?: IRectangle): void;
	disableDrag(): void;
}

export const mixinDrag = <T extends Sprite & IEventDispatcher>(target: T): T & IDragable => {
	let draging = false;
	let startPos: ICoodinate | null = null;
	let startTouchPos: ICoodinate | null = null;

	function touchMoveHandler(this: T, ev: CRTouchEvent) {
		if (!draging) return;
		if (startPos && startTouchPos && this.stage) {
			this.x = startPos.x - startTouchPos.x + ev.x;
			this.y = startPos.y - startTouchPos.y + ev.y;
			this.stage.repaint();
		}
	}

	function touchEndHandler(this: Sprite) {
		startPos = null;
		startTouchPos = null;
		this.stage!.off('touchmove', touchMoveHandler);
		this.stage!.off('touchend', touchEndHandler);
	}

	Object.defineProperties(target, {
		enableDrag: {
			value: function(this: T, rect: IRectangle = {
				x: -Infinity,
				y: -Infinity,
				width: Infinity,
				height: Infinity,
			}) {

				draging = true;
				const x1 = rect.x;
				const y1 = rect.y;

				this.on('touchstart', (ev: CRTouchEvent) => {
					if (this.stage && !startPos) {
						startPos = {
							x: this.x,
							y: this.y,
						};
						startTouchPos = {
							x: ev.x,
							y: ev.y,
						};
						this.stage.on('touchmove', touchMoveHandler.bind(this));
						this.stage.on('touchend', touchEndHandler);
					}
				});
			},
			disableDrag: {
				value: function(this: T) {
					draging = false;
					startPos = null;
					startTouchPos = null;
					this.off('touchstart');
					return this;
				}
			}
		}
	});
	return target as T & IDragable;
};
