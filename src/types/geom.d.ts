export interface ICoodinate {
	x: number;
	y: number;
}

// rect
export interface IRectangle extends ICoodinate {
	width: number;
	height: number;
}

// ellipse
export interface IEllipse extends ICoodinate {
	rx: number;
	ry: number;
	rotation: number;
	startAngle: number;
	endAngle: number;
	anticlockwise?: boolean;
}

// arc
export interface IArc extends ICoodinate {
	r: number;
	startAngle: number;
	endAngle: number;
	anticlockwise?: boolean;
}

export interface IPathMoveTo {
	// moveTo
	type: 'M';
	// x, y
	val: [number, number];
}

export interface IPathLineTo {
	// lineTo
	type: 'L';
	// x, y
	val: [number, number];
}

export interface IPathArcTo {
	// arcTo
	type: 'A';
	// x1, y1, x2, y2, radius
	val: [number, number, number, number, number];
}

export interface IPathBezierCurveTo {
	// bezierCurveTo
	type: 'C';
	// cx1, cy1, cx2, cy2, x, y
	val: [number, number, number, number, number, number];
}

export interface IPathQuadraticCurveTo {
	// quadraticCurveTo
	type: 'Q';
	// cx, cy, x, y
	val: [number, number, number, number];
}

export interface IPathClose {
	// closePath
	type: 'Z';
	val: [];
}

export type TPathItem = IPathMoveTo | IPathLineTo | IPathArcTo | IPathBezierCurveTo | IPathQuadraticCurveTo | IPathClose;
