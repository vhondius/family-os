import { describe, expect, it } from 'vitest';
import { hourIn, isNight } from './day-night.js';

describe('isNight', () => {
	it('goes by the clock: night from 20:00 until 06:00, whatever the system says', () => {
		expect([5, 6, 12, 19, 20, 23, 0].map((h) => isNight('clock', h, true))).toEqual([
			true,
			false,
			false,
			false,
			true,
			true,
			true,
		]);
		expect(isNight('clock', 12, true)).toBe(false);
		expect(isNight('clock', 22, false)).toBe(true);
	});

	it('keeps the other choices as they were', () => {
		expect(isNight('system', 12, true)).toBe(true);
		expect(isNight('system', 23, false)).toBe(false);
		expect(isNight('day', 23, true)).toBe(false);
		expect(isNight('night', 12, false)).toBe(true);
	});
});

describe('hourIn', () => {
	it('reads the hour in the family time zone, not the device one', () => {
		const at = Date.UTC(2026, 10, 6, 18, 30);
		expect(hourIn('Europe/Istanbul', at)).toBe(21);
		expect(hourIn('America/New_York', at)).toBe(13);
	});
});
