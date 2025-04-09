import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks'
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { fullDateTimeFormatter } from '../util/date'
import './station-chart.css'
import Tag from './tag'
import Loader from './loader'
import ThemeContext from '../contexts/theme-context'

const noDataOpts = {
	width: 340,
	height: 200,
	scales: {
		x: {
			range(u, dataMin, dataMax) {
				if (dataMin == null)
					return [1566453600, 1566497660]

				return [dataMin, dataMax]
			}
		},
		y: {
			range(u, dataMin, dataMax) {
				if (dataMin == null)
					return [0, 100]

				return UPlot.rangeNum(dataMin, dataMax, 0.1, true)
			}
		}
	},
	series: [
		{},
		{}
	]
}

const StationChart = ({ isLoading, chartQ, chartH }) => {
	const chartRef = useRef(null)
	const uplotInstance = useRef(null)

	const { colors } = useContext(ThemeContext)

	const [activeTab, setActiveTab] = useState(chartQ ? 'Q' : 'H')

	const xData = activeTab === 'Q' ? chartQ?.[0] : chartH?.[0]
	const yData = activeTab === 'Q' ? chartQ?.[1] : chartH?.[1]

	const activeTabHasData = activeTab === 'Q' && chartQ || activeTab === 'H' && chartH

	useEffect(() => {
		if (!chartRef.current) return

		if (uplotInstance.current) {
			uplotInstance.current.destroy()
			uplotInstance.current = null
		}

		const data = [xData, yData]

		const label = activeTab === 'Q' ? 'Débit' : 'Hauteur'
		const color = activeTab === 'Q' ? colors.Q : colors.H
		const unit = activeTab === 'Q' ? 'm³/s' : 'mm'

		const series = [
			{ label: 'Date', value: (u, raw) => raw ? fullDateTimeFormatter(raw) : '-' },
			{
				label,
				stroke: color,
				width: 2,
				value: (u, v) => v != null ? `${v} ${unit}` : '-'
			}
		]

		const options = xData ? {
			width: 340,
			height: 200,
			scales: {
				x: { time: true },
				y: { auto: true }
			},
			axes: [
				{
					rotate: 45,
					stroke: '#666',
					grid: { show: false },
					values: (u, ts) => ts.map(t =>
						new Intl.DateTimeFormat('fr-FR', {
							day: '2-digit',
							month: '2-digit'
						}).format(t)
					)
				},
				{
					label: `${label} (${unit})`
				}
			],
			series,
			legend: {
				show: true
			}
		} : noDataOpts

		uplotInstance.current = new UPlot(options, xData ? data : null, chartRef.current)

		return () => {
			uplotInstance.current?.destroy()
		}
	}, [activeTab, chartQ, chartH])

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
		link.download = `graphique-${activeTab}.png`
		link.href = exportCanvas.toDataURL('image/png')
		link.click()
	}, [activeTab])

	const handleClickQ = useCallback(() => {
		setActiveTab('Q')
	}, [])
	
	const handleClickH = useCallback(() => {
		setActiveTab('H')
	}, [])

	return (
		<div className="chart-wrapper">
			<div className="chart-tabs">
				<button
					className={activeTab === 'Q' ? 'active' : ''}
					onClick={handleClickQ}
				>
            Débit {!isLoading && !chartQ ? '⚠️' : ''}
				</button>
				<button
					className={activeTab === 'H' ? 'active' : ''}
					onClick={handleClickH}
				>
            Hauteur {!isLoading && !chartH ? '⚠️' : ''}
				</button>
				<button disabled={!activeTabHasData} className="export-btn" onClick={exportPNG}>
            Export PNG
				</button>
			</div>

			<div className="chart-container">
				<div ref={chartRef} />
				{isLoading && <div className="chart-overlay"><Loader /></div>}
				{!isLoading && !activeTabHasData && <div className="chart-overlay"><Tag type="warning">Aucune donnée disponible</Tag></div>}
			</div>
		</div>
	)
}

export default StationChart
