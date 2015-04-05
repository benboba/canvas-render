(function() {
	var toString = Object.prototype.toString, GLOBAL_FONTSIZE = 12,
	isArray = function(obj) {
		return toString.call(obj) === '[object Array]';
	},
	formatProp = function(prop, parseFunc) {
		var prop = isArray(prop) ? prop : [prop];
		parseFunc = parseFunc || function(arg) {
			return arg;
		};
		if (prop.length) {
			prop[0] = parseFunc(prop[0]);
			if (prop.length < 2) {
				prop[1] = prop[0];
			} else {
				prop[1] = parseFunc(prop[1]);
			}
			if (prop.length < 3) {
				prop[2] = prop[0];
			} else {
				prop[2] = parseFunc(prop[2]);
			}
			if (prop.length < 4) {
				prop[3] = prop[1];
			} else {
				prop[3] = parseFunc(prop[3]);
			}
			return prop.slice(0, 4);
		}
		return [0, 0, 0, 0];
	},
	parseColor = function(color, type) {
		type = type || 'backgroundColor';
		var p = document.createElement('p');
		p.style[type] = color;
		document.body.appendChild(p);
		var _color = getComputedStyle(p)[type];
		document.body.removeChild(p);
		return _color;
	},
	parseSize = function(val, parentVal) {
		if (val && val == parseFloat(val)) {
			return Math.round(val);
		}
		if (/(\d*\.?\d+)%/.test(val)) {
			return Math.round(RegExp.$1 * parentVal / 100);
		}
		return 0;
	};
	
	/*
	 * @盒模型 
	 * @param option {Object} 预定义属性
	 */
	var Box = Class.display.Sprite.extend({
		init : function(option) {
			this._super();
			
			this.style = {};
			this.setStyle(option);
			
			this.contentHeight = 0;
			this.scrollTop = 0;
			this.clipCanvas = this.clipCtx = null;
			
			this.addEventListener('ADDED_TO_STAGE', this.addedToStage);
			this.addEventListener('touchstart', this.touchStart);
		},
		touchStart : function(ev) {
			if (this.overflow === 'auto' && this.height < this.contentHeight) {
				var self = this, starttime = +new Date, baseTop = this.scrollTop, arr = [{
					t : starttime,
					m : ev.y
				}];
				if (this.scroll_anime) {
					this.scroll_anime.destroy();
					this.scroll_anime = null;
				}
				this.addEventListener('touchmove', function(e) {
					self.touchMove.call(self, e, baseTop, ev.y, arr);
				});
				this.addEventListener('touchend', function(e) {
					self.touchEnd.call(self, e, arr);
					arr = null;
				});
			}
		},
		touchMove : function(ev, baseTop, baseY, arr) {
			this.scrollTop = baseTop + baseY - ev.y;
			arr.push({
				t : +new Date,
				m : ev.y
			});
			if (arr.length > 3) {
				arr.shift();
			}
		},
		touchEnd : function(ev, arr) {
			var arr_len = arr.length - 1;
			if (arr_len > 1) {
				var speed = Math.round((arr[arr_len].m - arr[0].m) / (arr[arr_len].t - arr[0].t) * 200), self = this, baseTop = this.scrollTop;
				if (Math.abs(speed) > 20) {
					this.scroll_anime = SimpleAnime({
						duration : 1000,
						progress : function(ae) {
							self.scrollTop = baseTop - speed * ae.ease;
						},
						easing : 'circout'
					});
				}
			}
			this.removeEventListener('touchmove', 'function(e) {self.touchMove.call(self, e, baseTop, ev.y, arr);}');
			this.removeEventListener('touchend', 'function(e) {self.touchEnd.call(self, e, arr);arr = null;}');
		},
		setStyle : function(option) {
			if (option && typeof option === 'object') {
				for (var i in option) {
					switch(i) {
						case 'align':
						case 'boxFlex':
						case 'boxOrient':
						case 'display':
						case 'fontSize':
						case 'height':
						case 'overflow':
						case 'valign':
						case 'width':
							this.style[i] = option[i];
							break;
						case 'bgColor':
							this.style.bgColor = parseColor(option.bgColor);
							break;
						case 'borderColor':
							this.style.borderColor = formatProp(option.borderColor, parseColor);
							break;
						case 'borderWidth':
						case 'margin':
						case 'padding':
							this.style[i] = formatProp(option[i]);
							break;
					}
				}
				if (this.parent) {
					this.styleToProp();
					this.parent.childrenChange();
				}
			}
		},
		/*
		 * 将样式转换为属性
		 */
		styleToProp : function() {
			if (this.style.bgColor) {
				this.bgColor = this.style.bgColor;
			} else {
				this.bgColor = [0, 0, 0, 0];
			}
			this.borderColor = this.style.borderColor;
			this.fontSize = parseFloat(this.style.fontSize) || this.parent.fontSize || GLOBAL_FONTSIZE;
			if (this.style.align === 'center' || this.style.align === 'right') {
				this.align = this.style.align;
			} else {
				this.align = 'left';
			}
			if (this.style.valign === 'center' || this.style.align === 'bottom') {
				this.valign = this.style.valign;
			} else {
				this.valign = 'top';
			}
			if (this.style.display === 'box') {
				this.display = this.style.display;
			} else {
				this.display = 'block';
			}
			if (this.style.boxOrient === 'vertical') {
				this.boxOrient = this.style.boxOrient;
			} else {
				this.boxOrient = 'horizontal';
			}
			this.boxFlex = parseFloat(this.style.boxFlex) || 0;
			var parentWidth = this.parent.width, parentHeight = this.parent.height;
			if (this.style.margin) {
				this.margin = [parseSize(this.style.margin[0], parentHeight), parseSize(this.style.margin[1], parentWidth), parseSize(this.style.margin[2], parentHeight), parseSize(this.style.margin[3], parentWidth)];
			} else {
				this.margin = [0, 0, 0, 0];
			}
			if (this.style.padding) {
				this.padding = [parseSize(this.style.padding[0], parentHeight), parseSize(this.style.padding[1], parentWidth), parseSize(this.style.padding[2], parentHeight), parseSize(this.style.padding[3], parentWidth)];
			} else {
				this.padding = [0, 0, 0, 0];
			}
			if (this.style.borderWidth) {
				this.borderWidth = [parseSize(this.style.borderWidth[0], parentHeight), parseSize(this.style.borderWidth[1], parentWidth), parseSize(this.style.borderWidth[2], parentHeight), parseSize(this.style.borderWidth[3], parentWidth)];
			} else {
				this.borderWidth = [0, 0, 0, 0];
			}
			
			if (this.style.width === undefined) {
				this.width = parentWidth - this.margin[3] - this.borderWidth[3] - this.padding[3] - this.padding[1] - this.borderWidth[1] - this.margin[1];
			} else {
				this.width = parseSize(this.style.width, parentWidth);
			}
			this.height = parseSize(this.style.height, parentHeight);
			
			if (this.style.overflow === 'hidden' || this.style.overflow === 'auto') {
				this.overflow = this.style.overflow;
				this.clipCanvas = document.createElement('canvas');
				this.clipCtx = this.clipCanvas.getContext('2d');
				this.setClipCtx(this.clipCtx);
			} else {
				this.overflow = 'visible';
				this.clipCanvas = this.clipCtx = null;
				this.setClipCtx(this.ctx);
			}
		},
		/*
		 * 当被放入场景时，重新计算盒模型尺寸
		 */
		addedToStage : function(ev) {
			this.styleToProp();
			
			if (this.parent instanceof Box) return false;
			
			var parentContentWidth = this.parent.width - this.margin[1] - this.margin[3] - this.padding[1] - this.padding[3] - this.borderWidth[1] - this.borderWidth[3];
			var parentContentHeight = this.parent.height - this.margin[0] - this.margin[2] - this.padding[0] - this.padding[2] - this.borderWidth[0] - this.borderWidth[2];
			var width = parseSize(this.style.width, parentContentWidth), height = parseSize(this.style.height, parentContentHeight);
			if (!this.style.width || !width) {
				this.width = parentContentWidth;
				this.x = 0;
			} else {
				this.width = width;
			}
			if (!this.style.height || !height) {
				this.height = 0;
				this.y = 0;
			} else {
				this.height = height;
			}
		},
		/*
		 * 显示类型为box时，对插入子对象重新计算尺寸
		 */
		appendChildAt : function(el, i) {
			this._super(el, i);
			var baseX = this.margin[3] + this.borderWidth[3] + this.padding[3];
			var baseY = this.margin[0] + this.borderWidth[0] + this.padding[0];
			el.x = baseX;
			el.y = baseY;
			if (this.overflow !== 'visible') {
				el.ctx = this.clipCtx;
			}
			this.childrenChange();
		},
		/*
		 * 子元素发生变化时重新计算
		 */
		childrenChange : function() {
			var baseX = this.margin[3] + this.borderWidth[3] + this.padding[3];
			var baseY = this.margin[0] + this.borderWidth[0] + this.padding[0];
			if (this.display === 'box') {
				this.contentHeight = this.height;
				if (this.boxOrient === 'vertical') {
					this.calculateChildSize('height', 'Height', 'width', 'y', 3, 1, 0, 2, baseY);
				} else {
					this.calculateChildSize('width', 'Width', 'height', 'x', 0, 2, 3, 1, baseX);
				}
			} else {
				this.contentHeight = 0;
				var prev, cur;
				for (var d = 0 ; d < this.numChildren; d++) {
					cur = this.children[d];
					if (d > 0) {
						if (prev instanceof Box) {
							cur.y = prev.y + prev.margin[0] + prev.borderWidth[0] + prev.padding[0] + prev.height + prev.padding[2] + prev.borderWidth[2] + prev.margin[2];
						} else {
							cur.y = prev.y + prev.height;
						}
					}
					prev = cur;
				}
				if (cur instanceof Box) {
					this.contentHeight = cur.y + cur.margin[0] + cur.borderWidth[0] + cur.padding[0] + cur.height + cur.padding[2] + cur.borderWidth[2] + cur.margin[2];
				} else {
					this.contentHeight = cur.y + cur.height;
				}
			}
		},
		/*
		 * display为box的对象，重新计算子元素
		 */
		calculateChildSize : function(str, Str, ostr, pos, i0, i1, i2, i3, baseVal) {
			var restVal = this[str], restDiv = [], restMax = 0;
			for (var di = 0; di < this.numChildren; di++) {
				var item = this.children[di];
				if (item instanceof Box) {
					item[ostr] = item.style[ostr] || this[ostr] - item.margin[i0] - item.borderWidth[i0] - item.padding[i0] - item.padding[i1] - item.borderWidth[i1] - item.margin[i1];
					if (item.boxFlex) {
						restMax += item.boxFlex;
						restVal = restVal - item.margin[i2] - item.borderWidth[i2] - item.padding[i2] - item.padding[i3] - item.borderWidth[i3] - item.margin[i3];
						restDiv.push(item);
					} else {
						restVal = restVal - item.margin[i2] - item.borderWidth[i2] - item.padding[i2] - item[str] - item.padding[i3] - item.borderWidth[i3] - item.margin[i3];
					}	
				} else {
					restVal = restVal - item[str];
				}
			}
			
			if (restVal < 0) {
				restVal = 0;
			}

			var rl = restDiv.length;
			if (rl) {
				for (var ri = 0; ri < rl; ri++) {
					var rItem = restDiv[ri];
					rItem[str] = restVal * rItem.boxFlex / restMax;
				}
			}
			
			var offsetVal = baseVal;
			for (var ei = 0; ei < this.numChildren; ei++) {
				var curItem = this.children[ei];
				curItem[pos] = offsetVal;
				if (curItem instanceof Box) {
					offsetVal += curItem.margin[i2] + curItem.borderWidth[i2] + curItem.padding[i2] + curItem[str] + curItem.padding[i3] + curItem.borderWidth[i3] + curItem.margin[i3];
				} else {
					offsetVal += curItem[str];
				}
			}
		},
		removeChildAt : function(el, i) {
			this._super(el, i);
			this.childrenChange();
		},
		hitTest : function(point, x, y) {
			if (!this.ctx || !this.visible) return false;
			
			var in_figure = point.x >= this.x + x + this.margin[3]
				&& point.y >= this.y + y + this.margin[0]
				&& point.x <= this.x + x + this.margin[3] + this.width + this.padding[1] + this.padding[3] + this.borderWidth[1] + this.borderWidth[3]
				&& point.y <= this.y + y + this.margin[0] + this.height + this.padding[0] + this.padding[2] + this.borderWidth[0] + this.borderWidth[2];
			
			if (in_figure) {
				var child_hit_test = this._super(point, x, y - this.scrollTop);
				if (child_hit_test) {
					return child_hit_test;
				} else {
					return this;
				}
			}
			
			return false;
		},
		realRender : function(x, y, alpha) {
			if (!this.ctx || !this.visible) return false;
			
			x += this.x;
			y += this.y;
			alpha *= this.alpha;
			
			this.ctx.save();
			this.ctx.globalAlpha = alpha;
			this.ctx.translate(x * this.stage.ratioX, y * this.stage.ratioY);

			this.render();
			
			this.ctx.restore();
			
			if (this.overflow !== 'visible') {
				// 保持合理的scrollTop
				if (this.height >= this.contentHeight) {
					this.scrollTop = 0;
				} else {
					this.scrollTop = Math.min(Math.max(0, this.scrollTop), this.contentHeight - this.height);
				}
				
				this.clipCanvas.width = this.width * this.stage.ratioX;
				this.clipCanvas.height = this.contentHeight * this.stage.ratioY;
				this.clipCtx.clearRect(0, 0, this.clipCanvas.width, this.clipCanvas.height);
				for (var i = 0, l = this.numChildren; i < l; i++) {
					this.children[i].realRender(x, y, alpha);
				}
				this.ctx.drawImage(this.clipCanvas, 0, this.scrollTop * this.stage.ratioY, this.clipCanvas.width, this.height * this.stage.ratioY, this.x * this.stage.ratioX, this.y * this.stage.ratioY, (this.padding[3] + this.width + this.padding[1]) * this.stage.ratioX, (this.padding[0] + this.height + this.padding[2]) * this.stage.ratioY);
				if (this.overflow === 'auto') {
					this.drawScroll(x, y, alpha);
				}
			} else {
				for (var i = 0, l = this.numChildren; i < l; i++) {
					this.children[i].realRender(x, y, alpha);
				}
			}
		},
		drawScroll : function(x, y, alpha) {
			if (this.height >= this.contentHeight) {
				return false;
			}
			
			this.ctx.save();
			this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
			this.ctx.lineWidth = 2;
			var scrollHeight = Math.round(this.height * this.height / this.contentHeight);
			var scrollTop = Math.round(this.scrollTop * (this.height - scrollHeight) / (this.contentHeight - this.height));
			this.ctx.fillRect((x + this.width - 12) * this.stage.ratioX, (y + scrollTop) * this.stage.ratioY, 10 * this.stage.ratioX, scrollHeight * this.stage.ratioY);
			this.ctx.restore();
		},
		render : function() {
			if (this.bgColor) {
				this.ctx.fillStyle = this.bgColor;
				this.ctx.fillRect((this.margin[3] + this.borderWidth[3]) * this.stage.ratioX, (this.margin[0] + this.borderWidth[0]) * this.stage.ratioY, (this.width + this.padding[1] + this.padding[3]) * this.stage.ratioX, (this.height + this.padding[0] + this.padding[2]) * this.stage.ratioY);
			}
			if (this.borderWidth[0]) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = this.borderColor[0];
				this.ctx.lineWidth = this.borderWidth[0] * this.stage.ratioY;
				var _y = (this.margin[3] + this.borderWidth[0] / 2) * this.stage.ratioY;
				this.ctx.moveTo(this.margin[3] * this.stage.ratioX, _y);
				this.ctx.lineTo((this.margin[3] + this.borderWidth[3] + this.padding[3] + this.width + this.padding[1] + this.borderWidth[1]) * this.stage.ratioX, _y);
				this.ctx.stroke();
			}
			if (this.borderWidth[1]) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = this.borderColor[1];
				this.ctx.lineWidth = this.borderWidth[1] * this.stage.ratioX;
				var _x = (this.margin[3] + this.borderWidth[3] + this.padding[3] + this.width + this.padding[1] + this.borderWidth[1] / 2) * this.stage.ratioX;
				this.ctx.moveTo(_x, this.margin[0] * this.stage.ratioY);
				this.ctx.lineTo(_x, (this.margin[0] + this.borderWidth[0] + this.padding[0] + this.height + this.padding[2] + this.borderWidth[2]) * this.stage.ratioY);
				this.ctx.stroke();
			}
			if (this.borderWidth[2]) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = this.borderColor[2];
				this.ctx.lineWidth = this.borderWidth[2] * this.stage.ratioY;
				var _y = (this.margin[0] + this.borderWidth[0] + this.padding[0] + this.height + this.padding[2] + this.borderWidth[2] / 2) * this.stage.ratioY;
				this.ctx.moveTo(this.margin[3] * this.stage.ratioX, _y);
				this.ctx.lineTo((this.margin[3] + this.borderWidth[3] + this.padding[3] + this.width + this.padding[1] + this.borderWidth[1]) * this.stage.ratioX, _y);
				this.ctx.stroke();
			}
			if (this.borderWidth[3]) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = this.borderColor[3];
				this.ctx.lineWidth = this.borderWidth[3] * this.stage.ratioX;
				var _x = (this.margin[3] + this.borderWidth[3] / 2) * this.stage.ratioX;
				this.ctx.moveTo(_x, this.margin[0] * this.stage.ratioY);
				this.ctx.lineTo(_x, (this.margin[0] + this.borderWidth[0] + this.padding[0] + this.height + this.padding[2] + this.borderWidth[2]) * this.stage.ratioY);
				this.ctx.stroke();
			}
		}
	});
	
	/*
	 * @文本渲染
	 */
	var TextContent = Box.extend({
		init : function(option) {
			this._super(option);
			
		},
		render : function() {
			
		}
	});
	
	Class.dom = {};
	Class.dom.Box = Box;
	Class.dom.TextContent = TextContent;
})();
;
