import { useCallback, useEffect, useState } from 'preact/compat'
import StationList from './components/stations-list'
import StationItem from './components/station-item'
import Map from './components/map'
import './app.css'
import { fetchLastObservation, fetchStations } from './lib/api'
import { ConfigProvider } from './contexts/config-context'
import Loader from './components/loader'
import Tag from './components/tag'
import { sortStations } from './lib/stations'
import { getStationColor } from './util/station-color'

const App = ({
	mapWidth = '50%',
	showMap = true,
	codeStations = [],
	stationsLabels = {},
	colors = { station: '#007BFF',selectedStation: '#FF0000', graph: '#007BFF' },
	grandeurHydro= 'Q',
	startDate,
	endDate,
	days = 30,
	sort = 'default',
	thresholds = {},
	thresholdType = 'none'
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
		if (codeStations.length === 0) return
		setIsLoading(true)

		const getStations = async () => {
			try {
				const stations = await fetchStations(codeStations)
				const activeStations = stations.filter(station => station.en_service)
				const stationsData = await Promise.all(activeStations.map(async (station) => {
					const lastObservation = await fetchLastObservation({ codeStation: station.code_station, grandeurHydro })
					const stationThresholds = thresholds[station.code_station]
					const color = getStationColor(lastObservation, stationThresholds, thresholdType, colors.station)

					return {
						codeStation: station.code_station,
						customLabel: stationsLabels[station.code_station],
						name: station.libelle_station,
						lat: station.latitude_station,
						lng: station.longitude_station,
						enService: station.en_service,
						lastObservation,
						color
					}
				}))

				if (stationsData.length === 1) {
					const [station] = stationsData
					setSelectedStationCode(station.codeStation)
				}
				else {
					sortStations(stationsData, sort, codeStations)
				}

				setStations(stationsData)
			}
			catch (error) {
				setError(error.message)
				setStations([])
			}

			setIsLoading(false)
		}

		getStations()
	}, [])

	return (
		<ConfigProvider
			startDate={startDate}
			endDate={endDate}
			days={days}
			grandeurHydro={grandeurHydro}
			colors={colors}
			thresholds={thresholds}
		>
			<div className="app">
				{showMap && (
					<div className="map-container" style={{ '--map-width': mapWidth }}>
						<Map
							stations={stations}
							hoveredStationCode={hoveredStationCode}
							selectedStationCode={selectedStationCode}
							onHoverStation={setHoveredStationCode}
							onSelectStation={handleClickStation}
						/>
					</div>
				)}

				<div class="side-menu" style={!showMap ? { width: '100%' } : { flex: 1 }}>
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
									onClick={stations.length > 1 ? handleClickStation : null}
									thresholds={thresholds[selectedStationCode]}
								/>
							</div>
						) : (
							<StationList
								stations={stations}
								grandeurHydro={grandeurHydro}
								selectedStationCode={selectedStationCode}
								hoveredStationCode={hoveredStationCode}
								onStationClick={handleClickStation}
								onHoverStation={setHoveredStationCode}
							/>
						)
					)}
				</div>
			</div>
		</ConfigProvider>
	)
}

export default App
