export default function parseMeasurements(measurements) {
	const dataQ = []
	const dataH = []
	
	for (let i = measurements.length - 1; i >= 0; i--) {
		const obs = measurements[i]
		const t = new Date(obs.date_obs).getTime()
		if (obs.grandeur_hydro === 'Q') dataQ.push([t, obs.resultat_obs / 1000])
		if (obs.grandeur_hydro === 'H') dataH.push([t, obs.resultat_obs])
	}
  
	return {
		chartQ: dataQ.length ? [dataQ.map(d => d[0]), dataQ.map(d => d[1])] : null,
		chartH: dataH.length ? [dataH.map(d => d[0]), dataH.map(d => d[1])] : null,
		lastQ: dataQ.length ? dataQ[dataQ.length - 1][1] : null,
		lastH: dataH.length ? dataH[dataH.length - 1][1] : null
	}
}