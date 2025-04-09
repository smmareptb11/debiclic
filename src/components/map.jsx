import { useContext, useEffect, useRef } from 'preact/compat'
import Leaflet from 'leaflet'

import 'leaflet/dist/leaflet.css'
import './map.css'
import ThemeContext from '../contexts/theme-context'

const styles = {
	selected: {
		fillOpacity: 0.8
	},
	marker: {
		fillOpacity: 0.6
	}
}

const Map = ({ stations, selectedStationCode, onSelectStation }) => {
	const mapRef = useRef(null)
	const markersRef = useRef({})

	const { colors } = useContext(ThemeContext)

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
				marker.on('click', () => onSelectStation(station.codeStation))
			})

			// FitBounds si stations disponibles
			fitToStationsBounds(map, stations)
		}
	}, [stations, onSelectStation])

	// Mise à jour du style de sélection
	useEffect(() => {
		if (!mapRef.current) return
	
		const map = mapRef.current
		const marker = markersRef.current[selectedStationCode]
	
		// Style
		Object.keys(markersRef.current).forEach(stationCode => {
			const m = markersRef.current[stationCode]
			if (stationCode === selectedStationCode) {
				m.setStyle({
					...styles.marker,
					fillColor: colors.selectedStation
				})
			}
			else {
				m.setStyle({
					...styles.marker,
					fillColor: colors.station
				})
			}
		})
	
		// Zoom sur la station sélectionnée
		if (marker) {
			map.setView(marker.getLatLng(), 18)
		}
		else {
			fitToStationsBounds(map, stations)
		}
	}, [selectedStationCode])
	

	return (
		<div id="mapid" />
	)
}

export default Map
