import { render } from 'preact'
import App from './app.jsx'
import './index.css'

const renderApp = (config) => {
	render(<App {...config} />, document.getElementById('app'))
}

window.addEventListener('message', (event) => {
	const { type, data } = event.data || {}
	if (type === 'setConfig' && data) {
		renderApp(data)
	}
})
