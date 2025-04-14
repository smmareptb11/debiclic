import { memo, useCallback } from 'preact/compat'
import './station-item-header.css'
import Tag from './tag'

function StationItemHeader({ station, selected, onClick }) {

	const handleClick = useCallback(() => {
		onClick(station.codeStation)
	}, [onClick, station.codeStation])

	const isInactive = station.enService === false

	return (
		<div className="station-header" onClick={handleClick}>
			<div className="station-info">
				<div className="station-name">{station.customLabel || station.name}</div>
				<div className="station-code">{station.codeStation}</div>
			</div>

			{isInactive && <Tag type="inactive">Hors service</Tag>}
			
			{selected ? (
				<button className="close-button" onClick={handleClick}>X</button>
			) : (
				<div className="chevron">►</div>
			)}
		</div>
	)
}

export default memo(StationItemHeader)
