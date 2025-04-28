export function sortStations(stationsData, sort, codeStations) {
	if (sort === 'asc') {
		stationsData.sort((a, b) => {
			const aVal = a.lastObservation?.resultat_obs ?? -Infinity
			const bVal = b.lastObservation?.resultat_obs ?? -Infinity
			return aVal - bVal
		})
	}
	else if (sort === 'desc') {
		stationsData.sort((a, b) => {
			const aVal = a.lastObservation?.resultat_obs ?? Infinity
			const bVal = b.lastObservation?.resultat_obs ?? Infinity
			return bVal - aVal
		})
	}
	else {
		stationsData.sort((a, b) => codeStations.indexOf(a.codeStation) - codeStations.indexOf(b.codeStation))
	}
}
