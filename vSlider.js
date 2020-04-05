(function () {

    function vSlider(containerClassName, options) {

        if (!containerClassName || !options) return console.error("[vSlider]: You have to give an class and options in params = new vSlider('.className', {opctions})");
    
        var vSliderConstructor = class {
            constructor (containerClassName, options) {
                /**
                 * Main settings
                 */
                this.containerClassName = containerClassName;
                this.options = options;
                this.$container = document.querySelector(containerClassName);
                this.$wrapper = document.querySelector(containerClassName + " .v__slider__wrapper");
                this.$items = document.querySelectorAll(containerClassName + " .v__slider__wrapper .v__slide");
                this.sections = {};
                this.sections.currentSection = 0;

                /**
                 * Console messages
                 */
                this.msg = {
                    'initError': "[vSlider]: You have to give an class and options in params = new vSlider('.className', {opctions})",
                    'itemsError': '[vSlider]:{items: ...} You have to specified option "items: [number]" more items than "' + containerClassName + '" contain, or 0, or type error!',
                    'navError': '[vSlider]:{navigation: ...} Elements not found!',
                    'marginError': '[vSlider]:{marginRight: ...} You to specified option "marginRight: [number]" !',
                };

                /**
                 * Validate options
                 */
                // mouseControll
                this.options.mouseControll == false ? this.options.mouseControll = this.options.mouseControll : this.options.mouseControll = true;
                // loop
                this.options.loop = this.options.loop || false;
                // items
                this.options.items = this.options.items || 1;
                this.options.items > this.$items.length ? (this.options.items = this.$items.length, this.warn('itemsError')) : '';
                // navigation
                this.options.navigation ? this.navPrev = document.querySelectorAll(this.options.navigation.prev) || undefined : '';
                this.options.navigation ? this.navNext = document.querySelectorAll(this.options.navigation.next) || undefined : '';
                // marginRight
                !this.isMargin() ? this.options.marginRight = 0 : '';
                // autoplay
                this.autoplay = {};
                this.autoplay.status = this.options.autoplay || false;
                this.autoplay.delay = this.options.delay || 3000;
                this.autoplay.interval = null; // for killing interval
                // slideGroup
                this.options.slideGroup = this.options.slideGroup || false;


                /**
                 * Mouse events
                 */
                this.options.speed ? this.options.speed = this.options.speed : this.options.speed = 300;
                this.mouse = {
                    moveOn: false,
                    position: { start: 0, end: 0, inArea: 0, direction: "", wrapperStart: 0, wrapperEnd: 0 },
                    moveSpeed: 0,
                };

            }


            /**
             * Main slider manipulation functions
             */
            getContainerAreaSize (type) {
                switch(type) {
                    case "x": return this.$container.getBoundingClientRect().width;
                    case 'y': return this.$container.getBoundingClientRect().height;
                    default: return this.$container.getBoundingClientRect();
                }
            }
            getWrapperAreaSize(type) {
                switch (type) {
                    case "x": return this.$wrapper.getBoundingClientRect().width;
                    case 'y': return this.$wrapper.getBoundingClientRect().height;
                    default: return this.$wrapper.getBoundingClientRect();
                }
            }
            calcItemWidth () {
                var itemWidth = this.getContainerAreaSize('x') / this.options.items;
                if (this.isMargin()) {
                    itemWidth = itemWidth - this.options.marginRight;
                }
                return itemWidth;
            }
            setItemsWidth () {
                for(var i = 0; i < this.$items.length; i++) {
                    this.$items[i].style.minWidth = this.calcItemWidth()+"px";
                    this.setItemMargin(this.$items[i]);
                }
            }
            getItemWidth() { return parseInt(this.$items[0].style.minWidth) + (this.options.marginRight); }
            setItemMargin (item) { this.isMargin() ? item.style.marginRight = this.options.marginRight + "px" : ''; }
            getAllItemsWidth() { return (parseInt(this.$items[0].style.minWidth) + this.options.marginRight) * this.$items.length; }

            getWrapperTranslateX() {
                var currentPosition = this.$wrapper.style.transform;
                var regex = /[+-]?\d+(?:\.\d+)?/g;
                var matches_array = currentPosition.match(regex);
                return Number(matches_array[1]);
            }
            setWrapperTranslateX(pos) {
                this.$wrapper.style.transform = 'translate3d(' + pos + 'px, 0px, 0px)';
            }


            /**
             * Slider move controllers
             */
            moveToSection (id) { this.setWrapperTranslateX(this.sections.positions[id]); }

            moveItemsToLeft () {
                if (this.sections.currentSection > 0 && this.sections.currentSection !== -0) {
                    this.sections.currentSection--;
                } else this.sections.currentSection = this.sections.count - 1;

                this.moveToSection(this.sections.currentSection);
            }
            moveItemsToRight() {
                this.sections.currentSection++;
                this.sections.currentSection < this.sections.count ? this.sections.currentSection = this.sections.currentSection : this.sections.currentSection = 0;
                this.moveToSection(this.sections.currentSection);
            }


            /**
             * Navigation controller
             */
            onClickNavigation () {
                if(this.options.navigation) {
                    if (this.options.navigation.prev.length && this.options.navigation.next.length) {

                        var that = this;
                        console.log(this.options.navigation);
                        // this.options.navigation.prev[0].addEventListener('click', () => that.moveItemsToLeft());
                        this.options.navigation.prev[0] 
                            ?
                                this.options.navigation.prev[0].addEventListener('click', () => that.moveItemsToLeft())
                            :
                                this.navPrev.addEventListener('click', () => that.moveItemsToLeft());

                        this.options.navigation.next[0].addEventListener('click', () => that.moveItemsToRight());

                    } else {
                        this.error('navError');
                    }
                }
            }


            /**
             * Mouse Controller
             */
            setMouseDirection(pos) { Math.sign(pos) == -1 ? this.mouse.position.direction = "left" : this.mouse.position.direction = "right"; }
            getMouseDirection() { return this.mouse.position.direction; }
            getMousePos(e) { return e.screenX; }
            getMousePosInArea(currentPosition) {
                var calcPos = currentPosition - this.mouse.position.start;
                var thisPos = this.mouse.position.wrapperStart + calcPos;
                this.mouse.position.inArea = calcPos;

                this.setMouseDirection(this.mouse.position.inArea);
                console.log(this.getMouseDirection());
                
                return thisPos;
            }
            
            onMouseMove(event) {
                var newPos = this.getMousePosInArea(this.getMousePos(event));
                this.setWrapperTranslateX(newPos);
            }
            mouseInit() {

                this.$container.addEventListener('mousedown', (e) => {
                    this.mouse.position.start = this.getMousePos(e);
                    this.mouse.position.wrapperStart = this.getWrapperTranslateX();
                    this.clearTransitionSpeed();
                    document.addEventListener("mousemove", moveHandler);

                    this.stopAutoPlay();
                });

                this.$container.addEventListener('mouseup', (e) => {
                    this.setTransitionSpeed();
                    document.removeEventListener("mousemove", moveHandler);
                    this.mouse.position.start = 0;
                    this.mouse.position.wrapperStart = 0;

                    this.mouseRerfeshSlider();
                    
                });
                
                document.addEventListener('mouseup', (e) => {
                    this.setTransitionSpeed();
                    document.removeEventListener("mousemove", moveHandler);
                    this.mouse.position.start = 0;
                    this.mouse.position.wrapperStart = 0;

                    this.mouseRerfeshSlider();
                });

                var moveHandler = (e) => { this.onMouseMove(e); };
            }
            mouseRerfeshSlider() {

                for (var i = 0; i < this.sections.positions.length; i++) {
                    if (this.findClosestSection(this.getWrapperTranslateX()) == this.sections.positions[i]) this.sections.currentSection = i;
                }
                this.setWrapperTranslateX(this.findClosestSection(this.getWrapperTranslateX()));

                this.continueAutoPlay();
            }
            stopAutoPlay() { if (this.autoplay.interval) clearInterval(this.autoplay.interval), this.autoplay.interval = null; }
            continueAutoPlay() {
                if (this.autoplay.status) {
                    if (this.autoplay.interval == null) {
                        this.autoplay.interval = setInterval(() => {
                            this.moveItemsToRight();
                        }, this.autoplay.delay);
                    }
                }
            }






            /**
             * Helpers
             */
            getOneSectionSize() {
                const countTotalAreas = this.$items.length / this.options.items;
                const oneAreaSize = this.getAllItemsWidth() / countTotalAreas;
                console.log(this.getAllItemsWidth());
                return oneAreaSize;
            }
            getSectionsCount() { return this.sections.positions.length; }
            calcSections () {
                var sections = [];
                var per = false;
                this.options.slideGroup == true ? per = this.getOneSectionSize() : per = this.getItemWidth();


                var lastSectionPos = this.getAllItemsWidth() - (this.getItemWidth() * this.options.items);
                lastSectionPos = lastSectionPos * (-1);
                
                for (var i = 0; i <= this.getAllItemsWidth(); i++ ) {
                    if (i % per === 0 ) {
                        var lastSection = lastSectionPos * (-1);
                        if(i > lastSection) break;
                        sections.push(i * (-1));
                    }
                }

                return sections;
            }
            findClosestSection (wrapperPos) {
                
                function findTheClosest(arr, base) {
                    var arrLen = arr.length;
                    var theClosest = Infinity;
                    var i, temp, arrElement;

                    for (i = 0; i < arrLen; i++) {

                        temp = Math.abs(arr[i] - base);

                        if (temp < theClosest) {

                            theClosest = temp;
                            arrElement = arr[i];
                        };
                    };

                    return arrElement;
                };
                return findTheClosest(this.sections.positions, wrapperPos);
            }
            sumItemsWidth() { return this.calcItemWidth() * this.$items.length; }
            
            isMargin() {
                if (this.options.marginRight && this.options.marginRight != 0 && this.options.marginRight > 0) return true;
                return false;
            }

            isItems() {
                return  this.options.items == undefined ||
                        this.options.items == NaN ||
                        this.options.items == 0 ||
                        Math.sign(this.options.items) == -1 ||
                        typeof this.options.items == 'string';
            }

            clearTransitionSpeed() { this.$wrapper.style.transition = '0ms ease-in-out'; }

            setTransitionSpeed() { this.$wrapper.style.transition = this.options.speed + 'ms ease-in-out'; }

            error(id)   { console.error(this.msg[id]); }

            warn(id)    { console.warn(this.msg[id]); }





            init() {
                this.setItemsWidth();

                // set default params
                this.setDefaultParams();

                if (this.autoplay.status) {
                    this.autoplay.interval = setInterval(() => {
                        this.moveItemsToRight();
                    }, this.autoplay.delay);
                }

                
                this.options.mouseControll == true ? this.mouseInit() : '';
            }
            setDefaultParams() {
                this.sections.positions = this.calcSections();
                this.sections.count = this.sections.positions.length;
                
                // set default wrapper position
                
                this.$wrapper.style.transform = 'translate3d(0px, 0px, 0px)';


                if(this.options.navigation == undefined) {
                    var newNav = document.createElement('div');
                    newNav.classList.add('v__nav-wrapper');
                    newNav.innerHTML = '<div class="v__btn-prev"></div><div class="v__btn-next"></div>';
                    
                    this.$container.append(newNav);
                    this.options.navigation = {
                        prev: newNav.querySelectorAll('.v__btn-prev'),
                        next: newNav.querySelectorAll('.v__btn-next')
                    }
                } else {
                    this.options.navigation.prev = document.querySelectorAll(this.options.navigation.prev);
                    this.options.navigation.next = document.querySelectorAll(this.options.navigation.next);
                }

                // Set event siltener to navigation
                this.onClickNavigation();
            }
        }


        var newSlider = new vSliderConstructor(containerClassName, options);
        newSlider.init();
    }
    window.vSlider = vSlider;
})();
