// Test setup file for Vitest

// Mock URL.createObjectURL and URL.revokeObjectURL for export tests
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = (): string => 'blob:mock-url';
}

if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = (): void => {};
}
