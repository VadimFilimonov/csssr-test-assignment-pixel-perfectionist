export default () => {
	const textarea = document.querySelector('textarea');

	const update = () => {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	textarea.addEventListener('input', update);
	update();
};
