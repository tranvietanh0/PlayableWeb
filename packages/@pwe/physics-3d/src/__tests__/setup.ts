// Rapier WASM requires performance.now() to be available globally
// before any Rapier module is imported.
if (typeof globalThis.performance === 'undefined') {
  Object.defineProperty(globalThis, 'performance', {
    value: {
      now: () => Date.now(),
    } as Performance,
    writable: true,
    configurable: true,
  });
} else if (!globalThis.performance.now) {
  globalThis.performance.now = () => Date.now();
}
