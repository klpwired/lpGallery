/**
 *
 * @param data
 * @constructor
 */
var Gallery = function (data) {
    this.limit = data.limit || 3;
    this.postId = data.postId;
    this.cnt = 0;
    this.status = false;
    this.callbackLeft = null;
    this.callbackRight = null;
    this.lastId = false;
    this.firstId = false;
    this.current = false;
    this.linkedList = null;
    this.thumbs = $('.post_thumbnail img, .content_wrapper img');
    var _this = this;

    $(document).on('click', '.lpDynamicGallery .close', function () {
        _this.close();
    });

    $(document).keydown(function(e){
        if(_this.status){
            switch(e.keyCode){
                case 37: _this.prev(); break;
                case 39: _this.next(); break;
                case 27: _this.close(); break;
            }
        }
    });

    $(document).on('click', '.lpDynamicGallery #prev', function () {
        _this.prev();
    });

    $(document).on('click', '.lpDynamicGallery #next', function () {
        _this.next();
    });

    this.init();
};

Gallery.prototype.init = function () {
    var _this = this;
    $.ajax({
        url: 'gallery/getimages',
        method: 'POST',
        data: {
            limit: _this.limit,
            postId: _this.postId
        },
        success: function (data) {
            data.sort(function(a,b){
                return b.post_id - a.post_id;
            });

            var j = 0, list = [];
            _this.firstId = data[0].post_id;
            _this.lastId = data[data.length-1].post_id;
            _this.callbackLeft = data[1].post_id;
            _this.callbackRight = data[data.length-2].post_id;

            for (var id in data) {
                var images = data[id].postsImages;
                var postId = data[id].post_id;
                for(var imageId in images){
                    var image = images[imageId];
                    var item = {
                        id: _this.cnt,
                        src: image.image_original,
                        title: image.title,
                        link: data[id].link
                    };
                    if(postId == _this.callbackLeft){
                        item.callbackLeft = _this.addPrev;
                        _this.callbackLeft = null;
                    }
                    if(postId == _this.callbackRight){
                        item.callbackRight = _this.addNext;
                        _this.callbackRight = null;
                    }
                    if(postId == _this.postId){
                        $(_this.thumbs[j++]).attr('data-id', _this.cnt);
                    }

                    list.push(item);

                    _this.cnt++;
                }
            }

            _this.linkedList = new LinkedList(list);

            $(document).on('click', '.post_thumbnail img, .content_wrapper img', function(){
                var id = $(this).data('id');
                var slide = _this.linkedList.getNodeById(id).data;
                _this.open(slide, _this);
            });

        }
    });
};

Gallery.prototype.prev = function () {
    var prev = this.linkedList.getPrev().data;
    this.setSlide(prev);
    if(typeof prev.callbackLeft != "undefined"){
        prev.callbackLeft.call(this);
    }
};

Gallery.prototype.next = function () {
    var next = this.linkedList.getNext().data;
    this.setSlide(next);
    if(typeof next.callbackRight != "undefined"){
        next.callbackRight.call(this);
    }
};

Gallery.prototype.addPrev = function (){
    this.linkedList.iterate(this.removeCallbackLeft);
    var _this = this;
    $.ajax({
        url: 'gallery/getprevimages',
        method: 'POST',
        dataType: 'json',
        data: {
            limit: _this.limit,
            postId: _this.firstId
        },
        success: function (data) {
            var list = [];
            _this.callbackLeft = data[data.length-2].post_id;
            _this.firstId = data[data.length-1].post_id;

            for (var id in data) {
                var images = data[id].postsImages;
                var postId = data[id].post_id;
                for(var imageId in images){
                    var image = images[imageId];
                    var item = {
                        id: _this.cnt,
                        src: image.image_original,
                        title: image.title,
                        link: data[id].link
                    };

                    if(postId == _this.callbackLeft){
                        item.callbackLeft = _this.addPrev;
                        _this.callbackLeft = null;
                    }

                    list.push(item);

                    _this.cnt++;
                }
            }

            _this.linkedList.addBefore(list);
        }
    });
};

Gallery.prototype.addNext = function (){
    this.linkedList.iterate(this.removeCallbackRight);
    var _this = this;
    $.ajax({
        url: 'gallery/getnextimages',
        method: 'POST',
        dataType: 'json',
        data: {
            limit: _this.limit,
            postId: _this.lastId
        },
        success: function (data) {
            var list = [];
            _this.callbackRight = data[data.length-2].post_id;
            _this.lastId = data[data.length-1].post_id;

            for (var id in data) {
                var images = data[id].postsImages;
                var postId = data[id].post_id;
                for(var imageId in images){
                    var image = images[imageId];
                    var item = {
                        id: _this.cnt,
                        src: image.image_original,
                        title: image.title,
                        link: data[id].link
                    };

                    if(postId == _this.callbackRight){
                        item.callbackRight = _this.addNext;
                        _this.callbackRight = null;
                    }

                    list.push(item);

                    _this.cnt++;
                }
            }

            _this.linkedList.addAfter(list);
        }
    });
};

Gallery.prototype.removeCallbackLeft = function(node){
    delete node.data.callbackLeft;
};

Gallery.prototype.removeCallbackRight = function(node){
    delete node.data.callbackRight;
};

Gallery.prototype.setSlide = function(slide){
    $('.lpDynamicGallery .title a').prop({
        href: slide.link,
        text: slide.title
    });
    $('.lpDynamicGallery .images .wrapper img').attr({
        src: slide.src,
        alt: slide.title
    });
};

Gallery.prototype.open = function (slide, _this) {
    _this.setSlide(slide);
    _this.status = true;
    $('.lpDynamicGallery').fadeIn('slow');
};

Gallery.prototype.close = function () {
    this.status = false;
    $('.lpDynamicGallery').fadeOut('slow');
};

var LinkedList = function(data){
    this.current = false;

    if (typeof data != "undefined"){
        var keys = Object.keys(data);
        if(keys.length > 0){
            var newData = this.addFirst(data);

            for(var id in newData) {
                var current = this.current;
                this.current.next = new Node(data[id]);
                this.current = this.current.next;
                this.current.prev = current;
            }
            this.current.next = null;
        }
    }
};

LinkedList.prototype.getNodeById = function(id){
    var current = this.getFirst();
    while(current.data.id != id){
        current = current.next;
    }
    this.current = current;
    return current;
};

LinkedList.prototype.toBegin = function(){
    while(this.prev()){}
};

LinkedList.prototype.toEnd = function(){
    while(this.next()){}
};

LinkedList.prototype.getFirst = function () {
    var current = this.current;
    while(current.prev !== null){
        current = current.prev;
    }
    return current;
};

LinkedList.prototype.getLast = function () {
    var current = this.current;
    while(current.next !== null){
        current = current.next;
    }
    return current;

};

LinkedList.prototype.print = function(){
    var i = 0, current = this.getFirst();
    while(current !== null){
        console.log(i++, current);
        current = current.next;
    }
};

LinkedList.prototype.getPrev = function () {
    if(this.current.prev !== null){
        return this.current = this.current.prev;
    }
    return false;
};

LinkedList.prototype.prev = function(){
    if(this.current.prev !== null){
        this.current = this.current.prev;
        return true;
    }
    return false;
};

LinkedList.prototype.getNext = function () {
    if(this.current.next !== null){
        return this.current = this.current.next;
    }
    return false;
};

LinkedList.prototype.next = function(){
    if(this.current.next !== null){
        this.current = this.current.next;
        return true;
    }
    return false;
};

LinkedList.prototype.isEmpty = function () {
    return this.current != false;
};

LinkedList.prototype.addBefore = function (data) {

    var current = this.getFirst();
    for(var id in data){
        var next = current;
        current.prev = new Node(data[id]);
        current = current.prev;
        current.next = next;
    }
    current.prev = null;
};

LinkedList.prototype.addAfter = function (data) {

    var current = this.getLast();
    for(var id in data){
        var prev = current;
        current.next = new Node(data[id]);
        current = current.next;
        current.prev = prev;
    }
    current.next = null;
};

LinkedList.prototype.addFirst = function (data) {

    this.current = new Node(data.shift());
    this.current.prev = null;
    this.current.next = null;
    return data;
};

LinkedList.prototype.iterate = function(callback){
    var current = this.getFirst();
    while(current.next != null){
        callback(current);
        current = current.next;
    }
};

var Node = function (data) {
    this.data = false;
    this.next = null;
    this.prev = null;
    this.data = data;
};