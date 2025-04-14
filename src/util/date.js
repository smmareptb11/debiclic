export function fullDateFormatter(stringDate) {
	return new Intl.DateTimeFormat('fr-FR', {
		dateStyle: 'long'
	}).format(new Date(stringDate))
}

export function fullDateTimeFormatter(stringDate) {
	return new Intl.DateTimeFormat('fr-FR', {
		dateStyle: 'short',
		timeStyle: 'medium'
	}).format(new Date(stringDate))
}

export function shortDateTimeFormatter(stringDate) {
	return new Intl.DateTimeFormat('fr-FR', {
		dateStyle: 'short'
	}).format(new Date(stringDate))
}

export function subtractDays(days, endDate = new Date()) {
	const refDate = new Date(endDate.toISOString())
	refDate.setDate(refDate.getDate() - days)
	return refDate
}

export function getShortIsoString(date) {
	return date.toISOString().split('T')[0]
}