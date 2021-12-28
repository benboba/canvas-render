import { Sprite } from '../element/sprite';
import { ICoodinate } from '../types/geom';

export interface IHitTestResult {
	target: Sprite | null;
}

export interface IHitTest {
	hitTestPoint(point: ICoodinate): IHitTestResult;
	hitTest(target: Sprite): IHitTestResult;
}

export const mixinHitTest = <T extends Sprite & IHitTest>(target: T): T & IHitTest => {
	Object.defineProperties(target, {
		hitTestPoint: {
			value: function(this: T, point: ICoodinate) {
				// 未在场景中，或不可见，直接返回错误
				if (!this.stage || !this.visible) return {
					target: null
				};

				// NOTE：此循环顺序不可逆，从最上面开始判断
				for (let i: number = this.children.length; i--;) {
					let hit_test: IHitTestResult = this.children[i].hitTestPoint(point);
					if (hit_test.target !== null) {
						return hit_test;
					}
				}

				return {
					target: null
				};
			},
		},
		hitTest: {
			value: function(this: T, target: Sprite) {
				// 未在场景中，或不可见，直接返回错误
				if (!this.stage || !this.visible) return {
					target: null
				};

				// NOTE：此循环顺序不可逆，从最上面开始判断
				for (let i: number = this.children.length; i--;) {
					let hit_test: IHitTestResult = this.children[i].hitTest(target);
					if (hit_test.target !== null) {
						return hit_test;
					}
				}

				return {
					target: null
				};
			},
		},
	});

	return target as T & IHitTest;
};
