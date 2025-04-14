import { memo, useCallback, useEffect, useMemo, useState } from 'preact/compat'
import './station-item.css'
import { fullDateFormatter, getShortIsoString, subtractDays } from '../util/date'
import StationComment from './station-comment'
import Tag from './tag'
import StationItemHeader from './station-item-header'
import ObservationChart from './observations-chart'
import { getFirstAndLastObservationDate, parseObservations } from '../lib/observations'
import { fetchObservationsElab } from '../lib/api'
import Loader from './loader'

function StationItem({ station, graphProps, onClick }) {
	const [observations, setObservations] = useState({})
	const [isLoading, setIsLoading] = useState(false)
	const [endDate, setEndDate] = useState(null)
	const [startDate, setStartDate] = useState(null)
	const [visibleDates, setVisibleDates] = useState(null)
	const [error, setError] = useState(false)

	useEffect(() => {
		setEndDate(new Date())
		setStartDate(subtractDays(graphProps.days, new Date()))
	}, [])
	
	const handleClose = useCallback(() => {
		onClick(null)
	}, [onClick])

	const data = useMemo(() => {
		if (!observations.data || error) {
			return []
		}

		const parsedData = parseObservations(observations?.data)
		return parsedData[graphProps.grandeurHydro] || []

	}, [observations])

	useEffect(() => {
		const observationsData = observations?.data || []
		setVisibleDates(observationsData.length > 0
			? getFirstAndLastObservationDate(observations.data)
			: null
		)
	}, [observations.data])

	useEffect(() => {
		async function getObservations(codeStation) {
			try {
				const observations = await fetchObservationsElab({
					codeStation,
					grandeurHydro: graphProps.grandeurHydro,
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
		
		if (!startDate || !endDate) {
			return
		}

		setIsLoading(true)
		setError(false)
		getObservations(station.codeStation)
	}, [station.codeStation, endDate, startDate, graphProps.grandeurHydro])

	const handleStartDateChange = useCallback(event => {
		const selectedDate = new Date(event.target.value)
		if (selectedDate <= endDate) {
			setStartDate(selectedDate)
		}
	}, [endDate])

	const handleEndDateChange = useCallback(event => {
		const selectedDate = new Date(event.target.value)
		if (selectedDate >= startDate) {
			setEndDate(selectedDate)
		}
	}, [startDate])

	const handleUpdateObservations = async url => {
		setIsLoading(true)
		try {
			const response = await fetch(url)
			const observations = await response.json()
			setObservations(observations)
		}
		catch (error) {
			setError(error.message)
		}
		setIsLoading(false)
	}

	const handlePrevClick = useCallback(async () => {
		handleUpdateObservations(observations.prev)
	}, [observations.prev])

	const handleNextClick = useCallback(async () => {
		handleUpdateObservations(observations.next)
	}, [observations.next])

	const handleResetClick = useCallback(async () => {
		handleUpdateObservations(observations.first)
	}, [observations.first])

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
					onClick={handleClose}
				/>
			</div>

			<div className="station-details">
				{(!startDate || !endDate) ? (
					<Loader />
				) : (
					error ? (
						<Tag type="error">
							Erreur lors de la récupération des mesures : {error}
						</Tag>
					) : (
						<div className="station-chart">
							<div className="date-range-selector">
								<input
									type="date"
									value={getShortIsoString(startDate)}
									onChange={handleStartDateChange}
									max={getShortIsoString(endDate)}
								/>
								<span> à </span>
								<input
									type="date"
									value={getShortIsoString(endDate)}
									onChange={handleEndDateChange}
									min={getShortIsoString(startDate)}
								/>
							</div>
							
							{isLoading ? (
								<div className="loader-container">
									<Loader />
								</div>
							) : (
								<div>
									<ObservationChart
										data={data}
										color={graphProps.color}
										grandeurHydro={graphProps.grandeurHydro}
										onExportPNG={exportPNG}
									/>

									{(observations.prev || observations.next) && (
										<div>
											<div className="pagination-buttons">
												{observations.prev && (
													<button disabled={!observations.first} onClick={handleResetClick}>-</button>
												)}
												<button disabled={!observations.prev} onClick={handlePrevClick}>Précédent</button>
												<button disabled={!observations.next} onClick={handleNextClick}>Suivant</button>
											</div>

										</div>
									)}
									{visibleDates && (
										<div className="period-displayed">
											Période affichée : {fullDateFormatter(visibleDates.firstDate.toISOString())} - {fullDateFormatter(visibleDates.lastDate.toISOString())}
										</div>
									)}
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
