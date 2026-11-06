/**
 * Day and night on a device: follow the system, stay in the day or the night palette, or go by
 * the clock (night from `NIGHT_FROM_HOUR` until `DAY_FROM_HOUR` in the family's time zone).
 */
export type Mode = 'system' | 'clock' | 'day' | 'night';

/** The hours the weather strip takes for day without sunrise and sunset (`@famos/ui`'s HourlyStrip). */
const DAY_FROM_HOUR = 6;
const NIGHT_FROM_HOUR = 20;

export const MODES: readonly Mode[] = ['system', 'clock', 'day', 'night'];

/** The hour (0–23) of an instant in a time zone. */
export function hourIn(timeZone: string, at: number): number {
	return Number(
		new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23', timeZone }).format(at),
	);
}

/** Whether the night palette shows. */
export function isNight(mode: Mode, hour: number, systemDark: boolean): boolean {
	if (mode === 'clock') return hour < DAY_FROM_HOUR || hour >= NIGHT_FROM_HOUR;
	return mode === 'night' || (mode === 'system' && systemDark);
}
