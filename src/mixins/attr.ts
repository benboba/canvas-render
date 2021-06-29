import { TBaseObj } from '../types';

export interface IAttr {
	name: string;
	value: string;
}

export interface IAttrNode {
	setAttr(key: string, value: unknown): boolean;
	setAttrs(opt: Record<string, unknown>): Record<string, boolean>;
	getAttr<T>(key: string): T;
	getAttrs<T extends any[]>(keys: string): T;
}

export const mixinAttr = <T extends TBaseObj>(target: T): T & IAttrNode => {
	const attrObj: Record<string, string> = {};
	
	Object.defineProperties(target, {
		setAttr: {
			value: (key: string, value: unknown) => {
				try {
					const v = JSON.stringify(value);
					attrObj[key] = v;
					return true;
				} catch {
					return false;
				}
			},
		},
		setAttrs: {
			value: (opt: Record<string, unknown>) => {
				const returnVal: Record<string, boolean> = {};
				Object.keys(opt).forEach(key => {
					try {
						const v = JSON.stringify(opt[key]);
						attrObj[key] = v;
						returnVal[key] = true;
					} catch {
						returnVal[key] = false;
					}
				});
				return returnVal;
			},
		},
		getAttr: {
			value: <R>(key: string) => key in attrObj ? JSON.parse(attrObj[key]) as R : null,
		},
		getAttrs: {
			value: function<R extends unknown[]>(this: IAttrNode, keys: string[]) {
				return keys.map(this.getAttr) as R;
			},
		},
	});
	return target as T & IAttrNode;
};
