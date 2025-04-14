export function parseObservations(observations) {
	const grouped = {}

	for (const obs of observations) {
		const t = new Date(obs.date_obs_elab).getTime()
		const key = obs.grandeur_hydro_elab
		
		if (!grouped[key]) grouped[key] = []
		
		// On conserve les données sous forme [timestamp, valeur]
		grouped[key].push([t, obs.resultat_obs_elab])
	}

	// Construction du résultat pour chaque grandeur : [timestamps[], valeurs[]]
	const result = {}
	for (const [key, values] of Object.entries(grouped)) {
		result[key] = {
			chart: [values.map(([t]) => t), values.map(([, v]) => v)],
			last: values[values.length - 1][1]
		}
	}

	return result
}
