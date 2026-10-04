import { afterEach, describe, expect, it } from 'vitest';
import { detectXTheme, themeFromColor } from '../../src/lib/theme';

describe('theme detection (dark mode support)', () => {
  afterEach(() => {
    document.body.style.backgroundColor = '';
  });

  it('maps X backgrounds to light/dark', () => {
    expect(themeFromColor('rgb(255, 255, 255)')).toBe('light');
    expect(themeFromColor('rgb(0, 0, 0)')).toBe('dark'); // Lights out
    expect(themeFromColor('rgb(21, 32, 43)')).toBe('dark'); // Dim
  });

  it('reads the page body color', () => {
    document.body.style.backgroundColor = 'rgb(0, 0, 0)';
    expect(detectXTheme()).toBe('dark');
    document.body.style.backgroundColor = 'rgb(255, 255, 255)';
    expect(detectXTheme()).toBe('light');
  });
});
