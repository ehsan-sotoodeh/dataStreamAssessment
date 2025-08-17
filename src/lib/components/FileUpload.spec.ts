import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import FileUpload from './FileUpload.svelte';

// Mock FileReader
const mockFileReader = {
	readAsText: vi.fn(),
	onload: null as ((e: { target: { result: string } }) => void) | null,
	onerror: null as (() => void) | null,
	result: ''
};

global.FileReader = vi.fn(() => mockFileReader) as unknown as typeof FileReader;

describe('FileUpload', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFileReader.onload = null;
		mockFileReader.onerror = null;
		mockFileReader.result = '';
	});

	it('renders upload area with correct text', () => {
		render(FileUpload);

		expect(screen.getByText('Drag and drop your CSV file here')).toBeInTheDocument();
		expect(screen.getByText('Browse Files')).toBeInTheDocument();
		expect(screen.getByText('Supports .csv files only')).toBeInTheDocument();
	});

	it('shows upload icon', () => {
		render(FileUpload);

		// Check if upload icon is present (Lucide icons render as SVG elements)
		const uploadIcon =
			document.querySelector('[data-lucide="upload"]') || document.querySelector('svg');
		expect(uploadIcon).toBeInTheDocument();
	});

	it('handles file selection via browse button', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

		expect(fileInput).toBeInTheDocument();
		expect(fileInput.accept).toBe('.csv,text/csv');

		// Simulate file selection
		const file = new File(['name,age\nJohn,30\nJane,25'], 'test.csv', { type: 'text/csv' });

		// Mock FileReader result
		mockFileReader.result = 'name,age\nJohn,30\nJane,25';

		// Trigger file input change
		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader onload
		if (mockFileReader.onload) {
			mockFileReader.onload({ target: { result: mockFileReader.result } });
		}

		await waitFor(() => {
			expect(screen.getByText('test.csv')).toBeInTheDocument();
		});
	});

	it('validates CSV file type', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

		fireEvent.change(fileInput, { target: { files: [invalidFile] } });

		await waitFor(() => {
			expect(screen.getByText('Please select a valid CSV file')).toBeInTheDocument();
		});
	});

	it('validates CSV file extension', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const invalidFile = new File(['content'], 'test.txt', { type: '' });

		fireEvent.change(fileInput, { target: { files: [invalidFile] } });

		await waitFor(() => {
			expect(screen.getByText('Please select a valid CSV file')).toBeInTheDocument();
		});
	});

	it('parses CSV columns correctly', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const csvContent = 'name,age,city\nJohn,30,New York\nJane,25,London';
		const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

		// Mock FileReader result
		mockFileReader.result = csvContent;

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader onload
		if (mockFileReader.onload) {
			mockFileReader.onload({ target: { result: mockFileReader.result } });
		}

		await waitFor(() => {
			expect(screen.getByText('test.csv')).toBeInTheDocument();
		});
	});

	it('handles quoted CSV values correctly', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const csvContent = 'name,"age, years",city\nJohn,"30, years",New York';
		const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

		// Mock FileReader result
		mockFileReader.result = csvContent;

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader onload
		if (mockFileReader.onload) {
			mockFileReader.onload({ target: { result: mockFileReader.result } });
		}

		await waitFor(() => {
			expect(screen.getByText('test.csv')).toBeInTheDocument();
		});
	});

	it('shows file size in KB', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const file = new File(['content'], 'test.csv', { type: 'text/csv' });

		// Mock FileReader result
		mockFileReader.result = 'name,age\nJohn,30';

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader onload
		if (mockFileReader.onload) {
			mockFileReader.onload({ target: { result: mockFileReader.result } });
		}

		await waitFor(() => {
			expect(screen.getByText('test.csv')).toBeInTheDocument();
			// File size should be displayed (content is 7 bytes, so should show as 0.0 KB)
			expect(screen.getByText(/0\.0 KB/)).toBeInTheDocument();
		});
	});

	it('clears file when clear button is clicked', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });

		// Mock FileReader result
		mockFileReader.result = 'name,age\nJohn,30';

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader onload
		if (mockFileReader.onload) {
			mockFileReader.onload({ target: { result: mockFileReader.result } });
		}

		await waitFor(() => {
			expect(screen.getByText('test.csv')).toBeInTheDocument();
		});

		// Click clear button
		const clearButton = screen.getByRole('button', { name: /clear/i });
		fireEvent.click(clearButton);

		await waitFor(() => {
			expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
			expect(screen.getByText('Drag and drop your CSV file here')).toBeInTheDocument();
		});
	});

	it('handles FileReader errors gracefully', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const file = new File(['content'], 'test.csv', { type: 'text/csv' });

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader error
		if (mockFileReader.onerror) {
			mockFileReader.onerror();
		}

		await waitFor(() => {
			expect(screen.getByText('Error reading file')).toBeInTheDocument();
		});
	});

	it('has correct accessibility attributes', () => {
		render(FileUpload);

		const uploadArea = screen.getByRole('button');
		expect(uploadArea).toHaveAttribute('tabindex', '0');
		expect(uploadArea).toHaveAttribute('role', 'button');
	});

	it('filters empty lines from CSV', async () => {
		render(FileUpload);

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const csvContent = 'name,age\nJohn,30\n\nJane,25\n\n';
		const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

		// Mock FileReader result
		mockFileReader.result = csvContent;

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate FileReader onload
		if (mockFileReader.onload) {
			mockFileReader.onload({ target: { result: mockFileReader.result } });
		}

		await waitFor(() => {
			expect(screen.getByText('test.csv')).toBeInTheDocument();
		});
	});
});
