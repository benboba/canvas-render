import { TBaseObj } from '../types';

export interface IStyle {
	opacity: number;
	position: 'static' | 'absolute';
	left: number;
	top: number;
	transform: [number, number, number, number, number, number];
}

export interface IStyleNode {
	setStyle<K extends keyof IStyle>(key: K, value: IStyle[K]): void;
	setStyles(opt: Partial<IStyle>): void;
	getStyle<K extends keyof IStyle>(key: K): IStyle[K] | null;
}

export const mixinStyle = <T extends TBaseObj>(target: T): T & IStyleNode => {
	const styles: Partial<IStyle> = {};
	
	Object.defineProperties(target, {
		setStyle: {
			value: <K extends keyof IStyle>(key: K, value: IStyle[K]) => {
				styles[key] = value;
			},
		},
		setStyles: {
			value: (opt: Partial<IStyle>) => {
				Object.assign(styles, opt);
			},
		},
		getStyle: {
			value: <K extends keyof IStyle>(key: K): NonNullable<Partial<IStyle>[K]> | null => styles[key] ?? null,
		},
	});
	return target as T & IStyleNode;
};
