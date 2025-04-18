import { memo, useCallback } from 'preact/compat'
import './station-item-header.css'
import Tag from './tag'
import { HYDRO_META } from '../lib/observations'
import { formaterNombreFr } from '../util/number'

function StationItemHeader({ station, selected, grandeurHydro, onClick }) {
	const { label, unit, coef } = HYDRO_META[grandeurHydro]

	const handleClick = useCallback(() => {
		onClick(station.codeStation)
	}, [onClick, station.codeStation])

	return (
		<div className="station-header" onClick={handleClick}>
			<div className="station-header-top">
			<div className="station-info">
				<div className="station-name">{station.customLabel || station.name}</div>
				<div className="station-code">{station.codeStation}</div>
			</div>

				{selected && (
					onClick && <button className="close-button" onClick={handleClick}>X</button>
				)}
			</div>

			<div className='station-tags'>
				{station.lastObservation.resultat_obs_elab && (
					<Tag type="info">{label} : {formaterNombreFr(station.lastObservation.resultat_obs_elab * coef)} {unit}</Tag>
				)}
			</div>
			
		</div>
	)
}

export default memo(StationItemHeader)
