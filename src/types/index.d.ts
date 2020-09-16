import CEvent from '../event/event';

export interface IFn<T extends any[] = any[], R = any> {
	(...args: T): R;
}

export type TEmptyFn = IFn<[], void>;

export interface IEventObject {
	type: string; // 事件类型
	namespace: string[]; // 命名空间
	callback: (ev: CEvent) => void | boolean; // 回调
	locked: boolean; // 是否加锁，加锁后只能精确移除
}
