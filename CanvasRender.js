(function(window) {
	var CanvasRender = Class.extend({
		init : function(canvas, width, height) {
			if (!canvas || !canvas.tagName || canvas.tagName !== 'CANVAS') {
				throw('请传入canvas对象！');
			}
			this.canvas = canvas;
			var ctx = canvas.getContext('2d');
			this.ctx = ctx;
			this.autoWidth = !width;
			this.autoHeight = !height;
			
			var self = this;
			var documentElement = document.documentElement;
			var width = width || documentElement.clientWidth;
			var height = height || documentElement.clientHeight;
			
			this.scaleX = window.screen.availWidth / documentElement.clientWidth;
			this.scaleY = window.screen.availHeight / documentElement.clientHeight;
			this.ratioX = 2 / this.scaleX;
			this.ratioY = 2 / this.scaleY;
			
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			canvas.setAttribute('width', width * 2);
			canvas.setAttribute('height', height * 2);
			
			var stage = new Class.display.Stage({
				ctx : ctx,
				ratioX : this.ratioX / 2,
				ratioY : this.ratioY / 2,
				width : width * this.scaleX * 2,
				height : height * this.scaleY * 2
			});
			this.stage = stage;
			
			SimpleAnime.listen(function() {
				ctx.clearRect(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
				stage.realRender(0, 0, 1);
			});
			
			var touchCache = {
				target : null,
				moved : false,
				timeout : false
			}, touchTimer;
			this.wrapTouchStart = function(ev) {
				if (touchCache.target) return false;
				var _touch = ev.changedTouches[0], _x = _touch.pageX * 2 * self.scaleX, _y = _touch.pageY * 2 * self.scaleY;
				var eventTarget = stage.hitTest(new Class.geom.Point(_x, _y));
				var touchStartEv = new Class.utils.Event('TOUCHSTART');
				touchStartEv.x = _x;
				touchStartEv.y = _y;
				touchStartEv.bubble = true;
				touchStartEv.target = eventTarget;
				eventTarget.dispatchEvent(touchStartEv);
				eventTarget.isActive = true;
				
				touchCache.target = eventTarget;
				
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
				
				var _touch = ev.changedTouches[0], _x = _touch.pageX * 2 * self.scaleX, _y = _touch.pageY * 2 * self.scaleY;
				ev.preventDefault();
				
				touchCache.moved = true;
				
				var touchMoveEv = new Class.utils.Event('TOUCHMOVE');
				touchMoveEv.x = _x;
				touchMoveEv.y = _y;
				touchMoveEv.bubble = true;
				touchCache.target.dispatchEvent(touchMoveEv);
			};
			this.wrapTouchEnd = function(ev) {
				if (!touchCache.target) {
					return false;
				}
				
				var _touch = ev.changedTouches[0], _x = _touch.pageX * 2 * self.scaleX, _y = _touch.pageY * 2 * self.scaleY;
				ev.preventDefault();
				
				touchTimer.destroy();
				touchTimer = null;
				
				var touchEndEv = new Class.utils.Event('TOUCHEND');
				touchEndEv.x = _x;
				touchEndEv.y = _y;
				touchEndEv.bubble = true;
				touchEndEv.target = touchCache.target;
				touchCache.target.dispatchEvent(touchEndEv);
				touchCache.target.isActive = false;
				
				if (!touchCache.moved && !touchCache.timeout) {
					var tapEv = new Class.utils.Event('TAP');
					tapEv.x = _x;
					tapEv.y = _y;
					tapEv.bubble = true;
					tapEv.target = touchCache.target;
					touchCache.target.dispatchEvent(tapEv);
				}
				
				touchCache.target = null;
				touchCache.moved = false;
				touchCache.timeout = false;
			};
			
			canvas.addEventListener('touchstart', this.wrapTouchStart);
			canvas.addEventListener('touchmove', this.wrapTouchMove);
			canvas.addEventListener('touchend', this.wrapTouchEnd);
			canvas.addEventListener('touchcancel', this.wrapTouchEnd);
			canvas.addEventListener('mousewheel', function(ev) {
				var _x = ev.pageX * 2 * self.scaleX, _y = ev.pageY * 2 * self.scaleY;
				var eventTarget = stage.hitTest(new Class.geom.Point(_x, _y));
				
				var mouseWheelEv = new Class.utils.Event('MOUSEWHEEL');
				mouseWheelEv.delta = ev.wheelDeltaY;
				mouseWheelEv.bubble = true;
				mouseWheelEv.target = eventTarget;
				eventTarget.dispatchEvent(mouseWheelEv);
			});
			
			window.addEventListener('resize', function() {
				var size = {};
				if (self.autoWidth || self.autoHeight) {
					if (!self.autoWidth) {
						size.width = parseFloat(canvas.style.width);
					}
					if (!self.autoHeight) {
						size.height = parseFloat(canvas.style.height);
					}
					self.resize(size);
				}
			});
		},
		resize : function(option) {
			var documentElement = document.documentElement;
			var width = option.width || documentElement.clientWidth;
			var height = option.height || documentElement.clientHeight;
			
			this.scaleX = window.screen.availWidth / documentElement.clientWidth;
			this.scaleY = window.screen.availHeight / documentElement.clientHeight;
			this.ratioX = 2 / this.scaleX;
			this.ratioY = 2 / this.scaleY;
						
			this.canvas.style.width = width + 'px';
			this.canvas.style.height = height + 'px';
			this.canvas.setAttribute('width', width * 2);
			this.canvas.setAttribute('height', height * 2);
			
			this.stage.dispatchEvent('RESIZE', {
				ratioX : this.ratioX / 2,
				ratioY : this.ratioY / 2,
				width : width * this.scaleX * 2,
				height : height * this.scaleY * 2
			});
		},
		destroy : function() {
			this.canvas.removeEventListener('touchstart', this.wrapTouchStart);
			this.canvas.removeEventListener('touchmove', this.wrapTouchMove);
			this.canvas.removeEventListener('touchend', this.wrapTouchEnd);
			this.canvas.removeEventListener('touchcancel', this.wrapTouchEnd);
			SimpleAnime.unlisten('function(){stage.realRender(0, 0, 1);}');
			
			this.stage.remove();
			this.stage = this.canvas = this.ctx = null;
		}
	});
	CanvasRender.getBase64 = function(img) {
		var tmp = document.createElement("canvas");
		tmp.width = img.width;
		tmp.height = img.height;

		var tmpctx = tmp.getContext("2d");
		tmpctx.drawImage(img, 0, 0);

		return tmp.toDataURL("image/png");
	};
	
	window.CanvasRender = CanvasRender;
})(window);
