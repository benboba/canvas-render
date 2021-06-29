import type { TBaseObj } from '../types';
import { makeArray } from '../utils/make-array';
import type { IChildNode } from './child-node';

export interface IParentNode {
	readonly children: IChildNode[];
	append(targetChild: IChildNode | IChildNode[], index?: number): void;
	remove(child: IChildNode | IChildNode[]): void;
}

export const mixinParent = <T extends TBaseObj>(target: T): T & IParentNode => {
	const children: IChildNode[] = [];
	Object.defineProperties(target, {
		children: {
			get() {
				return children;
			},
		},
		append: {
			value: function(this: IParentNode, targetChild: IChildNode | IChildNode[], index = -1) {
				const targetChildren = makeArray(targetChild);
				targetChildren.forEach(child => {
					if (child.parent) {
						child.parent.remove(child);
					}
					child.parent = this;
				});
				if (index >= 0 && index < children.length) {
					children.splice(index, 0, ...targetChildren);
				} else {
					children.push(...targetChildren);
				}
			},
		},
		remove: {
			value: function(this: IParentNode, targetChild: IChildNode | IChildNode[]) {
				const targetChildren = makeArray(targetChild);
				targetChildren.forEach(child => {
					const index = children.indexOf(child);
					if (index !== -1) {
						children.splice(index, 1);
						child.parent = null;
					}
				});
			},
		}
	});

	return target as T & IParentNode;
}
