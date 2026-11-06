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

/**
 * Text size on this device: the root font size, so every size given in rem grows or shrinks
 * (`data-text-size` on <html>, sizes in theme.css). Kept in this browser only
 * (`famos.textSize`); app.html applies it before first paint.
 */
export const TEXT_SIZES = ['small', 'normal', 'large', 'larger'] as const;
export type TextSize = (typeof TEXT_SIZES)[number];
const TEXT_KEY = 'famos.textSize';

function storedTextSize(): TextSize {
	try {
		const value = localStorage.getItem(TEXT_KEY);
		return (TEXT_SIZES as readonly string[]).includes(value ?? '') ? (value as TextSize) : 'normal';
	} catch {
		return 'normal';
	}
}

class TextSizeChoice {
	size = $state<TextSize>(typeof localStorage === 'undefined' ? 'normal' : storedTextSize());

	set(size: TextSize): void {
		this.size = size;
		try {
			if (size === 'normal') localStorage.removeItem(TEXT_KEY);
			else localStorage.setItem(TEXT_KEY, size);
		} catch {
			// private mode: the choice lasts until the page is closed
		}
	}
}

export const textSize = new TextSizeChoice();

/** Puts this device's text size on <html>. */
export function applyTextSize(size: TextSize): void {
	if (size === 'normal') delete document.documentElement.dataset.textSize;
	else document.documentElement.dataset.textSize = size;
}
