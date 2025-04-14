export function parseObservations(observations) {
	const grouped = {}

	for (const obs of observations) {
		const key = obs.grandeur_hydro_elab
		
		if (!grouped[key]) grouped[key] = []
		
		// On conserve les données sous forme [timestamp, valeur]
		grouped[key].push([obs.date_obs_elab, obs.resultat_obs_elab])
	}

	// Construction du résultat pour chaque grandeur : [timestamps[], valeurs[]]
	const result = {}
	for (const [key, values] of Object.entries(grouped)) {
		result[key] = [values.map(([t]) => t), values.map(([, v]) => v)]
	}

	return result
}


export function getFirstAndLastObservationDate(observations) {
	const dates = observations.map(obs => new Date(obs.date_obs_elab))
	const firstDate = new Date(Math.min(...dates))
	const lastDate = new Date(Math.max(...dates))

	return { firstDate, lastDate }
}