import { describe, it, expect } from 'vitest'
import { validateConfig } from './config'

describe('validateConfig', () => {
	it('valide une configuration minimale correcte', () => {
		const config = {
			codeStations: ['X001'],
			grandeurHydro: 'QmnJ'
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(true)
		expect(errors).toHaveLength(0)
	})

	it('rejette une configuration vide', () => {
		const { valid, errors } = validateConfig({})
		expect(valid).toBe(false)
		expect(errors).toContain('Le champ "codeStations" est requis et doit être un tableau non vide.')
	})

	it('rejette si stationsLabels contient une clé inconnue', () => {
		const config = {
			codeStations: ['X001'],
			stationsLabels: { BAD: 'Bidon' },
			grandeurHydro: 'H'
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors[0]).toMatch(/stationsLabels.*clés inconnues/i)
	})

	it('accepte grandeurHydro "Q" comme valeur valide', () => {
		const config = {
			codeStations: ['X001'],
			grandeurHydro: 'Q'
		}
		const { valid } = validateConfig(config)
		expect(valid).toBe(true)
	})

	it('définit grandeurHydro = "Q" si non fourni', () => {
		const config = { codeStations: ['X001'] }
		const result = validateConfig(config)
		expect(result.valid).toBe(true)
		expect(config.grandeurHydro).toBe('Q') // mutation directe
	})
	it('rejette si grandeurHydro est invalide', () => {
		const config = {
			codeStations: ['X001'],
			grandeurHydro: 'INVALID'
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"grandeurHydro" doit être "Q", "H", ou "QmnJ".')
	})

	it('rejette si colors n\'est pas un objet', () => {
		const config = {
			codeStations: ['X001'],
			colors: 'rouge'
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"colors" doit être un objet avec les clés station et graph')
	})

	it('rejette si days est hors bornes', () => {
		const config = {
			codeStations: ['X001'],
			days: 40
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"days" doit être un nombre entre 1 et 30.')
	})

	it('rejette si sort est invalide', () => {
		const config = {
			codeStations: ['X001'],
			sort: 'random'
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"sort" doit être "asc", "desc" ou "default".')
	})

	it('rejette si showMap n\'est pas un booléen', () => {
		const config = {
			codeStations: ['X001'],
			showMap: 'yes'
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"showMap" doit être un booléen.')
	})

	it('rejette si width n\'est pas une chaîne ou un nombre', () => {
		const config = {
			codeStations: ['X001'],
			width: {}
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"width" doit être une chaîne ou un nombre.')
	})

	it('rejette si height n\'est pas une chaîne ou un nombre', () => {
		const config = {
			codeStations: ['X001'],
			height: []
		}
		const { valid, errors } = validateConfig(config)
		expect(valid).toBe(false)
		expect(errors).toContain('"height" doit être une chaîne ou un nombre.')
	})

	it('rejette si container n\'est pas une chaîne ou un élément HTML', () => {
		const config = {
			codeStations: ['X001'],
			container: 42
		}
		const { valid, errors } = validateConfig(config)
        expect(valid).toBe(false)
        expect(errors).toContain('"container" doit être un sélecteur CSS (string).')
    })

    it('valide une configuration avec des seuils corrects', () => {
        const config = {
            codeStations: ['X001'],
            seuils: {
                X001: [
					{ label: 'Bas', value: 10, color: 'blue', style: 'solid', default: true },
					{ label: 'Haut', value: 20, color: 'red', style: 'dotted', default: false }
                ]
            }
        }
        const { valid, errors } = validateConfig(config)
        expect(valid).toBe(true)
        expect(errors).toHaveLength(0)
    })

    it('rejette si seuils contient une clé de station inconnue', () => {
        const config = {
            codeStations: ['X001'],
            seuils: { BAD: [] }
        }
        const { valid, errors } = validateConfig(config)
        expect(valid).toBe(false)
        expect(errors[0]).toMatch(/seuils.*clé de station inconnue/i)
    })

    it('rejette si un seuil a un format invalide', () => {
        const config = {
            codeStations: ['X001'],
            seuils: {
                X001: [{ label: 'Bas' }]
            }
        }
        const { valid, errors } = validateConfig(config)
        expect(valid).toBe(false)
        expect(errors).toContain("Le seuil à l'index 0 pour la station X001 doit avoir une \"value\" (nombre).")
    })

    it('valide une configuration avec un threshold correct', () => {
        const config = {
            codeStations: ['X001'],
            threshold: 'low-water'
        }
        const { valid, errors } = validateConfig(config)
        expect(valid).toBe(true)
        expect(errors).toHaveLength(0)
    })

    it('rejette si threshold est invalide', () => {
        const config = {
            codeStations: ['X001'],
            threshold: 'invalid'
        }
        const { valid, errors } = validateConfig(config)
        expect(valid).toBe(false)
        expect(errors).toContain('"threshold" doit être "none", "low-water" ou "flood".')
    })
})
