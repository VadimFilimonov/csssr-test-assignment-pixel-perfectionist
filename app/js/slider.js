let range;

let slides;

const findElements = () => {
	range = document.querySelector('.slider__range');
	slides = [].slice.call(document.querySelectorAll('.slider__item'))
		.map((slide) => slide.querySelector('input'));
};

const isFirst = () => range.value >= 0 && range.value < 38;
const isSecond = () => range.value >= 38 && range.value < 99;
const isThird = () => range.value >= 99 && range.value < 165;
const isFourh = () => range.value >= 165;

const onSlideInput = ({currentTarget}) => {
	range.value = currentTarget.value;
};

const onRangeInput = () => {
	if (isFirst()) {
		slides[0].checked = true;
	} else if (isSecond()) {
		slides[1].checked = true;
	} else if (isThird()) {
		slides[2].checked = true;
	} else if (isFourh()) {
		slides[3].checked = true;
	}
};

const subscribe = () => {
	range.addEventListener('input', onRangeInput);
	slides.forEach((slide) => slide.addEventListener('input', onSlideInput));
};

export default () => {
	findElements();
	subscribe();
};
