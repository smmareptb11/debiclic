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
		}
		else if (Array.isArray(config.codeStations)) {
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
		errors.push('"colors" doit être un objet avec les clés station et graph')
	}

	// Valeurs acceptées pour grandeur
	const validGrandeurValues = ['Q', 'H', 'QmnJ']
	if (config.grandeurHydro === undefined) {
		config.grandeurHydro = 'Q' // valeur par défaut
	}
	else if (!validGrandeurValues.includes(config.grandeurHydro)) {
		errors.push('"grandeurHydro" doit être "Q", "H", ou "QmnJ".')
	}

	// Vérification des jours
	if (config.days !== undefined && (typeof config.days !== 'number' || config.days < 1 || config.days > 30)) {
		errors.push('"days" doit être un nombre entre 1 et 30.')
	}

	// Tri
	if (config.sort && !['asc', 'desc', 'default'].includes(config.sort)) {
		errors.push('"sort" doit être "asc", "desc" ou "default".')
	}

	// Carte affichée
	if (config.showMap !== undefined && typeof config.showMap !== 'boolean') {
		errors.push('"showMap" doit être un booléen.')
	}

	// Vérification de mapWidth
	if (config.mapWidth !== undefined) {
		if (typeof config.mapWidth !== 'string' || !/^\d+(?:\.\d+)?(?:px|%)$/.test(config.mapWidth)) {
			errors.push('"mapWidth" doit être une chaîne se terminant par "%" ou "px", par exemple "50%" ou "200px".')
		}
	}

	// Dimensions
	if (config.width && typeof config.width !== 'string' && typeof config.width !== 'number') {
		errors.push('"width" doit être une chaîne ou un nombre.')
	}
	if (config.height && typeof config.height !== 'string' && typeof config.height !== 'number') {
		errors.push('"height" doit être une chaîne ou un nombre.')
	}

	// Container
	if (config.container && typeof config.container !== 'string') {
		errors.push('"container" doit être un sélecteur CSS (string).')
	}

	// Threshold mode
	if (config.thresholdType === undefined) {
		config.thresholdType = 'none' // valeur par défaut
	}
	else if (!['none', 'low-water', 'flood'].includes(config.thresholdType)) {
		errors.push('"thresholdType" doit être "none", "low-water" ou "flood".')
	}

	// Thresholds per station
	if (config.thresholds) {
		if (typeof config.thresholds !== 'object') {
			errors.push('"thresholds" doit être un objet.')
		}
		else {
			for (const stationCode in config.thresholds) {
				if (!config.codeStations.includes(stationCode)) {
					errors.push(`"thresholds" contient une clé de station inconnue : ${stationCode}`)
				}
				else {
					const thresholds = config.thresholds[stationCode]
					if (!Array.isArray(thresholds)) {
						errors.push(`Les thresholds pour la station ${stationCode} doivent être un tableau.`)
					}
					else {
						thresholds.forEach((th, index) => {
							if (typeof th !== 'object' || th === null) {
								errors.push(`Le threshold à l'index ${index} pour la station ${stationCode} doit être un objet.`)
								return
							}
							if (typeof th.label !== 'string') {
								errors.push(`Le threshold à l'index ${index} pour la station ${stationCode} doit avoir un "label" (chaîne).`)
							}
							if (typeof th.value !== 'number') {
								errors.push(`Le threshold à l'index ${index} pour la station ${stationCode} doit avoir une "value" (nombre).`)
							}
							if (typeof th.color !== 'string') {
								errors.push(`Le threshold à l'index ${index} pour la station ${stationCode} doit avoir une "color" (chaîne).`)
							}
							if (th.style && !['solid', 'dotted', 'dashed'].includes(th.style)) {
								errors.push(`Le "style" du threshold à l'index ${index} pour la station ${stationCode} doit être "solid", "dotted" ou "dashed".`)
							}
							if (th.default !== undefined && typeof th.default !== 'boolean') {
								errors.push(`Le "default" du threshold à l'index ${index} pour la station ${stationCode} doit être un booléen.`)
							}
						})
					}
				}
			}
		}

		// Helper function to validate threshold order
		function isOrdered(values, mode) {
			if (mode === 'low-water') {
				// Should be strictly decreasing
				return values.every((val, i) => i === 0 || val < values[i-1]);
			} else if (mode === 'flood') {
				// Should be strictly increasing
				return values.every((val, i) => i === 0 || val > values[i-1]);
			}
			return true;
		}

		// Validation de l'ordre des thresholds selon le mode
		if (config.thresholds && config.thresholdType) {
			for (const stationCode in config.thresholds) {
				const thresholds = config.thresholds[stationCode];
				if (Array.isArray(thresholds) && thresholds.length > 1) {
					const values = thresholds.map(s => s.value);
					if (config.thresholdType === 'low-water' && !isOrdered(values, 'low-water')) {
						errors.push(`Les thresholds pour la station ${stationCode} doivent être dans l'ordre décroissant pour le mode low-water`);
					} else if (config.thresholdType === 'flood' && !isOrdered(values, 'flood')) {
						errors.push(`Les thresholds pour la station ${stationCode} doivent être dans l'ordre croissant pour le mode flood`);
					}
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors
	}
}
