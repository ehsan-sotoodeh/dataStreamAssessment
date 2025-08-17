import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatNumber, capitalize, isValidEmail, debounce, generateId } from './utils';

describe('Utility Functions', () => {
	describe('formatNumber', () => {
		it('should format number with default 2 decimal places', () => {
			expect(formatNumber(3.14159)).toBe('3.14');
			expect(formatNumber(10)).toBe('10.00');
			expect(formatNumber(0)).toBe('0.00');
		});

		it('should format number with custom decimal places', () => {
			expect(formatNumber(3.14159, 4)).toBe('3.1416');
			expect(formatNumber(10, 0)).toBe('10');
			expect(formatNumber(3.14159, 1)).toBe('3.1');
		});

		it('should handle negative numbers', () => {
			expect(formatNumber(-3.14159)).toBe('-3.14');
			expect(formatNumber(-10, 1)).toBe('-10.0');
		});
	});

	describe('capitalize', () => {
		it('should capitalize the first letter of a string', () => {
			expect(capitalize('hello')).toBe('Hello');
			expect(capitalize('world')).toBe('World');
			expect(capitalize('svelte')).toBe('Svelte');
		});

		it('should handle empty string', () => {
			expect(capitalize('')).toBe('');
		});

		it('should handle single character', () => {
			expect(capitalize('a')).toBe('A');
			expect(capitalize('z')).toBe('Z');
		});

		it('should handle already capitalized strings', () => {
			expect(capitalize('Hello')).toBe('Hello');
			expect(capitalize('WORLD')).toBe('WORLD');
		});

		it('should handle strings with numbers', () => {
			expect(capitalize('123abc')).toBe('123abc');
			expect(capitalize('abc123')).toBe('Abc123');
		});
	});

	describe('isValidEmail', () => {
		it('should validate correct email addresses', () => {
			expect(isValidEmail('test@example.com')).toBe(true);
			expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
			expect(isValidEmail('user+tag@example.org')).toBe(true);
			expect(isValidEmail('123@numbers.com')).toBe(true);
		});

		it('should reject invalid email addresses', () => {
			expect(isValidEmail('invalid-email')).toBe(false);
			expect(isValidEmail('@example.com')).toBe(false);
			expect(isValidEmail('user@')).toBe(false);
			expect(isValidEmail('user@.com')).toBe(false);
			expect(isValidEmail('user.com')).toBe(false);
			expect(isValidEmail('')).toBe(false);
		});

		it('should handle edge cases', () => {
			expect(isValidEmail('user@domain')).toBe(false);
			expect(isValidEmail('user@domain.')).toBe(false);
			expect(isValidEmail('user@domain.com')).toBe(true); // This should be valid
		});
	});

	describe('debounce', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('should debounce function calls', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			// Call multiple times
			debouncedFn('arg1');
			debouncedFn('arg2');
			debouncedFn('arg3');

			// Function should not be called immediately
			expect(mockFn).not.toHaveBeenCalled();

			// Fast forward time
			vi.advanceTimersByTime(100);

			// Function should be called once with last arguments
			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith('arg3');
		});

		it('should handle different wait times', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 500);

			debouncedFn('test');
			vi.advanceTimersByTime(250);
			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(250);
			expect(mockFn).toHaveBeenCalledWith('test');
		});

		it('should cancel previous calls when new call is made', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('first');
			vi.advanceTimersByTime(50);
			debouncedFn('second');
			vi.advanceTimersByTime(100);

			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith('second');
		});
	});

	describe('generateId', () => {
		it('should generate a string', () => {
			const id = generateId();
			expect(typeof id).toBe('string');
		});

		it('should generate different IDs on each call', () => {
			const id1 = generateId();
			const id2 = generateId();
			expect(id1).not.toBe(id2);
		});

		it('should generate IDs with correct length', () => {
			const id = generateId();
			expect(id.length).toBe(9);
		});

		it('should generate alphanumeric IDs', () => {
			const id = generateId();
			expect(id).toMatch(/^[a-z0-9]{9}$/);
		});
	});
});
