export default class Imaginator{
    /**
     * @static
     * @method
     * @param {object} data.image - Image
     * @param {int} data.width - Container width
     * @param {int} data.height - Container height
     * @param {beforeResize} data.beforeResize - called before resize
     * @param {afterResize} data.afterResize - called after resize
     * @description resize image to window
     */
    static resize(data) {
        let image = data.image,
            width = data.width,
            height = data.height,
            beforeResize = data.beforeResize,
            afterResize = data.afterResize;

        beforeResize();

        if(image.attr('src') == '') return;
        let newImg = new Image();
        newImg.src = image.attr('src');

        newImg.onload = function() {
            let heightPhoto = newImg.height;
            let widthPhoto = newImg.width;
            let left;
            if(heightPhoto < height && widthPhoto < width){
                width = widthPhoto;
                height = heightPhoto;
                left = 0;
            }else{
                let newWidth = widthPhoto/(heightPhoto/height);
                let newHeight = heightPhoto/(widthPhoto/width);

                width = newWidth > width ? width : newWidth;
                height = newHeight > height ? height : newHeight;
                left = newWidth > width ? 0 : -(newWidth-width)/2;
            }

            image.css({
                "height": height,
                'width': width,
                'left': left,
                'position': 'relative',
                'display': 'block'
            });

            afterResize();
        }
    }
};
