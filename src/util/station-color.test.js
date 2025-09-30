import { describe, it, expect } from 'vitest';
import { getStationColor } from './station-color';

describe('getStationColor', () => {
    const defaultColor = '#000000'; // Black

    // Test case 1: No thresholdMode or thresholds provided
    it('should return defaultColor if thresholdMode is not provided', () => {
        const lastObservation = { resultat_obs: 10 };
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, undefined, defaultColor)).toBe(defaultColor);
    });

    it('should return defaultColor if thresholds is not provided', () => {
        const lastObservation = { resultat_obs: 10 };
        expect(getStationColor(lastObservation, undefined, 'low-water', defaultColor)).toBe(defaultColor);
    });

    it('should return defaultColor if thresholds is empty', () => {
        const lastObservation = { resultat_obs: 10 };
        expect(getStationColor(lastObservation, [], 'low-water', defaultColor)).toBe(defaultColor);
    });

    // Test case 2: thresholdMode is 'none'
    it('should return defaultColor if thresholdMode is "none"', () => {
        const lastObservation = { resultat_obs: 10 };
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, 'none', defaultColor)).toBe(defaultColor);
    });

    // Test case 3: lastObservation is undefined or null
    it('should return defaultColor if lastObservation is undefined', () => {
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(undefined, thresholds, 'low-water', defaultColor)).toBe(defaultColor);
    });

    it('should return defaultColor if lastObservation.resultat_obs is null', () => {
        const lastObservation = { resultat_obs: null };
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor)).toBe(defaultColor);
    });

    it('should return defaultColor if lastObservation.resultat_obs is undefined', () => {
        const lastObservation = {};
        const thresholds = [{ value: 5, color: '#FF0000' }];
        expect(getStationColor(lastObservation, thresholds, 'low-water', defaultColor)).toBe(defaultColor);
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
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor)).toBe('#C2')
            })

            it('returns threshold above when below all thresholds', () => {
                const lastObservation = { resultat_obs: 1 }
                // premier seuil > 1 est 5
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor)).toBe('#C1')
            })

            it('returns default color when value above highest threshold', () => {
                const lastObservation = { resultat_obs: 20 }
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor)).toBe(defaultColor)
            })

            it('returns default color when exactly equal to highest threshold', () => {
                const lastObservation = { resultat_obs: 15 }
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor)).toBe(defaultColor)
            })

            it('returns threshold above when equal to lower threshold', () => {
                const lastObservation = { resultat_obs: 5 }
                // seuil strictement > 5 est 10
                expect(getStationColor(lastObservation, thresholdsLowWater, 'low-water', defaultColor)).toBe('#C2')
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
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor)).toBe(defaultColor)
            })

            it('returns last exceeded threshold color (middle)', () => {
                const lastObservation = { resultat_obs: 12 }
                // seuils dépassés : 5 (#D1), 10 (#D2) => dernier dépassé 10
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor)).toBe('#D2')
            })

            it('returns highest threshold color when above all', () => {
                const lastObservation = { resultat_obs: 30 }
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor)).toBe('#D3')
            })

            it('returns threshold color when exactly at value', () => {
                const lastObservation = { resultat_obs: 10 }
                expect(getStationColor(lastObservation, thresholdsFlood, 'flood', defaultColor)).toBe('#D2')
            })
        })
});
