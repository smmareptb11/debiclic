import StationItemHeader from './station-item-header'
import './stations-list.css'

function StationList({ stations, selectedStationCode, measurements, onStationClick }) {
	if (!stations.length) {
		return <div className="no-station">Aucune station</div>
	};

	return (
		<div className="station-list">
			{stations.map(station => (
				<StationItemHeader
					key={station.codeStation}
					station={station}
					selected={station.codeStation === selectedStationCode}
					onClick={onStationClick}
				/>
			))}
		</div>
	)
}

export default StationList
