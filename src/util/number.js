export function formaterNombreFr(valeur) {
    const nombre = Number(valeur.toFixed(2))
    return nombre.toLocaleString('fr-FR', {
      minimumFractionDigits: nombre % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })
  }