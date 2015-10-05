
"use strict";

interface FullSlideOptionsStruct {
	cyclic?: boolean;
	
	cyclic0?: boolean;
	cyclic1?: boolean;
	
	direction?: string;
	numberOfSections?: number;
	timingFunction?: string;
	transitionTime?: string;
	
	hasScrollEvent?: boolean;
	scrollReversed?: boolean;
	hasTouchEvent?: boolean;
}

class FullSlideOptions implements FullSlideOptionsStruct {
	cyclic: boolean = false;
	
	cyclic0: boolean = false;
	cyclic1: boolean = false;
	
	// TODO: horizontal sliding is not fully supported
	direction: string = 'vertical';
	numberOfSections: number = 3;
	timingFunction: string = 'ease-in-out';
	transitionTime: string = '1000';
	
	hasScrollEvent: boolean = true;
	scrollReversed: boolean = true;
	hasTouchEvent: boolean = true;
	
	constructor (options? : FullSlideOptionsStruct) {
		if (options) {
			$.extend(this, options); }
	}
}

//
// instance variables:
//
//	element: $(element),
//	options: { }, used as dict, from arg options,
//
//	currentIndex: int,
//	numberOfSections: int
//	inAnimation: bool
//
// events:
//	in:
//		* fslide-next
//		* fslide-prev
//		* fslide-to idx
//
//	out:
//		* fslide-start from to
//

class FullSlide {
	
	element: JQuery;
	options: any;
	
	private currentIndex: number;
	private numberOfSections: number;
	private inAnimation: boolean;
	
	constructor (element, options) {
		this.element = $(element);
		this.options = new FullSlideOptions(options);
	
		this.currentIndex = 0;
		this.numberOfSections = this.options.numberOfSections;
		this.inAnimation = false;
		
		var that = this;
		this.element.bind({
			'fslide-next': function () {
				that.next(); },
			'fslide-prev': function () {
				that.prev(); },
			'fslide-to': function (e, idx) {
				that.slideTo(idx); }
		});
		
		// TODO: do not hardcode unit of transitionTime to ms.
		this.element.css({
			'-webkit-transition': `-webkit-transform ${this.options.transitionTime}ms ${this.options.timingFunction}`,
			'transition': `transform ${this.options.transitionTime}ms ${this.options.timingFunction}`
		});
		
		this.element.bind({
			'transitionend': function (e) {
				if (e.originalEvent.propertyName == 'transform') {
					that.inAnimation = false; }
			}
		});
		
		this.element.bind('mousewheel DOMMouseScroll', function (e) {
			e.preventDefault(); });
		if (this.options.hasScrollEvent) {
			this._bindScroll(); }
		if (this.options.hasTouchEvent) {
			this._bindTouch(); }
	}
	
	next () : void {
		if (this.currentIndex < this.numberOfSections-1) {
			this.slideTo(this.currentIndex+1);
		} else if (this.options.cyclic0 || this.options.cyclic) {
			this.slideTo(0); }
	}
	prev () : void {
		if (this.currentIndex > 0) {
			this.slideTo(this.currentIndex-1);
		} else if (this.options.cyclic1 || this.options.cyclic) {
			this.slideTo(this.numberOfSections-1); }
	}
	
	slideTo (index : number) : void {
		this.element.trigger('fslide-start', [
			this.currentIndex, index ]);
		
		var percent = -index * 100;
		var transform_css = '';
		if (this._isVertical()) {
			transform_css = `translate3d(0, ${percent}%, 0)`;
		} else { transform_css = `translate3d(${percent}%, 0, 0)`; }
		this.element.css({
			'transform': transform_css,
			'-webkit-transform': transform_css });
		this.currentIndex = index;
		this.inAnimation = true;
	}
	
	private _isVertical () : boolean {
		return this.options.direction === 'vertical'; }
		
	private _bindScroll () : void {
		var that = this;
		this.element.bind('mousewheel DOMMouseScroll', function (e) {
			if (!that.inAnimation) {
				var delta = (<MouseWheelEvent>e.originalEvent).wheelDelta || -(<MouseWheelEvent>e.originalEvent).detail;
				
				if (!that.options.scrollReversed) {
					if (delta < 0) {
						that.next();
					} else { that.prev(); }
				} else {
					if (delta < 0) {
						that.prev();
					} else { that.next(); }
				}
			}
		});
	}
	
	_bindTouch () {
		var that = this;
		this.element.each(function () {
			var startX = 0; var startY = 0;;
			
			// TODO: problem of scrolling multiple times.
			function onTouchstart (e) {
				var t = e.originalEvent.touches;
				if (t && t.length) {
					t = t[0];
					startX = t.pageX, startY = t.pageY;
					that.element.bind('touchmove', onTouchmove);
				}
				// e.preventDefault();
			}
			function onTouchmove (e : JQueryEventObject) {
				var t = (<TouchEvent>e.originalEvent).touches;
				if (t && t.length) {
					var t0 = t[0];
					var deltaX = startX - t0.pageX;
					var deltaY = startY - t0.pageY;
					
					if (deltaX >= 50) {
						if (!that._isVertical()) {
							that.next(); }
					}
					if (deltaX <= -50) {
						if (!that._isVertical()) {
							that.prev(); }
					}
					if (deltaY >= 50) {
						if (that._isVertical()) {
							that.next(); }
					}
					if (deltaY <= -50) {
						if (that._isVertical()) {
							that.prev(); }
					}
					if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
						that.element.unbind('touchmove', onTouchmove); }
					// e.preventDefault();
				}
			}
			that.element.bind('touchstart', onTouchstart);
		});
	}
	
}

((function ($) {

$.fn.fullSlide = function (options) {
	return this.each(function () {
		$.data(this, "plugin_fullSlide", new FullSlide(this, options));
	});
};
	
}) (jQuery));
