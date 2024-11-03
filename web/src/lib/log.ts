namespace Log {
	/**
	 * Expects 3 values:
	 * * 0
	 * * 1
	 * * 2
	 */
	export const enum Level {
		DEBUG = 0,
		INFO = 1,
		WARNING = 2,
		ERROR = 3
	}

	/**
	 * Utility function to log different messages to the console.
	 *
	 * Requires environment variable `VITE_WEBSITE_LOG_LEVEL` to be set with the following value:
	 *
	 * 0 -> Debug
	 *
	 * 1 -> Info
	 *
	 * 2 -> Warning
	 *
	 * 3 -> Error
	 *
	 * @param logLevel - Uses declared {@linkcode Level}
	 * @param section - Part in the website or page where the log occured
	 * @param message - Data to log into the console
	 * @returns
	 */
	export function Log(logLevel: Level, section: string = 'Unknown', ...message: any) {
		if (logLevel < import.meta.env.VITE_WEBSITE_LOG_LEVEL) {
			return
		}
		switch (logLevel) {
			case 0:
				console.debug('DEBUG', section, message)
				break
			case 1:
				console.info('INFO', section, message)
				break
			case 2:
				console.warn('WARNING', section, message)
				break
			case 3:
				console.error('ERROR', section, message)
				break
		}
	}
}

export default Log