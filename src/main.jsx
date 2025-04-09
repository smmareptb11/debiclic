import { render } from 'preact'
import App from './app.jsx'
import './index.css'

const defaultConfig = {
	codeStations: ['H423041010', 'Y251002001'],
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

const renderApp = (config) => {
	render(<App {...config} />, document.getElementById('app'))
}

const isDev = import.meta.env.MODE === 'development' // ou process.env.NODE_ENV

if (isDev) {
	// Mode développement : on charge les données en dur
	renderApp(defaultConfig)
} else {
	// Mode production : on attend le postMessage pour avoir les données
	window.addEventListener('message', (event) => {
		const { type, data } = event.data || {}
		if (type === 'setConfig' && data) {
			renderApp(data)
		}
	})
}
