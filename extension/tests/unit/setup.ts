import { vi } from 'vitest';

/** محاكاة مبسطة لـ chrome.* داخل jsdom */
type Listener = (changes: Record<string, unknown>, area: string) => void;
const listeners = new Set<Listener>();

function area(name: string) {
  let data: Record<string, unknown> = {};
  const notify = () => listeners.forEach((l) => l({}, name));
  return {
    async get(keys?: string | string[] | Record<string, unknown> | null) {
      if (keys == null) return { ...data };
      if (typeof keys === 'string') return keys in data ? { [keys]: data[keys] } : {};
      if (Array.isArray(keys)) return Object.fromEntries(keys.filter((k) => k in data).map((k) => [k, data[k]]));
      return Object.fromEntries(Object.entries(keys).map(([k, def]) => [k, k in data ? data[k] : def]));
    },
    async set(items: Record<string, unknown>) {
      data = { ...data, ...structuredClone(items) };
      notify();
    },
    async remove(keys: string | string[]) {
      for (const k of Array.isArray(keys) ? keys : [keys]) delete data[k];
      notify();
    },
    async clear() {
      data = {};
      notify();
    },
    _reset() {
      data = {};
    },
  };
}

const chromeMock = {
  storage: {
    sync: area('sync'),
    local: area('local'),
    session: area('session'),
    onChanged: {
      addListener: (l: Listener) => listeners.add(l),
      removeListener: (l: Listener) => listeners.delete(l),
    },
  },
  runtime: {
    id: 'test-extension',
    sendMessage: vi.fn(async () => ({ ok: false, error: 'server_unreachable' })),
    getManifest: () => ({ version: '0.1.0' }),
  },
};

(globalThis as unknown as { chrome: typeof chromeMock }).chrome = chromeMock;

export function resetChrome(): void {
  chromeMock.storage.sync._reset();
  chromeMock.storage.local._reset();
  chromeMock.storage.session._reset();
  chromeMock.runtime.sendMessage.mockReset();
}
