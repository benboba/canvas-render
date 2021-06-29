
	/*
	 * 初始化拖拽
	 */
	enableDrag(rect: Rectangle, size: Point) {
		let startPos: Pos | null;
		this.draging = true;
		const x1 = rect.x;
		const y1 = rect.y;

		function touchMoveHandler(this: Sprite, ev: CTouchEvent) {
			if (!this.draging) return;
			if (startPos && this.stage) {
				let x = startPos.x - startPos.touchX + ev.x;
				let y = startPos.y - startPos.touchY + ev.y;
				
				const [a, b, c, d, e, f] = this.transform;
				const w = a * size.x + c * size.y + e;
				const h = b * size.x + d * size.y + f;

				const x2 = rect.x + rect.width - w;
				const y2 = rect.y + rect.height - h;
				const maxX = Math.max(x1, x2);
				const minX = Math.min(x1, x2);
				const maxY = Math.max(y1, y2);
				const minY = Math.min(y1, y2);

				x = Math.min(Math.max(x, minX), maxX);
				y = Math.min(Math.max(y, minY), maxY);

				this.x = x;
				this.y = y;
				this.repaint = true;
			}
		}

		function touchEndHandler(this: Sprite) {
			startPos = null;
			this.stage!.removeEventListener(CTouchEvent.TOUCHMOVE, touchMoveHandler as IEventObject['callback']).removeEventListener(CTouchEvent.TOUCHEND, touchEndHandler);
		}

		this.addEventListener('touchstart', function(this: Sprite, ev: CTouchEvent) {
			if (!startPos) {
				startPos = {
					x: this.x,
					y: this.y,
					touchX: ev.x,
					touchY: ev.y
				};
				this.stage!.addEventListener(CTouchEvent.TOUCHMOVE, touchMoveHandler.bind(this) as IEventObject['callback']).addEventListener(CTouchEvent.TOUCHEND, touchEndHandler);
			}
		} as IEventObject['callback']);
		return this;
	}

	/*
	 * 终止
	 */
	disableDrag() {
		this.draging = false;
		this.removeEventListener('touchstart');
		return this;
	}