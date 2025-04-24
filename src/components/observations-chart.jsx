import { useEffect, useRef, useCallback } from 'preact/hooks'
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { fullDateTimeFormatter, shortDateTimeFormatter } from '../util/date'
import Loader from './loader'
import Tag from './tag'
import './observations-chart.css'
import { HYDRO_META } from '../lib/observations'
import { formaterNombreFr } from '../util/number'

const ObservationChart = ({ data, color = '#007BFF', days = 30, grandeurHydro, onExportPNG }) => {
	const zoomRef = useRef(null)
	const uZoomedRef = useRef()
	const rangerRef = useRef(null)
	const uRangerRef = useRef()
	
	const meta = HYDRO_META[grandeurHydro] ?? { label: grandeurHydro, unit: '', coef: 1, withTime: true }

	useEffect(() => {
		if (!zoomRef.current || !data) return

		// Convertir et trier les données par date croissante (en ms)
		const zipped = data.x.map((t, i) => [Date.parse(t), Number((data.y[i] * meta.coef).toFixed(2))])
		zipped.sort((a, b) => a[0] - b[0])
		const xVals = zipped.map(d => d[0])
		const yVals = zipped.map(d => d[1])
		const transformedData = [xVals, yVals]

		// Domaine de la vue principale sur les derniers N jours
		const daysClamped = Math.max(1, days)
		const nowMs = xVals[xVals.length - 1]
		const initMin = nowMs - daysClamped * 86400 * 1000
		const initMax = nowMs

		if (uZoomedRef.current) {
			uZoomedRef.current.destroy()
			uZoomedRef.current = null
		}

		const options = {
			width: 340,
			height: 200,
			scales: {
				x: { time: true, min: initMin, max: initMax },
				y: { auto: true }
			},
			axes: [
				{
					stroke: '#666',
					grid: { show: false },
					values: (u, vals) => vals.map(v => shortDateTimeFormatter(v))
				},
				{
					label: `${meta.label} (${meta.unit})`
				}
			],
			series: [
				{
					label: 'Date',
					value: (u, raw) => raw ? fullDateTimeFormatter(new Date(raw)) : '-'
				},
				{
					label: meta.label,
					stroke: color,
					width: 2,
					value: (u, v) => (v != null && !isNaN(v)) ? `${formaterNombreFr(v)} ${meta.unit}` : '-'
				}
			],
			legend: { show: true }
		}

		uZoomedRef.current = new UPlot(options, transformedData, zoomRef.current)

		// Ranger chart
		if (daysClamped < data.x.length) {
			const rangerOpts = {
				width: options.width - 100,
				height: 20,
				axes: [
				  { show: false },
				  { show: false }
				],
				scales: { x: { time: true } },
				series: [{}, { stroke: color, width: 1, fill: color, fillAlpha: 0.1 }],
				cursor: { x: false, y: false, points: { show: false }, drag: { setScale: false,setSelect: true,x: true,y: false } },
				legend: { show: false },
				select: { show: true },
				hooks: {
				  ready: [
				    uRanger => {
				      // position initiale de la sélection
				      const left = Math.round(uRanger.valToPos(initMin, 'x'))
				      const width = Math.round(uRanger.valToPos(initMax, 'x')) - left
				      const height = uRanger.bbox.height
				      uRanger.setSelect({ left, width, height }, false)

				      // helpers from example
				      const debounce = fn => {
				        let raf
				        return (...args) => {
				          if (raf) return
				          raf = requestAnimationFrame(() => { fn(...args); raf = null })
				        }
				      }
				      const on = (ev, el, fn) => el.addEventListener(ev, fn)
				      const off = (ev, el, fn) => el.removeEventListener(ev, fn)
				      const placeDiv = cls => {
				        const el = document.createElement('div')
				        el.classList.add(cls)
				        selector.appendChild(el)
				        return el
				      }

				      let x0, lft0, wid0

				      function update(newLft, newWid) {
				        const newRgt = newLft + newWid
				        const maxRgt = uRanger.bbox.width
				        if (newLft >= 0 && newRgt <= maxRgt) {
				          uRanger.setSelect({ left: newLft, width: newWid, height: uRanger.bbox.height }, false)
				          // update zoomed chart
				          const min = uRanger.posToVal(newLft, 'x')
				          const max = uRanger.posToVal(newLft + newWid, 'x')
				          uZoomedRef.current.setScale('x', { min, max })
				        }
				      }

				      function bindMove(e, onMove) {
				        x0 = e.clientX
				        lft0 = uRanger.select.left
				        wid0 = uRanger.select.width
				        const _onMove = debounce(evt => onMove(evt.clientX - x0))
				        on('mousemove', document, _onMove)
				        const _onUp = () => {
				          off('mousemove', document, _onMove)
				          off('mouseup', document, _onUp)
				        }
				        on('mouseup', document, _onUp)
				        e.stopPropagation()
				      }

				      const selector = uRanger.root.querySelector('.u-select')
				      // create grips for visual only
				      placeDiv('u-grip-l')
				      placeDiv('u-grip-r')
				      // bind pan only (fixed width)
				      on('mousedown', selector, e => bindMove(e, diff => update(lft0 + diff, wid0)))
				      const gripL = selector.querySelector('.u-grip-l')
				      const gripR = selector.querySelector('.u-grip-r')
				      on('mousedown', gripL, e => bindMove(e, diff => update(lft0 + diff, wid0)))
				      on('mousedown', gripR, e => bindMove(e, diff => update(lft0 + diff, wid0)))
				    }
				  ],
				  setSelect: [
				    u => {
				      const { left, width } = u.select
				      const min = u.posToVal(left, 'x')
				      const max = u.posToVal(left + width, 'x')
				      uZoomedRef.current.setScale('x', { min, max })
				    }
				  ]
				}
			}

			if (!uRangerRef.current) {
				uRangerRef.current = new UPlot(rangerOpts, transformedData, rangerRef.current)
			}
			else {
				uRangerRef.current.setData(transformedData)
			}
			const left = uRangerRef.current.valToPos(initMin, 'x')
			const right = uRangerRef.current.valToPos(initMax, 'x')
			uRangerRef.current.setSelect({ left, width: right - left, height: uRangerRef.current.bbox.height }, false)
		}
		else {
			uRangerRef.current?.destroy()
			uRangerRef.current = null
		}

		// Nettoyage lors du démontage ou d'un changement de dépendances
		return () => {
			uZoomedRef.current?.destroy()
			uRangerRef.current?.destroy()
		}
	}, [data, grandeurHydro, color, days])

	const exportPNG = useCallback(() => {
		const canvas = uZoomedRef.current?.root.querySelector('canvas')
		if (!canvas) return

		onExportPNG(canvas)
	}, [onExportPNG])

	// Affichage conditionnel en fonction de la disponibilité des données
	if (!data) {
		return <Loader />
	}

	if (data.length === 0 || (Array.isArray(data) && data.x.length === 0)) {
		return (
			<div className="warning-wrapper">
				<Tag type="warning">Aucune donnée disponible</Tag>
			</div>
		)
	}

	return (
		<div className="chart-wrapper">
			<div className="chart-container">
				{ days < data.x.length && <div ref={rangerRef} className="chart-ranger" /> }
				<div ref={zoomRef} />
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