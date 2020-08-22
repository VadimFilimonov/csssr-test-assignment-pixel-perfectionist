let form;

const findElements = () => {
	form = document.getElementById('form');
};

const subscribe = () => {
	form.addEventListener('submit', (event) => {
		event.preventDefault();
	});
};

export default function init() {
	findElements();
	subscribe();
}
