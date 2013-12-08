(function ($) {

    $.Slider = function (element, options) {
        this._init(element, options);
    };

    $.Slider.prototype = {
        defaults: {
              slideClass: '.slide'
            , nextBtn: '.slide-next'
            , prevBtn: '.slide-prev'
            , fullBtn: '.slide-full-size'
            , showCounter: true
            , counterClass: '.slide-counter'
        }
         , keyCode: {
            ENTER: 13,
            NUMPAD_ENTER: 108,
            ESCAPE: 27,
            RIGHT: 39,
            LEFT: 37,
            DOWN: 40,
            UP: 38,
            SPACE: 32,
            END: 35,
            HOME: 36,
            PAGE_DOWN: 34,
            PAGE_UP: 33
        }
        /* methods starts with underscore means private*/
        , _init: function (element, options) {
            this.$el = $(element);
            this.$body = $('body');
            this.$html = $('html');
            this.options = $.extend({}, this.defaults, options);

            this.curSlide = 0;

            this.$slides = this.getSlides();
            this.totalSlides = this.$slides.length;

            this._bindEvents();

            if (this.totalSlides) {
                this.step(1);
            }
        }
        , _bindEvents: function () {
            var self = this;

            this.$el.on('click', function (e) {
                e.stopPropagation();
                self._toggleMode();
            })

            this.$body.on('keydown', function (e) { 
                if (self._isFullMode()) {
                    e.stopPropagation();
                    self._keydown(e);
                }
            })
        }
        , _destroy: function () {
            /*is it needed?*/
        }
        , _getTransform: function () {
            var multiplicator = window.innerHeight / this.$el[0].clientHeight;
            return multiplicator;
        }
        , _setTransform: function (transform) {
            var props = [
                        '-webkit-transform',
                           '-moz-transform',
                            '-ms-transform',
                              'o-transform',
                                'transform'
                        ]
            for (var i = 0, l = props.length; i < l; i++) {
                this.$el.css(props[i], 'scale(' + transform + ')')
            }
        }
        /* navigation */
        , _keydown: function (e) {
            var keyCode = this.keyCode;
            switch (e.keyCode) {
                case keyCode.HOME:
                    this.step(1);
                    break;

                case keyCode.ESCAPE:
                    this.exitFullMode();
                    break;

                case keyCode.END:
                    this.step(this.totalSlides);
                    break;

                case keyCode.RIGHT:
                case keyCode.SPACE:
                case keyCode.DOWN:
                case keyCode.PAGE_DOWN:
                case keyCode.ENTER:
                case keyCode.NUMPAD_ENTER:
                    this.next();
                    break;

                case keyCode.LEFT:
                case keyCode.UP:
                case keyCode.PAGE_UP:
                    this.prev();
                    break;
            }
        }
        , getSlides: function () {
            if (this.options.slideClass) {
                return this.$el.find(this.options.slideClass);
            }
            return []
        }
        , getSlide: function (slideNum) {
            if (this.$slides.length) {
                return this.$slides.filter('.slide-num-' + slideNum)
            }
            return []
        }
        , step: function (slideNum) {
            if (!slideNum) return new Error('slide number is undefined');

            var $slide = this.getSlide(slideNum);

            if ($slide.length) {
                this.$slides.removeClass('active');
                $slide.addClass('active');
                this.updateCounter(slideNum);
            } else {
                return new Error('slide witn number ' + slideNum + ' not found');
            }
        }
        , next: function () {
            if (this.curSlide < this.totalSlides) {
                this.step(++this.curSlide);
            }
        }
        , prev: function () {
            if (this.curSlide > 1) {
                this.step(--this.curSlide);
            }
        }
        , updateCounter: function (slideNum) {
            this.curSlide = slideNum;
            if (this.options.showCounter) {
                /* curSlide/totalSlides */
            }
        }
        /* modes */
        , _isFullMode: function () {
            return this.$body.hasClass('slider-mode-full');
        }
        , _toggleMode: function () {
            if (this._isFullMode()) {
                this.exitFullMode();
            } else {
                this.enterFullMode();
            }
        }
        , enterFullMode: function () {
            this.$body.addClass('slider-mode-full');
            /* lock scroll (html for ie)*/
            this.$html.addClass('slider-mode-full');

            this._setTransform(this._getTransform())

            var top = this.$el.offset().top;
            this.$el.addClass('active')
                    .css('margin-top', -top);
        }
        , exitFullMode: function () {
            this.$body.removeClass('slider-mode-full');
            /* lock scroll (html for ie)*/
            this.$html.removeClass('slider-mode-full');

            this.$el.removeClass('active')
                    .css('margin-top', 0);
            this._setTransform(1)
        }
    };

    $.fn.slider = function (options) {
        var   instance = this.data('slider')
            , isMethodCall = typeof options === "string"
            , args = Array.prototype.slice.call(arguments, 1)/* allow call public method with arguments*/
            , returnValue = this;

        this.each(function() {
            if (isMethodCall) {
                if (!instance) {
                    return new Error('Cannot call ' +  method + ' before init jQuery.slider');
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_" ) {
                    return new Error('Method ' +  method + ' not found among jQuery.slider methods');
                }
                /* method return value (not always this)?*/
                instance[options](args);
            } else {
                if (instance) {
                    /* what we do if already setup widget?*/
                } else {
                    $(this).data('slider', new $.Slider(this, options));
                }
            }
        });
        return returnValue;
    };

})(jQuery);