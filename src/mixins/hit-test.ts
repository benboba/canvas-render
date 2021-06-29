
	hitTest(point: Point, x: number = 0, y: number = 0, transform = [1, 0, 0, 1, 0, 0]): HitTestResult {
		if (!this.stage || !this.visible || !this.pointerEvents) return {
			target: null
		};

		const [a, b, c, d, e, f] = transform;
		const _x = this.x * a + this.y * c + e;
		const _y = this.x * c + this.y * d + f;

		// NOTE：此循环顺序不可逆，从最上面开始判断
		for (let i: number = this.numChildren; i--;) {
			let hit_test: HitTestResult = this.children[i].hitTest(point, x + _x, y + _y, this.transform);
			if (hit_test.target !== null) {
				return hit_test;
			}
		}

		if (this.hitTestArea) {
			const w = a * this.hitTestArea.width + c * this.hitTestArea.height + e;
			const h = b * this.hitTestArea.width + d * this.hitTestArea.height + f;
			const x1 = a * this.hitTestArea.x + c * this.hitTestArea.y + e;
			const y1 = b * this.hitTestArea.x + d * this.hitTestArea.y + f;
			if (point.hitTest(new Rectangle(_x + x + x1, _y + y + y1, w, h))) {
				return {
					target: this
				};
			}
		}

		if (this.extraHitTest) {
			let extra_test: HitTestResult = this.extraHitTest(point, x, y, transform);
			if (extra_test && extra_test.target !== null) {
				return extra_test;
			}
		}

		return {
			target: null
		};
	}

	getHitTestArea(x: number = 0, y: number = 0): Rectangle {
		let width: number = 0,
			height: number = 0;

		x += this.x;
		y += this.y;

		for (let i: number = this.numChildren; i--;) {
			let area: Rectangle = this.children[i].getHitTestArea(x, y);
			x = Math.min(x, area.x);
			y = Math.min(y, area.y);
			width = Math.max(width, area.width + area.x - x);
			height = Math.max(height, area.height + area.y - y);
		}
		const [a, b, c, d, e, f] = this.transform;
		const w = a * width + c * height + e;
		const h = b * width + d * height + f;
		return new Rectangle(x, y, w, h);
	}
