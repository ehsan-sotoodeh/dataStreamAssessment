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

		it('should handle very large numbers', () => {
			expect(formatNumber(1234567.89)).toBe('1234567.89');
			expect(formatNumber(1234567.89, 0)).toBe('1234568');
		});

		it('should handle very small numbers', () => {
			expect(formatNumber(0.000001)).toBe('0.00');
			expect(formatNumber(0.000001, 6)).toBe('0.000001');
		});

		it('should handle NaN and Infinity', () => {
			expect(formatNumber(NaN)).toBe('NaN');
			expect(formatNumber(Infinity)).toBe('Infinity');
			expect(formatNumber(-Infinity)).toBe('-Infinity');
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

		it('should handle strings with special characters', () => {
			expect(capitalize('!hello')).toBe('!hello');
			expect(capitalize('hello!')).toBe('Hello!');
			expect(capitalize('hello-world')).toBe('Hello-world');
		});

		it('should handle null and undefined', () => {
			expect(capitalize(null as string | null)).toBe(null);
			expect(capitalize(undefined as string | undefined)).toBe(undefined);
		});
	});

	describe('isValidEmail', () => {
		it('should validate correct email addresses', () => {
			expect(isValidEmail('test@example.com')).toBe(true);
			expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
			expect(isValidEmail('user+tag@example.org')).toBe(true);
			expect(isValidEmail('123@numbers.com')).toBe(true);
			expect(isValidEmail('user@domain.com')).toBe(true);
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
			expect(isValidEmail('user@domain.com')).toBe(true);
		});

		it('should handle email addresses with subdomains', () => {
			expect(isValidEmail('user@sub.domain.com')).toBe(true);
			expect(isValidEmail('user@sub.sub2.domain.com')).toBe(true);
		});

		it('should handle email addresses with special characters', () => {
			expect(isValidEmail('user+tag@domain.com')).toBe(true);
			expect(isValidEmail('user-tag@domain.com')).toBe(true);
			expect(isValidEmail('user_tag@domain.com')).toBe(true);
			expect(isValidEmail('user.tag@domain.com')).toBe(true);
		});

		it('should handle international domain names', () => {
			expect(isValidEmail('user@domain.co.uk')).toBe(true);
			expect(isValidEmail('user@domain.org')).toBe(true);
			expect(isValidEmail('user@domain.net')).toBe(true);
		});
	});

	describe('debounce', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
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

		it('should handle multiple debounced functions', () => {
			const mockFn1 = vi.fn();
			const mockFn2 = vi.fn();
			const debouncedFn1 = debounce(mockFn1, 100);
			const debouncedFn2 = debounce(mockFn2, 200);

			debouncedFn1('test1');
			debouncedFn2('test2');

			vi.advanceTimersByTime(100);
			expect(mockFn1).toHaveBeenCalledWith('test1');
			expect(mockFn2).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			expect(mockFn2).toHaveBeenCalledWith('test2');
		});

		it('should handle edge case with 0 wait time', () => {
			const mockFn = vi.fn();
			const debouncedFn = debounce(mockFn, 0);

			debouncedFn('test');
			expect(mockFn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1);
			expect(mockFn).toHaveBeenCalledWith('test');
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
			const id3 = generateId();
			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
			expect(id1).not.toBe(id3);
		});

		it('should generate IDs with correct length', () => {
			const id = generateId();
			expect(id.length).toBe(9);
		});

		it('should generate alphanumeric IDs', () => {
			const id = generateId();
			expect(id).toMatch(/^[a-z0-9]{9}$/);
		});

		it('should generate IDs with consistent format', () => {
			const ids = Array.from({ length: 10 }, () => generateId());
			ids.forEach((id) => {
				expect(id).toMatch(/^[a-z0-9]{9}$/);
				expect(id.length).toBe(9);
			});
		});

		it('should handle multiple rapid calls', () => {
			const ids = [];
			for (let i = 0; i < 100; i++) {
				ids.push(generateId());
			}

			// Check that all IDs are unique
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(100);
		});
	});
});
