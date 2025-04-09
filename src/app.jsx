import { useCallback, useEffect, useState } from 'preact/compat'
import StationList from './components/stations-list'
import StationItem from './components/station-item'
import Map from './components/map'
import './app.css'
import { fetchStations, fetchMeasurements } from './lib/api'
import parseMeasurements from './lib/charts'
import { ThemeProvider } from './contexts/theme-context'
import Loader from './components/loader'
import Tag from './components/tag'

const App = ({
	showMap = true,
	codeStations = [],
	stationsLabels = {},
	colors = { station: '#007BFF',selectedStation: '#FF0000',Q: '#007BFF',H: '#AA336A' },
	grandeurHydro,
	days = 1,
	sort = 'default'
}) => {
	const [stations, setStations] = useState([])
	const [selectedStationCode, setSelectedStationCode] = useState(null)
	const [measurements, setMeasurements] = useState(null)
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
		async function getMeasurements(codeStation) {
			try {
				const measurements = await fetchMeasurements({ codeStation, grandeurHydro })
						
				const { chartQ, chartH, lastQ, lastH } = parseMeasurements(measurements)
				
				setMeasurements({
					discharge: lastQ,
					height: lastH,
					chartQ,
					chartH
				})
			}
			catch (error) {
				setMeasurements({ error: error.message })
			}
		}
		
		setMeasurements(null)
		if (selectedStationCode) {
			getMeasurements(selectedStationCode)
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
									measurements={measurements}
									onClick={handleClickStation}
								/>
							</div>
						) : (
							<StationList
								stations={stations}
								measurements={measurements}
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
