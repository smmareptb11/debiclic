import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'preact/compat'
import './station-item.css'
import { fullDateFormatter, getShortIsoString } from '../util/date'
import StationComment from './station-comment'
import Tag from './tag'
import StationItemHeader from './station-item-header'
import ObservationChart from './observations-chart'
import { parseObservations } from '../lib/observations'
import { getObservations } from '../lib/api'
import Loader from './loader'
import ConfigContext from '../contexts/config-context'

function StationItem({ station, onClick }) {
	const { colors, startDate, endDate, days, grandeurHydro } = useContext(ConfigContext)

	const [observations, setObservations] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [visibleDates, setVisibleDates] = useState({ startDate, endDate })
	const [error, setError] = useState(false)
	
	const data = useMemo(() => {
		if (!observations?.data || error) {
			return null
		}
		
		const parsedData = parseObservations(observations?.data, startDate, endDate)
		return parsedData[grandeurHydro] || []

	}, [observations])

	useEffect(() => {
		async function fetchMonthlyObservations(codeStation) {
			try {
				const observations = await getObservations({
					codeStation,
					grandeurHydro,
					startDate,
					endDate
				})

				setObservations(observations)
			}
			catch (error) {
				setError(error.message)
			}

			setIsLoading(false)
		}
		
		setObservations({})
		setIsLoading(true)
		setError(false)
		fetchMonthlyObservations(station.codeStation)
	}, [station.codeStation, grandeurHydro, startDate, endDate])

	const exportPNG = useCallback(canvas => {
		const exportCanvas = document.createElement('canvas')
		exportCanvas.width = canvas.width
		exportCanvas.height = canvas.height
		const ctx = exportCanvas.getContext('2d')
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
		ctx.drawImage(canvas, 0, 0)

		const link = document.createElement('a')
		link.download = `${station.codeStation}-${grandeurHydro}_${getShortIsoString(visibleDates.startDate)}_${getShortIsoString(visibleDates.endDate)}.png`
		link.href = exportCanvas.toDataURL('image/png')
		link.click()
	}, [grandeurHydro])

	return (
		<div
			id={`station-${station.codeStation}`}
			className="station-item"
		>
			<div className="station-header-sticky">
				<StationItemHeader
					selected
					station={station}
					grandeurHydro={grandeurHydro}
					onClick={onClick}
				/>
			</div>

			<div className="station-details">
				{isLoading ? (
					<Loader />
				) : (
					error ? (
						<Tag type="error">
							Erreur lors de la récupération des mesures : {error}
						</Tag>
					) : (
						<div className="station-chart">
							{data ? (
								<ObservationChart
									data={data}
									color={colors.graph}
									grandeurHydro={grandeurHydro}
									days={days}
									onExportPNG={exportPNG}
									setVisibleDates={setVisibleDates}
								/>
							) : (
								<div className="loader-container">
									<Loader />
								</div>
							)}
						</div>
					)
				)}

				{visibleDates && (
					<div className="period-displayed">
						Période affichée : {fullDateFormatter(visibleDates.startDate.toISOString())} - {fullDateFormatter(visibleDates.endDate.toISOString())}
					</div>
				)}

				{station.commentaire && (
					<StationComment comment={station.commentaire} />
				)}
			</div>
		</div>
	)
}

export default memo(StationItem)
