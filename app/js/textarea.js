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

const textarea = document.querySelector('.js-textarea');

textarea.addEventListener('input', addAutoResize);
