import { render } from 'preact'
import App from './app.jsx'
import './index.css'

const props = {
	codeStations: [
		'H423041010',
		'Y251002001'
	],
	colors: {
		station: '#0D4',
		selectedStation: '#F0FF',
		Q: '#00F5',
		H: '#0F0'
	},
	grandeurHydro: 'Q',
	days: 1,
	sort: 'desc'
}

render(<App {...props} />, document.getElementById('app'))
