/**
 * style 的定义是，不影响碰撞检测，实际碰撞检测的位置并不影响
 */

import { TBaseObj } from '../types';

export interface IStyle {
	opacity: number;
	fill: string;
	stroke: string;
	'line-cap': 'butt' | 'round' | 'square';
	'line-join': 'bevel' | 'round' | 'miter';
	'line-width': number;
	'milter-limit': number;
	'font': 'caption' | 'icon' | 'menu' | 'message-box' | 'small-caption' | 'status-bar';
	'font-style': 'normal' | 'italic' | 'oblique';
	'font-variant': 'normal' | 'small-caps';
	'font-weight': 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
	'font-size': number;
	'line-height': number;
	'font-family': string;	
	'text-align': 'start' | 'end' | 'center' | 'left' | 'right';
	'text-baseline': 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
	'global-composite-operation': 'source-over' | 'source-atop' | 'source-in' | 'source-out' | 'destination-over' | 'destination-atop' | 'destination-in' | 'destination-out' | 'lighter' | 'copy' | 'xor';
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
