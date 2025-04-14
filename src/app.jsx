import { useCallback, useEffect, useState } from 'preact/compat'
import StationList from './components/stations-list'
import StationItem from './components/station-item'
import Map from './components/map'
import './app.css'
import { fetchStations } from './lib/api'
import { ThemeProvider } from './contexts/theme-context'
import Loader from './components/loader'
import Tag from './components/tag'

const App = ({
	showMap = true,
	codeStations = [],
	stationsLabels = {},
	colors = { station: '#007BFF',selectedStation: '#FF0000', graph: '#007BFF' },
	grandeurHydro= 'QmnJ',
	days = 30,
	sort = 'default'
}) => {
	const [stations, setStations] = useState([])
	const [selectedStationCode, setSelectedStationCode] = useState(null)
	const [hoveredStationCode, setHoveredStationCode] = useState(null)
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

	// Si une seule station, on la sélectionne par défaut
	useEffect(() => {
		if (stations.length === 1) {
			setSelectedStationCode(stations[0].codeStation)
		}
	}, [stations])

	return (
		<ThemeProvider colors={colors}>
			<div className="App">
				{showMap && (
					<Map
						stations={stations}
						hoveredStationCode={hoveredStationCode}
						selectedStationCode={selectedStationCode}
						onHoverStation={setHoveredStationCode}
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
									graphProps={{
										grandeurHydro,
										color: colors.graph,
										days
									}}
									onClick={stations.length > 1 ? handleClickStation : null}
								/>
							</div>
						) : (
							<StationList
								stations={stations}
								selectedStationCode={selectedStationCode}
								hoveredStationCode={hoveredStationCode}
								onStationClick={handleClickStation}
								onHoverStation={setHoveredStationCode}
							/>
						)
					)}
				</div>
			</div>
		</ThemeProvider>
	)
}

export default App
