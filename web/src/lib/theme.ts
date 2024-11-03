namespace Theme {
	/**
	 * Color palletes for use within the application like with different tailwind classes.
	 */
	export const enum Color {
		PRIMARY = '#3c7847',
		PRIMARY_CONTENT = '#FAFAFA',
		SECONDARY = '#d4c16d',
		SECONDARY_CONTENT = '#242424',
		ACCENT = '#000000',
		ACCENT_CONTENT = '#ffffff',
		NEUTRAL = '#ffffff',
		NEUTRAL_CONTENT = '#000000',
		ERROR = '#ff0000',
		ERROR_CONTENT = '#2d1919',
		SUCCESS = '#008000',
		SUCCESS_CONTENT = '#d6e8d5',
		INFO = '#0000cd',
		INFO_CONTENT = '#cbdbfa',
		WARNING = '#ffa500',
		WARNING_CONTENT = '#191919'
	}

	/**
	 * Returns next color in the color pallete using PRIMARY->SECONDARY->ACCENT sequence.
	 * @param currentColor
	 * @returns
	 */
	export function GetNextColorA(currentColor: Color) {
		switch (currentColor) {
			case Color.PRIMARY:
				return Color.SECONDARY
			case Color.SECONDARY:
				return Color.ACCENT
			case Color.ACCENT:
				return Color.PRIMARY
			default:
				return Color.PRIMARY
		}
	}

	/**
	 * Returns next color in the color pallete using PRIMARY->SECONDARY->NEUTRAL sequence.
	 * @param currentColor
	 * @returns
	 */
	export function GetNextColorN(currentColor: Color) {
		switch (currentColor) {
			case Color.PRIMARY:
				return Color.SECONDARY
			case Color.SECONDARY:
				return Color.NEUTRAL
			case Color.NEUTRAL:
				return Color.PRIMARY
			default:
				return Color.PRIMARY
		}
	}
}

export default Theme