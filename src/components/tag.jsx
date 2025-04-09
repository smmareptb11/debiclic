import './tag.css'

const typeIcons = {
	warning: '⚠️',
	success: '✅',
	info: 'ℹ️',
	error: '❌',
	inactive: ''
}

export default function Tag({ children, type }) {
	const icon = typeIcons[type] || ''

	return (
		<span className={`tag ${type || 'default'}`}>
			{icon && <span className="tag-icon">{icon}</span>}
			{children}
		</span>
	)
}
