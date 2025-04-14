import { render } from 'preact'
import App from './app.jsx'
import './index.css'
import { validateConfig } from './lib/config.js'

const defaultConfig = {
	codeStations: ['H423041010', 'Y251002001'],
	stationsLabels: {
		H423041010: 'Station 1',
		Y251002001: 'Station 2'
	},
	colors: {
		station: '#0D4',
		selectedStation: '#F0FF',
		graph: '#0D4',
		Q: '#00F5',
		H: '#0F0'
	},
	grandeurHydro: 'QmnJ',
	days: 30,
	sort: 'desc'
}

const renderApp = (config) => {
	render(<App {...config} />, document.getElementById('app'))
}

const isDev = import.meta.env.MODE === 'development'

if (isDev) {
	renderApp(defaultConfig)
}
else {
	window.addEventListener('message', (event) => {
		const { type, data } = event.data || {}
		if (type === 'setConfig' && data) {
			const result = validateConfig(data)
			if (result.valid) {
				renderApp(data)
			}
			else {
				console.error('[DébiClic] Configuration invalide :', result.errors)
				render((
					<div style="padding:1rem; background:#fee; color:#900; font-family:sans-serif;">
						<b>Erreur de configuration :</b><br />
						<ul>{result.errors.map(error => <li key={error}>{error}</li>)}</ul>
					</div>
				), document.getElementById('app'))
			}
		}
	})
}
