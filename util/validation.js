const isEmpty = input => (input === '' ? 'Empty Inputs not Allowed'.red : true)

const isValidNumber = (input, constraints) => {
	if (constraints) {
		const test = input ? input : ''
		if (!constraints.nullable && test === 'null') return 'Value Can\'t Be a null'.red
		if (constraints.nullable && test === 'null') return true 
			if (!test.toString().match(/-?[0-9]+/)) return 'Input Is Not a Number'.red
		const checkResult = checkValueRangeConstraints(+test, constraints)
			if (checkResult) return checkResult
	}
	return true
}

const isValidString = (input, constraints) => {
	if (constraints) {
		const test = input ? input : ''
		if (!constraints.nullable && test === 'null') return 'Value Can\'t Be a null'.red
		if (constraints.nullable && test === 'null') return true
			if (constraints.validContentRegex && !test.match(constraints.validContentRegex)) return 'Input Doesn\'t Match RegEx'.red
		const checkResult = checkValueRangeConstraints(test.length, constraints)
			if (checkResult) return checkResult
	}
	return true
}

const checkValueRangeConstraints = (value, constraints) => {
	if (constraints.valueRangeConstraints) {
		const inRange = constraints.valueRangeConstraints.some(item => {
			const min = item.minValue ? item.minValue <= value : true
			const max = item.maxValue ? item.maxValue >= value : true
			return min && max
		})
		if (!inRange) return 'Input is Outside Allowed Range'.red
	}
}

module.exports = { isEmpty, isValidNumber, isValidString, checkValueRangeConstraints}