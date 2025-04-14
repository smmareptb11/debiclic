import { memo, useCallback } from 'preact/compat'
import './station-item.css'
import LabelItem from './label-item'
import { shortDateTimeFormatter } from '../util/date'
import StationComment from './station-comment'
import Tag from './tag'
import StationItemHeader from './station-item-header'
import ObservationChart from './observations-chart'

function StationItem({ station, observations, onClick }) {
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

				{observations?.error ? (
					<Tag type="error">
						Erreur lors de la récupération des mesures : {observations.error}
					</Tag>
				) : (
					<div className="station-chart">
						<ObservationChart
							data={observations.data}
							color={observations.color}
							grandeurHydro={observations.grandeurHydro}
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
