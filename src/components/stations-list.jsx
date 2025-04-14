import StationItemHeader from './station-item-header'
import './stations-list.css'
import Tag from './tag'

function StationList({ stations, selectedStationCode, onStationClick }) {
	if (!stations.length) {
		return (
			<div className="no-station">
				<Tag type="warning">Aucune station</Tag>
				<p>Veuillez renseigner les codes stations que vous souhaitez afficher.</p>
			</div>
		)
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
