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

	// Seuil
	if (config.threshold === undefined) {
		config.threshold = 'none' // valeur par défaut
	}
	else if (!['none', 'low-water', 'flood'].includes(config.threshold)) {
		errors.push('"threshold" doit être "none", "low-water" ou "flood".')
	}

	// Seuils
	if (config.seuils) {
		if (typeof config.seuils !== 'object') {
			errors.push('"seuils" doit être un objet.')
		}
		else {
			for (const stationCode in config.seuils) {
				if (!config.codeStations.includes(stationCode)) {
					errors.push(`"seuils" contient une clé de station inconnue : ${stationCode}`)
				}
				else {
					const seuils = config.seuils[stationCode]
					if (!Array.isArray(seuils)) {
						errors.push(`Les seuils pour la station ${stationCode} doivent être un tableau.`)
					}
					else {
						seuils.forEach((seuil, index) => {
							if (typeof seuil !== 'object' || seuil === null) {
								errors.push(`Le seuil à l'index ${index} pour la station ${stationCode} doit être un objet.`)
								return
							}
							if (typeof seuil.label !== 'string') {
								errors.push(`Le seuil à l'index ${index} pour la station ${stationCode} doit avoir un "label" (chaîne de caractères).`)
							}
							if (typeof seuil.value !== 'number') {
								errors.push(`Le seuil à l'index ${index} pour la station ${stationCode} doit avoir une "value" (nombre).`)
							}
							if (typeof seuil.color !== 'string') {
								errors.push(`Le seuil à l'index ${index} pour la station ${stationCode} doit avoir une "color" (chaîne de caractères).`)
							}
							if (seuil.style && !['solid', 'dotted', 'dashed'].includes(seuil.style)) {
								errors.push(`Le "style" du seuil à l'index ${index} pour la station ${stationCode} doit être "solid", "dotted" ou "dashed".`)
							}
							if (seuil.default && typeof seuil.default !== 'boolean') {
								errors.push(`Le "default" du seuil à l'index ${index} pour la station ${stationCode} doit être un booléen.`)
							}
						})
					}
				}
			}
		}

		// Validation de l'ordre des seuils selon le mode
		if (config.seuils && config.threshold) {
			for (const stationCode in config.seuils) {
				const seuils = config.seuils[stationCode];
				if (Array.isArray(seuils) && seuils.length > 1) {
					if (config.threshold === 'low-water') {
						// Pour l'étiage, les seuils doivent être dans l'ordre décroissant
						const values = seuils.map(s => s.value);
						if (values.some((val, i) => i > 0 && val <= values[i-1])) {
							errors.push(`Les seuils pour la station ${stationCode} doivent être dans l'ordre décroissant pour le mode étiage (low-water)`);
						}
					} else if (config.threshold === 'flood') {
						// Pour la crue, les seuils doivent être dans l'ordre croissant
						const values = seuils.map(s => s.value);
						if (values.some((val, i) => i > 0 && val >= values[i-1])) {
							errors.push(`Les seuils pour la station ${stationCode} doivent être dans l'ordre croissant pour le mode crue (flood)`);
						}
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
