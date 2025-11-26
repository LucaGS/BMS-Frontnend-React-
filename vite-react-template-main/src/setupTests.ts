import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (!('createObjectURL' in URL)) {
  // jsdom does not implement createObjectURL; mock for components expecting it
  (URL as unknown as { createObjectURL?: () => string }).createObjectURL = vi.fn(() => 'blob:preview');
}

if (!('revokeObjectURL' in URL)) {
  (URL as unknown as { revokeObjectURL?: () => void }).revokeObjectURL = vi.fn();
}

if (!crypto.randomUUID) {
  crypto.randomUUID = () => '00000000-0000-4000-8000-000000000000';
}

if (!(globalThis as any).ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserverStub;
}

if (typeof window.alert !== 'function') {
  (window as any).alert = vi.fn();
} else {
  vi.spyOn(window, 'alert').mockImplementation(() => undefined);
}
