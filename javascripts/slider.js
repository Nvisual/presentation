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
              ENTER: 13
            , SPACE: 32
            , ESCAPE: 27
            , NUMPAD_ENTER: 108

            , UP: 38
            , RIGHT: 39
            , DOWN: 40
            , LEFT: 37

            , HOME: 36
            , END: 35
            , PAGE_UP: 33
            , PAGE_DOWN: 34
        }

        /* methods starts with underscore means private */
        , _init: function (element, options) {
            this.$el = $(element);
            this.$body = $('body');
            this.$html = $('html');

            this.options = $.extend({}, this.defaults, options);

            this.curSlide = 0;

            this.$slides = this._getSlides();
            this.totalSlides = this.$slides.length;

            if (this.totalSlides) {
                this._makeCounter();
                this._writeDimensions();
                this._bindEvents();
                this.step(1);
            }
        }

        /* allow fit dynamicly */
        , _bindEvents: function () {
            var self = this;

            this.$el.on('click', function (e) {
                e.stopPropagation();
                self._toggleMode();
            })

            this.$body.on('keydown', function (e) { 
                if (self._isFullMode() && self._isActive()) {
                    e.stopPropagation();
                    self._keydown(e);
                }
            })

            $(window).on('resize', function (e) {
                if (self._isFullMode() && self._isActive()) {
                    self._setTransform()
                }
            });
        }

        , _writeDimensions: function () {

        }



        , _destroy: function () {
            /* is it needed? */
        }

        , _isActive: function () {
            return this.$el.hasClass('active')
        }

        , _makeCounter: function () {
            var counter = '<div class="slide-counter"></div>';
            this.$counter = $(counter).appendTo(this.$el);
        }

        , updateCounter: function (slideNum, resetTotal) {
            this.curSlide = slideNum;

            if (this.options.showCounter) {
                var counter_txt = this.curSlide + '/' + this.totalSlides;
                this.$counter.text(counter_txt)
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

        , _getSlides: function () {
            if (this.options.slideClass) {
                return this.$el.find(this.options.slideClass);
            }
            return []
        }

        , _getSlide: function (slideNum) {
            if (this.$slides.length) {
                return this.$slides.filter('.slide-num-' + slideNum)
            }
            return []
        }

        , step: function (slideNum) {
            if (!slideNum) return new Error('slide number is undefined');

            var $slide = this._getSlide(slideNum);

            if ($slide.length) {
                if (this.$curSlide) {
                    $slide.animate({opacity: .99}, 500);
                    this.$curSlide.animate({opacity: 0}, 500);
                    this.$curSlide.removeClass('current');
                }
                 $slide.addClass('current');

                this.$curSlide = $slide;

                this.updateCounter(slideNum);
            } else {
                return new Error('slide witn number ' + slideNum + ' not found');
            }
        }

        , next: function () {
            if (this.curSlide < this.totalSlides) this.step(++this.curSlide);
        }

        , prev: function () {
            if (this.curSlide > 1) this.step(--this.curSlide);
        }

        /* transformation */
        , _getTransformMultiplier: function () {
            var height = window.innerHeight / this.$el[0].clientHeight
              , width = window.innerWidth / this.$el[0].clientWidth;

            return Math.min(height, width);
        }

        , _setTransformMultiplier: function (transform) {
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

        , _fitTransform: function (transform) {
            var styles = {};

            styles.width = this.$el[0].clientWidth;
            styles.height = this.$el[0].clientHeight;

            styles.marginTop = (transform)? -styles.height*0.5: 0;
            styles.marginLeft = (transform)? -styles.width*0.5: 0;

            this.$el.css(styles)
        }

        , _setTransform: function () {
            var transform = this._getTransformMultiplier()
            this._setTransformMultiplier(transform)
            this._fitTransform(transform)
        }

        , _resetTransform: function () {
            this._setTransformMultiplier(1)
            this._fitTransform(0)
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
            this.$html.addClass('slider-mode-full');
            this.$body.addClass('slider-mode-full');

            this.$background = $('<div class="background"></div>').appendTo(this.$body);

            this._setTransform();
            this.$el.addClass('active');
        }

        , exitFullMode: function () {
            this.$body.removeClass('slider-mode-full');
            this.$html.removeClass('slider-mode-full');

            this.$background && this.$background.remove();
            this.$background = null;

            this._resetTransform();
            this.$el.removeClass('active');
        }
    };

    $.fn.slider = function (options) {
        var args = Array.prototype.slice.call(arguments, 1)   /* allow call public method with arguments */
          , instance = this.data('slider')
          , isMethodCall = (typeof options === 'string')      /* senseless comment: brackets only for easy reading */
          , returnValue = this;                               /* how about custom method returnValue (not always this for chaining)? */

        this.each(function() {
            if (isMethodCall) {
                if (!instance) {
                    return new Error('Cannot call ' +  method + ' before init jQuery.slider');
                }
                if ($.isFunction(instance[options]) || options.charAt(0) === '_') {
                    return new Error('Method ' +  method + ' not found among jQuery.slider methods');
                }

                instance[options](args);
            } else {
                if (instance) {
                    /* what shall we do, if widget already initialized? */
                } else {
                    $(this).data('slider', new $.Slider(this, options));
                }
            }
        });

        return returnValue;
    };

})(jQuery);