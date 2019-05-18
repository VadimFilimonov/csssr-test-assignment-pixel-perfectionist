var range = document.querySelector('.slider__range');
var sliderItems = document.querySelectorAll('.slider__item');

range.addEventListener('input', function(evt) {
    if (range.value > 0 && range.value < 38) {
        document.querySelector('.slider__item:nth-child(1) input').checked = true;
    } else if (range.value >= 38 && range.value < 99) {
        document.querySelector('.slider__item:nth-child(2) input').checked = true;
    } if (range.value >= 99 && range.value < 165) {
        document.querySelector('.slider__item:nth-child(3) input').checked = true;
    } else if (range.value >= 165) {
        document.querySelector('.slider__item:nth-child(4) input').checked = true;
    }
});

var clickSliderItem = function(element) {
    element.addEventListener('click', function() {
        var position = element.querySelector('input').getAttribute('data-position');
        range.value = position;
    });
}

for (var i = 0; i < sliderItems.length; i++) {
    var sliderItem = sliderItems[i];
    clickSliderItem(sliderItem);
}

