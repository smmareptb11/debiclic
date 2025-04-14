import { useEffect, useRef, useCallback } from 'preact/hooks'
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { fullDateTimeFormatter } from '../util/date'
import Loader from './loader'
import Tag from './tag'
import './observations-chart.css'
import { HYDRO_META } from '../lib/observations'
import { formaterNombreFr } from '../util/number'

const ObservationChart = ({ data, color = '#007BFF', grandeurHydro, onExportPNG }) => {
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
			data[0].map(t => new Date(t).getTime()),
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
					value: (u, v) => v != null ? `${formaterNombreFr(v)} ${meta.unit}` : '-'
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

		onExportPNG(canvas)
	}, [onExportPNG])

	// Affichage conditionnel en fonction de la disponibilité des données
	if (!data) {
		return <Loader />
	}

	if (data.length === 0 || (Array.isArray(data) && data[0].length === 0)) {
		return (
			<div className="warning-wrapper">
				<Tag type="warning">Aucune donnée disponible</Tag>
			</div>
		)
	}

	return (
		<div className="chart-wrapper">
			<div className="chart-container">
				<div ref={chartRef} />
			</div>

			<button
				disabled={data.length === 0}
				type="button"
				title="Exporter le graphique au format PNG"
				className="export-btn"
				onClick={exportPNG}
			>
				Exporter en PNG
			</button>
		</div>
	)
}

export default ObservationChart