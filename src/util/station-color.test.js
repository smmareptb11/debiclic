import { describe, it, expect } from 'vitest';
import { getStationColor } from './station-color';

describe('getStationColor', () => {
    const defaultColor = '#000000'; // Black

    // Note: Pour les tests qui ne concernent pas la conversion d'unité,
    // on utilise une grandeur factice avec coef=1 pour tester la logique de base
    const noConversionGrandeur = 'TEST'

    // Test case 1: No thresholdMode or thresholds provided
    it('should return defaultColor if thresholdMode is not provided', () => {
        const lastObservation = { resultat_obs: 10 };
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, undefined, defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    it('should return defaultColor if thresholds is not provided', () => {
        const lastObservation = { resultat_obs: 10 };
        expect(getStationColor(lastObservation, undefined, 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    it('should return defaultColor if thresholds is empty', () => {
        const lastObservation = { resultat_obs: 10 };
        expect(getStationColor(lastObservation, [], 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    // Test case 2: thresholdMode is 'none'
    it('should return defaultColor if thresholdMode is "none"', () => {
        const lastObservation = { resultat_obs: 10 };
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, 'none', defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    // Test case 3: lastObservation is undefined or null
    it('should return defaultColor if lastObservation is undefined', () => {
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(undefined, thresholds, 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    it('should return defaultColor if lastObservation.resultat_obs is null', () => {
        const lastObservation = { resultat_obs: null };
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    it('should return defaultColor if lastObservation.resultat_obs is undefined', () => {
        const lastObservation = {};
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor);
    });

    // Test case 4: thresholdMode is 'low-water'
        describe('low-water mode', () => {
            const thresholdsLowWater = [
                { value: 5, color: '#C1' },
                { value: 10, color: '#C2' },
                { value: 15, color: '#C3' }
            ]

            it('returns first threshold above value (between lower gaps)', () => {
                const lastObservation = { resultat_obs: 7 }
                // premier seuil strictement > 7 est 10
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor, noConversionGrandeur)).toBe('#C2')
            })

            it('returns threshold above when below all thresholds', () => {
                const lastObservation = { resultat_obs: 1 }
                // premier seuil > 1 est 5
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor, noConversionGrandeur)).toBe('#C1')
            })

            it('returns default color when value above highest threshold', () => {
                const lastObservation = { resultat_obs: 20 }
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor)
            })

            it('returns default color when exactly equal to highest threshold', () => {
                const lastObservation = { resultat_obs: 15 }
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor, noConversionGrandeur)).toBe(defaultColor)
            })

            it('returns threshold above when equal to lower threshold', () => {
                const lastObservation = { resultat_obs: 5 }
                // seuil strictement > 5 est 10
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor, noConversionGrandeur)).toBe('#C2')
            })
        })

    // Test case 5: thresholdMode is 'flood'
        describe('flood mode', () => {
            const thresholdsFlood = [
                { value: 5, color: '#D1' },
                { value: 10, color: '#D2' },
                { value: 15, color: '#D3' }
            ]

            it('returns default color if below first threshold', () => {
                const lastObservation = { resultat_obs: 3 }
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor, noConversionGrandeur)).toBe(defaultColor)
            })

            it('returns last exceeded threshold color (middle)', () => {
                const lastObservation = { resultat_obs: 12 }
                // seuils dépassés : 5 (#D1), 10 (#D2) => dernier dépassé 10
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor, noConversionGrandeur)).toBe('#D2')
            })

            it('returns highest threshold color when above all', () => {
                const lastObservation = { resultat_obs: 30 }
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor, noConversionGrandeur)).toBe('#D3')
            })

            it('returns threshold color when exactly at value', () => {
                const lastObservation = { resultat_obs: 10 }
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor, noConversionGrandeur)).toBe('#D2')
            })
        })

    // Test case 6: Unit conversion with grandeurHydro parameter
    describe('unit conversion', () => {
        it('converts l/s to m³/s for QmnJ in low-water mode', () => {
            // Seuils en l/s (unité brute de l'API, comme dans la config utilisateur)
            const thresholds = [
                { label: 'Crise', value: 10, color: '#FF0000' },       // 10 l/s
                { label: 'Alerte renforcée', value: 30, color: '#FA4D00' }, // 30 l/s
                { label: 'Alerte', value: 40, color: '#ed9d5e' },      // 40 l/s
                { label: 'Vigilance', value: 140, color: '#ECEC2E' }   // 140 l/s
            ]
            
            // Valeur observée : 7 l/s (brut de l'API)
            // Après conversion : 7 * 0.001 = 0.007 m³/s
            // Seuils après conversion : 0.01, 0.03, 0.04, 0.14 m³/s
            // Premier seuil > 0.007 m³/s est 0.01 m³/s (Crise)
            const lastObservation = { resultat_obs: 7 } // en l/s
            expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor, 'QmnJ')).toBe('#FF0000')
        })

        it('converts l/s to m³/s for Q in low-water mode', () => {
            // Seuils en l/s
            const thresholds = [
                { label: 'Vigilance', value: 140, color: '#ECEC2E' }, // 140 l/s = 0.14 m³/s
                { label: 'Alerte', value: 40, color: '#ed9d5e' },     // 40 l/s = 0.04 m³/s
                { label: 'Crise', value: 10, color: '#FF0000' }       // 10 l/s = 0.01 m³/s
            ]
            
            // Valeur observée : 25 l/s = 0.025 m³/s
            // Premier seuil > 0.025 m³/s est 0.04 m³/s (Alerte)
            const lastObservation = { resultat_obs: 25 } // en l/s
            expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor, 'Q')).toBe('#ed9d5e')
        })

        it('handles values above all thresholds with conversion', () => {
            const thresholds = [
                { label: 'Vigilance', value: 140, color: '#ECEC2E' }, // 140 l/s = 0.14 m³/s
            ]
            
            // Valeur observée : 200 l/s = 0.2 m³/s > 0.14 m³/s
            const lastObservation = { resultat_obs: 200 } // en l/s
            expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor, 'Q')).toBe(defaultColor)
        })

        it('converts l/s to m³/s for flood mode', () => {
            // Seuils en l/s
            const thresholds = [
                { label: 'Vigilance', value: 50, color: '#ECEC2E' },  // 50 l/s = 0.05 m³/s
                { label: 'Alerte', value: 100, color: '#ed9d5e' },    // 100 l/s = 0.10 m³/s
                { label: 'Crise', value: 150, color: '#FF0000' }      // 150 l/s = 0.15 m³/s
            ]
            
            // Valeur observée : 120 l/s = 0.12 m³/s
            // Dernier seuil dépassé : 0.10 m³/s (Alerte)
            const lastObservation = { resultat_obs: 120 } // en l/s
            expect(getStationColor(lastObservation, thresholds, 'flood', defaultColor, 'Q')).toBe('#ed9d5e')
        })
    })
});
