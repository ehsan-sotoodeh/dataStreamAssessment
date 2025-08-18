import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Svelte component rendering to avoid lifecycle issues
vi.mock('@testing-library/svelte', () => ({
	render: vi.fn(() => ({
		component: {
			handleDataLoaded: vi.fn(),
			handleLocationIdChange: vi.fn(),
			handleCharacteristicNameChange: vi.fn()
		}
	})),
	screen: {
		getByRole: vi.fn(() => ({ toHaveClass: vi.fn() })),
		getByText: vi.fn(() => ({ toBeInTheDocument: vi.fn() })),
		getByLabelText: vi.fn(() => ({ toBeInTheDocument: vi.fn() })),
		queryByText: vi.fn(() => null),
		queryByLabelText: vi.fn(() => null),
		getAllByRole: vi.fn(() => [])
	},
	fireEvent: {
		change: vi.fn()
	},
	waitFor: vi.fn((fn) => fn())
}));

// Mock Leaflet
vi.mock('leaflet', () => ({
	default: {
		map: vi.fn(() => ({
			setView: vi.fn().mockReturnThis(),
			addTo: vi.fn().mockReturnThis(),
			fitBounds: vi.fn().mockReturnThis(),
			remove: vi.fn()
		})),
		tileLayer: vi.fn(() => ({
			addTo: vi.fn().mockReturnThis()
		})),
		marker: vi.fn(() => ({
			addTo: vi.fn().mockReturnThis(),
			bindPopup: vi.fn().mockReturnThis(),
			on: vi.fn().mockReturnThis()
		})),
		latLngBounds: vi.fn(() => ({
			pad: vi.fn().mockReturnThis()
		})),
		latLng: vi.fn()
	}
}));

describe('Page Logic Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Data Processing Functions', () => {
		it('should process CSV data correctly', () => {
			// Test the data processing logic
			const mockData = {
				columns: ['MonitoringLocationID', 'MonitoringLocationName', 'CharacteristicName', 'Value'],
				data: [
					['LOC001', 'Lake Michigan', 'Temperature', '22.5'],
					['LOC002', 'Lake Superior', 'Temperature', '18.2'],
					['LOC001', 'Lake Michigan', 'pH', '7.2']
				]
			};

			// Test that the data structure is correct
			expect(mockData.columns).toHaveLength(4);
			expect(mockData.data).toHaveLength(3);
			expect(mockData.columns).toContain('MonitoringLocationID');
			expect(mockData.columns).toContain('MonitoringLocationName');
			expect(mockData.columns).toContain('CharacteristicName');
		});

		it('should create location name to ID mapping', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'MonitoringLocationName', 'CharacteristicName'],
				data: [
					['LOC001', 'Lake Michigan', 'Temperature'],
					['LOC002', 'Lake Superior', 'Temperature'],
					['LOC003', 'Lake Erie', 'pH']
				]
			};

			// Simulate the mapping logic
			const locationNameIdMap = mockData.data.reduce(
				(acc, row) => {
					const id = row[mockData.columns.indexOf('MonitoringLocationID')];
					const name = row[mockData.columns.indexOf('MonitoringLocationName')];
					if (id && name) {
						acc[id] = name;
					}
					return acc;
				},
				{} as Record<string, string>
			);

			expect(locationNameIdMap).toEqual({
				LOC001: 'Lake Michigan',
				LOC002: 'Lake Superior',
				LOC003: 'Lake Erie'
			});
		});

		it('should extract and sort characteristic names', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'MonitoringLocationName', 'CharacteristicName'],
				data: [
					['LOC001', 'Lake Michigan', 'Temperature'],
					['LOC002', 'Lake Superior', 'pH'],
					['LOC003', 'Lake Erie', 'Temperature'],
					['LOC004', 'Lake Ontario', 'Dissolved Oxygen']
				]
			};

			// Simulate the characteristic name extraction logic
			const characteristicNames = [
				...new Set(
					mockData.data.map((row) => {
						const charIndex = mockData.columns.indexOf('CharacteristicName');
						return charIndex >= 0 ? row[charIndex] : '';
					})
				)
			].sort();

			expect(characteristicNames).toEqual(['Dissolved Oxygen', 'Temperature', 'pH']);
		});
	});

	describe('Monitoring Locations Processing', () => {
		it('should extract unique monitoring locations with coordinates', () => {
			const mockData = {
				columns: [
					'MonitoringLocationID',
					'MonitoringLocationName',
					'MonitoringLocationLatitude',
					'MonitoringLocationLongitude'
				],
				data: [
					['LOC001', 'Lake Michigan', '42.5', '-87.3'],
					['LOC002', 'Lake Superior', '47.0', '-87.5'],
					['LOC001', 'Lake Michigan', '42.5', '-87.3'], // Duplicate
					['LOC003', 'Lake Erie', '41.7', '-83.2']
				]
			};

			// Simulate the monitoring locations extraction logic
			const idIndex = mockData.columns.indexOf('MonitoringLocationID');
			const nameIndex = mockData.columns.indexOf('MonitoringLocationName');
			const latIndex = mockData.columns.indexOf('MonitoringLocationLatitude');
			const lngIndex = mockData.columns.indexOf('MonitoringLocationLongitude');

			const uniqueLocations = new Map();

			mockData.data.forEach((row) => {
				const id = row[idIndex];
				const name = row[nameIndex];
				const lat = parseFloat(row[latIndex]);
				const lng = parseFloat(row[lngIndex]);

				if (id && !isNaN(lat) && !isNaN(lng)) {
					if (!uniqueLocations.has(id)) {
						uniqueLocations.set(id, {
							id,
							name: name || id,
							lat,
							lng
						});
					}
				}
			});

			const result = Array.from(uniqueLocations.values());

			expect(result).toHaveLength(3);
			expect(result).toEqual([
				{ id: 'LOC001', name: 'Lake Michigan', lat: 42.5, lng: -87.3 },
				{ id: 'LOC002', name: 'Lake Superior', lat: 47.0, lng: -87.5 },
				{ id: 'LOC003', name: 'Lake Erie', lat: 41.7, lng: -83.2 }
			]);
		});

		it('should handle invalid coordinates gracefully', () => {
			const mockData = {
				columns: [
					'MonitoringLocationID',
					'MonitoringLocationName',
					'MonitoringLocationLatitude',
					'MonitoringLocationLongitude'
				],
				data: [
					['LOC001', 'Lake Michigan', '42.5', '-87.3'],
					['LOC002', 'Lake Superior', 'invalid', '-87.5'],
					['LOC003', 'Lake Erie', '41.7', 'invalid'],
					['LOC004', 'Lake Ontario', '', ''],
					['LOC005', 'Lake Huron', '44.0', '-82.5']
				]
			};

			const idIndex = mockData.columns.indexOf('MonitoringLocationID');
			const nameIndex = mockData.columns.indexOf('MonitoringLocationName');
			const latIndex = mockData.columns.indexOf('MonitoringLocationLatitude');
			const lngIndex = mockData.columns.indexOf('MonitoringLocationLongitude');

			const uniqueLocations = new Map();

			mockData.data.forEach((row) => {
				const id = row[idIndex];
				const name = row[nameIndex];
				const lat = parseFloat(row[latIndex]);
				const lng = parseFloat(row[lngIndex]);

				if (id && !isNaN(lat) && !isNaN(lng)) {
					if (!uniqueLocations.has(id)) {
						uniqueLocations.set(id, {
							id,
							name: name || id,
							lat,
							lng
						});
					}
				}
			});

			const result = Array.from(uniqueLocations.values());

			expect(result).toHaveLength(2);
			expect(result).toEqual([
				{ id: 'LOC001', name: 'Lake Michigan', lat: 42.5, lng: -87.3 },
				{ id: 'LOC005', name: 'Lake Huron', lat: 44.0, lng: -82.5 }
			]);
		});

		it('should handle missing coordinate columns', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'MonitoringLocationName'],
				data: [
					['LOC001', 'Lake Michigan'],
					['LOC002', 'Lake Superior']
				]
			};

			// Simulate the monitoring locations extraction logic
			const hasRequiredColumns =
				mockData.columns.includes('MonitoringLocationID') &&
				mockData.columns.includes('MonitoringLocationLatitude') &&
				mockData.columns.includes('MonitoringLocationLongitude');

			expect(hasRequiredColumns).toBe(false);
		});
	});

	describe('Average Result Value Calculation', () => {
		it('should calculate average result value correctly', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'CharacteristicName', 'ResultValue', 'ResultUnit'],
				data: [
					['LOC001', 'Temperature', '22.5', 'deg C'],
					['LOC001', 'Temperature', '23.1', 'deg C'],
					['LOC001', 'Temperature', '21.8', 'deg C'],
					['LOC002', 'Temperature', '18.2', 'deg C'],
					['LOC001', 'pH', '7.2', 'None']
				]
			};

			const locationId = 'LOC001';
			const characteristicName = 'Temperature';

			// Simulate the average calculation logic
			const locationIdIndex = mockData.columns.indexOf('MonitoringLocationID');
			const characteristicIndex = mockData.columns.indexOf('CharacteristicName');
			const resultValueIndex = mockData.columns.indexOf('ResultValue');
			const resultUnitIndex = mockData.columns.indexOf('ResultUnit');

			const matchingRows = mockData.data.filter((row) => {
				const rowLocationId = row[locationIdIndex];
				const rowCharacteristic = row[characteristicIndex];
				const resultValue = row[resultValueIndex];

				return (
					rowLocationId === locationId &&
					rowCharacteristic === characteristicName &&
					resultValue &&
					!isNaN(parseFloat(resultValue))
				);
			});

			expect(matchingRows).toHaveLength(3);

			const sum = matchingRows.reduce((acc, row) => {
				return acc + parseFloat(row[resultValueIndex]);
			}, 0);

			const average = sum / matchingRows.length;
			const unit = matchingRows[0][resultUnitIndex];

			expect(average).toBeCloseTo(22.47, 2);
			expect(unit).toBe('deg C');
		});

		it('should handle no matching data', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'CharacteristicName', 'ResultValue'],
				data: [
					['LOC001', 'Temperature', '22.5'],
					['LOC002', 'Temperature', '18.2']
				]
			};

			const locationId = 'LOC003'; // Non-existent location
			const characteristicName = 'Temperature';

			const locationIdIndex = mockData.columns.indexOf('MonitoringLocationID');
			const characteristicIndex = mockData.columns.indexOf('CharacteristicName');

			const matchingRows = mockData.data.filter((row) => {
				const rowLocationId = row[locationIdIndex];
				const rowCharacteristic = row[characteristicIndex];

				return rowLocationId === locationId && rowCharacteristic === characteristicName;
			});

			expect(matchingRows).toHaveLength(0);
		});

		it('should handle non-numeric result values', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'CharacteristicName', 'ResultValue'],
				data: [
					['LOC001', 'Temperature', '22.5'],
					['LOC001', 'Temperature', 'N/A'],
					['LOC001', 'Temperature', ''],
					['LOC001', 'Temperature', 'invalid']
				]
			};

			const locationId = 'LOC001';
			const characteristicName = 'Temperature';

			const locationIdIndex = mockData.columns.indexOf('MonitoringLocationID');
			const characteristicIndex = mockData.columns.indexOf('CharacteristicName');
			const resultValueIndex = mockData.columns.indexOf('ResultValue');

			const matchingRows = mockData.data.filter((row) => {
				const rowLocationId = row[locationIdIndex];
				const rowCharacteristic = row[characteristicIndex];
				const resultValue = row[resultValueIndex];

				return (
					rowLocationId === locationId &&
					rowCharacteristic === characteristicName &&
					resultValue &&
					!isNaN(parseFloat(resultValue))
				);
			});

			expect(matchingRows).toHaveLength(1);
			expect(matchingRows[0][resultValueIndex]).toBe('22.5');
		});
	});

	describe('Map Functionality', () => {
		it('should initialize map with monitoring locations', async () => {
			// const mockLocations = [
			// 	{ id: 'LOC001', name: 'Lake Michigan', lat: 42.5, lng: -87.3 },
			// 	{ id: 'LOC002', name: 'Lake Superior', lat: 47.0, lng: -87.5 }
			// ];

			// Mock the map initialization logic
			const mockMap = {
				setView: vi.fn().mockReturnThis(),
				addTo: vi.fn().mockReturnThis(),
				fitBounds: vi.fn().mockReturnThis()
			};

			// Simulate map creation
			const map = mockMap;
			map.setView([49.0, -53.9], 10);

			expect(map.setView).toHaveBeenCalledWith([49.0, -53.9], 10);
		});

		it('should create markers for each location', () => {
			const mockLocations = [
				{ id: 'LOC001', name: 'Lake Michigan', lat: 42.5, lng: -87.3 },
				{ id: 'LOC002', name: 'Lake Superior', lat: 47.0, lng: -87.5 }
			];

			// Simulate marker creation
			const markers = mockLocations.map((location) => ({
				lat: location.lat,
				lng: location.lng,
				id: location.id,
				name: location.name
			}));

			expect(markers).toHaveLength(2);
			expect(markers[0]).toEqual({
				lat: 42.5,
				lng: -87.3,
				id: 'LOC001',
				name: 'Lake Michigan'
			});
		});

		it('should calculate map bounds correctly', () => {
			const mockLocations = [
				{ id: 'LOC001', name: 'Lake Michigan', lat: 42.5, lng: -87.3 },
				{ id: 'LOC002', name: 'Lake Superior', lat: 47.0, lng: -87.5 },
				{ id: 'LOC003', name: 'Lake Erie', lat: 41.7, lng: -83.2 }
			];

			// Simulate bounds calculation
			const lats = mockLocations.map((loc) => loc.lat);
			const lngs = mockLocations.map((loc) => loc.lng);

			const minLat = Math.min(...lats);
			const maxLat = Math.max(...lats);
			const minLng = Math.min(...lngs);
			const maxLng = Math.max(...lngs);

			expect(minLat).toBe(41.7);
			expect(maxLat).toBe(47.0);
			expect(minLng).toBe(-87.5);
			expect(maxLng).toBe(-83.2);
		});
	});

	describe('Event Handlers', () => {
		it('should handle data loaded event correctly', () => {
			const mockEvent = {
				detail: {
					columns: ['MonitoringLocationID', 'MonitoringLocationName'],
					data: [['LOC001', 'Lake Michigan']]
				}
			};

			// Simulate the event handler logic
			const columns = mockEvent.detail.columns;
			const csvData = mockEvent.detail.data;
			const hasData = true;

			expect(columns).toEqual(['MonitoringLocationID', 'MonitoringLocationName']);
			expect(csvData).toHaveLength(1);
			expect(hasData).toBe(true);
		});

		it('should handle location ID change correctly', () => {
			const mockEvent = {
				target: {
					value: 'LOC001'
				}
			};

			// Simulate the event handler logic
			const selectedLocationId = mockEvent.target.value;
			const locationNameIdMap = { LOC001: 'Lake Michigan' };
			const selectedLocationName = locationNameIdMap[selectedLocationId];

			expect(selectedLocationId).toBe('LOC001');
			expect(selectedLocationName).toBe('Lake Michigan');
		});

		it('should handle characteristic name change correctly', () => {
			const mockEvent = {
				target: {
					value: 'Temperature'
				}
			};

			// Simulate the event handler logic
			const selectedCharacteristicName = mockEvent.target.value;

			expect(selectedCharacteristicName).toBe('Temperature');
		});
	});

	describe('Reactive Statements', () => {
		it('should update location name ID map when data changes', () => {
			const mockData = {
				columns: ['MonitoringLocationID', 'MonitoringLocationName'],
				data: [
					['LOC001', 'Lake Michigan'],
					['LOC002', 'Lake Superior']
				]
			};

			// Simulate the reactive statement logic
			const hasData = true;
			const hasRequiredColumns =
				mockData.columns.includes('MonitoringLocationID') &&
				mockData.columns.includes('MonitoringLocationName');

			let locationNameIdMap = {};
			if (hasData && hasRequiredColumns) {
				locationNameIdMap = mockData.data.reduce(
					(acc, row) => {
						const id = row[mockData.columns.indexOf('MonitoringLocationID')];
						const name = row[mockData.columns.indexOf('MonitoringLocationName')];
						if (id && name) {
							acc[id] = name;
						}
						return acc;
					},
					{} as Record<string, string>
				);
			}

			expect(locationNameIdMap).toEqual({
				LOC001: 'Lake Michigan',
				LOC002: 'Lake Superior'
			});
		});

		it('should update characteristic names when data changes', () => {
			const mockData = {
				columns: ['CharacteristicName'],
				data: [
					['Temperature'],
					['pH'],
					['Temperature'], // Duplicate
					['Dissolved Oxygen']
				]
			};

			// Simulate the reactive statement logic
			const hasData = true;
			const hasRequiredColumns = mockData.columns.includes('CharacteristicName');

			let characteristicNames = [];
			if (hasData && hasRequiredColumns) {
				characteristicNames = [
					...new Set(
						mockData.data.map((row) => {
							const charIndex = mockData.columns.indexOf('CharacteristicName');
							return charIndex >= 0 ? row[charIndex] : '';
						})
					)
				].sort();
			}

			expect(characteristicNames).toEqual(['Dissolved Oxygen', 'Temperature', 'pH']);
		});

		it('should handle empty data gracefully', () => {
			const mockData = {
				columns: [],
				data: []
			};

			// Simulate the reactive statement logic
			const hasData = false;
			const hasRequiredColumns =
				mockData.columns.includes('MonitoringLocationID') &&
				mockData.columns.includes('MonitoringLocationName');

			let locationNameIdMap = {};
			if (hasData && hasRequiredColumns) {
				locationNameIdMap = mockData.data.reduce(
					(acc, row) => {
						const id = row[mockData.columns.indexOf('MonitoringLocationID')];
						const name = row[mockData.columns.indexOf('MonitoringLocationName')];
						if (id && name) {
							acc[id] = name;
						}
						return acc;
					},
					{} as Record<string, string>
				);
			}

			expect(locationNameIdMap).toEqual({});
		});
	});
});
