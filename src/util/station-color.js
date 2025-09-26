// Calcule la couleur d'une station selon les règles de modes de seuils.
// Modes :
//  - none : couleur par défaut
//  - flood : couleur du dernier seuil dépassé (max seuil.value <= valeur). Sinon défaut si valeur en-dessous du plus bas seuil.
//  - low-water : couleur du premier seuil au-dessus (min seuil.value > valeur). Sinon défaut si valeur au-dessus du plus haut seuil.
export function getStationColor(lastObservation, seuils, thresholdMode, defaultColor) {
  const mode = thresholdMode ?? 'none'
  if (mode === 'none' || !Array.isArray(seuils) || seuils.length === 0) return defaultColor

  const v = lastObservation?.resultat_obs
  if (v === undefined || v === null || isNaN(v)) return defaultColor

  const sorted = [...seuils].sort((a, b) => a.value - b.value)

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
