let textarea;

function addAutoResize() {
	document.querySelectorAll('[data-autoresize]').forEach((element) => {
		element.style.boxSizing = 'border-box';
		const offset = element.offsetHeight - element.clientHeight;

		element.addEventListener('input', ({target}) => {
			target.style.height = 'auto';
			target.style.height = `${target.scrollHeight + offset}px`;
		});
		element.removeAttribute('data-autoresize');
	});
}

function findElements() {
	textarea = document.querySelector('.js-textarea');
}

function subscribe() {
	textarea.addEventListener('input', addAutoResize);
}

function init() {
	findElements();
	subscribe();
}

init();
