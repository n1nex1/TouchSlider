

// 幻灯片
function Slider(options) {
	this.init(options);
}

$.extend(Slider.prototype, {
	init: function(options) {
		this.options = $.extend({}, {
			conversion: 0.375,		// 宽高比 wraperHeight = wraperWidth * conversion;
			current: 1,
			speed: 300
		}, options);
	
		this.$wraper = $('#sliderWrapper');
		this.$slider = $('#sliderContent');
		this.$control = $('#sliderControl');

		this.$items = this.$slider.find('.slider-item');
		this.length = this.$items.size();
		
		this.setWraperSize();
		
		this.render();
	},
	render: function() {
		var _this = this, options = _this.options, content = '', controls = '';

		$.each(_this.$items, function(i) {
			controls += '<em></em>';
		});
	
		_this.$control.html(controls);
		
		var $first = _this.$items.first().clone();
		var $last = _this.$items.last().clone();
		
		_this.$items.first().before($last.addClass('duplicate'));
		_this.$slider.append($first.addClass('duplicate'))
		_this.bindEvents();
	},
	bindEvents: function() {
		var _this = this, options = _this.options;

		_this.setCurrent();
		_this.setSliderTransform(- (_this.screenWidth * options.current));
	
		// slider 尺寸
		$(window).resize(function() {
			_this.setWraperSize();
			_this.setSliderTransform(- (_this.screenWidth * options.current));
		});
	
		// 滑动
		_this.$wraper.on('touchstart', function(e) {
			_this.touchstart(e);
		});
		_this.$wraper.on('touchmove', function(e) {
			_this.touchmove(e);
		});
		_this.$wraper.on('touchend', function() {
			_this.touchend();
		});
		_this.auto();
		
		_this.$wraper.removeClass('slider-wraper-loading');
	},
	touchstart: function(e) {
		var touches = e.originalEvent.touches;
		if (!touches || !touches.length) return;
		var touch = touches[0];
		this.touchStartX = touch.pageX;
		this.touchMoveX = touch.pageX;
		this.setSliderTransition(0);
		this.setSliderTransform(- (this.screenWidth * this.options.current));
		this.touchTime = new Date();
		this.positionX = this.getSliderTransform();
		this.autoStop();
	},
	touchmove: function(e) {
		if (e.type === 'touchmove') {
			e.preventDefault();
		}
		var touches = e.originalEvent.touches;
		if (!touches || !touches.length) return;
		var touch = touches[0];
		this.touchMoveX = touch.pageX;
		// document.querySelector('#busList').innerHTML += this.touchMoveX + ',,' + this.touchStartX + '<br>';
		if (!this.scrolling) {
			var x = this.touchMoveX - this.touchStartX;
			this.setSliderTransform(x + this.positionX);
		}
	},
	touchend: function() {
		var options = this.options, x = this.touchMoveX - this.touchStartX;
		var current = options.current;
		var date = new Date();

		var left = x > 25;
		var right = x < -25;

		var span = Math.abs(x) || 0;
		// document.querySelector('#busList').innerHTML += 'touchMoveX:' + this.touchMoveX + ', touchStartX:' + this.touchStartX + '<br>';
		// document.querySelector('#busList').innerHTML += 'span: ' +span + ', time:' + (date - this.touchTime) + '<br>';
		if (span < 30 && (date - this.touchTime) < 100) {
			// document.querySelector('#busList').innerHTML += 'return<br>';
			this.auto();
			return;
		}

		if (left) {
			if (this.isFirst) {
				this.setCurrent(this.length);
				current = 0;
			}
			else {
				this.setCurrent(current -= 1);
			}
		}
		else if (right) {
			if (this.isLast) {
				this.setCurrent(1);
				current += 1;
			}
			else {
				this.setCurrent(current += 1);
			}
		}
	
		this.setSliderTransition(options.speed);
		this.setSliderTransform(- (this.screenWidth * current));
	
		this.scrollEnd();
		this.auto();
	},
	scrollEnd: function() {
		var _this = this;
		_this.scrolling = true;
		window.clearTimeout(_this.scrollingTimer);
		_this.scrollingTimer = window.setTimeout(function() {

			// 滚动中状态，不允许touchmove事件设置transform
			_this.scrolling = false;
			
			// 重置幻灯片位置，如果当前是复制体的画面，设置到真实画面
			_this.setSliderTransition(0);
			_this.setSliderTransform(- (_this.screenWidth * _this.options.current));
		}, this.options.speed);
	},
	setSliderTransition: function(duration) {
		var style = this.$slider.get(0).style;
		style.webkitTransitionDuration = duration / 1000 + 's';
	},
	setSliderTransform: function(x, y, z) {
		var style = this.$slider.get(0).style;
		var x = x || 0, y = y || 0, z = z || 0;
		style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
	},
	getSliderTransform: function() {
		var style = this.$slider.get(0).style;
		var matrix = new WebKitCSSMatrix(style.webkitTransform);
		return matrix.m41;
	},
	setCurrent: function(current) {
		var options = this.options, current = current === undefined ? options.current : current;
		options.current = current;
		this.isFirst = options.current <= 1 ? true : false;
		this.isLast = options.current >= this.length ? true : false;
		this.$control.find('em').eq(options.current - 1).addClass('current').siblings().removeClass('current');
	},
	setWraperSize: function() {
		if (!this.options.conversion) {
			return;
		}
		this.screenWidth = $(window).width();
		this.$wraper.css({width: this.screenWidth, height: this.screenWidth * this.options.conversion});
	},
	next: function() {
		var _this = this, options = this.options;
		var current = options.current;
		if (this.isLast) {
			this.setCurrent(1);
			current += 1;
		}
		else {
			this.setCurrent(current += 1);
		}

		_this.setSliderTransition(options.speed);
		_this.setSliderTransform(- (_this.screenWidth * current));

		_this.scrollEnd();
		
	},
	auto: function() {
		var _this = this;
		
		if (_this.length <= 0) return;
		
		_this.autoStop();

		_this.timer = window.setTimeout(function() {
			_this.auto();
			_this.next();
		}, 4000);
	},
	autoStop: function() {
		window.clearTimeout(this.timer);
	}

});