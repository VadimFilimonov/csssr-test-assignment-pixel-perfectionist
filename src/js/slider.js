var sliderItems = document.querySelectorAll('.slider__item');

var removeActiveClassOfsliderItems = function() {
    for (var i = 0; i < sliderItems.length; i++) {
        var sliderItem = sliderItems[i];
        sliderItem.classList.remove('slider__item--active');
    }  
}

var clicksliderItems = function(element) {
    element.addEventListener('click', function() {
        removeActiveClassOfsliderItems();
        element.classList.add('slider__item--active');
    });
}

for (var i = 0; i < sliderItems.length; i++) {
    var sliderItem = sliderItems[i];
    clicksliderItems(sliderItem);
}