import './label-item.css'

function LabelItem({ label, value, defaultValue = 'Non renseignée' }) {
	return (
		<div className="label-item">
			<span className="label">{label} :</span>
			<span className="value">{value || defaultValue}</span>
		</div>
	)
}

export default LabelItem