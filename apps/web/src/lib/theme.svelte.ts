/**
 * Day and night: each device chooses to follow the system, or to stay
 * in the day or the night palette of the active theme. Night is the `.dark` class on <html>.
 * The choice lives in this browser only (`famos.mode`); app.html applies it before first paint.
 */
export type Mode = 'system' | 'day' | 'night';
const KEY = 'famos.mode';

function stored(): Mode {
	try {
		const value = localStorage.getItem(KEY);
		return value === 'day' || value === 'night' ? value : 'system';
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

/** Keeps `.dark` on <html> in line with the device's choice and, for "system", the OS setting. */
export function followDayNight(): () => void {
	const query = matchMedia('(prefers-color-scheme: dark)');
	const apply = () => {
		const mode = dayNight.mode;
		const night = mode === 'night' || (mode === 'system' && query.matches);
		document.documentElement.classList.toggle('dark', night);
	};
	apply();
	query.addEventListener('change', apply);
	return () => query.removeEventListener('change', apply);
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
