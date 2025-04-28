export const HYDRO_META = {
	Q: { label: 'Débit',                         unit: 'm³/s', coef: 1 / 1000, withTime: true },
	QmM: { label: 'Débit mensuel',              unit: 'm³/s',  coef: 1 / 1000, withTime: false },
	QmnJ: { label: 'Débit journalier',          unit: 'm³/s',  coef: 1 / 1000, withTime: false },
	QINM: { label: 'Débit min. mensuel',        unit: 'm³/s',  coef: 1 / 1000, withTime: false },
	QINnJ: { label: 'Débit min. journalier',    unit: 'm³/s',  coef: 1 / 1000, withTime: false },
	QixM: { label: 'Débit max. mensuel',        unit: 'm³/s',  coef: 1 / 1000, withTime: false },
	QIXnJ: { label: 'Débit max. journalier',    unit: 'm³/s',  coef: 1 / 1000, withTime: false },
	H: { label: 'Hauteur',                      unit: 'm',     coef: 1 / 1000, withTime: true },
	HIXM: { label: 'Hauteur max. mensuelle',    unit: 'm',     coef: 1 / 1000, withTime: false },
	HIXnJ: { label: 'Hauteur max. journalière', unit: 'm',     coef: 1 / 1000, withTime: false }
}

export function parseObservations(observations, startDate, endDate) {
	const grouped = {}

	for (const obs of observations) {
		const key = obs.grandeurHydro
		
		if (!grouped[key]) {
			grouped[key] = [[startDate, null]] // Add oldest date
		}

		// On conserve les données sous forme [timestamp, valeur]
		grouped[key].push([new Date(obs.dateObs), obs.resultatObs])
	}

	for (const key in grouped) {
		grouped[key].push([endDate, null]) // Add most recent date
	}

	// Construction du résultat pour chaque grandeur : [timestamps[], valeurs[]]
	const result = {}
	for (const [key, values] of Object.entries(grouped)) {
		result[key] = {
			x: values.map(([t]) => t),
			y: values.map(([, v]) => v)
		}
	}

	return result
}
