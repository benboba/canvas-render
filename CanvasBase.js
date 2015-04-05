(function(window) {
	/*
	 * CanvasRender类
	 */
	var GLOBAL_FONTSIZE = 12, // 默认文字大小
	GLOBAL_FONTCOLOR = '#333', // 默认文字颜色
	GLOBAL_FONTFACE = 'Microsoft Yahei', // 默认字体
	GLOBAL_FONTWEIGHT = 'normal', // 默认字体粗细
	GLOBAL_TEXTALIGN = 'left', // 默认文字对齐方式
	GLOBAL_TEXTBASELINE = 'middle'; // 默认文字基线对齐方式
	
	/*
	 * 事件
	 */
	var _Event = Class.extend({
		init : function(eventname) {
			if (!eventname || typeof eventname !== 'string') {
				throw('请传入事件名称！');
			}
			this.type = eventname.toLowerCase();
			this.bubble = false;
		},
		stopPaganation : function() {
			this.bubble = false;
		}
	});
	
	/*
	 * 二维空间点，用于hitTest
	 */
	var Point = Class.extend({
		init : function(x, y) {
			this.x = x || 0;
			this.y = y || 0;
		}
	});
	
	/*
	 * 矩形，用于测定范围
	 */
	var Rectangle = Class.extend({
		init : function(x, y, width, height) {
			this.x = x || 0;
			this.y = y || 0;
			this.width = width || 0;
			this.height = height || 0;
		}
	});
	
	/*
	 * 显示对象基类
	 */
	var DisplayObject = Class.extend({
		init : function() {
			// 深度
			this.depth = 0;
			// 坐标
			this.x = 0;
			this.y = 0;
			// 父元素
			this.parent = null;
			// 对象名称
			this.name = '';
			// 透明度
			this.alpha = 1;
			// 旋转
			this.rotate = 0;
			// 缩放
			this.scaleX = this.scaleY = 1;
			// 鼠标响应
			this.isActive = false;
			// 是否渲染
			this.visible = true;
			// 舞台
			this.stage = null;
			// canvas画布
			this.ctx = null;
			// 事件缓存
			this.EvCache = {};
		},
		/*
		 * 绑定事件方法
		 * @param {String} eventname 事件名称
		 * @param {Function|Array|String} callback 回调方法
		 * @param {Boolean} priority 默认false，先绑定的方法先执行，传入true则可以使后绑定的方法优先执行
		 */
		addEventListener : function(eventname, callback, priority) {
			if ( typeof eventname === 'string' && callback) {
				eventname = eventname.toLowerCase();
				
				if (!this.EvCache[eventname]) {
					this.EvCache[eventname] = [];
				}
				
				var operate = priority ? 'unshift' : 'push';
				if ( typeof callback === 'string') {
					try {
						callback = (new Function('return ' + callback))();
					} catch(e) {}
				}
				if ( typeof callback === 'function') {
					this.EvCache[eventname][operate](callback);
				} else if (Object.prototype.toString.call(callback) === '[object Array]') {
					for (var ei = 0, el = callback.length; ei < el; ei++) {
						if ( typeof callback[ei] === 'function') {
							this.EvCache[eventname][operate](callback[ei]);
						}
					}
				}
			}
		},
		/*
		 * 解除事件绑定
		 * @param {String} eventname 事件名称，不传此参数则清空全部事件监听
		 * @param {Function} callback 解除绑定的方法，不传此参数则解除该事件的全部绑定
		 */
		removeEventListener : function(eventname, callback) {
			if ( typeof eventname === 'string') {
				eventname = eventname.toLowerCase();
				// 第一个参数必须是事件类型字符串
				if (this.EvCache[eventname] && this.EvCache[eventname].length) {
					if (callback && (typeof callback === 'string' || typeof callback === 'function')) {
						for (var ei = this.EvCache[eventname].length; ei--; ) {
							var fn = this.EvCache[eventname][ei];
							// 判断方法是否相等，同时也判断方法的字符串是否相等
							if (fn === callback || fn.toString().replace(/\s/g, '') === callback.toString().replace(/\s/g, '')) {
								this.EvCache[eventname].splice(ei, 1);
								// 不中断循环，避免有重复绑定同一个方法的情况
								// break;
							}
						}
					} else {
						this.EvCache[eventname] = null;
						delete this.EvCache[eventname];
					}
				}
			} else {
				// 第一个参数无效，直接清空所有事件监听
				for (var e in this.EvCache) {
					this.removeEventListener(e);
				}
			}
		},
		/*
		 * 触发指定事件
		 * @param {String} eventname 事件名称
		 */
		dispatchEvent : function(ev) {
			if ( typeof ev === 'string') {
				ev = new _Event(ev);
				ev.target = this;
			}
			if (!(ev instanceof _Event)) {
				return;
			}
			var args = Array.prototype.slice.call(arguments, 1);
			args.unshift(ev);
			if (this.EvCache[ev.type] && this.EvCache[ev.type].length) {
				for (var ei = 0, el = this.EvCache[ev.type].length; ei < el; ei++) {
					this.EvCache[ev.type][ei].apply(this, args);
				}
			}
			
			// 判断事件是否冒泡
			if (ev.bubble && this.parent) {
				this.parent.dispatchEvent.apply(this.parent, args);
			}
		},
		/*
		 * 移除所有的事件监听
		 */
		destroyEvent : function() {
			for (var ei in this.EvCache) {
				this.EvCache[ei] = null;
				delete this.EvCache[ei];
			}
			this.EvCache = this.addEventListener = this.removeEventListener = this.dispatchEvent = null;
		},
		/*
		 * 渲染方法，逐级传入父元素的偏移量和透明度
		 * @param x, y {Number} 偏移量
		 * @param alpha {Number} 实际透明度
		 */
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
		},
		/*
		 * 用于复写的实际渲染方法
		 */
		render : function() {},
		/*
		 * 用于复写的碰撞检测方法
		 * @param point {Point} 传入碰撞检测的点
		 * @param x, y {Number} 父元素的偏移量
		 */
		hitTest : function(point, x, y) {
			return false;
		},
		remove : function() {
			this.destroyEvent();
			this.stage = null;
			this.ctx = null;
			if (this.parent) {
				this.parent.removeChildAt(this.depth);
				this.parent = null;
			}
		}
	});
	
	/*
	 * 精灵类，实现子对象管理相关功能
	 */
	var Sprite = DisplayObject.extend({
		init : function() {
			this._super();
			this.children = [];
			this.numChildren = 0;
		},
		/*
		 * 渲染每个子类
		 */
		realRender : function(x, y, alpha) {
			this._super(x, y, alpha);
			for (var i = 0, l = this.numChildren; i < l; i++) {
				this.children[i].realRender(x + this.x, y + this.y, alpha * this.alpha);
			}
		},
		hitTest : function(point, x, y) {
			if (!this.ctx || !this.visible) return false;
			
			var _x = x || 0, _y = y || 0;
			_x += this.x;
			_y += this.y;
			
			for (var i = this.numChildren; i--; ) {
				var hit_test = this.children[i].hitTest(point, _x, _y);
				if (hit_test) {
					return hit_test;
				}
			}
			return false;
		},
		appendChild : function(el) {
			this.appendChildAt(el, this.numChildren);
			return this;
		},
		appendChildAt : function(el, i) {
			i = parseInt(i);
			if ( el instanceof DisplayObject && !(el instanceof Stage) && !isNaN(i)) {
				if (el.parent) {
					el.parent.removeChild(el);
				}
				var l = this.numChildren;
				i = Math.max(0, Math.min(i, l));
				el.depth = i;
				el.parent = this;
				if (this.ctx) {
					el.ctx = this.ctx;
				}
				this.children.splice(i, 0, el);
				for (var d = i + 1; d < l; d++) {
					this.children[d].depth++;
				}
				this.numChildren++;
				if (this.stage) {
					el.stage = this.stage;
					el.dispatchEvent('ADDED_TO_STAGE');
				}
			}
			return this;
		},
		getChildAt : function(i) {
			return this.children[i];
		},
		getChildByName : function(name) {
			if (!name)
				return null;
			for (var d = this.numChildren; d--; ) {
				var _child = this.children[d];
				if (_child.name === name) {
					return _child;
				}
			}
			return null;
		},
		remove : function() {
			for (var d = this.numChildren; d--; ) {
				this.children[d].remove();
			}
			this._super();
		},
		removeChild : function(el) {
			return this.removeChildAt(el.depth);
		},
		removeChildAt : function(i) {
			this.children.splice(i, 1);
			this.numChildren--;
			for (var d = i, l = this.numChildren; d < l; d++) {
				this.children[d].depth--;
			}
			return this;
		},
		getChildIndex : function(tgt) {
			if (!tgt)
				return null;
			for (var d = this.numChildren; d--; ) {
				var _child = this.children[d];
				if (_child === tgt) {
					return d;
				}
			}
			return null;
		},
		setChildIndex : function(el, i) {
			var _d = el.depth, l = this.numChildren;
			if (_d === i) {
				return this;
			}
			this.children.splice(d, 1);
			this.children.splice(i, 0, el);
			el.depth = i;
			if (_d < i) {
				for (var d = _d; d < i; d++) {
					this.children[d].depth--;
				}
			} else if (_d > i) {
				for (var d = i + 1; d < _d + 1; d++) {
					this.children[d].depth++;
				}
			}
			return this;
		},
		/*
		 * 设置子对象context
		 */
		setClipCtx : function(ctx) {
			for (var i = 0; i < this.numChildren; i++) {
				this.children[i].ctx = ctx;
				if (this.children[i] instanceof Sprite) {
					this.children[i].setClipCtx(ctx);
				}
			}
		}
	});
	
	/*
	 * 文本类
	 */
	var Textfield = DisplayObject.extend({
		init : function(option) {
			this._super();
			this.text = option.text || '';
			this.fontSize = option.fontSize || GLOBAL_FONTSIZE;
			this.color = option.color || GLOBAL_FONTCOLOR;
			this.fontFace = option.fontFace || GLOBAL_FONTFACE;
			this.fontWeight = option.fontWeight || GLOBAL_FONTWEIGHT;
			this.textAlign = option.textAlign || GLOBAL_TEXTALIGN;
			this.textBaseline = option.textBaseline || GLOBAL_TEXTBASELINE;
		},
		hitTest : function(point, x, y) {
			if (!this.ctx || !this.visible) return false;
			var textWidth = this.getTextWidth();
			if (point.x >= this.x + x && point.y >= this.y + y && point.x <= this.x + x + textWidth && point.y <= this.y + y + this.fontSize) {
				return this;
			}
			return false;
		},
		render : function() {
			try {
				this.ctx.fillStyle = this.color;
				this.ctx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFace;
				this.ctx.textAlign = this.textAlign;
				this.ctx.textBaseline = this.textBaseline;
				this.ctx.fillText(this.text, 0, 0);
			} catch(e) {}
		},
		getTextWidth : function() {
			this.ctx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFace;
			this.ctx.textAlign = this.textAlign;
			this.ctx.textBaseline = this.textBaseline;
			return this.ctx.measureText(this.text);
		}
	});
	
	var _Image = DisplayObject.extend({
		init : function(option) {
			this._super();
			this.src = option.src || '';
			this.x = option.x || 0;
			this.y = option.y || 0;
			this.width = option.width || 0;
			this.height = option.height || 0;
			
			if (this.src) {
				this.imageData = new Image();
				var self = this;
				this.imageData.onload = function() {
					self.width = this.width;
					self.height = this.height;
					this.onload = this.onerror = null;
				};
				this.imageData.onerror = function() {
					this.onload = this.onerror = null;
				};
				this.imageData.src = this.src;
			} else {
				this.imageData = option.imageData || new Image();
			}
		},
		hitTest : function(point, x, y) {
			if (!this.ctx || !this.visible) return false;
			if (point.x >= this.x + x && point.y >= this.y + y && point.x <= this.x + x + this.width && point.y <= this.y + y + this.height) {
				return this;
			}
			return false;
		},
		render : function() {
			this.ctx.drawImage(this.imageData, 0, 0, this.width * this.stage.ratioX, this.height * this.stage.ratioY);
		}
	});
	
	/*
	 * 图形精灵，类似CSS Sprite
	 */
	var ImgSprite = DisplayObject.extend({
		init : function(option) {
			this._super();
			this.imageData = option.image;
			this.x = option.x || 0;
			this.y = option.y || 0;
			this.width = option.width || this.imageData.width;
			this.height = option.height || this.imageData.height;
			this.clipX = option.clipX || 0;
			this.clipY = option.clipY || 0;
			this.clipWidth = option.clipWidth || this.width;
			this.clipHeight = option.clipHeight || this.height;
			
			if (this.src) {
				this.imageData = new Image();
				var self = this;
				this.imageData.onload = function() {
					self.width = this.width;
					self.height = this.height;
					this.onload = this.onerror = null;
				};
				this.imageData.onerror = function() {
					this.onload = this.onerror = null;
				};
				this.imageData.src = this.src;
			} else {
				this.imageData = option.imageData || new Image();
			}
		},
		hitTest : function(point, x, y) {
			if (!this.ctx || !this.visible) return false;
			if (point.x >= this.x + x && point.y >= this.y + y && point.x <= this.x + x + this.width && point.y <= this.y + y + this.height) {
				return this;
			}
			return false;
		},
		render : function() {
			try {
				this.ctx.drawImage(this.bitmapData, this.clipX, this.clipY, this.clipWidth, this.clipHeight, 0, 0, this.width * this.stage.ratioX, this.height * this.stage.ratioY);
			} catch(e) {}
		}
	});
	
	/*
	 * 舞台，每个Canvas下只有一个舞台
	 */
	var Stage = Sprite.extend({
		init : function(option) {
			this._super();
			this.ctx = option.ctx;
			this.ratioX = option.ratioX || 2;
			this.ratioY = option.ratioY || 2;
			this.width = option.width;
			this.height = option.height;
			this.stage = this;
			this.addEventListener('resize', this.resize);
		},
		/*
		 * 如果没有任何子对象触发碰撞，舞台自身将响应碰撞
		 */
		hitTest : function(point, x, y) {
			var child_hit_test = this._super(point, x, y);
			if (child_hit_test) {
				return child_hit_test;
			} else {
				return this;
			}
		},
		// stage被remove表示整个舞台被销毁
		remove : function() {
			this._super();
		},
		// 重置大小
		resize : function(ev, option) {
			this.width = option.width;
			this.height = option.height;
			this.ratioX = option.ratioX || 2;
			this.ratioY = option.ratioY || 2;
		}
	});
	
	Class.display = {};
	Class.geom = {};
	Class.utils = {};
	
	Class.display.DisplayObject = DisplayObject;
	Class.display.Sprite = Sprite;
	Class.display.Textfield = Textfield;
	Class.utils.Event = _Event;
	Class.geom.Point = Point;
	Class.geom.Rectangle = Rectangle;
	Class.display.Image = _Image;
	Class.display.ImgSprite = ImgSprite;
	Class.display.Stage = Stage;
	
})(window);
