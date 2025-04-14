import { useCallback, useEffect, useState } from 'preact/compat'
import StationList from './components/stations-list'
import StationItem from './components/station-item'
import Map from './components/map'
import './app.css'
import { fetchStations, fetchObservationsElab } from './lib/api'
import { parseObservations } from './lib/charts'
import { ThemeProvider } from './contexts/theme-context'
import Loader from './components/loader'
import Tag from './components/tag'
import { subtractDays } from './util/date'

const App = ({
	showMap = true,
	codeStations = [],
	stationsLabels = {},
	colors = { station: '#007BFF',selectedStation: '#FF0000', graph: '#007BFF' },
	grandeurHydro= 'QmM',
	days = 30,
	sort = 'default'
}) => {
	const [stations, setStations] = useState([])
	const [selectedStationCode, setSelectedStationCode] = useState(null)
	const [observations, setObservations] = useState({})
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	const handleClickStation = useCallback((codeStation) => {
		if (selectedStationCode === codeStation) {
			setSelectedStationCode(null)
		}
		else {
			setSelectedStationCode(codeStation)
		}
	}, [selectedStationCode])

	useEffect(() => {
		async function getObservations(codeStation) {
			try {
				const now = new Date()
				const startDate = subtractDays(days, now)
				const observations = await fetchObservationsElab({
					codeStation,
					grandeurHydro,
					startDate,
					endDate: now
				})
				const parsedObservations = parseObservations(observations)
						
				
				setObservations(parsedObservations)
			}
			catch (error) {
				setObservations({ error: error.message })
			}
		}
		
		setObservations({})
		if (selectedStationCode) {
			getObservations(selectedStationCode)
		}
	}, [selectedStationCode])

	useEffect(() => {
		if (!codeStations.length) return
		setIsLoading(true)
		
		const getStations = async () => {
			try {
				const stations = await fetchStations(codeStations)
	
				setStations(stations.map(station => ({
					codeStation: station.code_station,
					customLabel: stationsLabels[station.code_station],
					name: station.libelle_station,
					lat: station.latitude_station,
					lng: station.longitude_station,
					enService: station.en_service,
					commentaire: station.commentaire_station,
					dateOuverture: station.date_ouverture_station,
					dateFermeture: station.date_fermeture_station,
					dateMaj: station.date_maj_station
				})))
			}
			catch (error) {
				setError(error.message)
				setStations([])
			}

			setIsLoading(false)
		}

		getStations()
	}, [codeStations])

	return (
		<ThemeProvider colors={colors}>
			<div className="App">
				{showMap && (
					<Map
						stations={stations}
						selectedStationCode={selectedStationCode}
						onSelectStation={handleClickStation}
					/>
				)}

				<div class="side-menu" style={!showMap ? { width: '100%' } : {}}>
					{isLoading && <Loader />}

					{error ? (
						<div className="fetch-stations-error">
							<Tag type="error">Une erreur est survenue lors de la récupération des stations : {error}</Tag>
						</div>
					) : (
						selectedStationCode ? (
							<div className="station-details-view">
								<StationItem
									station={stations.find(({ codeStation }) => codeStation === selectedStationCode)}
									observations={{
										data: observations[grandeurHydro] ? observations[grandeurHydro].chart : [],
										grandeurHydro,
										error: observations?.error,
										color: colors.graph
									}}
									onClick={handleClickStation}
								/>
							</div>
						) : (
							<StationList
								stations={stations}
								selectedStationCode={selectedStationCode}
								onStationClick={handleClickStation}
							/>
						)
					)}
				</div>
			</div>
		</ThemeProvider>
	)
}

export default App
