import { render } from 'preact'
import App from './app.jsx'
import './index.css'
import { validateConfig } from './lib/config.js'

const defaultConfig = {
	  "container": "#debiclic-widget",
	  "codeStations": [
		"Y111201001",
		"Y123201002",
		"Y161202001",
		"Y113501001",
		"Y110501001",
		"Y136401001",
		"Y141502001",
		"Y158402001",
		"Y143541001",
		"Y160505001",
		"Y082401001"
	  ],
	  "stationsLabels": {},
	  "colors": {
		"station": "#007bff",
		"graph": "#007bff"
	  },
	  "grandeurHydro": "QmnJ",
	  "days": 10,
	  "sort": "asc",
	  "width": "100%",
	  "height": "600",
	  "showMap": true,
	  "mapWidth": "50%",
	  "thresholdType": "low-water",
	  "thresholds": {
		"Y111201001": [
		  {
			"label": "Vigilance",
			"value": 7000,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 3000,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 2750,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 2500,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y123201002": [
		  {
			"label": "Vigilance",
			"value": 8000,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 3500,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 2800,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 2500,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y161202001": [
		  {
			"label": "Vigilance",
			"value": 12000,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 4400,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 3200,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 2000,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y113501001": [
		  {
			"label": "Vigilance",
			"value": 320,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 140,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 120,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 100,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y110501001": [
		  {
			"label": "Vigilance",
			"value": 600,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 220,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 185,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 150,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y136401001": [
		  {
			"label": "Vigilance",
			"value": 750,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 500,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 365,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 230,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y141502001": [
		  {
			"label": "Vigilance",
			"value": 300,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 90,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 70,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 50,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y158402001": [
		  {
			"label": "Vigilance",
			"value": 600,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 200,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 165,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 130,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y143541001": [
		  {
			"label": "Vigilance",
			"value": 140,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 40,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 28,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 15,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y160505001": [
		  {
			"label": "Vigilance",
			"value": 800,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 300,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 250,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 200,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		],
		"Y082401001": [
		  {
			"label": "Vigilance",
			"value": 100,
			"color": "#ECEC2E",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte",
			"value": 30,
			"color": "#ed9d5e",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Alerte renforcée",
			"value": 23,
			"color": "#FA4D00",
			"style": "solid",
			"default": true
		  },
		  {
			"label": "Crise",
			"value": 15,
			"color": "#FF0000",
			"style": "solid",
			"default": true
		  }
		]
	  }
	}

const renderApp = (config) => {
	const today = new Date()
	const lastMonth = new Date()
	lastMonth.setMonth(lastMonth.getMonth() - 1)
	lastMonth.setHours(0, 0, 0, 0)
	
	render(
		<App
			{...config}
			startDate={lastMonth}
			endDate={today}
		/>,
		document.getElementById('app')
	)
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
