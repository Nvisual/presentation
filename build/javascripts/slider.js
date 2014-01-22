(function ($) {
    $.Slider = function (element, options) {
        this._init(element, options);
    };

    $.Slider.prototype = {
        // constants
        DEFAULTS: {
              navigation: true
            , counter: true
            , controlPanel: true
            , animateToggleNav: 250
            , animateStep: 750
        }

        , CLASSES: {
            // common slider
              slider_active:    'slider-active'
            , slider_mode_full: 'slider-mode-full'
            , slider_background:'slider-background'
            , slider_content:   'slider-content'
            , slider_slides:    'slider-slides'
            // counter
            , counter:          'slider-counter'
            // slide
            , slide:            'slider-slide'
            , slide_num:        'slider-slide__num-'
            , slide_current:    'slider-slide__current'
            , slide_visible:    'slider-slide__visible'
            // navigation
            , nav:              'slider-nav'
            , nav_content:      'slider-nav__content'
            , nav_btn:          'slider-nav__btn'
            , nav_btn_prev:     'slider-nav__btn-role-prev'
            , nav_btn_next:     'slider-nav__btn-role-next'
            , nav_slides_start: 'slider-nav__slides-start'
            , nav_slides_end:   'slider-nav__slides-end'
            // control panel
            , cp:               'slider-cp'
            , cp_content:       'slider-cp__content'
            , cp_content_left:  'slider-cp__content-left'
            , cp_content_right: 'slider-cp__content-right'
            , cp_content_center:'slider-cp__content-center'
            // control panel buttons
            , cp_btn:           'slider-cp__btn'
            , cp_btn_start:     'slider-cp__btn-role-start'
            , cp_btn_end:       'slider-cp__btn-role-end'
            , cp_btn_prev:      'slider-cp__btn-role-prev'
            , cp_btn_next:      'slider-cp__btn-role-next'
            , cp_btn_toggle:    'slider-cp__btn-toggle'
            , cp_btn_toggle_nav: 'slider-cp__btn-role-toggle-nav'
            , cp_btn_toggle_mode:'slider-cp__btn-role-toggle-mode'
        }

        , KEY_CODES: {
            // toggle fullscrenn || step next slide in full mode
              ENTER: 13 
            , NUMPAD_ENTER: 108
            // exit full mode
            , ESCAPE: 27
            // step first slide
            , HOME: 36
            // step last slide
            , END: 35
            // step prev
            , UP: 38
            , LEFT: 37
            , BACKSPACE: 8
            , PAGE_UP: 33
            // step next
            , RIGHT: 39
            , DOWN: 40
            , SPACE: 32
            , PAGE_DOWN: 34
            // toggle navigation
            , N: 78
            // toggle control panel
            , C: 67
        }

        , PREF_PROPS: [
            '-webkit-transform',
               '-moz-transform',
                '-ms-transform',
                  'o-transform',
                    'transform'
        ]

        // initialization
        // _method - private method
        , _init: function (element, options) {
            this.$el = $(element);
            this.$body = $('body');
            this.$html = $('html');
            this.options = $.extend({}, this.DEFAULTS, options);

            this.currSlide = 0;
            this.$content = this.$el.find('.' + this.CLASSES.slider_content);
            this.$content_slides = this.$content.find('.' + this.CLASSES.slider_slides);

            if (!this.$content.length) throw new Error('jQuery.slider wouldn\'t work properly. Content element not found');
            if (!this.$content_slides.length) throw new Error('jQuery.slider wouldn\'t work properly. Slides content element not found');

            this.$slides = this._getSlides();
            this.totalSlides = this.$slides.length;

            if (this.options.navigation) {
                this.$nav = this._makeNavigation();
                this.$nav_slides = this._getSlides(this.$nav);
                this.$nav_btn_prev = this.$nav.find('.' + this.CLASSES.nav_btn_prev);
                this.$nav_btn_next = this.$nav.find('.' + this.CLASSES.nav_btn_next);
            }
            if (this.options.controlPanel) {
                this.$cp = this._makeControlPanel();
                this.$cp_btn_prev = this.$cp.find('.' + this.CLASSES.cp_btn_prev);
                this.$cp_btn_next = this.$cp.find('.' + this.CLASSES.cp_btn_next);

                this.$cp_btn_start = this.$cp.find('.' + this.CLASSES.cp_btn_start);
                this.$cp_btn_end = this.$cp.find('.' + this.CLASSES.cp_btn_end);

                this.$cp_btn_toggle_nav = this.$cp.find('.' + this.CLASSES.cp_btn_toggle_nav);
                this.$cp_btn_toggle_mode = this.$cp.find('.' + this.CLASSES.cp_btn_toggle_mode);
            }
            if (this.options.counter) {
                this.$counter = this._makeCounter();
            }

            this._bindEvents();
            this.start();
        }

        , _bindEvents: function () {
            var self = this;
            this.$content_slides.on('click', function (e) {
                self._toggleMode();
            });
            this.$body.on('keydown', function (e) {
                if (self._isFullMode() && self._isActive()) {
                    self._keydown(e);
                }
            });
            $(window).on('resize', function (e) {
                if (self._isFullMode() && self._isActive()) {
                    self._setTransform();
                }
            });
            if (this.$nav.length) {
                this._bindNavigationEvents();
            }
            if (this.$cp.length) {
                this._bindControlPanelEvents();
            }
        }

        , _bindNavigationEvents: function () {
            var self = this;
            if (this.$nav_btn_prev.length) {
                this.$nav_btn_prev.on('click', function (e) { self.prev() });
            }
            if (this.$nav_btn_next.length) {
                this.$nav_btn_next.on('click', function (e) { self.next() });
            }
        }

        , _bindControlPanelEvents: function () {
            var self = this;
            if (this.$cp_btn_prev.length) {
                this.$cp_btn_prev.on('click', function (e) {
                    e.preventDefault();
                    self.prev();
                });
            }
            if (this.$cp_btn_next.length) {
                this.$cp_btn_next.on('click', function (e) {
                    e.preventDefault();
                    self.next();
                });
            }
            if (this.$cp_btn_start.length) {
                this.$cp_btn_start.on('click', function (e) {
                    e.preventDefault();
                    self.start();
                });
            }
            if (this.$cp_btn_end.length) {
                this.$cp_btn_end.on('click', function (e) {
                    e.preventDefault();
                    self.end();
                });
            }
            if (this.$cp_btn_toggle_nav.length) {
                this.$cp_btn_toggle_nav.on('click', function (e) {
                    e.preventDefault();
                    self.toggleNavigation();
                });
            }
            if (this.$cp_btn_toggle_mode.length) {
                this.$cp_btn_toggle_mode.on('click', function (e) {
                    e.preventDefault();
                    self._toggleMode();
                });
            }
        }

        , _keydown: function (e) {
            var keyCode = this.KEY_CODES;
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
                case keyCode.DOWN:
                case keyCode.SPACE:
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
                case keyCode.N:
                    this.$nav && this.toggleNavigation();
                    break;
                case keyCode.C:
                    this.$cp && this.toggleControlPanel();
                    break;
            }
        }

        , _isActive: function () {
            return this.$el.hasClass(this.CLASSES.slider_active)
        }

        // counter
        , _makeCounter: function () {
            var counter = '<div class="' + this.CLASSES.counter + '"></div>';
            return $(counter).appendTo(this.$content);
        }

        , _updateCounter: function (slideNum) {
            this.currSlide = slideNum;
            if (this.$counter) {
                var counter_txt = this.currSlide + '/' + this.totalSlides;
                this.$counter.text(counter_txt);
            }
        }

        // control panel
        , _makeControlPanel: function () {
            var left = '', center = '', right = '', template = '';

            left = '<div class=' + this.CLASSES.cp_content_left + '>' + 
                        '<a href="#" class="' + this.CLASSES.cp_btn + ' ' + 
                                                this.CLASSES.cp_btn_toggle + ' ' + 
                                                this.CLASSES.cp_btn_toggle_nav + '"' + 
                                   ' title="показать панель навигации">&nbsp;' + 
                        '</a>' + 
                   '</div>';

            center = '<div class=' + this.CLASSES.cp_content_center + '>' + 
                        '<a href="#" class="' + this.CLASSES.cp_btn + ' ' + this.CLASSES.cp_btn_start + '"' + 
                                   ' title="первый слайд">&#9646;&#9664;' + 
                        '</a>' + 
                        '<a href="#" class="' + this.CLASSES.cp_btn + ' ' + this.CLASSES.cp_btn_prev + '"' + 
                                   ' title="предыдущий слайд">&#9664;' + 
                        '</a>' + 
                        '<a href="#" class="' + this.CLASSES.cp_btn + ' ' + this.CLASSES.cp_btn_next + '"' + 
                                   ' title="следующий слайд">&#9654;' + 
                        '</a>' + 
                        '<a href="#" class="' + this.CLASSES.cp_btn + ' ' + this.CLASSES.cp_btn_end + '"' + 
                                   ' title="последний слайд">&#9654;&#9646;' + 
                        '</a>' + 
                    '</div>';

            right = '<div class=' + this.CLASSES.cp_content_right + '>' + 
                        '<a href="#" class="' + this.CLASSES.cp_btn + ' ' + 
                                                this.CLASSES.cp_btn_toggle + ' ' + 
                                                this.CLASSES.cp_btn_toggle_mode + '"' + 
                                   ' title="переключить полноэкранного режима">&nbsp;' + 
                        '</a>' + 
                    '</div>';

            template = '<div class=' + this.CLASSES.cp + '>' + 
                            '<div class=' + this.CLASSES.cp_content + '>' +
                                left + center + right +
                            '</div>' +
                       '</div>';

            return $(template).appendTo(this.$content);
        }

        , toggleControlPanel: function () {
            if (!this.$cp.length) throw new Error('jQuery.slider can\'t toggle navigation. Control panel is not build.');
            if (this.$cp.is(':visible')) {
                this.$cp.hide();
            } else {
                this.$cp.show();
            }
        }

        // navigation
        , _makeNavigation: function () {
            var content, template;
            content = this.$content_slides.html();
            template = '<div class="' + this.CLASSES.nav + '">' +
                          '<div class="' + this.CLASSES.nav_btn +' '+ this.CLASSES.nav_btn_prev + '"></div>' +
                          '<div class="' + this.CLASSES.nav_content + '">' +
                              content +
                           '</div>' +
                          '<div class="' + this.CLASSES.nav_btn +' '+ this.CLASSES.nav_btn_next + '"></div>' +
                       '</div>';
            return $(template).appendTo(this.$el);
        }

        , toggleNavigation: function () {
            if (!this.$nav.length) throw new Error('jQuery.slider can\'t toggle navigation. Navigation is not build.');
            var delay = this.options.animateToggleNav;
            this.$nav.finish();
            if (this.nav_visible) {
                this.$nav.animate({marginLeft: '-20%', opacity: 0}, delay, function () { $(this).hide(); });
                this._setScale(this.$content, 1);
                this.$content.css({marginLeft: 0});
                this.nav_visible = 0;
            } else {
                this._updateNavigation();
                this.$nav.show().animate({marginLeft: 0, opacity: 1}, delay);
                this._setScale(this.$content, 0.8);
                this.$content.css({marginLeft: '10%'});
                this.nav_visible = 1;
            }
        }

        , _toggleClass: function ($el, className, condition) {
            (condition)? $el.addClass(className): $el.removeClass(className);
        }

        , _updateNavSlideClass: function ($slide, num, current) {
            var total = this.totalSlides
              , visibility_range = (total <= 5)? 5:
                                        (current < 4)? 5 - current:
                                        (total - current < 3)? 4 - (total - current): 2;
            this._toggleClass($slide, this.CLASSES.slide_visible, Math.abs(current - num) <= visibility_range);
            this._toggleClass($slide, this.CLASSES.slide_current, num === current);
        }

        , _updateNavigation: function () {
            var total = this.totalSlides
              , current = this.currSlide
              , skip = (current < 4 || total <= 5)? 3: (total - current < 3)? total - 2: current;
            // нумерация слайдов с 1, а храним проиндексированными с 0 (место для удара головой).
            for (var i = 1, $slide; i <= total; i++) {
                $slide = $(this.$nav_slides[i-1]);
                this._updateNavSlideClass($slide, i, current);
                this._setTranslate($slide, '-40%', (i - skip) * 115 + '%', '-6px');// база 1 (perspective), 6px - 6*кратный zoom
            }
            this._toggleClass(this.$nav, this.CLASSES.nav_slides_start, current > 1);
            this._toggleClass(this.$nav, this.CLASSES.nav_slides_end, total - current >= 1);
        }

        , _getSlides: function ($el) {
            var $target = ($el)? $el: this.$content;
            return $target.find('.' + this.CLASSES.slide);
        }

        , _getSlide: function (slideNum) {
            var result = [];
            if (this.$slides.length) {
                result = this.$slides.filter('.' + this.CLASSES.slide_num + slideNum);
            }
            return result;
        }

        , _animateStep: function ($newSlide) {
            // используем finish, т.к. хотим чтобы одновременно воспроизводилось не более 2-х анимаций.
            if (this.$prevSlide) this.$prevSlide.finish();
            if (this.$currSlide) {
                this.$currSlide.finish().animate({opacity: 0}, this.options.animateStep);
            }
            $newSlide.animate({opacity: .99}, this.options.animateStep);
        }

        , step: function (slideNum) {
            if (!slideNum) throw new Error('jQuery.slider can\'t do step. Need slide number to step');

            var $newSlide = this._getSlide(slideNum);

            if ($newSlide.length) {
                if (this.options.animateStep) this._animateStep($newSlide);

                if (this.$currSlide) {
                    this.$currSlide.removeClass(this.CLASSES.slide_current);
                    this.$prevSlide = this.$currSlide;
                }

                $newSlide.addClass(this.CLASSES.slide_current);
                this.$currSlide = $newSlide;

                this._updateCounter(slideNum);
                if (this.nav_visible) this._updateNavigation();
            } else {
                throw new Error('jQuery.slider can\'t do step. Slide witn number ' + slideNum + ' not found');
            }
        }

        , next: function () {
            if (this.currSlide < this.totalSlides) this.step(++this.currSlide);
        }

        , prev: function () {
            if (this.currSlide > 1) this.step(--this.currSlide);
        }

        , start: function () {
            this.step(1);
        }

        , end: function () {
            this.step(this.totalSlides);
        }

        // transformations
        , _getScaleMultiplier: function () {
            var height = window.innerHeight / this.$el[0].clientHeight
              , width = window.innerWidth / this.$el[0].clientWidth;
            return Math.min(height, width);
        }

        , _setScale: function ($el, value) {
            var props = this.PREF_PROPS
              , scale = 'scale(' + value + ')';
            for (var i = 0, l = props.length; i < l; i++) {
                $el.css(props[i], scale);
            }
        }

        , _setTranslate: function ($el, x, y, z) {
            var props = this.PREF_PROPS;
            for (var i = 0, l = props.length; i < l; i++) {
                $el.css(props[i], 'translate(' + x + ',' + y + ') translateZ(' + z + ')');
            }
        }

        , _fitTransform: function (scale) {
            var styles = {};

            styles.width = this.$el[0].clientWidth;
            styles.height = this.$el[0].clientHeight;

            styles.marginTop = (scale)? - styles.height * 0.5: 0;
            styles.marginLeft = (scale)? - styles.width * 0.5: 0;

            this.$el.css(styles);
        }

        , _setTransform: function () {
            var scale = this._getScaleMultiplier();
            this._setScale(this.$el, scale);
            this._fitTransform(scale);
        }

        , _resetTransform: function () {
            this._setScale(this.$el, 1);
            this._fitTransform(0);
        }

        // modes
        , _isFullMode: function () {
            return this.$body.hasClass(this.CLASSES.slider_mode_full);
        }

        , _toggleMode: function () {
            (this._isFullMode())? this.exitFullMode(): this.enterFullMode();
        }

        , enterFullMode: function () {
            this.$html.addClass(this.CLASSES.slider_mode_full);
            this.$body.addClass(this.CLASSES.slider_mode_full);

            this.$background = $('<div class="' + this.CLASSES.slider_background + '"></div>').appendTo(this.$body);

            this._setTransform();
            this.$el.addClass(this.CLASSES.slider_active);
        }

        , exitFullMode: function () {
            this.$html.removeClass(this.CLASSES.slider_mode_full);
            this.$body.removeClass(this.CLASSES.slider_mode_full);

            if (this.$background) {
                this.$background.remove();
                delete this.$background;
            }

            this._resetTransform();
            this.$el.removeClass(this.CLASSES.slider_active);
        }
    };

    $.fn.slider = function (options) {
        var instance = this.data('slider')
          , isMethodCall = typeof options === 'string'
          , methodParams = Array.prototype.slice.call(arguments, 1) // отделяем имя метода от его параметров
          , returnValue = this;                                     // пока возвращаем this для цепочек

        this.each(function() {
            if (isMethodCall) {
                if (!instance) {
                    throw new Error('Cannot call ' +  method + ' before init jQuery.slider');
                }
                // служебные методы (начинаются с _), которые также не даем вызвать
                if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                    throw new Error('Method ' +  method + ' not found among jQuery.slider methods');
                }
                instance[options](methodParams);
            } else {
                if (instance) {
                    // хотим чтобы экземпляр слайдера нельзя было переопределить
                    throw new Error('jQuery.slider was already initialized');
                } else {
                    $(this).data('slider', new $.Slider(this, options));
                }
            }
        });

        return returnValue;
    };

})(jQuery);