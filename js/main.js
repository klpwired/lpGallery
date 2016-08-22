/**
 * @constructor
 * @param {int} data.limit - Кол-во новостей, которое будет загружено в обе стороны
 * @param {int} data.postId - Id текущей новости
 * @param {string} data.thumbs - Селекторы с изображениями, пример: '.post_thumbnail img, .content_wrapper img'
 * @param {string} data.imgFolder - Путь к папке с изображениями, если она отличается от дефолтной
 */
var LpGallery = function(data){
    this.limit = data.limit || 3;
    this.postId = data.postId;
    this.thumbs = data.thumbs;
    this.imgFolder = data.imgFolder || '../images';
    this.cnt = 0;
    this.callPoint = 1;
    this.lastId = false;
    this.firstId = false;
    this.init();
};

/**
 * @method
 * @description Первая загрузка картинок, расстановка callback'ов, маппинг на превьюшки, вызов галлереи
 */
LpGallery.prototype.init = function(){
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
                return b.post_id - a.post_id; // сортируем пришедший массив по убыванию
            });

            var j = 0,
                list = [],
                noPrev,
                noNext;

            _this.firstId = data[0].post_id; // получаем id первой статьи из ответа
            _this.lastId = data[data.length-1].post_id; // получаем id последней статьи из ответа
            _this.callbackLeft = data[1].post_id; // запоминаем, в какой момент присвоить callback объекту с левой стороны
            _this.callbackRight = data[data.length-2].post_id; // запоминаем, в какой момент присвоить callback объекту с правой стороны
            noPrev = _this.postId == _this.firstId; // проверяем, не является ли наша статья первой на сайте
            noNext = _this.postId == _this.lastId; // проверяем, не является ли наша статья последней на сайте

            for (var id in data) {
                var images = data[id].postsImages;
                var postId = data[id].post_id;
                for(var imageId in images){
                    var image = images[imageId];
                    // собираем объект, который пойдет в галлерею
                    var item = {
                        id: _this.cnt,
                        src: image.image_original,
                        title: image.title,
                        link: data[id].link
                    };
                    if(postId == _this.callbackLeft && !noPrev){
                        // устанавливаем callback на объект
                        item.callbackLeft = (function(_this){
                            return function(){_this.addPrev.call(_this);}
                        })(_this);
                        _this.callbackLeft = null;
                    }
                    if(postId == _this.callbackRight && !noNext){
                        // устанавливаем callback на объект
                        item.callbackRight = (function(_this){
                            return function(){_this.addNext.call(_this);}
                        })(_this);
                    }
                    if(postId == _this.postId){
                        // мапим наши объекты на превьюшки
                        $($(_this.thumbs)[j++]).attr('data-id', _this.cnt).css('cursor', 'pointer');
                    }

                    list.push(item);

                    _this.cnt++;
                }
            }

            // вызываем галлерею, передавая необходимые параметры
            _this.gallery = new Gallery({
                items: list,
                slide_prev: !noPrev,
                slide_next: !noNext,
                thumbs: _this.thumbs,
                imgFolder: _this.imgFolder
            });
        }
    });
};

/**
 * @callback, функция которая загружает фото в начало галлереи
 */
LpGallery.prototype.addPrev = function (){
    var _this = this;
    $.ajax({
        url: 'gallery/getprevimages',
        method: 'POST',
        dataType: 'json',
        data: {
            limit: _this.limit,
            postId: _this.firstId
        },
        beforeSend: function(){
            // запрещаем мотать фото влево и ставим лоадер на картинку
            _this.gallery.toggleLoader('prev');
        },
        success: function (data) {
            if(data.length > 0){
                var list = [];
                // если пришло столько статей, сколько запросили - снова ставим callback
                if(_this.limit == data.length){
                    _this.callbackLeft = data[(data.length-1)-_this.callPoint].post_id;
                    _this.firstId = data[data.length-1].post_id;
                }

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
                            // присваиваем левый callback
                            item.callbackLeft = (function(_this){
                                return function(){_this.addPrev.call(_this);}
                            })(_this);
                            _this.callbackLeft = null;
                        }

                        list.push(item);

                        _this.cnt++;
                    }
                }
                _this.gallery.prepend(list); // добавляем в начало галлереи новые фото
                _this.gallery.toggleLoader('prev'); // разрешаем мотать фото влево и снимаем лоадер
            }
        }
    });
};

/**
 * @callback функция, которая загружает фото в конец галлереи
 */
LpGallery.prototype.addNext = function (){
    var _this = this;
    $.ajax({
        url: 'gallery/getnextimages',
        method: 'POST',
        dataType: 'json',
        data: {
            limit: _this.limit,
            postId: _this.lastId
        },
        beforeSend: function(){
            // запрещаем мотать фото вправо и ставим лоадер на картинку
            _this.gallery.toggleLoader('next');
        },
        success: function (data) {
            if(data.length > 0){
                var list = [];

                // если пришло столько статей, сколько запросили - снова ставим callback
                if(_this.limit == data.length){
                    _this.callbackRight = data[(data.length-1)-_this.callPoint].post_id;
                    _this.lastId = data[data.length-1].post_id;
                }

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
                            // присваиваем правый callback
                            item.callbackRight = (function(_this){
                                return function(){_this.addNext.call(_this);}
                            })(_this);
                            _this.callbackRight = null;
                        }

                        list.push(item);

                        _this.cnt++;
                    }
                }
                _this.gallery.append(list); // добавляем в конец галлереи фото
                _this.gallery.toggleLoader('next'); // разрешаем мотать фото вправо и снимаем лоадер
            }
        }
    });
};