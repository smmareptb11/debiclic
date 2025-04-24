import { useContext, useEffect, useRef } from 'preact/compat'
import Leaflet from 'leaflet'

import 'leaflet/dist/leaflet.css'
import './map.css'
import ConfigContext from '../contexts/config-context'

import.meta.env.DEBICLIC_DOC_URL

const DEBICLIC_DOC_URL = import.meta.env.DEBICLIC_DOC_URL || 'https://github.com/smmareptb11/debiclic'

function createInfoControl() {
	const infoControl = Leaflet.control({ position: 'bottomleft' })
	infoControl.onAdd = function(map) {
		const div = Leaflet.DomUtil.create('div', 'map-info-control')
		// Apply some basic styling
		div.style.background = 'rgba(255, 255, 255, 0.8)'
		div.style.padding = '5px 10px'
		div.style.borderRadius = '4px'
		div.style.margin = '10px'
		// Set the inner HTML with a link to the documentation
		div.innerHTML = `<a href="${DEBICLIC_DOC_URL}" target="_blank" style="text-decoration: none; color: inherit;">` +
      '<img src="/assets/debiclic-logo.png" alt="Debiclic Logo" style="height:20px; vertical-align:middle; margin-right:5px;" />' +
      'Documentation</a>'
		return div
	}
	return infoControl
}

const styles = {
	marker: {
		color: '#fff',
		fillOpacity: 0.6,
		radius: 8
	},
	hovered: {
		fillOpacity: 1,
		radius: 12
	}
}

const Map = ({ stations, selectedStationCode, hoveredStationCode, onHoverStation, onSelectStation }) => {
	const mapRef = useRef(null)
	const markersRef = useRef({})

	const { colors } = useContext(ConfigContext)

	const fitToStationsBounds = (map, stations) => {
		if (stations.length > 0) {
			const bounds = Leaflet.latLngBounds(stations.map(s => [s.lat, s.lng]))
			map.fitBounds(bounds, { padding: [40, 40] })
		}
	}
	
	// Initialisation de la carte
	useEffect(() => {
		if (!mapRef.current) {
			const map = Leaflet.map('mapid', {
				center: [46.5, 2.5],
				zoom: 6,
				zoomControl: false,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false,
				dragging: false,
				tap: false,
				keyboard: false
			})

			Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors'
			}).addTo(map)

			const infoControl = createInfoControl()
			infoControl.addTo(map)

			map.on('click', (e) => {
				// Si aucun marker n'est à la position cliquée, on désélectionne
				let clickedOnMarker = false
				Object.values(markersRef.current).forEach(marker => {
					if (marker.getLatLng().equals(e.latlng)) {
						clickedOnMarker = true
					}
				})
				
				if (!clickedOnMarker) {
					onSelectStation(null)
				}
			})

			mapRef.current = map
		}

		return () => {
			if (mapRef.current) {
				mapRef.current.remove()
				mapRef.current = null
			}
		}
	}, [])

	// Ajout des marqueurs
	useEffect(() => {
		if (mapRef.current) {
			const map = mapRef.current

			// Nettoyage des anciens marqueurs
			Object.values(markersRef.current).forEach(marker => marker.remove())
			markersRef.current = {}

			// Ajout des nouveaux marqueurs
			stations.forEach(station => {
				const marker = Leaflet.circleMarker([station.lat, station.lng], {
					...styles.marker,
					fillColor: colors.station
				}).addTo(map)
				markersRef.current[station.codeStation] = marker

				marker.on('click', (e) => {
					Leaflet.DomEvent.stopPropagation(e) // Empêche la propagation de l'événement au clic sur la carte
					onSelectStation(station.codeStation)
				})

				// Ajout de l'effet de survol
				marker.on('mouseover', () => {
					onHoverStation(station.codeStation)
					marker.setStyle(styles.hovered)
				})

				marker.on('mouseout', () => {
					onHoverStation(null)
					marker.setStyle(styles.marker)
				})
			})

			// FitBounds si stations disponibles
			fitToStationsBounds(map, stations)
		}
	}, [stations, onSelectStation, onHoverStation])

	// Sélection de la station
	useEffect(() => {
		if (!mapRef.current) return
	
		const map = mapRef.current
		const marker = markersRef.current[selectedStationCode]
	
		// Zoom sur la station sélectionnée
		if (marker) {
			map.setView(marker.getLatLng(), 18)
		}
		else {
			fitToStationsBounds(map, stations)
		}
	}, [selectedStationCode])

	// Effet de survol des stations
	useEffect(() => {
		if (!mapRef.current) return

		stations.forEach(station => {
			const marker = markersRef.current[station.codeStation]
			if (marker) {
				marker.setStyle(hoveredStationCode === station.codeStation
					? styles.hovered
					: styles.marker
				)
			}
		})
	}, [hoveredStationCode])
	

	return (
		<div id="mapid" />
	)
}

export default Map
