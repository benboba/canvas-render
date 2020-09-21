/*
 * raf方法，用于逐帧渲染
 */

import { IFn } from "src/types";

// 获取requestAnimationFrame
let aFrame = window.requestAnimationFrame;
let timer: number;
let useAframe = !!aFrame; // 是否使用requestAnimationFrame
const DEFAULT_ITV = Math.round(1000 / 60); // 默认时间间隔
let useItv = DEFAULT_ITV; // 实际使用的时间间隔
const timerListen: Array<{
	tgt: any;
	fn: IFn;
	destroy?: boolean;
}> = []; // 定时器执行方法列表
const rafListen: Array<{
	tgt: any;
	fn: IFn;
}> = []; // 单次执行方法列表,
let iscancel: boolean = false;

function interval() { // 间隔执行函数
	for (let ti = timerListen.length; ti--;) {
		let titem = timerListen[ti];
		if (titem.destroy) {
			timerListen.splice(ti, 1);
		} else {
			titem.fn.apply(titem.tgt);
		}
	}
	for (let ri = rafListen.length; ri--;) {
		let ritem = rafListen.splice(ri, 1)[0];
		ritem.fn.apply(ritem.tgt);
	}

	if (!timerListen.length && !rafListen.length) {
		clear();
	}
}

function reg(fn: IFn) {
	if (useAframe) {
		timer = aFrame(function animate() {
			fn();
			if (iscancel) {
				iscancel = false;
			} else {
				timer = aFrame(animate);
			}
		});
	} else {
		timer = window.setInterval(fn, useItv);
	}
}

function clear() { // 终止定时器
	if (useAframe) {
		iscancel = true;
	} else {
		clearInterval(timer);
	}
	timer = 0;
}

export const Anime = {
	listen: function (fn: IFn, tgt?: HTMLElement) { // 添加新的逐帧执行方法
		timerListen.unshift({
			fn: fn,
			tgt: tgt || window,
		});
		if (!timer) {
			reg(interval);
		}
		return Anime;
	},
	raf: function (fn: IFn, tgt?: any) { // 添加单次延时执行方法
		rafListen.unshift({
			fn,
			tgt: tgt || window,
		});
		if (!timer) {
			reg(interval);
		}
		return Anime;
	},
	unlisten: function (fn: string | IFn, _tgt?: any) { // 移除指定的逐帧执行方法
		if (typeof fn === 'function' || typeof fn === 'string') {
			const tgt = _tgt || window;
			for (let ti = timerListen.length; ti--;) {
				if (timerListen[ti].fn === fn || timerListen[ti].fn.toString().replace(/\s/g, '') === fn.toString().replace(/\s/g, '') && timerListen[ti].tgt === tgt) {
					timerListen[ti].destroy = true;
					break;
				}
			}
		}
		return Anime;
	},
	/*
	 * 手动设置fps（每秒执行的帧数）
	 * @param [Number] 新的fps值（每秒执行的帧数）
	 */
	setFPS: function (fps: unknown, forceItv?: boolean) {
		if (typeof fps === 'number') {
			let _itv = Math.round(1000 / fps);
			if (_itv !== useItv) {
				useItv = _itv;
				let _new_use_aframe;
				if (useItv > DEFAULT_ITV || forceItv) {
					_new_use_aframe = false; // 当新的FPS小于60时，中止使用requestAnimationFrame
				} else {
					useItv = DEFAULT_ITV; // 最大FPS限制为60
					_new_use_aframe = !!aFrame;
				}
				clear();
				useAframe = _new_use_aframe;
				reg(interval);
			}
		}
		return Anime;
	}
};
