import { TriangleAlert, CheckCircle, Info, XCircle } from 'lucide-react'
import './tag.css'

const typeIcons = {
	warning: { Icon: TriangleAlert, name: 'triangle-alert', color: '#856404' },
	success: { Icon: CheckCircle, name: 'check-circle', color: '#155724' },
	info: { Icon: Info, name: 'info', color: '#0c5460' },
	error: { Icon: XCircle, name: 'x-circle', color: '#721c24' },
	inactive: null
}

export default function Tag({ children, type }) {
	const { Icon, color } = typeIcons[type] || { Icon: null, color: null }

	return (
		<span className={`tag ${type || 'default'}`}>
			{Icon && <Icon size={18} color={color} />}
			{children}
		</span>
	)
}
