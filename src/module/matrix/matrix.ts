const HALF_CIRC = 180;

export class Matrix {
	constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.e = e;
		this.f = f;
	}

	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;

	translate(x: number, y: number): Matrix {
		return this.multiply(new Matrix(1, 0, 0, 1, x, y));
	}

	rotate(corner: number): Matrix {
		const arg = corner * Math.PI / HALF_CIRC;
		return this.multiply(new Matrix(Math.cos(arg), Math.sin(arg), -Math.sin(arg), Math.cos(arg), 0, 0));
	}

	scale(xscale: number, yscale: number | null = null): Matrix {
		return this.multiply(new Matrix(xscale, 0, 0, yscale === null ? xscale : yscale, 0, 0));
	}

	skewX(corner: number): Matrix {
		const skew = corner * Math.PI / HALF_CIRC;
		return this.multiply(new Matrix(1, 0, Math.tan(skew), 1, 0, 0));
	}

	skewY(corner: number): Matrix {
		const skew = corner * Math.PI / HALF_CIRC;
		return this.multiply(new Matrix(1, Math.tan(skew), 0, 1, 0, 0));
	}

	multiply(m: Matrix): Matrix {
		const a = this.a * m.a + this.c * m.b;
		const b = this.b * m.a + this.d * m.b;
		const c = this.a * m.c + this.c * m.d;
		const d = this.b * m.c + this.d * m.d;
		const e = this.a * m.e + this.c * m.f + this.e;
		const f = this.b * m.e + this.d * m.f + this.f;
		return new Matrix(a, b, c, d, e, f);
	}

	// todo 矩阵除法
	// divide(m: Matrix): Matrix {

	// }

	get vals() {
		return [this.a, this.b, this.c, this.d, this.e, this.f];
	}
}
