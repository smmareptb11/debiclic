import.meta.env.HUBEAU_API_URL

const HUBEAU_API_URL = import.meta.env.HUBEAU_API_URL || 'https://hubeau.eaufrance.fr/api/v2'

export async function fetchStations(codeStations) {
	const query = codeStations.map(code => `code_station=${code}`).join('&')
	const url = `${HUBEAU_API_URL}/hydrometrie/referentiel/stations?${query}&format=json&fields=code_station,libelle_station,latitude_station,longitude_station,en_service,commentaire_station,date_ouverture_station,date_fermeture_station,date_maj_station`
	const res = await fetch(url)
	const json = await res.json()

	return json.data
};

export async function fetchObservationsElab({ codeStation, startDate, endDate, grandeurHydro }) {
	const url = `${HUBEAU_API_URL}/hydrometrie/obs_elab?code_entite=${codeStation}&date_debut_obs_elab=${startDate.toISOString()}&date_fin_obs_elab=${endDate.toISOString()}&type_entite=station_hydrometrique&grandeur_hydro_elab=${grandeurHydro}&fields=date_obs_elab,resultat_obs_elab,grandeur_hydro_elab`
	const res = await fetch(url)
	const json = await res.json()

	return json.data
}
