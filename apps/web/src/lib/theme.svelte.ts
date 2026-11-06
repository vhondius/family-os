import { hourIn, isNight, type Mode } from './day-night.js';
import { family } from './family.svelte.js';

/**
 * Day and night: each device chooses to follow the system, to go by the clock, or to stay
 * in the day or the night palette of the active theme. Night is the `.dark` class on <html>.
 * The choice lives in this browser only (`famos.mode`); app.html applies it before first paint.
 */
export type { Mode };

const KEY = 'famos.mode';
/** How often "by the clock" looks at the time. */
const CLOCK_CHECK_MS = 60_000;

function stored(): Mode {
	try {
		const value = localStorage.getItem(KEY);
		return value === 'day' || value === 'night' || value === 'clock' ? value : 'system';
	} catch {
		return 'system';
	}
}

class DayNight {
	mode = $state<Mode>(typeof localStorage === 'undefined' ? 'system' : stored());

	set(mode: Mode): void {
		this.mode = mode;
		try {
			if (mode === 'system') localStorage.removeItem(KEY);
			else localStorage.setItem(KEY, mode);
		} catch {
			// private mode: the choice lasts until the page is closed
		}
	}
}

export const dayNight = new DayNight();

/**
 * Keeps `.dark` on <html> in line with the device's choice: for "system" the OS setting, for
 * "clock" the hour in the family's time zone (looked at every minute; the switch is instant).
 */
export function followDayNight(): () => void {
	const query = matchMedia('(prefers-color-scheme: dark)');
	const mode = dayNight.mode;
	const timeZone = family.timeZone;
	const apply = () => {
		const night = isNight(mode, hourIn(timeZone, Date.now()), query.matches);
		document.documentElement.classList.toggle('dark', night);
	};
	apply();
	query.addEventListener('change', apply);
	const timer = mode === 'clock' ? setInterval(apply, CLOCK_CHECK_MS) : undefined;
	return () => {
		query.removeEventListener('change', apply);
		clearInterval(timer);
	};
}
