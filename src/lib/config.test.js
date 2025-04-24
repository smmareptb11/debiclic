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

	it('accepte grandeurHydro "Q,H" comme valeur valide', () => {
		const config = {
			codeStations: ['X001'],
			grandeurHydro: 'Q'
		}
		const { valid } = validateConfig(config)
		expect(valid).toBe(true)
	})

	it('définit grandeurHydro = "Q,H" si non fourni', () => {
		const config = { codeStations: ['X001'] }
		const result = validateConfig(config)
		expect(result.valid).toBe(true)
		expect(config.grandeurHydro).toBe('Q') // mutation directe
	})
})
