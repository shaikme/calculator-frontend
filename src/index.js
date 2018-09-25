(function(doc) {
	const input = doc.querySelector('.calculator__input');
	const button = doc.querySelector('.calculator__button');
	const messageBox = doc.querySelector('.calculator__messageBox');
	const resultBox = doc.querySelector('.calculator__result');
	const errorMessage = observableValue(null);
	const resultValue = observableValue(null);

	doc.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') submitHandler(resultValue, errorMessage);
	});
	button.addEventListener('click', submitHandler.bind(null, resultValue, errorMessage));
	input.addEventListener('input', () => {
		if (resultValue() !== '') resultValue('');
		if (errorMessage()) errorMessage('');
	});

	errorMessage.subscribe(message => {
		messageBox.textContent = message;
	});

	resultValue.subscribe(value => {
		resultBox.textContent = '= ' + value
	});

	function observableValue(value) {
		const listeners = [];

		const emitter = (newValue) => {
			listeners.forEach((listener) => { listener(newValue); });
		}

		const valueHandler = (...arg) => {
			if (arg.length) {
				value = arg[0];
				emitter(value);
			}
			return value;
		}

		valueHandler.subscribe = (listener) => { listeners.push(listener); };

		return valueHandler;
	}

	function submitHandler(resultValue, errorMessage) {
		if (input.value !== '') {
			fetch(`https://calc-server-xhelzbygxu.now.sh/calculus?query=${encodeURIComponent(input.value)}`)
				.then(response => response.json().then((json) => response.ok ? json : Promise.reject(json)))
				.then(response => { resultValue(response.result); })
				.catch(error => { errorMessage(error.message ? error.message : 'something went wrong'); })
		}
	}
})(document)