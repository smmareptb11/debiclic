import { useEffect, useRef, useCallback } from 'preact/hooks'
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { fullDateTimeFormatter } from '../util/date'
import Loader from './loader'
import Tag from './tag'
import './observations-chart.css'

const HYDRO_META = {
	QmM: { label: 'Débit mensuel',         unit: 'm³/s', coef: 1 / 1000, withTime: false },
	QmnJ: { label: 'Débit journalier',       unit: 'm³/s', coef: 1 / 1000, withTime: true },
	QINM: { label: 'Débit min. mensuel',     unit: 'm³/s', coef: 1 / 1000, withTime: false },
	QINnJ: { label: 'Débit min. journalier',  unit: 'm³/s', coef: 1 / 1000, withTime: true },
	QixM: { label: 'Débit max. mensuel',     unit: 'm³/s', coef: 1 / 1000, withTime: false },
	QIXnJ: { label: 'Débit max. journalier',  unit: 'm³/s', coef: 1 / 1000, withTime: true },
	HIXM: { label: 'Hauteur max. mensuelle', unit: 'mm',   coef: 1,        withTime: false },
	HIXnJ: { label: 'Hauteur max. journalière',unit: 'mm',  coef: 1,        withTime: true }
}

const ObservationChart = ({ data, color = '#007BFF', grandeurHydro }) => {
	const chartRef = useRef(null)
	const uplotInstance = useRef(null)
	const meta = HYDRO_META[grandeurHydro] ?? { label: grandeurHydro, unit: '', coef: 1, withTime: true }

	useEffect(() => {
		if (!chartRef.current || !data) return

		if (uplotInstance.current) {
			uplotInstance.current.destroy()
			uplotInstance.current = null
		}

		// Transformation des données :
		// - Conversion du tableau de timestamps des millisecondes en secondes pour uPlot
		// - Application du coefficient sur les valeurs y
		const transformedData = [
			data[0].map(t => t / 1000),
			data[1].map(v => v * meta.coef)
		]

		const options = {
			width: 340,
			height: 200,
			scales: {
				x: { time: true },
				y: { auto: true }
			},
			axes: [
				{
					// Axe des x : formatage des dates en fonction de la configuration meta
					rotate: 45,
					stroke: '#666',
					grid: { show: false },
					values: (u, ts) => ts.map(t =>
						new Intl.DateTimeFormat('fr-FR', meta.withTime ? {
							day: '2-digit',
							month: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						} : {
							day: '2-digit',
							month: '2-digit'
						}).format(new Date(t * 1000))
					)
				},
				{
					label: `${meta.label} (${meta.unit})`
				}
			],
			series: [
				{ 
					label: 'Date', 
					value: (u, raw) => raw ? fullDateTimeFormatter(raw) : '-' 
				},
				{
					label: meta.label,
					stroke: color,
					width: 2,
					value: (u, v) => v != null ? `${v} ${meta.unit}` : '-'
				}
			],
			legend: { show: true }
		}

		uplotInstance.current = new UPlot(options, transformedData, chartRef.current)

		// Nettoyage lors du démontage ou d'un changement de dépendances
		return () => {
			uplotInstance.current?.destroy()
		}
	}, [data, grandeurHydro, color])

	const exportPNG = useCallback(() => {
		const canvas = uplotInstance.current?.root.querySelector('canvas')
		if (!canvas) return

		const exportCanvas = document.createElement('canvas')
		exportCanvas.width = canvas.width
		exportCanvas.height = canvas.height
		const ctx = exportCanvas.getContext('2d')
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
		ctx.drawImage(canvas, 0, 0)

		const link = document.createElement('a')
		link.download = `graphique-${grandeurHydro}.png`
		link.href = exportCanvas.toDataURL('image/png')
		link.click()
	}, [grandeurHydro])

	// Affichage conditionnel en fonction de la disponibilité des données
	if (!data) {
		return <div className="chart-wrapper"><Loader /></div>
	}

	if (data.length === 0 || (Array.isArray(data) && data[0].length === 0)) {
		return <div className="chart-wrapper"><Tag type="warning">Aucune donnée disponible</Tag></div>
	}

	return (
		<div className="chart-wrapper">
			<button disabled={data.length === 0} className="export-btn" onClick={exportPNG}>
				Export PNG
			</button>
			<div className="chart-container">
				<div ref={chartRef} />
			</div>
		</div>
	)
}

export default ObservationChart