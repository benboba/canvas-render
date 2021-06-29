import type { TBaseObj } from '../types';
import type { IParentNode } from './parent-node';

export interface IChildNode {
	parent: IParentNode | null;
}

export const mixinChild = <T extends TBaseObj>(target: T): T & IChildNode => {
	let parent: IParentNode | null = null;
	Object.defineProperties(target, {
		parent: {
			get() {
				return parent;
			},
            set(p: IParentNode | null) {
                parent = p;
            },
		},
	});

	return target as T & IChildNode;
}
