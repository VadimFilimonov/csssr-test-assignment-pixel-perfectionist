let textarea;

const addAutoResize = () => {
	document.querySelectorAll('[data-autoresize]').forEach((element) => {
		const offset = element.offsetHeight - element.clientHeight;

		element.addEventListener('input', ({target}) => {
			target.style.height = 'auto';
			target.style.height = `${target.scrollHeight + offset}px`;
		});
		element.removeAttribute('data-autoresize');
	});
};

const findElements = () => {
	textarea = document.querySelector('.js-textarea');
};

const subscribe = () => {
	textarea.addEventListener('input', addAutoResize);
};

export default () => {
	findElements();
	subscribe();
};
