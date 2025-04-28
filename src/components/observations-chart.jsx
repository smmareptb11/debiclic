import { useEffect, useRef, useCallback } from 'preact/hooks'
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { fullDateTimeFormatter, shortDateTimeFormatter } from '../util/date'
import Loader from './loader'
import Tag from './tag'
import './observations-chart.css'
import { HYDRO_META } from '../lib/observations'
import { formaterNombreFr } from '../util/number'

const DEFAULT_ZOOMED_WIDTH = 340
const DEFAULT_ZOOMED_HEIGHT = 300
const RANGER_OFFSET = 100
const DEFAULT_RANGER_HEIGHT = 28

const ObservationChart = ({ data, color = '#007BFF', days = 30, grandeurHydro, onExportPNG, setVisibleDates }) => {
	const zoomRef = useRef(null)
	const uZoomedRef = useRef()
	const rangerRef = useRef(null)
	const uRangerRef = useRef()
	
	const meta = HYDRO_META[grandeurHydro] ?? { label: grandeurHydro, unit: '', coef: 1, withTime: true }

	useEffect(() => {
		if (!zoomRef.current || !data) return

		// Convertir et trier les données par date croissante (en ms)
		const zipped = data.x.map((t, i) => [Date.parse(t), data.y[i] ? Number((data.y[i] * meta.coef).toFixed(2)) : null])
		zipped.sort((a, b) => a[0] - b[0])
		const xVals = zipped.map(d => d[0])
		const yVals = zipped.map(d => d[1])
		const transformedData = [xVals, yVals]

		// Domaine de la vue principale sur les derniers N jours
		const daysClamped = Math.max(1, days)
		const nowMs = xVals[xVals.length - 1]
		const initMin = nowMs - daysClamped * 86400 * 1000
		const initMax = nowMs

		setVisibleDates({ startDate: new Date(initMin), endDate: new Date(initMax) })

		if (uZoomedRef.current) {
			uZoomedRef.current.destroy()
			uZoomedRef.current = null
		}

		const options = {
			width: zoomRef.current?.offsetWidth || DEFAULT_ZOOMED_WIDTH,
			height: DEFAULT_ZOOMED_HEIGHT,
			scales: {
				x: { time: true, min: initMin, max: initMax },
				y: { auto: true }
			},
			axes: [
				{
					stroke: '#666',
					grid: { show: false },
					space: 70,
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
					spanGaps: false,
					width: 2,
					value: (u, v) => (v != null && !isNaN(v)) ? `${formaterNombreFr(v)} ${meta.unit}` : '-'
				}
			],
			cursor: { drag: { setScale: false, setSelect: false }, bind: { dblclick: () => null } },
			select: { show: false },
			legend: { show: false },
			hooks: {
				init: [
				  u => {
					const tooltip = document.createElement("div")
					tooltip.id = "tooltip"
					document.body.appendChild(tooltip)
			  
					let bLeft = 0
					let bTop = 0
			  
					function syncBounds() {
					  if (zoomRef.current) {
						const bbox = zoomRef.current.getBoundingClientRect()
						bLeft = bbox.left
						bTop = bbox.top
					  }
					}
			  
					syncBounds()
					window.addEventListener('resize', syncBounds)
			  
					u.over.addEventListener('mouseenter', () => {
					  tooltip.style.display = "block"
					})
					u.over.addEventListener('mouseleave', () => {
					  tooltip.style.display = "none"
					})
			  
					u.over._tooltip = tooltip
					u.over._syncBounds = syncBounds
				  }
				],
				setCursor: [
					u => {
					  const tooltip = u.over._tooltip
					  const { left, top, idx } = u.cursor
				  
					  if (idx == null || idx < 0 || idx >= u.data[0].length) {
						tooltip.style.display = "none"
						return
					  }
				  
					  const xVal = u.data[0][idx]
					  const yVal = u.data[1][idx]
				  
					  if (xVal == null || yVal == null) {
						tooltip.style.display = "none"
						return
					  }
				  
					  tooltip.style.display = "block"
					  tooltip.innerHTML = `
					    <div class="date">${fullDateTimeFormatter(new Date(xVal))}</div>
					    <div class="value">${meta.label} : ${formaterNombreFr(yVal)} ${meta.unit}</div>
					  `
				  
					  const bbox = u.over.getBoundingClientRect()
					  const tooltipWidth = 150
					  const tooltipHeight = 40
				  
					  let pageX = left + bbox.left
					  let pageY = top + bbox.top
				  
					  if (pageX + tooltipWidth + 10 > window.innerWidth) {
						pageX = pageX - tooltipWidth - 10
					  } else {
						pageX = pageX + 10
					  }
				  
					  if (pageY + tooltipHeight + 10 > window.innerHeight) {
						pageY = pageY - tooltipHeight - 10
					  } else {
						pageY = pageY + 10
					  }
				  
					  tooltip.style.left = `${pageX}px`
					  tooltip.style.top = `${pageY}px`
					}
				  ],
				destroy: [
				  u => {
					const tooltip = u.over._tooltip
					const syncBounds = u.over._syncBounds
					if (tooltip?.parentNode) tooltip.parentNode.removeChild(tooltip)
					window.removeEventListener('resize', syncBounds)
				  }
				]
			  }
		}

		uZoomedRef.current = new UPlot(options, transformedData, zoomRef.current)

		// Ranger chart
		const rangerOpts = {
			width: (zoomRef.current?.offsetWidth || DEFAULT_ZOOMED_WIDTH) - RANGER_OFFSET,
			height: DEFAULT_RANGER_HEIGHT,
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
						const left = Math.round(uRanger.valToPos(initMin, 'x'))
						const width = Math.round(uRanger.valToPos(initMax, 'x')) - left
						const height = uRanger.bbox.height
						uRanger.setSelect({ left, width, height }, false)

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
							const newRgt = newLft + newWid;
							const maxRgt = uRanger.bbox.width;
							const minWidth = 10; // Minimum allowed width in pixels

							if (newLft >= 0 && newRgt <= maxRgt && newWid >= minWidth) {
								uRanger.setSelect({ left: newLft, width: newWid, height: uRanger.bbox.height }, false);

								const min = uRanger.posToVal(newLft, 'x');
								const max = uRanger.posToVal(newLft + newWid, 'x');

								uZoomedRef.current.setScale('x', { min, max });
								setVisibleDates({ startDate: new Date(min), endDate: new Date(max) });
							}
						}

						function bindMove(e, onMove) {
							x0 = e.clientX;
							lft0 = uRanger.select.left;
							wid0 = uRanger.select.width;
							const _onMove = debounce(evt => onMove(evt.clientX - x0));
							const _onUp = () => {
								off('mousemove', document, _onMove);
								off('mouseup', document, _onUp);
							};
							on('mousemove', document, _onMove);
							on('mouseup', document, _onUp);
							e.stopPropagation();
						}

						const selector = uRanger.root.querySelector('.u-select')

						placeDiv('u-grip-l')
						placeDiv('u-grip-r')
						// bind pan only (fixed width)
						on('mousedown', selector, e => bindMove(e, diff => update(lft0 + diff, wid0)))
						const gripL = selector.querySelector('.u-grip-l')
						const gripR = selector.querySelector('.u-grip-r')
						on('mousedown', gripL, e => bindMove(e, diff => update(lft0 + diff, wid0 - diff)))
						on('mousedown', gripR, e => bindMove(e, diff => update(lft0, wid0 + diff)))
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

		// Gestionnaire de redimensionnement
		const handleResize = () => {
			if (!zoomRef.current || !data) return

			const width = zoomRef.current.offsetWidth || DEFAULT_ZOOMED_WIDTH

			if (uZoomedRef.current) {
				uZoomedRef.current.setSize({ width, height: DEFAULT_ZOOMED_HEIGHT })
			}

			if (uRangerRef.current) {
				uRangerRef.current.setSize({ width: width - RANGER_OFFSET, height: DEFAULT_RANGER_HEIGHT })
			}
		}

		window.addEventListener('resize', handleResize)

		// Cleanup on unmount
		return () => {
			uZoomedRef.current?.destroy()
			uRangerRef.current?.destroy()
			window.removeEventListener('resize', handleResize)
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
		<div className="chart-container">

			<button
				disabled={data.length === 0}
				type="button"
				title="Exporter le graphique au format PNG"
				className="export-btn"
				onClick={exportPNG}
			>
				📷
			</button>
			<div className="chart-wrapper">
				{ <div ref={rangerRef} className="chart-ranger" /> }
				<div ref={zoomRef} />
			</div>
		</div>
	)
}

export default ObservationChart