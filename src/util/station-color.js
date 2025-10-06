import { HYDRO_META } from '../lib/observations.js'

// Calcule la couleur d'une station selon les règles de modes de seuils.
// Modes :
//  - none : couleur par défaut
//  - flood : couleur du dernier seuil dépassé (max threshold.value <= valeur). Sinon défaut si valeur en-dessous du plus bas seuil.
//  - low-water : couleur du premier seuil au-dessus (min threshold.value > valeur). Sinon défaut si valeur au-dessus du plus haut seuil.
//
// Note: Les seuils et la valeur observée sont dans l'unité brute de l'API (l/s pour les débits).
// On applique la même conversion (meta.coef) pour comparer dans la même unité affichée.
export function getStationColor(lastObservation, thresholds, thresholdMode, defaultColor, grandeurHydro = 'Q') {
  const mode = thresholdMode ?? 'none'
  if (mode === 'none' || !Array.isArray(thresholds) || thresholds.length === 0) return defaultColor

  const rawValue = lastObservation?.resultat_obs
  if (rawValue === undefined || rawValue === null || isNaN(rawValue)) return defaultColor

  // Appliquer le même coefficient de conversion que pour l'affichage
  const meta = HYDRO_META[grandeurHydro] ?? { coef: 1 }
  const v = rawValue * meta.coef
  
  // Convertir aussi les seuils avec le même coefficient
  const sorted = [...thresholds]
    .map(th => ({ ...th, value: th.value * meta.coef }))
    .sort((a, b) => a.value - b.value)

  if (mode === 'flood') {
    if (v < sorted[0].value) return defaultColor
    let chosen = null
    for (const s of sorted) {
      if (v >= s.value) chosen = s
      else break
    }
    return chosen ? chosen.color : defaultColor
  }

  if (mode === 'low-water') {
    const max = sorted[sorted.length - 1]
    if (v > max.value) return defaultColor
    for (const s of sorted) {
      if (s.value > v) return s.color
    }
    // v est égal au plus haut seuil -> couleur par défaut (spécification : au-dessus => défaut, on assimile l'égalité ici pour rester prévisible)
    return defaultColor
  }

  return defaultColor
}
