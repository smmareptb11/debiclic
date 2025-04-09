function init(config) {
	const container = typeof config.container === 'string'
		? document.querySelector(config.container)
		: config.container

	if (!container) {
		console.warn('[debiclic] Conteneur non trouvé :', config.container)
		return
	}

	const iframe = document.createElement('iframe')
	iframe.src = config.src || 'https://unpkg.com/debiclic@latest/dist/iframe/index.html'
	iframe.width = config.width || '100%'
	iframe.height = config.height || '100%'
	iframe.style.border = 'none'

	container.appendChild(iframe)

	iframe.addEventListener('load', () => {
		iframe.contentWindow.postMessage({ type: 'setConfig', data: config }, '*')
	})
}

window.debiclic = { init }