import { memo, useCallback, useEffect, useMemo, useState } from 'preact/compat'
import './station-item.css'
import { getShortIsoString } from '../util/date'
import StationComment from './station-comment'
import Tag from './tag'
import StationItemHeader from './station-item-header'
import ObservationChart from './observations-chart'
import { getFirstAndLastObservationDate, parseObservations } from '../lib/observations'
import { getObservations } from '../lib/api'
import Loader from './loader'

function StationItem({ station, graphProps, onClick }) {
	const [observations, setObservations] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [visibleDates, setVisibleDates] = useState(null)
	const [error, setError] = useState(false)
	
	const handleClose = useCallback(() => {
		onClick(null)
	}, [onClick])

	const data = useMemo(() => {
		if (!observations?.data || error) {
			return null
		}
		
		const parsedData = parseObservations(observations?.data)
		return parsedData[graphProps.grandeurHydro] || []

	}, [observations])

	useEffect(() => {
		const observationsData = observations?.data || []
		setVisibleDates(observationsData.length > 0
			? getFirstAndLastObservationDate(observations?.data)
			: null
		)
	}, [observations])

	useEffect(() => {
		async function fetchMonthlyObservations(codeStation) {
			const today = new Date()
			const lastMonth = new Date(today)
			lastMonth.setMonth(lastMonth.getMonth() - 1)
			lastMonth.setDate(lastMonth.getDate() + 1)
			try {
				const observations = await getObservations({
					codeStation,
					grandeurHydro: graphProps.grandeurHydro,
					startDate: lastMonth,
					endDate: today
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
	}, [station.codeStation, graphProps.grandeurHydro])

	const exportPNG = useCallback(canvas => {
		const exportCanvas = document.createElement('canvas')
		exportCanvas.width = canvas.width
		exportCanvas.height = canvas.height
		const ctx = exportCanvas.getContext('2d')
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
		ctx.drawImage(canvas, 0, 0)

		const link = document.createElement('a')
		link.download = `${station.codeStation}-${graphProps.grandeurHydro}_${getShortIsoString(visibleDates.firstDate)}_${getShortIsoString(visibleDates.lastDate)}.png`
		link.href = exportCanvas.toDataURL('image/png')
		link.click()
	}, [graphProps.grandeurHydro])

	return (
		<div
			id={`station-${station.codeStation}`}
			className="station-item"
		>
			<div className="station-header-sticky">
				<StationItemHeader
					selected
					station={station}
					grandeurHydro={graphProps.grandeurHydro}
					onClick={onClick ? handleClose : null}
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
									color={graphProps.color}
									grandeurHydro={graphProps.grandeurHydro}
									days={graphProps.days}
									onExportPNG={exportPNG}
								/>
							) : (
								<div className="loader-container">
									<Loader />
								</div>
							)}
						</div>
					)
				)}

				{station.commentaire && (
					<StationComment comment={station.commentaire} />
				)}
			</div>
		</div>
	)
}

export default memo(StationItem)
