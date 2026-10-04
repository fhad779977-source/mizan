import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';
import overlayCss from '../styles/overlay.css?inline';

export const HOST_ATTR = 'data-xac-host';

export interface MountedHost {
  host: HTMLElement;
  root: Root;
  unmount(): void;
}

const STOP_EVENTS = ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown', 'dblclick'];

/**
 * ينشئ عنصرًا معزولًا بـ Shadow DOM حتى لا تتأثر أنماط X بأنماطنا والعكس.
 * أحداث النقر داخل واجهتنا لا تصل لـ X (حتى لا يتوقف الفيديو أو تُفتح التغريدة).
 */
export function createShadowHost(kind: 'video' | 'tweet', ui: ReactNode, style?: Partial<CSSStyleDeclaration>): MountedHost {
  const host = document.createElement('div');
  host.setAttribute(HOST_ATTR, kind);
  Object.assign(host.style, style ?? {});
  const shadow = host.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style');
  styleEl.textContent = overlayCss;
  shadow.appendChild(styleEl);
  const mountPoint = document.createElement('div');
  mountPoint.setAttribute('dir', 'rtl');
  mountPoint.setAttribute('lang', 'ar');
  shadow.appendChild(mountPoint);
  for (const type of STOP_EVENTS) host.addEventListener(type, (e) => e.stopPropagation());
  const root = createRoot(mountPoint);
  root.render(ui);
  return {
    host,
    root,
    unmount() {
      root.unmount();
      host.remove();
    },
  };
}
