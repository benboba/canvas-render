/* Simple JavaScript Inheritance
* By John Resig http://ejohn.org/
* MIT Licensed.
*/
// Inspired by base2 and Prototype
(function() {
	var initializing = false, fnTest = /xyz/.test(function() {xyz;}) ? /\b_super\b/ : /.*/;

	// The base Class implementation (does nothing)
	this.Class = function() {};

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, prop[name]) : prop[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;

		return Class;
	};
})();

/*
 * 简单定义define、以兼容非amd环境
 */
(function(window) {
	if (!window.define) {
		var amdCache = {};
		window.define = function() {
			var id, args = [], callback;
			for (var ai = 0, al = arguments.length; ai < al; ai++) {
				var argitem = arguments[ai];
				if (typeof argitem === 'string') {
					id = argitem;
				} else if (typeof arguments[ai] === 'function') {
					callback = argitem;
				} else if (Array.isArray(argitem)) {
					for (var gi = 0, gl = argitem.length; gi < gl; gi++) {
						if (amdCache[argitem[gi]]) {
							args.push(amdCache[argitem[gi]]);
						} else {
							args.push(null);
						}
					}
				}
			}
			if (callback) {
				var amdObj = callback.apply(window, args);
				if (id) {
					amdCache[id] = amdObj;
				}
			}
		};
	}
	
	// 定义一些包和缓存
	Class.utils = {};
	Class.geom = {};
	Class.display = {};
	Class.dom = {};
	Class.imageCache = {};
	Class.styleCache = {};
})(window);

/*
 * 事件
 */
define('class_utils_event', function() {
	var _Event = Class.extend({
		init : function(eventname) {
			if (!eventname || typeof eventname !== 'string') {
				throw('请传入事件名称！');
			}
			var bubble = false;
			Object.defineProperties(this, {
				type : {
					value : eventname.toLowerCase()
				},
				bubble : {
					get : function() {
						return bubble;
					},
					set : function(val) {
						bubble = !!val;
					}
				}
			});
		},
		stopPaganation : function() {
			this.bubble = false;
		}
	});
	Class.utils.Event = _Event;
	return _Event;
});

/*
 * 二维空间点，用于hitTest
 */
define('class_geom_point', function() {
	var Point = Class.extend({
		init : function(x, y) {
			Object.defineProperties(this, {
				x : {
					value : x || 0
				},
				y : {
					value : y || 0
				}
			});
		}
	});
	Class.geom.Point = Point;
	return Point;
});

/*
 * 矩形，用于测定范围
 */
define('class_geom_rectangle', function() {
	var Rectangle = Class.extend({
		init : function(x, y, width, height) {
			Object.defineProperties(this, {
				x : {
					value : x || 0
				},
				y : {
					value : y || 0
				},
				width : {
					value : width || 0
				},
				height : {
					value : height || 0
				}
			});
		}
	});
	Class.geom.Rectangle = Rectangle;
	return Rectangle;
});

/*
 * 精灵类，实现子对象管理相关功能
 */
define('class_display_sprite', function() {
	var Sprite = Class.extend({
		init : function(option) {
			// 深度
			var depth = 0;
			// 坐标
			var x = 0, y = 0;
			// 舞台
			var stage = null;
			// 父元素
			var parent = null;
			// 对象名称
			var name = '';
			// 透明度
			var alpha = 1;
			// 旋转
			//var rotate = 0;
			// 缩放
			//var scaleX = 1, scaleY = 1;
			// 鼠标响应
			var isActive = false;
			// 是否渲染
			var visible = true;
			
			Object.defineProperties(this, {
				depth : {
					get : function() {
						return depth;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							depth = Math.max(0, val);
						}
					}
				},
				x : {
					get : function() {
						return x;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							x = val;
						}
					}
				},
				y : {
					get : function() {
						return y;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							y = val;
						}
					}
				},
				parent : {
					get : function() {
						return parent;
					},
					set : function(val) {
						if ((val instanceof Sprite) || val === null) {
							parent = val;
						}
					}
				},
				stage : {
					get : function() {
						return stage;
					},
					set : function(val) {
						if ((val instanceof Class.display.Stage) || val === null) {
							stage = val;
						}
					}
				},
				alpha : {
					get : function() {
						return alpha;
					},
					set : function(val) {
						val = parseFloat(val);
						if (!isNaN(val)) {
							alpha = Math.min(1, Math.max(0, val));
						}
					}
				},
				isActive : {
					get : function() {
						return isActive;
					},
					set : function(val) {
						isActive = !!val;
					}
				},
				visible : {
					get : function() {
						return visible;
					},
					set : function(val) {
						visible = !!val;
					}
				},
				// 事件缓存
				EvCache : {
					value : []
				},
				children : {
					value : []
				},
				numChildren : {
					get : function() {
						return this.children.length;
					}
				}
			});
			
			this.x = option.x;
			this.y = option.y;
			this.visible = option.visible !== false;
			
			this.addEventListener('ADDED_TO_STAGE', this.addedToStage);
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
				} else if (Array.isArray(callback)) {
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
				ev = new Class.utils.Event(ev);
				ev.target = this;
			}
			if (!(ev instanceof Class.utils.Event)) {
				return;
			}
			var args = Array.prototype.slice.call(arguments, 1);
			args.unshift(ev);
			if (this.EvCache[ev.type] && this.EvCache[ev.type].length) {
				for (var ei = 0, el = this.EvCache[ev.type].length; ei < el; ei++) {
					if (this.EvCache[ev.type][ei].apply(this, args) === false) {
						return false;
					}
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
			this.EvCache.splice(0);
		},
		/*
		 * 渲染方法，逐级传入父元素的偏移量和透明度
		 * @param x, y {Number} 偏移量
		 * @param alpha {Number} 实际透明度
		 */
		prepareRender : function(x, y, alpha) {
			if (!this.stage || !this.visible) return false;
			
			x += this.x;
			y += this.y;
			alpha *= this.alpha;
			
			if (alpha <= 0 || x > this.stage.width || y > this.stage.height || x + this.width < 0 || y + this.contentHeight < 0) {
				return false;
			}
			
			this.stage.ctx.save();
			this.stage.ctx.globalAlpha = alpha;
			this.stage.ctx.translate(x, y);
			this.render();
			this.stage.ctx.restore();
			
			/*
			 * 渲染每个子类
			 */
			for (var i = 0, l = this.numChildren; i < l; i++) {
				this.children[i].prepareRender(x + this.x, y + this.y, alpha * this.alpha);
			}
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
			if (this.parent) {
				this.parent.removeChildAt(this.depth);
				this.parent = null;
			}
			this.removeChildren();
		},
		removeChildren : function() {
			for (var d = this.numChildren; d--; ) {
				this.children[d].remove();
			}
		},
		/*
		 * 判断是否处于某个对象之内
		 */
		includeBy : function(el) {
			if (this.stage && el instanceof Class.display.Sprite) {
				var parent = this.parent;
				while (parent !== this.stage) {
					if (parent === el) {
						return true;
					}
					parent = parent.parent;
				}
			}
			return false;
		},
		hitTest : function(point, x, y) {
			if (!this.stage || !this.visible) return false;
			
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
			if (el instanceof Sprite && !(el instanceof Class.display.Stage) && !isNaN(i)) {
				if (el.parent) {
					el.parent.removeChild(el);
				}
				var l = this.numChildren;
				i = Math.max(0, Math.min(i, l));
				el.depth = i;
				el.parent = this;
				this.children.splice(i, 0, el);
				for (var d = i + 1; d < l; d++) {
					this.children[d].depth++;
				}
				if (this.stage && el.stage !== this.stage) {
					el.stage = this.stage;
					el.dispatchEvent('ADDED_TO_STAGE');
				}
			}
			return this;
		},
		/*
		 * 批量插入子元素
		 */
		appendChildren : function() {
			for (var i = 0, l = arguments.length; i < l; i++) {
				this.appendChildAt(arguments[i], this.numChildren);
			}
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
		getChildrenByType : function(TypeClass) {
			var result = [];
			for (var i = 0; i < this.numChildren; i++) {
				if (this.children[i] instanceof TypeClass) {
					result.push(this.children[i]);
				}
			}
			return result;
		},
		removeChild : function(el) {
			return this.removeChildAt(el.depth);
		},
		removeChildAt : function(i) {
			this.children.splice(i, 1);
			for (var d = i, l = this.numChildren; d < l; d++) {
				this.children[d].depth--;
			}
			return this;
		},
		getChildIndex : function(el) {
			if (!el || el.parent !== this)
				return null;
			return el.depth;
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
		 * 判断是否包含某个子对象
		 */
		include : function(el) {
			for (var i = 0; i < this.numChildren; i++) {
				if (this.children[i] === el) {
					return true;
				}
				if (this.children[i] instanceof Sprite) {
					if (this.children[i].include(el)) {
						return true;
					}
				}
			}
			return false;
		},
		/*
		 * 放入场景时，处理所有子对象
		 */
		addedToStage : function(ev) {
			if (this.numChildren) {
				for (var i = 0, l = this.numChildren; i < l; i++) {
					this.children[i].stage = this.stage;
					this.children[i].dispatchEvent('ADDED_TO_STAGE');
				}
			}
		}
	});
	Class.display.Sprite = Sprite;
	return Sprite;
});

/*
 * 舞台，Canvas渲染的根元素
 */
define('class_display_stage', ['class_display_sprite'], function(Sprite) {
	var Stage = Sprite.extend({
		init : function(option) {
			this._super(option);
			this.stage = this;
			
			var ctx, ratioX, ratioY, width, height, repaint = true;
			
			Object.defineProperties(this, {
				ctx : {
					get : function() {
						return ctx;
					},
					set : function(val) {
						if ((val instanceof CanvasRenderingContext2D) || val === null) {
							ctx = val;
						}
					}
				},
				ratioX : {
					get : function() {
						return ratioX;
					},
					set : function(val) {
						val = parseFloat(val);
						if (!isNaN(val)) {
							ratioX = val;
						}
					}
				},
				ratioY : {
					get : function() {
						return ratioY;
					},
					set : function(val) {
						val = parseFloat(val);
						if (!isNaN(val)) {
							ratioY = val;
						}
					}
				},
				width : {
					get : function() {
						return width;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							width = val;
						}
					}
				},
				height : {
					get : function() {
						return height;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							height = val;
						}
					}
				},
				repaint : {
					get : function() {
						return repaint;
					},
					set : function(val) {
						repaint = !!val;
					}
				}
			});
			
			this.ctx = option.ctx;
			this.ratioX = option.ratioX;
			this.ratioY = option.ratioY;
			this.width = option.width;
			this.height = option.height;
		},
		/*
		 * 舞台的渲染规则单独处理
		 * 1、舞台自身不进行渲染
		 * 2、舞台在渲染子类前进行一次缩放
		 */
		prepareRender : function(x, y, alpha) {
			this.ctx.save();
			this.ctx.scale(this.ratioX, this.ratioY);
			/*
			 * 渲染每个子类
			 */
			for (var i = 0, l = this.numChildren; i < l; i++) {
				this.children[i].prepareRender(x + this.x, y + this.y, alpha * this.alpha);
			}
			this.ctx.restore();
		},
		/*
		 * 如果没有任何子对象触发碰撞，舞台自身将响应碰撞
		 */
		hitTest : function(point, x, y) {
			var child_hit_test = this._super(point, x, y);
			if (child_hit_test) {
				return child_hit_test;
			} else {
				return {
					target : this
				};
			}
		},
		// stage被remove表示整个舞台被销毁
		remove : function() {
			this._super();
		}
	});
	Class.display.Stage = Stage;
	return Stage;
});

/*
 * 盒模型 
 */
define('class_dom_box', ['class_display_sprite'], function(Sprite) {
	/*
	 * @param option {Object} 预定义属性
	 */
	var Box = Sprite.extend({
		init : function(option) {
			option = option || {};
			this._super(option);
			
			// 宽高，用于渲染背景色和边框，auto表示是否根据父元素自动计算宽度，是否根据子元素自动延展高度
			var height = 'auto', autoHeight = false, width = 'auto', autoWidth = false,  scrollTop = 0;
			// 滚动条透明度
			var scrollAlpha = 1;
			
			var tagName = 'div', id = '', className = '', activeClass = '', extraRender = null;
			var contentHeight = 0, contentWidth = 0, isClip = false, clipParent = null;
			
			Object.defineProperties(this, {
				// children用来管理子对象顺序，zChildren用来管理显示顺序和tap事件触发顺序
				zChildren : {
					value : []
				},
				dataset : {
					value : {}
				},
				baseStyle : {
					value : {}
				},
				// 计算后的样式
				style : {
					value : {}
				},
				// active状态的样式
				activeStyle : {
					value : {}
				},
				width : {
					get : function() {
						return width;
					},
					set : function(val) {
						if (val === 'auto') {
							width = val;
						} else {
							val = parseInt(val);
							if (!isNaN(val)) {
								width = val;
							}
						}
					}
				},
				height : {
					get : function() {
						return height;
					},
					set : function(val) {
						if (val === 'auto') {
							height = val;
						} else {
							val = parseInt(val);
							if (!isNaN(val)) {
								height = val;
							}
						}
					}
				},
				autoWidth : {
					get : function() {
						return autoWidth;
					},
					set : function(val) {
						autoWidth = !!val;
					}
				},
				autoHeight : {
					get : function() {
						return autoHeight;
					},
					set : function(val) {
						autoHeight = !!val;
					}
				},
				scrollTop : {
					get : function() {
						return scrollTop;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							scrollTop = val;
						}
					}
				},
				scrollAlpha : {
					get : function() {
						return scrollAlpha;
					},
					set : function(val) {
						val = parseFloat(val);
						if (!isNaN(val)) {
							scrollAlpha = val;
						}
					}
				},
				tagName : {
					get : function() {
						return tagName;
					},
					set : function(val) {
						if (typeof val === 'string') {
							tagName = val;
						}
					}
				},
				id : {
					get : function() {
						return id;
					},
					set : function(val) {
						if (typeof val === 'string') {
							id = val;
						}
					}
				},
				className : {
					get : function() {
						return className;
					},
					set : function(val) {
						if (typeof val === 'string') {
							className = val;
						}
					}
				},
				activeClass : {
					get : function() {
						return activeClass;
					},
					set : function(val) {
						if (typeof val === 'string') {
							activeClass = val;
						}
					}
				},
				extraRender : {
					get : function() {
						return extraRender;
					},
					set : function(val) {
						if (val === null || typeof val === 'function') {
							extraRender = val;
						}
					}
				},
				contentWidth : {
					get : function() {
						return contentWidth;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							contentWidth = val;
						}
					}
				},
				contentHeight : {
					get : function() {
						return contentHeight;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							contentHeight = val;
						}
					}
				},
				isClip : {
					get : function() {
						return isClip;
					},
					set : function(val) {
						isClip = !!val;
					}
				},
				clipParent : {
					get : function() {
						return clipParent;
					},
					set : function(val) {
						if (val === null || val instanceof Box) {
							clipParent = val;
						}
					}
				}
			});
			
			this.height = option.hasOwnProperty('height') && option.height;
			this.width = option.hasOwnProperty('width') && option.width;
			if (this.width === 'auto') {
				this.autoWidth = true;
			}
			if (this.height === 'auto') {
				this.autoHeight = true;
			}
			this.scrollTop = option.scrollTop;
			this.tagName = option.tagName;
			this.id = option.id;
			this.className = option.className;
			this.activeClass = option.activeClass;
			this.extraRender = option.extraRender;
			
			// dataset动态存储数据
			if (typeof option.dataset === 'object') {
				for (var di in option.dataset) {
					this.dataset[di] = option.dataset[di];
				}
			}
			// style属性
			if (option.style) {
				if (typeof option.style === 'string') {
					var styleArr = option.style.split(';');
					for (var yi = 0, yl = styleArr.length; yi < yl; yi++) {
						var styleI = styleArr[yi].split(':');
						this.baseStyle[styleI[0]] = styleI[1];
					}
				} else if (typeof option.style === 'object') {
					for (var si in option.style) {
						this.baseStyle[si] = option.style[si];
					}
				}
			}
			
			this.addEventListener('touchstart', this.touchStart);
		},
		getElementById : function(id, subsearch) {
			if (!id)
				return null;
			for (var i = 0; i < this.numChildren; i++) {
				if (this.children[i].id === id) {
					return this.children[i];
				}
				if (subsearch) {
					var sub = this.children[i].getElementById(id, subsearch);
					if (sub) {
						return sub;
					}
				}
			}
			return null;
		},
		getElementsByClassName : function(className, subsearch) {
			if (!className || (typeof className !== 'string'))
				return null;
			var result = [], reg = new RegExp('(?:^|\\s)' + className + '(?:\\s|$)');
			for (var i = 0; i < this.numChildren; i++) {
				if (reg.test(this.children[i].className)) {
					result.push(this.children[i]);
				}
				if (subsearch) {
					var subs = this.children[i].getElementsByClassName(subs, subsearch);
					if (subs) {
						result = result.concat(subs);
					}
				}
			}
			return result;
		},
		touchStart : function(ev) {
			if (this.style.overflow === 'auto' && this.isClip) {
				if (this.scroll_anime) {
					this.scroll_anime.destroy();
					this.scroll_anime = null;
				}
				this.scrollAlpha = 1;
				var self = this, starttime = +new Date;
				this.dataset.arr = [starttime, ev.y];
				this.dataset.baseTop = this.scrollTop;
				this.dataset.baseY = ev.y;
				this.removeEventListener('touchmove', this.touchMove);
				this.removeEventListener('touchend', this.touchEnd);
				this.addEventListener('touchmove', this.touchMove);
				this.addEventListener('touchend', this.touchEnd);
			}
		},
		touchMove : function(ev) {
			var baseTop = this.dataset.baseTop, baseY = this.dataset.baseY;
			this.scrollTop = Math.min(Math.max(0, baseTop + baseY - ev.y), this.contentHeight - this.height);
			this.dataset.arr.push(+new Date, ev.y);
			if (this.dataset.arr.length > 6) {
				this.dataset.arr.shift();
				this.dataset.arr.shift();
			}
			if (this.EvCache.scroll && this.EvCache.scroll.length) {
				this.dispatchEvent('SCROLL');
			}
			this.setRepaint();
		},
		touchEnd : function(ev) {
			var arr = this.dataset.arr, arr_len = arr.length - 1;
			if (arr_len > 1) {
				// 匀减速加速度
				var acce = 1 / 200;
				// 首先获取速度，并根据速度和加速度获取移动的距离
				var key0 = Math.max(1, arr_len - 4);
				var speed = (arr[arr_len] - arr[key0]) / (arr[arr_len - 1] - arr[key0 - 1]);
				if (isNaN(speed)) {
					speed = 0;
				}
				var distance = Math.round(speed * Math.abs(speed / acce) / 2);
				var self = this, baseTop = this.scrollTop;
				// 计算真正的距离
				if (distance < 0) {
					distance = Math.max(distance, self.height - self.contentHeight + baseTop);
				} else if (speed > 0) {
					distance = Math.min(distance, baseTop);
				}
				// 最后根据计算后的距离算出所用时间
				var usetime = distance * 2 / speed;
				
				if (distance) {
					this.scroll_anime = SimpleAnime({
						duration : usetime,
						progress : function(ae) {
							if (self.stage) {
								self.scrollTop = baseTop - Math.round(distance * ae.ease);
								if (self.EvCache.scroll && self.EvCache.scroll.length) {
									self.dispatchEvent('SCROLL');
								}
								self.setRepaint();
							} else {
								self.scroll_anime.destroy();
							}
						},
						easing : 'circ',
						after : function() {
							self.hideScroll();
						}
					});
				} else {
					self.hideScroll();
				}
			} else {
				this.hideScroll();
			}
			
			this.setRepaint();
			this.dataset.arr = [];
			this.removeEventListener('touchmove', this.touchMove);
			this.removeEventListener('touchend', this.touchEnd);
		},
		calculateStyle : function() {
			var cache_key = [this.tagName];
			if (this.id) {
				cache_key.push('#', this.id);
			}
			if (this.className) {
				cache_key.push('.', this.className.split(/\s+/).join('.'));
			}
			cache_key = cache_key.join('');
			var active_key = cache_key;
			if (this.activeClass) {
				active_key += '.' + this.activeClass.split(/\s+/).join('.');
			}
			
			var baseStyle = [];
			for (var bi in this.baseStyle) {
				baseStyle.push(bi, ':', this.baseStyle[bi], ';');
			}
			baseStyle = baseStyle.join('');
			if (baseStyle) {
				cache_key += '[style=' + baseStyle + ']';
				active_key += '[style=' + baseStyle + ']';
			}
			
			if (Class.styleCache[cache_key] && Class.styleCache[active_key]) {
				for (var ci in Class.styleCache[cache_key]) {
					this.style[ci] = Class.styleCache[cache_key][ci];
				}
				for (var li in Class.styleCache[active_key]) {
					this.activeStyle[li] = Class.styleCache[active_key][li];
				}
			} else {
				var div = document.createElement(this.tagName);
				div.setAttribute('id', this.id);
				div.setAttribute('class', this.className);
				div.setAttribute('style', baseStyle);
				document.body.appendChild(div);
				var style = getComputedStyle(div);
				
				this.style.backgroundColor = style.backgroundColor;
				this.style.borderColor = [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor];
				this.style.lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
				this.style.textAlign = style.textAlign;
				this.style.overflow = style.overflow;
				this.style.position = style.position;
				this.style.zIndex = parseInt(style.zIndex) || 0;
				this.style.whiteSpace = style.whiteSpace;
				this.style.textOverflow = style.textOverflow;
				
				this.style.minWidth = parseFloat(style.minWidth) || null;
				this.style.maxWidth = parseFloat(style.maxWidth) || null;
				this.style.minHeight = parseFloat(style.minHeight) || null;
				this.style.maxHeight = parseFloat(style.maxHeight) || null;
				
				if (style.webkitTransform === 'none') {
					this.style.transform = null;
				} else {
					var trans = style.webkitTransform.replace(/matrix\((.+)\)/, function() {
						return arguments[1];
					});
					this.style.transform = trans.split(/\s*,\s*/);
					for (var i = 0, l = this.style.transform.length; i < l; i++) {
						this.style.transform[i] = parseFloat(this.style.transform[i]);
					}
				}
				
				var display = style.display;
				if (display.indexOf('box') !== -1 || display.indexOf('flex') !== -1) {
					this.style.display = 'box';
				} else {
					this.style.display = 'block';
				}
	
				this.style.boxFlex = parseFloat(style.boxFlex) || parseFloat(style.webkitBoxFlex);
				this.style.boxOrient = style.boxOrient || style.webkitBoxOrient;
				this.style.boxAlign = style.boxAlign || style.webkitBoxAlign;
				this.style.pointerEvents = style.pointerEvents;
				this.style.borderWidth = [parseFloat(style.borderTopWidth) || 0, parseFloat(style.borderRightWidth) || 0, parseFloat(style.borderBottomWidth) || 0, parseFloat(style.borderLeftWidth) || 0];
				this.style.margin = [parseFloat(style.marginTop) || 0, parseFloat(style.marginRight) || 0, parseFloat(style.marginBottom) || 0, parseFloat(style.marginLeft) || 0];
				this.style.padding = [parseFloat(style.paddingTop) || 0, parseFloat(style.paddingRight) || 0, parseFloat(style.paddingBottom) || 0, parseFloat(style.paddingLeft) || 0];
				
				// active状态样式，从style浅复制
				Class.styleCache[cache_key] = {};
				Class.styleCache[active_key] = {};
				for (var si in this.style) {
					this.activeStyle[si] = this.style[si];
					Class.styleCache[cache_key][si] = this.style[si];
					Class.styleCache[active_key][si] = this.style[si];
				}
				if (this.activeClass) {
					div.setAttribute('class', this.className + ' ' + this.activeClass);
					this.activeStyle.backgroundColor = style.backgroundColor;
					this.activeStyle.color = style.color;
					Class.styleCache[active_key].backgroundColor = style.backgroundColor;
					Class.styleCache[active_key].color = style.color;
				}
				document.body.removeChild(div);
			}
			
			if (this.parent === this.stage && (this.height === 'auto' && (this.style.overflow === 'auto' || this.style.overflow === 'hidden'))) {
				this.height = this.stage.height - this.style.margin[0] - this.style.borderWidth[0] - this.style.padding[0] - this.style.padding[2] - this.style.borderWidth[2] - this.style.margin[2];
				if (this.style.minHeight) {
					this.height = Math.max(this.style.minHeight, this.height);
				}
				if (this.style.maxHeight) {
					this.height = Math.min(this.style.maxHeight, this.height);
				}
			}
			
			if ((this.style.overflow === 'hidden' || this.style.overflow === 'auto') && this.style.height !== 'auto') {
				this.isClip = true;
			} else {
				this.isClip = false;
			}
			
			// 计算自动宽度
			if (this.width === 'auto') {
				this.contentWidth = ((this.parent.width === 'auto') ? this.parent.contentWidth : this.parent.width) - this.style.margin[3] - this.style.borderWidth[3] - this.style.padding[3] - this.style.padding[1] - this.style.borderWidth[1] - this.style.margin[1];
				if (this.style.minWidth) {
					this.contentWidth = Math.max(this.style.minWidth, this.contentWidth);
				}
				if (this.style.maxWidth) {
					this.contentWidth = Math.min(this.style.maxWidth, this.contentWidth);
				}
			} else {
				if (this.style.minWidth) {
					this.width = Math.max(this.style.minWidth, this.width);
				}
				if (this.style.maxWidth) {
					this.width = Math.min(this.style.maxWidth, this.width);
				}
				this.contentWidth = this.width;
			}
			
			this.setRepaint();
		},
		/*
		 * 设置重绘
		 */
		setRepaint : function() {
			if (!this.stage) {
				return;
			}
			this.stage.repaint = true;
		},
		/*
		 * 当被放入场景时，重新计算盒模型尺寸
		 */
		addedToStage : function(ev) {
			this._super(ev);
			this.calculateStyle();
			if (this.style.overflow === 'auto' && this.height !== 'auto' && this.height < this.contentHeight) {
				this.hideScroll();
			}
			
			var self = this;
			this.removeEventListener('resize', this.resize);
			this.addEventListener('resize', this.resize);
		},
		resize : function() {
			if (this.autoHeight && this.parent === this.stage) {
				this.height = this.parent.height - this.style.margin[0] - this.style.borderWidth[0] - this.style.padding[0] - this.style.padding[2] - this.style.borderWidth[2] - this.style.margin[2];
				if (this.style.minHeight) {
					this.height = Math.max(this.style.minHeight, this.height);
				}
				if (this.style.maxHeight) {
					this.height = Math.min(this.style.maxHeight, this.height);
				}
			}
			if (this.autoWidth) {
				this.contentWidth = ((this.parent.width === 'auto') ? this.parent.contentWidth : this.parent.width) - this.style.margin[3] - this.style.borderWidth[3] - this.style.padding[3] - this.style.padding[1] - this.style.borderWidth[1] - this.style.margin[1];
				if (this.style.minWidth) {
					this.contentWidth = Math.max(this.style.minWidth, this.contentWidth);
				}
				if (this.style.maxWidth) {
					this.contentWidth = Math.min(this.style.maxWidth, this.contentWidth);
				}
			}
			
			if (this.style.display === 'box') {
				this.childrenChange();
			}
			
			for (var i = 0, l = this.numChildren; i < l; i++) {
				this.children[i].dispatchEvent('RESIZE');
			}
		},
		getAttribute : function(key) {
			return this[key] || null;
		},
		setAttribute : function(option, val) {
			if (typeof option === 'string' && val !== undefined) {
				this.setAttribute({
					option : val
				});
				return this;
			}
			if (typeof option !== 'object') {
				return this;
			}
			var repaint = false;
			if (option.hasOwnProperty('x') && this.x !== option.x) {
				this.x = option.x;
				repaint = true;
			}
			if (option.hasOwnProperty('y') && this.y !== option.y) {
				this.y = option.y;
				repaint = true;
			}
			if (option.hasOwnProperty('scrollTop') && this.scrollTop !== option.scrollTop) {
				this.scrollTop = option.scrollTop;
				repaint = true;
			}
			if (option.hasOwnProperty('visible') && this.visible !== option.visible) {
				this.visible = option.visible;
				repaint = true;
			}
			if (option.hasOwnProperty('width') && this.width !== option.width) {
				this.width = option.width;
				// 计算自动宽度
				if (this.width === 'auto') {
					this.autoWidth = true;
					this.contentWidth = ((this.parent.width === 'auto') ? this.parent.contentWidth : this.parent.width) - this.style.margin[3] - this.style.borderWidth[3] - this.style.padding[3] - this.style.padding[1] - this.style.borderWidth[1] - this.style.margin[1];
					if (this.style.minWidth) {
						this.contentWidth = Math.max(this.style.minWidth, this.contentWidth);
					}
					if (this.style.maxWidth) {
						this.contentWidth = Math.min(this.style.maxWidth, this.contentWidth);
					}
				} else {
					if (this.style.minWidth) {
						this.width = Math.max(this.style.minWidth, this.width);
					}
					if (this.style.maxWidth) {
						this.width = Math.min(this.style.maxWidth, this.width);
					}
					this.autoWidth = false;
					this.contentWidth = this.width;
				}
				if (this.style.display === 'box') {
					this.childrenChange();
				}
				repaint = true;
			}
			if (option.hasOwnProperty('height') && this.height !== option.height) {
				this.height = option.height;
				if (this.style.minHeight) {
					this.height = Math.max(this.style.minHeight, this.height);
				}
				if (this.style.maxHeight) {
					this.height = Math.min(this.style.maxHeight, this.height);
				}
				if (this.height === 'auto') {
					this.autoHeight = true;
				} else {
					this.autoHeight = false;
				}
				if (this.style.display === 'box') {
					this.childrenChange();
				}
				repaint = true;
			}
			if (repaint) {
				this.parent && this.parent.childrenChange && this.parent.childrenChange(this.depth);
				this.setRepaint();
			}
			
			if (option.hasOwnProperty('isActive') && this.isActive !== option.isActive) {
				this.isActive = option.isActive;
				if (this.activeClass) {
					this.setRepaint();
				}
			}
			
			if (option.hasOwnProperty('id') || option.hasOwnProperty('className') || option.hasOwnProperty('activeClass') || option.hasOwnProperty('style')) {
				if (option.hasOwnProperty('id')) {
					this.id = option.id;
				}
				if (option.hasOwnProperty('className')) {
					this.className = option.className;
				}
				if (option.hasOwnProperty('activeClass')) {
					this.activeClass = option.activeClass;
				}
				if (option.hasOwnProperty('style')) {
					if (typeof option.style === 'string') {
						var styleArr = option.style.split(';');
						for (var yi = 0, yl = styleArr.length; yi < yl; yi++) {
							var styleI = styleArr[yi].split(':');
							this.baseStyle[styleI[0]] = styleI[1];
						}
					} else if (typeof option.style === 'object') {
						for (var oi in option.style) {
							this.baseStyle[oi] = option.style[oi];
						}
					}
				}
				this.calculateStyle();
				this.setRepaint();
			}
		},
		/*
		 * 插入子元素时，手动计算
		 */
		appendChildAt : function(el, i) {
			if (!el instanceof Box) return;
			this._super(el, i);
			var baseX = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3];
			var baseY = this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0];
			if (el.style.position === 'absolute') {
				el.x += this.style.margin[3];
				el.y += this.style.margin[0];
			} else {
				el.x += baseX;
				el.y += baseY;
			}
			if (this.isClip) {
				el.clipParent = this;
			} else if (this.clipParent) {
				el.clipParent = this.clipParent;
			}
			this.zChildren.push(el);
			this.childrenChange(i);
			this.setRepaint();
		},
		/*
		 * 子元素发生变化时重新计算
		 */
		childrenChange : function(depth) {
			depth = depth || 0;
			var baseX = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3];
			var baseY = this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0];
			if (this.style.display === 'box') {
				this.contentHeight = this.height;
				if (this.style.boxOrient === 'vertical') {
					this.calculateChildSize('height', 'Height', 'width', 'Width', 'y', 'x', 3, 1, 0, 2, baseY);
				} else {
					this.calculateChildSize('width', 'Width', 'height', 'Height', 'x', 'y', 0, 2, 3, 1, baseX);
				}
			} else {
				this.contentHeight = 0;
				var prev, cur;
				for (var d = 0 ; d < this.numChildren; d++) {
					var _cur = this.children[d];
					if (_cur.style.position === 'absolute') {
						continue;
					}
					cur = _cur;
					if (d >= depth && prev) {
						var prevH = (prev.height === 'auto') ? prev.contentHeight : prev.height;
						cur.y = prev.y + prev.style.margin[0] + prev.style.borderWidth[0] + prev.style.padding[0] + prevH + prev.style.padding[2] + prev.style.borderWidth[2] + prev.style.margin[2];
					}
					prev = cur;
				}
				var curH = 0;
				if (cur) {
					curH = (cur.height === 'auto') ? cur.contentHeight : cur.height;
					this.contentHeight = cur.y + cur.style.margin[0] + cur.style.borderWidth[0] + cur.style.padding[0] + curH + cur.style.padding[2] + cur.style.borderWidth[2] + cur.style.margin[2] - baseY;
				}
			}
			this.contentHeight = Math.ceil(this.contentHeight); 
			if (this.parent && this.parent.childrenChange) {
				this.parent.childrenChange(this.depth);
			}
			
			this.zChildren.sort(function(a, b) {
				if (b.style.zIndex < a.style.zIndex) {
					return 1;
				} else {
					return -1;
				}
			});
		},
		/*
		 * display为box的对象，重新计算子元素
		 */
		calculateChildSize : function(str, Str, ostr, oStr, pos, opos, i0, i1, i2, i3, baseVal) {
			var restVal = (this[str] === 'auto') ? this['content' + Str] : this[str], restDiv = [], restMax = 0;
			var oVal = (this[ostr] === 'auto') ? this['content' + oStr] : this[ostr];
			var maxVal = 0;
			
			// 首先计算基本信息
			for (var di = 0; di < this.numChildren; di++) {
				var item = this.children[di];
				if (item.style.position !== 'absolute') {
					var iVal = (item[ostr] === 'auto') ? item['content' + oStr] : item[ostr];
					maxVal = Math.max(iVal, maxVal);
					if (item.style.boxFlex) {
						restMax += item.style.boxFlex;
						restVal = restVal - item.style.margin[i2] - item.style.borderWidth[i2] - item.style.padding[i2] - item.style.padding[i3] - item.style.borderWidth[i3] - item.style.margin[i3];
						restDiv.push(item);
					} else {
						var iVal = (item[str] === 'auto') ? item['content' + Str] : item[str];
						restVal = restVal - item.style.margin[i2] - item.style.borderWidth[i2] - item.style.padding[i2] - iVal - item.style.padding[i3] - item.style.borderWidth[i3] - item.style.margin[i3];
					}
				} else {
					restVal = restVal - item[str];
				}
			}
			
			if (restVal < 0) {
				restVal = 0;
			}
			
			// 计算有boxFlex属性的模块size
			var rl = restDiv.length, restV = restVal;
			if (rl) {
				for (var ri = 0; ri < rl; ri++) {
					var rItem = restDiv[ri], oldVal = rItem['content' + Str];
					if (ri === rl - 1) {
						if (oldVal !== restV) {
							var prop = {};
							prop[str] = prop['content' + Str] = restV;
							rItem.setAttribute(prop);
						}
					} else {
						var newVal = Math.round(restVal * rItem.style.boxFlex / restMax);
						if (oldVal !== newVal) {
							var prop = {};
							prop[str] = prop['content' + Str] = newVal;
							rItem.setAttribute(prop);
						}
						restV -= newVal;
					}
				}
			}
			
			// 重新计算偏移
			var offsetVal = baseVal;
			for (var ei = 0; ei < this.numChildren; ei++) {
				var curItem = this.children[ei];
				curItem[pos] = offsetVal;
				offsetVal += curItem.style.margin[i2] + curItem.style.borderWidth[i2] + curItem.style.padding[i2] + curItem['content' + Str] + curItem.style.padding[i3] + curItem.style.borderWidth[i3] + curItem.style.margin[i3];
			}
			
			if (maxVal) {
				this['content' + oStr] = maxVal;
				if (this.style.boxAlign === 'center' || this.style.boxAlign === 'end') {
					for (var di = 0; di < this.numChildren; di++) {
						var item = this.children[di];
						if (item.style.position !== 'absolute') {
							var iVal = (item[ostr] === 'auto') ? item['content' + oStr] : item[ostr];
							if (this.style.boxAlign === 'center') {
								item[opos] = this.style.margin[i0] + this.style.borderWidth[i0] + this.style.padding[i0] + (maxVal - iVal) / 2;
							} else {
								item[opos] = this.style.margin[i0] + this.style.borderWidth[i0] + this.style.padding[i0] + maxVal - iVal;
							}
						}
					}
				}
			}
		},
		removeChildAt : function(el, i) {
			this._super(el, i);
			this.childrenChange(i);
		},
		hitTest : function(point, x, y) {
			if (!this.stage || !this.visible) return false;
			
			var child_hit_test;
			
			var _x = x || 0, _y = y || 0;
			_x += this.x;
			_y += this.y;
			
			for (var i = this.numChildren; i--; ) {
				child_hit_test = this.zChildren[i].hitTest(point, _x, _y - this.scrollTop);
				if (child_hit_test) {
					return child_hit_test;
				}
			}
			
			if (this.style.pointerEvents === 'none') return false;
			
			var height = this.height;
			if ((!this.isClip && this.contentHeight > this.height) || this.height === 'auto') {
				height = this.contentHeight;
			}
			
			if (!this.contentWidth) {
				this.contentWidth = this.parent.width - this.style.margin[3] - this.style.borderWidth[3] - this.style.padding[3] - this.style.padding[1] - this.style.borderWidth[1] - this.style.margin[1];
			}
			var width = this.contentWidth;
			
			var in_figure = point.x >= _x + this.style.margin[3]
				&& point.y >= _y + this.style.margin[0]
				&& point.x <= _x + this.style.margin[3] + width + this.style.padding[1] + this.style.padding[3] + this.style.borderWidth[1] + this.style.borderWidth[3]
				&& point.y <= _y + this.style.margin[0] + height + this.style.padding[0] + this.style.padding[2] + this.style.borderWidth[0] + this.style.borderWidth[2];
			if (in_figure) {
				return {
					target : this
				};
			}
			
			return false;
		},
		prepareRender : function(x, y, alpha) {
			if (!this.stage || !this.visible) return false;
			
			x += this.x;
			y += this.y;
			alpha *= this.alpha;
			
			var height = (this.height === 'auto') ? this.contentHeight : this.height;
			if (!this.contentWidth) {
				this.contentWidth = this.parent.width - this.style.margin[3] - this.style.borderWidth[3] - this.style.padding[3] - this.style.padding[1] - this.style.borderWidth[1] - this.style.margin[1];
			}
			var width = this.contentWidth;

			// 判断是否可展示，不可展示则不进行实际渲染
			if (alpha <= 0 || x > this.stage.width || y > this.stage.height || x + width < 0 || y + height < 0) {
			} else {
				
				this.stage.ctx.save();
				this.stage.ctx.globalAlpha = alpha;
				
				this.stage.ctx.translate(x, y);
				if (this.style.transform) {
					/* TODO transform Origin */
					// 变形之前，首先平移一半的位置
					this.stage.ctx.translate(width / 2, height / 2);
					this.stage.ctx.transform.apply(this.stage.ctx, this.style.transform);
					// 变形之后，平移回一半，使变形中心对应在中心点（可能未必有用）
					this.stage.ctx.translate(-width / 2, -height / 2);
				}
			
				this.render();
			
				this.stage.ctx.restore();
			}

			if (this.isClip) {
				// 保持合理的scrollTop
				if (height >= this.contentHeight) {
					this.scrollTop = 0;
				} else {
					this.scrollTop = Math.min(Math.max(0, this.scrollTop), this.contentHeight - height);
				}
				var baseX = x + this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3], baseY = y + this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0], scrollTop = Math.round(this.scrollTop);
				this.stage.ctx.save();
				this.stage.ctx.rect(baseX, baseY, width, height);
				this.stage.ctx.clip();
				for (var i = 0, l = this.numChildren; i < l; i++) {
					this.zChildren[i].prepareRender(baseX, baseY - scrollTop, 1);
				}
				this.stage.ctx.restore();
				if (this.style.overflow === 'auto' && this.height !== 'auto') {
					this.drawScroll(x, y, alpha);
				}
			} else {
				for (var i = 0, l = this.numChildren; i < l; i++) {
					this.zChildren[i].prepareRender(x, y, alpha);
				}
			}
		},
		hideScroll : function() {
			var self = this;
			this.scroll_anime = SimpleAnime({
				delay : 500,
				duration : 300,
				progress : function(ae) {
					if (self.stage) {
						self.scrollAlpha = 1 - ae.ease;
						self.setRepaint();
					} else {
						self.scroll_anime.destroy();
					}
				}
			});
		},
		drawScroll : function(x, y, alpha) {
			if (this.height === 'auto' || this.height >= this.contentHeight) {
				return false;
			}
			var width = this.contentWidth;
			this.stage.ctx.fillStyle = 'rgba(0,0,0,' + 0.3 * this.scrollAlpha + ')';
			this.stage.ctx.lineWidth = 2;
			var scrollWidth = 5, scrollHeight = Math.round(this.height * this.height / this.contentHeight);
			var scrollTop = Math.round(this.scrollTop * (this.height - scrollHeight) / (this.contentHeight - this.height));
			var scrollX = (x + width + this.style.padding[1] + this.style.borderWidth[1] - 6), scrollY = (y + scrollTop + this.style.borderWidth[0]);
			this.stage.ctx.fillRect(scrollX, scrollY, scrollWidth, scrollHeight);
		},
		render : function() {
			var getStyle = this.isActive ? this.activeStyle : this.style;
			var height = (this.height === 'auto') ? this.contentHeight : this.height;
			var width = this.contentWidth;
			
			this.stage.ctx.fillStyle = getStyle.backgroundColor;
			this.stage.ctx.fillRect(this.style.margin[3] + this.style.borderWidth[3], this.style.margin[0] + this.style.borderWidth[0], this.style.padding[3] + width + this.style.padding[1], this.style.padding[0] + height + this.style.padding[2]);
			
			/* if (getStyle.linearGradient) {
				var linear_gradient, direction = getStyle.linearGradient.direction;
				var x0 = this.style.margin[3] + this.style.borderWidth[3], x1 = this.style.padding[3] + this.width + this.style.padding[1];
				var y0 = this.style.margin[0] + this.style.borderWidth[0], y1 = this.style.padding[0] + this.height + this.style.padding[2];
				if (direction === 'horizontal') {
					linear_gradient = this.stage.ctx.createLinearGradient(x0, y0, (x0 + x1), y0);
				} else {
					linear_gradient = this.stage.ctx.createLinearGradient(x0, y0, x0, (y0 + y1));
				}
				var colors = getStyle.linearGradient.colors;
				for (var fi = 0, fl = colors.length; fi < fl; fi++) {
					linear_gradient.addColorStop(colors[fi].pos, colors[fi].color);
				}
				this.stage.ctx.fillStyle = linear_gradient;
				this.stage.ctx.fillRect((this.style.margin[3] + this.style.borderWidth[3]), (this.style.margin[0] + this.style.borderWidth[0]), (this.width + this.style.padding[1] + this.style.padding[3]), (this.height + this.style.padding[0] + this.style.padding[2]));
			} */
			
			if (this.style.borderWidth[0]) {
				this.stage.ctx.fillStyle = getStyle.borderColor[0];
				this.stage.ctx.fillRect(this.style.margin[3], this.style.margin[0], this.style.borderWidth[3] + this.style.padding[3] + width + this.style.padding[1] + this.style.borderWidth[1], this.style.borderWidth[0]);
			}
			if (this.style.borderWidth[1]) {
				this.stage.ctx.fillStyle = getStyle.borderColor[1];
				this.stage.ctx.fillRect(this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3] + width + this.style.padding[1], this.style.margin[0], this.style.borderWidth[1], this.style.borderWidth[0] + this.style.padding[0] + height + this.style.padding[2] + this.style.borderWidth[2]);
			}
			if (this.style.borderWidth[2]) {
				this.stage.ctx.fillStyle = getStyle.borderColor[2];
				this.stage.ctx.fillRect(this.style.margin[3], this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0] + height + this.style.padding[2], this.style.borderWidth[3] + this.style.padding[3] + width + this.style.padding[1] + this.style.borderWidth[1], this.style.borderWidth[2]);
			}
			if (this.style.borderWidth[3]) {
				this.stage.ctx.fillStyle = getStyle.borderColor[3];
				this.stage.ctx.fillRect(this.style.margin[3], this.style.margin[0], this.style.borderWidth[3], this.style.borderWidth[0] + this.style.padding[0] + height + this.style.padding[2] + this.style.borderWidth[2]);
			}
			
			if (this.extraRender) {
				this.extraRender();
			}
		},
		getOffset : function() {
			var offset = {
				x : 0,
				y : 0,
				alpha : 1
			};
			if (this.stage && this.parent && this.parent !== this.stage) {
				var  parent = this.parent;
				while (parent !== this.stage) {
					offset.x += parent.x;
					offset.y += parent.y;
					offset.alpha *= parent.alpha;
					parent = parent.parent;
				}
			}
			return offset;
		}
	});
	Class.dom.Box = Box;
	return Box;
});

/*
 * 文本渲染
 */
define('class_dom_textContent', ['class_dom_box'], function(Box) {
	/*
	 * 文本格式化，将输入字符串的第一组换行不截断字符提取出来并返回结果
	 * @param str {String} 输入字符串
	 * @return result {Array} 返回数组，0为不截断字符之前的内容，1为不截断字符串，2为不截断字符之后的内容
	 */
	var nowrapReg = /([\x00-\xff]{2,}|[“‘《｛【（{\(\[]+[\u4e00-\u9fa5][，。、”’》｝】）}\]\)？！…—]*|[“‘《｛【（{\(\[]*[\u4e00-\u9fa5][，。、”’》｝】）}\]\)？！…—]+)/;
	var getNowrapText = function(str) {
		var result = [];
		var nowrap_pos = str.search(nowrapReg);
		if (nowrap_pos >= 0) {
			result.push(str.substr(0, nowrap_pos));
			var nowrap_str = RegExp.$1;
			result.push(nowrap_str);
			result.push(str.substr(nowrap_pos + nowrap_str.length));
		} else {
			result.push(str);
		}
		return result;
	},
	easeCopy = function(obj) {
		var newObj = {};
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				newObj[i] = obj[i];
			}
		}
		return newObj;
	};
	
	var TextContent = Box.extend({
		init : function(option) {
			this._super(option);
			var activeLink = null, htmlText = '', text = null;
			Object.defineProperties(this, {
				activeLink : {
					get : function() {
						return activeLink;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							activeLink = val;
						}
					}
				},
				htmlText : {
					get : function() {
						return htmlText;
					},
					set : function(val) {
						if (typeof val === 'string') {
							htmlText = val;
						}
					}
				},
				text : {
					get : function() {
						return text;
					},
					set : function(val) {
						if (Array.isArray(val) || val === null) {
							text = val;
						}
					}
				}
			});
			this.htmlText = option.text;
		},
		addedToStage : function(ev) {
			this._super(ev);
			if (this.htmlText) {
				this.setText(this.htmlText);
			}
		},
		setText : function(htmlText) {
			this.htmlText = htmlText;
			if (this.stage) {
				this.text = this.formatText(htmlText);
				this.parent.childrenChange && this.parent.childrenChange(this.depth);
			}
		},
		setAttribute : function(option) {
			this._super(option);
			this.setText(this.htmlText);
		},
		resize : function() {
			this._super();
			this.setText(this.htmlText);
		},
		// 格式化文本 TODO：不能折行文本的跨标签判断，TODO：图文混排
		formatText : function(htmlText) {
			var result = [[]], self = this;
			var div = document.createElement(this.tagName);
			div.setAttribute('id', this.id);
			div.setAttribute('class', this.className);
			for (var yi in this.baseStyle) {
				div.style[yi] = this.baseStyle[yi];
			}
			div.innerHTML = htmlText;
			document.body.appendChild(div);
			
			var line_id = 0, line_width = 0, subitem = '', full_width, new_item, char_at, char_code, char_width, textObj;
			var tmp = document.createElement('canvas'), tmp_ctx = tmp.getContext('2d');
			
			var formatTextLine = function(str, styleObj) {
				new_item = getNowrapText(str);
				
				var str_width = 0;
				for (var ti = 0, tl = new_item[0].length; ti < tl; ti++) {
					char_code = new_item[0].charCodeAt(ti);
					char_at = new_item[0].charAt(ti);
					char_width = (char_code > 255) ? full_width : tmp_ctx.measureText(char_at).width;
					if (line_width + char_width <= self.contentWidth || !line_width) {
						subitem += char_at;
						line_width += char_width;
					} else {
						if (subitem) {
							textObj = easeCopy(styleObj);
							textObj.text = subitem;
							textObj.width = tmp_ctx.measureText(subitem).width;
							result[line_id].push(textObj);
						}
						line_width = char_width;
						if (self.style.whiteSpace === 'nowrap') {
							if (self.style.textOverflow === 'ellipsis') {
								var sub = textObj.text.substr(-1);
								if (sub.charCodeAt(0) > 255) {
									textObj.text = textObj.text.substr(0, textObj.text.length - 1);
								} else {
									textObj.text = textObj.text.substr(0, textObj.text.length - 2);
								}
								textObj.text += '…';
							}
							subitem = '';
							new_item[1] = null;
							break;
						} else {
							result[++line_id] = [];
							subitem = char_at;
						}
					}
				}
				
				if (new_item[1]) {
					char_at = new_item[1];
					char_width = tmp_ctx.measureText(char_at).width;
					if (line_width + char_width <= self.contentWidth || !line_width) {
						subitem += char_at;
						line_width += char_width;
					} else {
						textObj = easeCopy(styleObj);
						textObj.text = subitem;
						textObj.width = tmp_ctx.measureText(subitem).width;
						result[line_id].push(textObj);
						
						if (self.style.whiteSpace === 'nowrap') {
							if (self.style.textOverflow === 'ellipsis') {
								var sub = textObj.text.substr(-1);
								if (sub.charCodeAt(0) > 255) {
									textObj.text = textObj.text.substr(0, textObj.text.length - 1);
								} else {
									textObj.text = textObj.text.substr(0, textObj.text.length - 2);
								}
								textObj.text += '…';
							}
							new_item[2] = null;
						} else {
							result[++line_id] = [];
							
							textObj = easeCopy(styleObj);
							textObj.text = char_at;
							textObj.width = Math.ceil(char_width);
							result[line_id].push(textObj);
						}
						
						subitem = '';
						line_width = char_width;
					}
					
					if (new_item[2]) {
						formatTextLine(new_item[2], styleObj);
					}
				}
				
				if (subitem) {
					textObj = easeCopy(styleObj);
					textObj.text = subitem;
					textObj.width = tmp_ctx.measureText(subitem).width;
					result[line_id].push(textObj);
					subitem = '';
				}
			};
			
			var link_id = 0;
			var nodeTraversal = function(node, link) {
				for (var ci = 0, cl = node.childNodes.length; ci < cl; ci++) {
					var item = node.childNodes[ci];
					if (item.nodeType === 3) {
						var nodeStyle = getComputedStyle(node);
						tmp_ctx.font = nodeStyle.fontStyle + ' ' + nodeStyle.fontWeight + ' ' + nodeStyle.fontSize + ' ' + nodeStyle.fontFamily;
						full_width = tmp_ctx.measureText('一').width;
						
						formatTextLine(item.textContent, {
							color : nodeStyle.color,
							fontFamily : nodeStyle.fontFamily,
							fontSize : parseFloat(nodeStyle.fontSize),
							fontStyle : nodeStyle.fontStyle,
							fontWeight : nodeStyle.fontWeight,
							link : link
						});
					} else if (item.nodeType === 1) {
						if (!link && item.nodeName === 'A') {
							nodeTraversal(item, {
								href : item.getAttribute('href'),
								target : item.getAttribute('target'),
								id : link_id++,
								text : item.textContent,
								html : item.innerHTML
							});
						} else {
							nodeTraversal(item, link);
						}
					}
				}
			};
			nodeTraversal(div);
			
			document.body.removeChild(div);
			this.contentHeight = this.height = Math.round(result.length * this.style.lineHeight);
			return result;
		},
		hitTest : function(point, x, y) {
			var result = this._super(point, x, y);
			var width = this.contentWidth;
			this.activeLink = null;
			if (result) {
				var text_start = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3], text_top = this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0];
				if (this.style.textAlign === 'center') {
					text_start += Math.round(width / 2);
				} else if (this.style.textAlign === 'right') {
					text_start += width;
				}
				line_for : for (var li = 0, ll = this.text.length; li < ll; li++) {
					var line_start = text_start;
					if (this.style.textAlign === 'center') {
						var line_width = 0;
						for (var wi = 0, wl = this.text[li].length; wi < wl; wi++) {
							line_width += this.text[li][wi].width;
						}
						line_start -= line_width / 2;
					} else if (this.style.textAlign === 'right') {
						var line_width = 0;
						for (var wi = 1, wl = this.text[li].length; wi < wl; wi++) {
							line_width += this.text[li][wi].width;
						}
						line_start -= line_width;
					}
					for (var ti = 0, tl = this.text[li].length; ti < tl; ti++) {
						var text_item = this.text[li][ti], extra_width = 0;
						if (this.style.textAlign === 'right' && ti > 0) {
							line_start += text_item.width;
							extra_width = -(text_item.width);
						} else if (this.style.textAlign === 'center') {
							line_start += Math.round(text_item.width / 2);
							extra_width = -(text_item.width / 2);
						}
						if (text_item.link) {
							var hit_test = point.x >= x + this.x + line_start + extra_width
								&& point.x <= x + this.x + line_start + text_item.width + extra_width
								&& point.y >= y + this.y + text_top + li * this.style.lineHeight
								&& point.y <= y + this.y + text_top + (li + 1) * this.style.lineHeight;
								
							if (hit_test) {
								result.link = text_item.link;
								this.activeLink = result.link.id;
								break line_for;
							};
						}
						if (this.style.textAlign !== 'center' && this.style.textAlign !== 'right') {
							line_start += text_item.width;
						} else if (this.style.textAlign === 'center') {
							line_start += Math.round(text_item.width / 2);
						}
					}
				}
			}
			return result;
		},
		// 渲染文字和行距时要乘2
		render : function() {
			this._super();
			var width = this.contentWidth;
			this.stage.ctx.textAlign = this.style.textAlign;
			// var getStyle = this.isActive ? this.activeResult : this;
			var text_start = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3], text_top = this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0];
			if (this.style.textAlign === 'center') {
				text_start += Math.round(width / 2);
			} else if (this.style.textAlign === 'right') {
				text_start += width;
			}
			this.stage.ctx.textBaseline = 'middle';
			if (this.text && this.text.length) {
				for (var li = 0, ll = this.text.length; li < ll; li++) {
					var line_start = text_start;
					if (this.style.textAlign === 'center') {
						var line_width = 0;
						for (var wi = 0, wl = this.text[li].length; wi < wl; wi++) {
							line_width += this.text[li][wi].width;
						}
						line_start -= line_width / 2;
					} else if (this.style.textAlign === 'right') {
						var line_width = 0;
						for (var wi = 1, wl = this.text[li].length; wi < wl; wi++) {
							line_width += this.text[li][wi].width;
						}
						line_start -= line_width;
					}
					for (var ti = 0, tl = this.text[li].length; ti < tl; ti++) {
						var text_item = this.text[li][ti];
						if (this.style.textAlign === 'right' && ti > 0) {
							line_start += text_item.width;
						} else if (this.style.textAlign === 'center') {
							line_start += Math.round(text_item.width / 2);
						}
						var fillStyle = text_item.color;
						if (text_item.link && this.isActive && this.activeLink === text_item.link.id) {
							fillStyle = this.activeStyle.color;
						}
						this.stage.ctx.fillStyle = fillStyle;
						this.stage.ctx.font = text_item.fontStyle + ' ' + text_item.fontWeight + ' ' + text_item.fontSize + 'px ' + text_item.fontFamily;
						this.stage.ctx.fillText(text_item.text, line_start, Math.round(text_top + (li + 0.5) * this.style.lineHeight));
						
						if (this.style.textAlign !== 'center' && this.style.textAlign !== 'right') {
							line_start += text_item.width;
						} else if (this.style.textAlign === 'center') {
							line_start += Math.round(text_item.width / 2);
						}
					}
				}
			}
		}
	});
	Class.dom.TextContent = TextContent;
});

/*
 * DOM图形
 */
define('class_dom_image', ['class_dom_box'], function(Box) {
	var DomImage = Box.extend({
		init : function(option) {
			this._super(option);
			var src = option.src;
			var clipX = 0, clipY = 0, clipWidth = 0, clipHeight = 0;
			Object.defineProperties(this, {
				src : {
					get : function() {
						return src;
					},
					set : function(val) {
						if (typeof val === 'string') {
							src = val;
						}
					}
				},
				clipX : {
					get : function() {
						return clipX;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							clipX = val;
						}
					}
				},
				clipY : {
					get : function() {
						return clipY;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							clipY = val;
						}
					}
				},
				clipWidth : {
					get : function() {
						return clipWidth;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							clipWidth = val;
						}
					}
				},
				clipHeight : {
					get : function() {
						return clipHeight;
					},
					set : function(val) {
						val = parseInt(val);
						if (!isNaN(val)) {
							clipHeight = val;
						}
					}
				}
			});
			this.clipX = option.clipX;
			this.clipY = option.clipY;
			this.clipWidth = option.clipWidth;
			this.clipHeight = option.clipHeight;
		},
		loadImage : function(src) {
			this.src = src;
			if (!Class.imageCache[src]) {
				Class.imageCache[src] = new Image();
				var self = this;
				Class.imageCache[src].onload = function() {
					if (!this.src || !self.stage) return;
					if (self.height === 'auto' || self.width === 'auto') {
						if (self.height !== 'auto') {
							self.width = Math.round(self.height * this.width / this.height);
						} else if (self.width !== 'auto') {
							self.height = Math.round(self.width * this.height / this.width);
						} else {
							self.width = this.width;
							self.height = this.height;
						}
						self.contentWidth = self.width;
						self.contentHeight = self.height;
						if (self.stage) {
							var parentW = (self.parent.width === 'auto') ? self.parent.contentWidth : self.parent.width;
							var lx = self.style.margin[3] + self.style.borderWidth[3] + self.style.padding[3], rx = self.style.padding[1] + self.style.borderWidth[1] + self.style.margin[1];
							if (self.parent.style.textAlign === 'center') {
								self.x = Math.round((parentW - self.width - lx - rx) / 2) + lx;
							} else if (self.parent.style.textAlign === 'right') {
								self.x = parentW - self.width - rx;
							}
							self.parent.childrenChange && self.parent.childrenChange(self.depth);
						}
					}
					self.setRepaint();
					if (self.EvCache.load && self.EvCache.load.length) {
						self.dispatchEvent('LOAD');
					}
				};
				Class.imageCache[src].onerror = function() {
					if (self.EvCache.error && self.EvCache.error.length) {
						self.dispatchEvent('ERROR');
					}
				};
				Class.imageCache[src].src = src;
			}
		},
		addedToStage : function(ev) {
			this._super(ev);
			if (this.width) {
				var parentW = (this.parent.width === 'auto') ? this.parent.contentWidth : this.parent.width;
				var lx = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3], rx = this.style.padding[1] + this.style.borderWidth[1] + this.style.margin[1];
				if (this.parent.style.textAlign === 'center') {
					this.x = Math.round((parentW - this.width - lx - rx) / 2);
				} else if (this.parent.style.textAlign === 'right') {
					this.x += parentW - this.width - rx - lx;
				}
			}
			
			if (this.src) {
				this.loadImage(this.src);
			}
		},
		resize : function() {
			if (this.width) {
				var parentW = (this.parent.width === 'auto') ? this.parent.contentWidth : this.parent.width;
				var lx = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3], rx = this.style.padding[1] + this.style.borderWidth[1] + this.style.margin[1];
				if (this.parent.style.textAlign === 'center') {
					this.x = Math.round((parentW - this.width - lx - rx) / 2);
				} else if (this.parent.style.textAlign === 'right') {
					this.x += parentW - this.width - rx - lx;
				}
			}
		},
		render : function() {
			this._super();
			if (!this.src || !Class.imageCache[this.src]) return;
			var ix = this.style.margin[3] + this.style.borderWidth[3] + this.style.padding[3], iy = this.style.margin[0] + this.style.borderWidth[0] + this.style.padding[0];
			if (this.clipWidth && this.clipHeight) {
				this.stage.ctx.drawImage(Class.imageCache[this.src], this.clipX, this.clipY, this.clipWidth, this.clipHeight, ix, iy, this.width, this.height);
			} else {
				this.stage.ctx.drawImage(Class.imageCache[this.src], ix, iy, this.width, this.height);
			}
		}
	});
	Class.dom.Image = DomImage;
	return DomImage;
});

define('canvas_render', function() {
	//var isIos = /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(window.navigator.userAgent);
	var GLOBAL_SCALE = 2;
	
	var CanvasRender = Class.display.Stage.extend({
		init : function(option) {
			var canvas = option.canvas, width = option.width || 0, height = option.height || 0, noResize = option.noResize || false, noTouchMove = option.noTouchMove || false;
			if (!canvas || !canvas.tagName || canvas.tagName !== 'CANVAS') {
				throw('请传入canvas对象！');
			}
			this._super(option);
			this.ctx = canvas.getContext('2d');
			
			var autoWidth = !width, autoHeight = !height;
			
			Object.defineProperty(this, 'canvas', {
				value : canvas
			});
			
			var self = this;
			var documentElement = document.documentElement;
			var width = width || documentElement.clientWidth;
			var height = height || documentElement.clientHeight;
			
			this.ratioX =  this.ratioY = GLOBAL_SCALE;
			this.width = width;
			this.height = height;
			
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			canvas.setAttribute('width', width * GLOBAL_SCALE);
			canvas.setAttribute('height', height * GLOBAL_SCALE);
			
			var now = +new Date, fps = 0, len = 0;
			this.paintFn = option.debug ? function() {
				var repaint = self.repaint;
				self.paint();
				var _now = +new Date;
				if (repaint) {
					var _fps = Math.floor(1000 / (_now - now));
					fps += _fps, len++;
					var _average = Math.round(fps / len);
					self.ctx.fillStyle = '#000';
					self.ctx.font = '24px 微软雅黑';
					self.ctx.fillText('FPS : ' + Math.floor(1000 / (_now - now)) + ' / ' + _average, 10, 30);
				}
				now = _now;
			} : function() {
				self.paint();
			};
			SimpleAnime.listen(this.paintFn);
			
			var touchCache = {
				target : null,
				moved : false,
				timeout : false,
				link : null
			}, touchTimer;
			this.wrapTouchStart = function(ev) {
				if (touchCache.target) return false;
				var _touch = ev.changedTouches[0], _x = _touch.pageX, _y = _touch.pageY;
				var eventTarget = self.hitTest(new Class.geom.Point(_x, _y));
				var touchStartEv = new Class.utils.Event('TOUCHSTART');
				touchStartEv.x = _x;
				touchStartEv.y = _y;
				touchStartEv.pageX = _touch.pageX;
				touchStartEv.pageY = _touch.pageY;
				touchStartEv.bubble = true;
				touchStartEv.target = eventTarget.target;
				eventTarget.target.dispatchEvent(touchStartEv);
				eventTarget.target.setAttribute({
					isActive : true
				});
				
				touchCache.target = eventTarget.target;
				touchCache.link = eventTarget.link;
				touchCache.moved = false;
				touchCache.timeout = false;
				
				touchTimer && touchTimer.destroy();
				touchTimer = SimpleAnime({
					duration : 500,
					after : function() {
						touchCache.timeout = true;
					}
				});
			};
			this.wrapTouchMove = function(ev) {
				if (!touchCache.target) {
					return false;
				}
				
				var _touch = ev.changedTouches[0], _x = _touch.pageX, _y = _touch.pageY;
				
				touchCache.moved = true;
				if (touchCache.target.isActive) {
					touchCache.target.setAttribute({
						isActive : false
					});
				}
				
				if (!noTouchMove) {
					ev.preventDefault();
					var touchMoveEv = new Class.utils.Event('TOUCHMOVE');
					touchMoveEv.x = _x;
					touchMoveEv.y = _y;
					touchMoveEv.pageX = _touch.pageX;
					touchMoveEv.pageY = _touch.pageY;
					touchMoveEv.bubble = true;
					touchCache.target.dispatchEvent(touchMoveEv);
				}
			};
			this.wrapTouchEnd = function(ev) {
				if (!touchCache.target) {
					return false;
				}
				ev.preventDefault();
				
				var _touch = ev.changedTouches[0], _x = _touch.pageX, _y = _touch.pageY;
				
				touchTimer.destroy();
				touchTimer = null;
				
				var touchEndEv = new Class.utils.Event('TOUCHEND');
				touchEndEv.x = _x;
				touchEndEv.y = _y;
				touchEndEv.pageX = _touch.pageX;
				touchEndEv.pageY = _touch.pageY;
				touchEndEv.bubble = true;
				touchEndEv.target = touchCache.target;
				touchCache.target.dispatchEvent(touchEndEv);
				
				if (!touchCache.moved && !touchCache.timeout) {
					var tapEv = new Class.utils.Event('TAP');
					tapEv.x = _x;
					tapEv.y = _y;
					tapEv.bubble = true;
					tapEv.target = touchCache.target;
					touchCache.target.dispatchEvent(tapEv);
					
					if (touchCache.link) {
						var linkEv = new Class.utils.Event('LINK');
						linkEv.x = _x;
						linkEv.y = _y;
						linkEv.bubble = true;
						linkEv.target = touchCache.target;
						linkEv.link = touchCache.link;
						
						if (touchCache.target.dispatchEvent(linkEv) !== false) {
							var a = document.createElement('a');
							a.setAttribute('href', touchCache.link.href);
							if (touchCache.link.target) {
								a.setAttribute('target', touchCache.link.target);
							}
							a.click();
						}
					}
				}
				
				if (touchCache.target.stage && touchCache.target.isActive) {
					touchCache.target.setAttribute({
						isActive : false
					});
				}
				
				touchCache.target = null;
				touchCache.moved = false;
				touchCache.timeout = false;
				touchCache.link = null;
			};
			
			canvas.addEventListener('touchstart', this.wrapTouchStart);
			canvas.addEventListener('touchmove', this.wrapTouchMove);
			canvas.addEventListener('touchend', this.wrapTouchEnd);
			canvas.addEventListener('touchcancel', this.wrapTouchEnd);
			/* canvas.addEventListener('mousewheel', function(ev) {
				var _x = ev.pageX * self.scaleX, _y = ev.pageY * self.scaleY;
				var eventTarget = stage.hitTest(new Class.geom.Point(_x, _y));
				
				var mouseWheelEv = new Class.utils.Event('MOUSEWHEEL');
				mouseWheelEv.delta = ev.wheelDeltaY;
				mouseWheelEv.bubble = true;
				mouseWheelEv.target = eventTarget.target;
				eventTarget.dispatchEvent(mouseWheelEv);
			}); */
			
			if (!noResize) {
				this.resizeFunc = function() {
					var size = {};
					if (autoWidth || autoHeight) {
						if (!autoWidth) {
							size.width = parseFloat(canvas.style.width);
						}
						if (!autoHeight) {
							size.height = parseFloat(canvas.style.height);
						}
						self.resize(size);
					}
				};
				window.addEventListener('resize', this.resizeFunc);
			}
		},
		resize : function(option) {
			var documentElement = document.documentElement;
			var width = option.width || documentElement.clientWidth;
			var height = option.height || documentElement.clientHeight;
			documentElement.scrollTop = document.body.scrollTop = 0;
			
			this.width = width;
			this.height = height;
						
			this.canvas.style.width = width + 'px';
			this.canvas.style.height = height + 'px';
			this.canvas.setAttribute('width', width * GLOBAL_SCALE);
			this.canvas.setAttribute('height', height * GLOBAL_SCALE);
			
			for (var i = 0, l = this.numChildren; i < l; i++) {
				this.children[i].dispatchEvent('RESIZE');
			}
			this.repaint = true;
		},
		paint : function() {
			if (this.repaint) {
				this.ctx.clearRect(0, 0, this.canvas.getAttribute('width'), this.canvas.getAttribute('height'));
				this.prepareRender(0, 0, 1);
				this.repaint = false;
			}
		},
		paint : function() {
			if (this.repaint) {
				this.ctx.clearRect(0, 0, this.canvas.getAttribute('width'), this.canvas.getAttribute('height'));
				this.prepareRender(0, 0, 1);
				this.repaint = false;
			}
		},
		destroy : function() {
			this.canvas.removeEventListener('touchstart', this.wrapTouchStart);
			this.canvas.removeEventListener('touchmove', this.wrapTouchMove);
			this.canvas.removeEventListener('touchend', this.wrapTouchEnd);
			this.canvas.removeEventListener('touchcancel', this.wrapTouchEnd);
			window.removeEventListener('resize', this.resizeFunc);
			SimpleAnime.unlisten(this.paintFn);
			
			this.remove();
			this.stage = this.canvas = this.ctx = null;
		}
	});
	
	window.CanvasRender = CanvasRender;
	return CanvasRender;
});
