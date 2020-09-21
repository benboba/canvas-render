/*
 * 使目标对象支持事件绑定、解绑、触发等功能
 */
import { CEvent } from '../event/event';
import { IEventDispatcher, IEventObject, ISprite } from '../types';

function removeEmpty(arr: string[]): string[] {
	return arr.filter((val) => !!val);
}

function checkNameSpace(ns1: string[], ns2: string[]): boolean {
	for (let ni: number = ns1.length; ni--;) {
		if (ns2.indexOf(ns1[ni]) !== -1) {
			return true;
		}
	}
	return false;
}

export abstract class EventDispatcher implements IEventDispatcher {
	// 事件缓存
	evCache: IEventObject[] = [];

	addEventListener(eventname: string, callback: IEventObject['callback'], priority: boolean = false, locked: boolean = false) {

		let ev: string[] = eventname.toLowerCase().split('.');

		if (ev[0] && callback) {
			let operate: 'unshift' | 'push' = priority ? 'unshift' : 'push';
			if (typeof callback === 'string') {
				try {
					callback = (new Function(`return ${callback}`))();
				} catch (e) {}
			}
			if (typeof callback === 'function') {
				let namespace: string[] = removeEmpty(ev.slice(1));
				this.evCache[operate]({
					type: ev[0],
					namespace,
					callback,
					locked
				});
			}
		}

		return this;
	}

	on(eventname: string, callback: IEventObject['callback'], priority: boolean = false, locked: boolean = false) {
		return this.addEventListener(eventname, callback, priority, locked);
	}

	/*
	 * 解除事件绑定
	 * @param {String} eventname 事件名称，不传此参数则清空全部事件监听
	 * @param {Function} callback 解除绑定的方法，不传此参数则解除该事件的全部绑定
	 */
	removeEventListener(eventname: string, callback: IEventObject['callback'] | null = null, locked: boolean = false) {
		let ev: string[] = eventname.toLowerCase().split('.'),
			namespace: string[] = removeEmpty(ev);

		if (ev[0] || namespace.length) {
			for (let ei: number = this.evCache.length; ei--;) {
				let evItem: IEventObject = this.evCache[ei];
				// 锁定状态的事件监听不解除
				if ((!ev[0] || ev[0] === evItem.type) && (!namespace.length || checkNameSpace(namespace, evItem.namespace)) && ((!callback && !evItem.locked) || (callback === evItem.callback && locked === evItem.locked))) {
					this.evCache.splice(ei, 1);
				}
			}
		} else {
			// 未指定事件类型或命名空间
			for (let ei: number = this.evCache.length; ei--;) {
				let evItem: IEventObject = this.evCache[ei];
				if (!evItem.locked) {
					this.removeEventListener(evItem.type, evItem.callback);
				}
			}
		}
		return this;
	}

	off(eventname: string, callback = null, locked: boolean = false) {
		return this.removeEventListener(eventname, callback, locked);
	}

	/*
	 * 触发指定事件
	 * @param {String} eventname 事件名称
	 * @param {Array|Undefined} 附加的参数
	 */
	dispatchEvent(_ev: any, ...args: any[]) {
		let ev = _ev as CEvent;
		if (typeof _ev === 'string') {
			ev = new CEvent(_ev);
			ev.target = this;
		}
		if (!(ev instanceof CEvent)) {
			return this;
		}
		args.unshift(ev);
		let type: string = ev.type;
		for (let ei: number = 0, el: number = this.evCache.length; ei < el; ei++) {
			let evItem: IEventObject = this.evCache[ei];
			if (type === evItem.type) {
				if (evItem.callback.apply(this, args as [CEvent]) === false) {
					return this;
				}
			}
		}

		// 判断事件是否冒泡
		if (ev.bubble && this.parent) {
			let parent = this.parent;
			if (parent.dispatchEvent && typeof parent.dispatchEvent === 'function') {
				parent.dispatchEvent.apply(parent, args as Parameters<IEventDispatcher['dispatchEvent']>);
			}
		}
		return this;
	}

	trigger(...args: any) {
		return this.dispatchEvent.apply(this, args);
	}

	parent?: ISprite | null;

	destroyEvent(): void {
		this.evCache.splice(0, this.evCache.length);
	}

}
