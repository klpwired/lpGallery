import LinkedList from './LinkedList';
import Imaginator from './Imaginator';

export default class DynamicGallery {

    /**
     * @constructor
     * @param {int} data.items[].id - id of item
     * @param {string} data.items[].src - src of Img
     * @param {string} data.items[].title - title of Img
     * @param {string} data.items[].link - link above the Img
     * @param {string} data.imgFolder - overwrite default Images folder
     * @param {string} data.thumbs - selectors of your thumbnails. Example: '.post_thumbnail img, .content_wrapper img'
     */
    constructor(data){
        let items = (typeof data.items == "undefined" && typeof data.thumbs != "undefined") ? this.initFromDom(data.thumbs) : data.items;
        this.thumbs = data.thumbs;
        this.linkedList = new LinkedList(items);
        this.imgFolder = data.imgFolder || "images";
        this.loading = false;
        this.status = false;
        this.slide_prev = true;
        this.slide_next = true;
        this.callbackLeft = null;
        this.callbackRight = null;
        this.wrapperLoader = $('<img>', {
            src: this.imgFolder + "/loading.gif",
            alt: "loading..",
            class: "wrapperLoader" }
        );

        // bind close event
        $(document).on('click', '.lpDynamicGallery .close', () => {
            this.close();
        });

        // bind prev event
        $(document).on('click', '.lpDynamicGallery #prev:not(load)', () => {
            this.prev();
        });

        // bind next event
        $(document).on('click', '.lpDynamicGallery #next:not(load)', () => {
            this.next();
        });

        // bind open event
        $(document).on('click', this.thumbs, (event) => {
            let id = event.target.dataset.id;
            let slide = this.linkedList.getNodeById(id).data;
            this.open(slide);
        });

        // bind keyboard buttons to navigate gallery
        $(document).keydown((e) => {
            if(this.status){
                switch(e.keyCode){
                    case 37: this.prev(); break;
                    case 39: this.next(); break;
                    case 27: this.close(); break;
                }
            }
        });
    }

    /**
     *
     * @param {string} thumbs
     * @return {object[]}
     * @description initialize gallery from DOM
     */
    initFromDom(thumbs){
        let list = [];

        $.each($(thumbs), function(id, thumb){
            thumb.dataset.id = id;
            thumb.style.cursor = 'pointer';

            list.push({
                id: id,
                src: $(thumb).attr('src'),
                title: $(thumb).attr('title'),
                link: $(thumb).data('href')
            });
        });

        return list;
    }

    /**
     * @method
     * @param {object[]} list - array of objects
     * @param {string} list[].src - src of Img
     * @param {string} list[].title - title of Img
     * @param {string} list[].link - link above the Img
     * @description removing previous left callback, prepend objects to linked list
     */
    prepend(list){
        this.linkedList.iterate(this.removeCallbackLeft); // removing previous left callback
        this.linkedList.addBefore(list); // prepend photos to linked list
    }

    /**
     * @method
     * @param {object[]} list - array of objects
     * @param {string} list[].src - src of Img
     * @param {string} list[].title - title of Img
     * @param {string} list[].link - link above the Img
     * @description removing previous right callback, append objects to linked list
     */
    append(list){
        this.linkedList.iterate(this.removeCallbackRight); // removing previous right callback
        this.linkedList.addAfter(list); // append photos to linked list
    }

    /**
     * @method
     * @param {string} direction - could be 'prev' or 'next'
     * @description toggle loader
     */
    toggleLoader(direction){
        let selector = '#'+direction;
        $(selector).toggleClass('load');
        this.loading = !this.loading;
        if(!$(selector).hasClass('load')){
            this['slide_' + direction] = true;
        }
    }

    /**
     * @method
     * @param {string} direction - could be 'prev' or 'next'
     * @description hide arrow in case of given direction
     */
    hideArrow(direction){
        let selector = '#'+direction;
        $(selector).stop().fadeOut('slow');
        this['slide_' + direction] = false;
    }

    /**
     * @method
     * @param {string} direction - could be 'prev' or 'next'
     * @description show arrow in case of given direction
     */
    showArrow(direction){
        let selector = '#'+direction;
        $(selector).stop().fadeIn('slow');
        this['slide_' + direction] = true;
    }

    /**
     * @method
     * @description change photo to previous one, call callback function, if needed
     */
    prev() {
        if(this.slide_prev){
            // get previous object from list
            let prev = this.linkedList.getPrev().data;
            // set slide
            this.setSlide(prev);
            // call callback if needed
            if(typeof prev.callbackLeft != "undefined") prev.callbackLeft.call(this);
            // hide arrow if no more left slides and no loading
            if(!this.linkedList.hasPrev() && !this.loading) this.hideArrow('prev');
            if(!this.slide_next) this.showArrow('next');
        }
    }

    /**
     * @method
     * @description change photo to next one, call callback function, if needed
     */
    next() {
        if(this.slide_next){
            // get next object from list
            let next = this.linkedList.getNext().data;
            // set slide
            this.setSlide(next);
            // call callback if needed
            if(typeof next.callbackRight != "undefined") next.callbackRight();
            // hide arrow if no more left slides and no loading
            if(!this.linkedList.hasNext() && !this.loading) this.hideArrow('next');
            if(!this.slide_prev) this.showArrow('prev');
        }
    }

    /**
     * @callback removeCallbackLeft
     * @param {Node} node - instance of Node object
     * @description remove left callback from Node.data object
     */
    removeCallbackLeft(node){
        delete node.data.callbackLeft;
    }

    /**
     * @callback removeCallbackLeft
     * @param {Node} node - instance of Node object
     * @description remove right callback from Node.data object
     */
    removeCallbackRight(node){
        delete node.data.callbackRight;
    };

    /**
     * @method
     * @param {Node.data} slide
     * @description set the slide, resize it to the window
     */
    setSlide(slide){
        let imageContainer = $('.imagesContainer'),
            wrapper = $('.lpDynamicGallery .wrapper'),
            image = $('.lpDynamicGallery .images .wrapper img'),
            title = $('.lpDynamicGallery .title');

        // set link
        $('.lpDynamicGallery .title a').prop({
            href: slide.link || "",
            text: slide.title || ""
        });

        // set image
        image.attr({
            src: slide.src,
            alt: slide.title
        });

        // resize slide
        Imaginator.resize({
            image: image,
            width: imageContainer.width(),
            height: imageContainer.height() - title.height(),

            /**
             * @callback beforeResize
             */
            beforeResize: () => {
                return function(){
                    wrapper.hide();
                    imageContainer.append(this.wrapperLoader);
                }
            },

            /**
             * @callback afterResize
             */
            afterResize: () => {
                return function(){
                    imageContainer.find(this.wrapperLoader).remove();
                    wrapper.show();
                }
            }
        });

    }

    /**
     * @param {Node.data} slide
     * @description open gallery with passed slide
     */
    open(slide) {
        $('body').css('overflow-y', 'hidden');
        this.status = true;

        $('.lpDynamicGallery').fadeIn('fast');

        $('#prev').css('display', this.slide_prev ? "" : "none");
        $('#next').css('display', this.slide_next ? "" : "none");

        this.setSlide(slide);
    }

    /**
     * @method
     * @description close gallery
     */
    close() {
        this.status = false;
        $('.lpDynamicGallery').fadeOut('fast');
        this.showArrow('prev');
        this.showArrow('next');
        $('body').css('overflow-y', 'auto');
    };

}