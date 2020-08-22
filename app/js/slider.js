let range;

let slides;

const findElements = () => {
	range = document.querySelector('.slider__range');
	slides = document.querySelectorAll('.slider__item');
};

const isFirst = () => range.value > 0 && range.value < 38;
const isSecond = () => range.value >= 38 && range.value < 99;
const isThird = () => range.value >= 99 && range.value < 165;
const isFourh = () => range.value >= 165;

const onClick = (item) => {
	range.value = item.querySelector('input').dataset.position;
};

const onInput = () => {
	if (isFirst()) {
		slides[0].querySelector('input').checked = true;
	} else if (isSecond()) {
		slides[1].querySelector('input').checked = true;
	} if (isThird()) {
		slides[2].querySelector('input').checked = true;
	} else if (isFourh()) {
		slides[3].querySelector('input').checked = true;
	}
};

const subscribe = () => {
	range.addEventListener('input', onInput);
	slides.forEach((slide) => {
		slide.addEventListener('click', () => onClick(slide));
	});
};

export default () => {
	findElements();
	subscribe();
};

