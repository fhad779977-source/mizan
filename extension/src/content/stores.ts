import { useSyncExternalStore } from 'react';
import { DEFAULT_SETTINGS } from '../lib/settings';
import type { XTheme } from '../lib/theme';
import type { HealthResult, Settings } from '../lib/types';

/** مخزن بسيط قابل للاشتراك (بديل خفيف عن مكتبات إدارة الحالة) */
export class Store<T> {
  private listeners = new Set<() => void>();
  constructor(private value: T) {}
  get = (): T => this.value;
  set = (value: T): void => {
    if (Object.is(value, this.value)) return;
    this.value = value;
    this.listeners.forEach((l) => l());
  };
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

export const settingsStore = new Store<Settings>(DEFAULT_SETTINGS);
export const themeStore = new Store<XTheme>('light');
export const healthStore = new Store<Pick<HealthResult, 'mode'> | null>(null);

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
