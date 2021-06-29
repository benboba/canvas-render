/*
 * 使目标对象支持事件绑定、解绑、触发等功能
 */
import { CREvent } from '../module/events';
import { TBaseObj } from '../types';
import type { IChildNode } from './child-node';
import type { IParentNode } from './parent-node';

export interface IEventObject {
	type: string; // 事件类型
	namespace: string[]; // 命名空间
	callback: (ev: CREvent) => void; // 回调
}

const removeEmpty = (arr: string[]) => arr.filter((val) => !!val);
const checkNameSpace = (ns1: string[], ns2: string[]) => ns1.some(ni => ns2.includes(ni));

export interface IEventDispatcher extends IChildNode, IParentNode {
	on(eventname: string, callback: IEventObject['callback'], option?: {
        capture?: boolean;
    }): void;
	off(eventname: string, callback?: IEventObject['callback']): void;
	trigger(ev: CREvent | string): void;
	parent: IEventDispatcher | null;
}

export const mixinEvent = <T extends TBaseObj>(target: T): T & IEventDispatcher => {
	// 事件缓存
    const evCache: IEventObject[] = [];
	Object.defineProperties(target, {
		on: {
			value: (eventname: string, callback: IEventObject['callback'], option: {
				capture?: boolean;
			} = {}) => {
				let ev: string[] = eventname.toLowerCase().split('.');
				if (ev[0] && callback) {
					if (typeof callback === 'function') {
						let namespace: string[] = removeEmpty(ev.slice(1));
						evCache.push({
							type: ev[0],
							namespace,
							callback,
						});
					}
				}
			},
		},
		off: {
			value: (eventname: string, callback?: IEventObject['callback']) => {
				const ev: string[] = eventname.toLowerCase().split('.');
				const namespace: string[] = removeEmpty(ev.slice(1));
		
				if (ev[0] || namespace.length) {
					for (let ei: number = evCache.length; ei--;) {
						let evItem: IEventObject = evCache[ei];
						// 锁定状态的事件监听不解除
						if ((!ev[0] || ev[0] === evItem.type) && (!namespace.length || checkNameSpace(namespace, evItem.namespace)) && (!callback || callback === evItem.callback)) {
							evCache.splice(ei, 1);
						}
					}
				}
			},
		},
		trigger: {
			value: function(this: IEventDispatcher, _ev: CREvent | string) {
				const ev = typeof _ev === 'string' ? new CREvent(_ev) : _ev;
				if (!ev.target) {
					ev.target = this;
				}
				const type = ev.type;
				for (const evItem of evCache) {
					if (type === evItem.type) {
						evItem.callback(ev);
					}
				}
				// 判断事件是否冒泡
				if (ev.bubble && this.parent) {
					this.parent.trigger(ev);
				}
			},
		},
	});
    return target as T & IEventDispatcher;
}
