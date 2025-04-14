import { useEffect, useState, useCallback } from 'preact/hooks'
import StationItemHeader from './station-item-header'
import './stations-list.css'
import Tag from './tag'

function StationList({ stations, selectedStationCode, hoveredStationCode, onStationClick, onHoverStation }) {
	const [isPointerOverList, setIsPointerOverList] = useState(false)

	const handleListMouseEnter = useCallback(() => setIsPointerOverList(true), [])
	const handleListMouseLeave = useCallback(() => setIsPointerOverList(false), [])
	const handleStationMouseEnter = useCallback((e) => {
		const id = e.currentTarget.id // expected format: "station-<codeStation>"
		const stationCode = id.substring(8) // remove 'station-' prefix
		onHoverStation(stationCode)
	}, [onHoverStation])
	const handleStationMouseLeave = useCallback(() => onHoverStation(null), [onHoverStation])

	useEffect(() => {
		if (hoveredStationCode && !isPointerOverList) {
			const element = document.getElementById(`station-${hoveredStationCode}`)
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}
		}
	}, [hoveredStationCode, isPointerOverList])

	if (!stations.length) {
		return (
			<div className="no-station">
				<Tag type="warning">Aucune station</Tag>
				<p>Veuillez renseigner les codes stations que vous souhaitez afficher.</p>
			</div>
		)
	};

	return (
		<div
			className="station-list"
			onMouseEnter={handleListMouseEnter}
			onMouseLeave={handleListMouseLeave}
		>
			{stations.map(station => (
				<div
					id={`station-${station.codeStation}`}
					key={station.codeStation}
					onMouseEnter={handleStationMouseEnter}
					onMouseLeave={handleStationMouseLeave}
					className={`station-list-item ${hoveredStationCode === station.codeStation ? 'hovered' : ''}`}
				>
					<StationItemHeader
						station={station}
						selected={station.codeStation === selectedStationCode}
						onClick={onStationClick}
					/>
				</div>
			))}
		</div>
	)
}

export default StationList
