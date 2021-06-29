export enum NodeType {
	Stage,
	Sprite,
}

// 事件常量
export enum EventType {
	ENTER_FRAME = 'enter_frame', // 每次渲染时触发
	ADDED_TO_STAGE = 'added_to_stage', // 插入场景时触发
	LOAD = 'load',
	ERROR = 'error',
	RESIZE = 'resize',
	MOUSE_DOWN = 'mousedown',
	MOUSE_MOVE = 'mousemove',
	MOUSE_UP = 'mouseup',
	TOUCH_START = 'touchstart',
	TOUCH_MOVE = 'touchmove',
	TOUCH_END = 'touchend',
	TAP = 'tap',
	CLICK = 'click',
	DOUBLE_CLICK = 'dblclick',
}
