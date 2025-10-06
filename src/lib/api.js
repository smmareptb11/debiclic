import { getShortIsoString } from '../util/date'

import.meta.env.HUBEAU_API_URL

const HUBEAU_API_URL = import.meta.env.HUBEAU_API_URL || 'https://hubeau.eaufrance.fr/api/v2/hydrometrie'

export async function fetchStations(codeStations) {
	const params = new URLSearchParams({
		code_station: codeStations,
		fields: ['code_station','libelle_station','latitude_station','longitude_station','en_service'],
		format: 'json'
	})

	const res = await fetch(`${HUBEAU_API_URL}/referentiel/stations?${params}`)
	const json = await res.json()

	return json.data
};

export async function fetchObservationsElab({ codeStation, grandeurHydro, startDate, endDate }) {
	const params = new URLSearchParams({
		code_entite: codeStation,
		grandeur_hydro_elab: grandeurHydro,
		date_debut_obs_elab: getShortIsoString(startDate),
		date_fin_obs_elab: getShortIsoString(endDate),
		size: '20000',
		fields: ['date_obs_elab', 'resultat_obs_elab', 'grandeur_hydro_elab']
	})

	const res = await fetch(`${HUBEAU_API_URL}/obs_elab?${params}`)
	const json = await res.json()

	return json
}

export async function fetchObservationsTr({ codeStation, grandeurHydro, sort = 'desc' }) {
	const params = new URLSearchParams({
		code_entite: codeStation,
		grandeur_hydro: grandeurHydro,
		size: '20000',
		fields: ['date_obs', 'resultat_obs', 'grandeur_hydro'],
		sort
	})
	const res = await fetch(`${HUBEAU_API_URL}/observations_tr?${params}`)
	const json = await res.json()

	return json
}

export async function getObservations({ codeStation, grandeurHydro, startDate, endDate, sort }) {
	if (grandeurHydro === 'H' || grandeurHydro === 'Q') {
		const observations = await fetchObservationsTr({ codeStation, grandeurHydro, sort })
		return {
			...observations,
			data: observations.data.map(obs => ({
				dateObs: obs.date_obs,
				resultatObs: obs.resultat_obs,
				grandeurHydro: obs.grandeur_hydro
			}))
		}
	}
	const observations = await fetchObservationsElab({ codeStation, grandeurHydro, startDate, endDate, sort })
	return {
		...observations,
		data: observations.data.map(obs => ({
			dateObs: obs.date_obs_elab,
			resultatObs: obs.resultat_obs_elab,
			grandeurHydro: obs.grandeur_hydro_elab
		}))
	}
	
}

export async function fetchLastObservation({ codeStation, grandeurHydro }) {
	try {
		if (grandeurHydro === 'H' || grandeurHydro === 'Q') {
			const params = new URLSearchParams({
				code_entite: codeStation,
				grandeur_hydro: grandeurHydro,
				sort: 'desc',
				size: '1',
				fields: ['date_obs', 'resultat_obs', 'grandeur_hydro']
		  })
	
		  const resp = await fetch(`${HUBEAU_API_URL}/observations_tr?${params}`)
		  const { data } = await resp.json()
		  
		  return data.length ? data[0] : null
		}
		
		// Calculer la date d'hier au format YYYY-MM-DD
		const today = new Date()
			.toISOString()
			.slice(0, 10)
		const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
			.toISOString()
			.slice(0, 10)

		const params = new URLSearchParams({
			code_entite: codeStation,
			grandeur_hydro_elab: 'QmnJ',
			date_debut_obs_elab: yesterday,
			date_fin_obs_elab: today,
			size: '1',
			fields: ['date_obs_elab', 'resultat_obs_elab', 'grandeur_hydro_elab']
		})
	  
		const resp = await fetch(`${HUBEAU_API_URL}/obs_elab?${params}`)
		const { data } = await resp.json()

		return data.length ? {
			date_obs: data[0].date_obs_elab,
			resultat_obs: data[0].resultat_obs_elab,
			grandeur_hydro: data[0].grandeur_hydro_elab
		} : null
	}
	catch (err) {
		console.error('Erreur fetchLastObservation:', err)
		return null
	}
}
