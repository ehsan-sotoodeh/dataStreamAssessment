/**
 * Utility functions for the application
 */

/**
 * Formats a number with the specified number of decimal places
 */
export function formatNumber(num: number, decimals: number = 2): string {
	return num.toFixed(decimals);
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Checks if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Generates a random ID
 */
export function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}
