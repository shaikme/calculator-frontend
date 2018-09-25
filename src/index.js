(function(doc) {
	const input = doc.querySelector('.calculator__input');
	const button = doc.querySelector('.calculator__button');
	const messageBox = doc.querySelector('.calculator__messageBox');
	const resultBox = doc.querySelector('.calculator__result');
	const defaultValue = {
		input: '',
		value: ''
	};
	const errorMessage = observableValue('');
	const resultValue = observableValue(defaultValue);
	const loadingFlag = observableValue(false);

	doc.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') submitHandler(resultValue, errorMessage);
	});
	button.addEventListener('click', submitHandler.bind(null, resultValue, errorMessage));
	input.addEventListener('input', () => {
		if (resultValue().value !== '') resultValue(defaultValue);
		if (errorMessage()) errorMessage(null);
	});

	errorMessage.subscribe(message => {
		messageBox.textContent = message;
	});

	resultValue.subscribe(data => {
		resultBox.textContent = '= ' + data.value
	});

	loadingFlag.subscribe(value => button.setAttribute('disabled', value));

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
		if (input.value === '' || input.value === resultValue().input
		|| loadingFlag() || errorMessage()) return;
		let base64String;


		try {
			base64String = window.btoa(input.value)
		} catch(e) {
			return errorMessage('invalid expression');
		}

		loadingFlag(true);
		fetch(`https://calc-server-fyunjxifjr.now.sh/calculus?query=${window.encodeURI(base64String)}`)
			.then(response => response.json().then((json) => response.ok ? json : Promise.reject(json)))
			.then(response => {
				resultValue({
					input: input.value,
					value: response.result
				});
				loadingFlag(false);
			})
			.catch(error => {
				errorMessage(error.message ? error.message : 'something went wrong');
				loadingFlag(false);
			})
	}
})(document)