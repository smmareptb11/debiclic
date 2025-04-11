export function validateConfig(config) {
	const errors = []

	if (!config || typeof config !== 'object') {
		errors.push('Configuration invalide : doit être un objet.')
		return { valid: false, errors }
	}

	// Vérification du champ obligatoire : codeStations
	if (!Array.isArray(config.codeStations) || config.codeStations.length === 0) {
		errors.push('Le champ "codeStations" est requis et doit être un tableau non vide.')
	}

	// Vérification de stationsLabels
	if (config.stationsLabels !== undefined) {
		if (typeof config.stationsLabels !== 'object') {
			errors.push('"stationsLabels" doit être un objet associatif.')
		} else if (Array.isArray(config.codeStations)) {
			const unknownKeys = Object.keys(config.stationsLabels).filter(
				(key) => !config.codeStations.includes(key)
			)
			if (unknownKeys.length > 0) {
				errors.push(`"stationsLabels" contient des clés inconnues : ${unknownKeys.join(', ')}`)
			}
		}
	}

	// Vérification des couleurs
	if (config.colors && typeof config.colors !== 'object') {
		errors.push('"colors" doit être un objet avec les clés station, selectedStation, Q, H.')
	}

	// Valeurs acceptées pour grandeur
	const validGrandeurValues = ['Q', 'H', 'Q,H', 'H,Q']
	if (config.grandeurHydro === undefined) {
		config.grandeurHydro = 'Q,H' // valeur par défaut
	} else if (!validGrandeurValues.includes(config.grandeurHydro)) {
		errors.push('"grandeurHydro" doit être "Q", "H", "Q,H" ou "H,Q".')
	}

	// Vérification des jours
	if (config.days !== undefined && (typeof config.days !== 'number' || config.days < 1 || config.days > 30)) {
		errors.push('"days" doit être un nombre entre 1 et 30.')
	}

	// Tri
	if (config.order && !['asc', 'desc', 'default'].includes(config.order)) {
		errors.push('"order" doit être "asc", "desc" ou "default".')
	}

	// Carte affichée
	if (config.showMap !== undefined && typeof config.showMap !== 'boolean') {
		errors.push('"showMap" doit être un booléen.')
	}

	// Dimensions
	if (config.width && typeof config.width !== 'string' && typeof config.width !== 'number') {
		errors.push('"width" doit être une chaîne ou un nombre.')
	}
	if (config.height && typeof config.height !== 'string' && typeof config.height !== 'number') {
		errors.push('"height" doit être une chaîne ou un nombre.')
	}

	// Container
	if (config.container && typeof config.container !== 'string' && !(config.container instanceof HTMLElement)) {
		errors.push('"container" doit être un sélecteur CSS (string) ou un élément HTML.')
	}

	return {
		valid: errors.length === 0,
		errors
	}
}
