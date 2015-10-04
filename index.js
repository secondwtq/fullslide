"use strict";
((function ($) {
    var defaults = {
        'cyclic': false,
        'cyclic0': false,
        'cyclic1': false,
        'direction': 'vertical',
        'numberOfSections': 3,
        'timingFunction': 'ease-in-out',
        'transitionTime': '1000',
        'hasScrollEvent': true,
        'scrollReversed': false,
        'hasTouchEvent': true
    };
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
    function FullSlide(element, options) {
        this.element = $(element);
        this.options = $.extend({}, options, defaults);
        this._setup();
    }
    $.extend(FullSlide.prototype, {
        _isVertical: function () {
            return this.options.direction === 'vertical';
        },
        _setup: function () {
            this.currentIndex = 0;
            this.numberOfSections = this.options.numberOfSections;
            this.inAnimation = false;
            var that = this;
            this.element.bind({
                'fslide-next': function () {
                    that.next();
                },
                'fslide-prev': function () {
                    that.prev();
                },
                'fslide-to': function (e, idx) {
                    that.slideTo(idx);
                }
            });
            // TODO: do not hardcode unit of transitionTime to ms.
            this.element.css({
                '-webkit-transition': "-webkit-transform " + this.options.transitionTime + "ms " + this.options.timingFunction
            });
            this.element.bind({
                'transitionend': function (e) {
                    if (e.originalEvent.propertyName == 'transform') {
                        that.inAnimation = false;
                    }
                }
            });
            if (this.options.hasScrollEvent) {
                this._bindScroll();
            }
            if (this.options.hasTouchEvent) {
                this._bindTouch();
            }
        },
        _bindScroll: function () {
            var that = this;
            this.element.bind('mousewheel DOMMouseScroll', function (e) {
                if (!that.inAnimation) {
                    var delta = e.originalEvent.wheelDelta;
                    if (!that.options.scrollReversed) {
                        if (delta < 0) {
                            that.next();
                        }
                        else {
                            that.prev();
                        }
                    }
                    else {
                        if (delta < 0) {
                            that.prev();
                        }
                        else {
                            that.next();
                        }
                    }
                }
            });
        },
        _bindTouch: function () {
            var startX = 0;
            var startY = 0;
            var that = this;
            function onTouchstart(e) {
                var t = e.originalEvent.touches;
                if (t && t.length) {
                    t = t[0];
                    startX = t.pageX, startY = t.pageY;
                    this.element.bind('touchmove', onTouchmove);
                }
            }
            function onTouchmove(e) {
                var t = e.originalEvent.touches;
                if (t && t.length) {
                    t = t[0];
                    var deltaX = startX - t.pageX;
                    var deltaY = startY - t.pageY;
                    if (deltaX >= 50) {
                    }
                    if (deltaX <= -50) {
                    }
                    if (deltaY >= 50) {
                    }
                    if (deltaY <= -50) {
                    }
                    if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                        that.element.unbind('touchmove', onTouchmove);
                    }
                }
            }
            this.element.bind('touchstart', onTouchstart);
        },
        slideTo: function (index) {
            this.element.trigger('fslide-start', [
                this.currentIndex, index]);
            var percent = -index * 100;
            var transform_css = '';
            if (this._isVertical()) {
                transform_css = "translate3d(0, " + percent + "%, 0)";
            }
            else {
                transform_css = "translate3d(" + percent + "%, 0, 0)";
            }
            this.element.css({
                '-webkit-transform': transform_css });
            this.currentIndex = index;
            this.inAnimation = true;
        },
        next: function () {
            if (this.currentIndex < this.numberOfSections) {
                this.slideTo(this.currentIndex + 1);
            }
            else if (this.options.cyclic0 || this.options.cyclic) {
                this.slideTo(0);
            }
        },
        prev: function () {
            if (this.currentIndex > 0) {
                this.slideTo(this.currentIndex - 1);
            }
            else if (this.options.cyclic1 || this.options.cyclic) {
                this.slideTo(this.numberOfSections - 1);
            }
        }
    });
    $.fn.fullSlide = function (options) {
        return this.each(function () {
            $.data(this, "plugin_fullSlide", new FullSlide(this, options));
        });
    };
})(jQuery));
