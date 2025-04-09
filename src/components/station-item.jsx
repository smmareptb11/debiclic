import { memo, useCallback } from 'preact/compat'
import StationChart from './station-chart'
import './station-item.css'
import LabelItem from './label-item'
import { shortDateTimeFormatter } from '../util/date'
import StationComment from './station-comment'
import Tag from './tag'
import StationItemHeader from './station-item-header'

function StationItem({ station, measurements, onClick }) {
	const handleClose = useCallback(() => {
		onClick(null)
	}, [onClick])

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
				<ul className="station-meta">
					<LabelItem label="Ouverture" value={shortDateTimeFormatter(station.dateOuverture)} />
					<LabelItem label="Fermeture" value={shortDateTimeFormatter(station.dateFermeture)} />
					<LabelItem label="Dernière mise à jour" value={shortDateTimeFormatter(station.dateMaj)} />
				</ul>

				{measurements?.error ? (
					<Tag type="error">
						Erreur lors de la récupération des mesures : {measurements.error}
					</Tag>
				) : (
					<div className="station-chart">
						<StationChart
							isLoading={!measurements}
							chartQ={measurements?.chartQ}
							chartH={measurements?.chartH}
						/>
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
