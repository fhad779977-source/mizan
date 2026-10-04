import { describe, expect, it } from 'vitest';
import manifest from '../../public/manifest.json';
import { isAllowedPath, isSupportedHost, tweetInfo } from '../../src/lib/x-dom';
import { makeTweet } from './fixtures';

describe('host support', () => {
  it('works on x.com and twitter.com', () => {
    for (const host of ['x.com', 'twitter.com', 'mobile.x.com', 'mobile.twitter.com']) expect(isSupportedHost(host)).toBe(true);
    for (const host of ['evil-x.com', 'x.com.evil.io', 'example.com']) expect(isSupportedHost(host)).toBe(false);
  });

  it('manifest injects the content script on x.com and twitter.com only', () => {
    const matches = manifest.content_scripts.flatMap((c) => c.matches);
    expect(matches).toContain('https://x.com/*');
    expect(matches).toContain('https://twitter.com/*');
    expect(matches.every((m) => /^https:\/\/(mobile\.)?(x|twitter)\.com\/\*$/.test(m))).toBe(true);
    const excluded = manifest.content_scripts.flatMap((c) => c.exclude_matches ?? []);
    expect(excluded).toContain('https://x.com/messages*');
  });

  it('manifest requests minimal permissions and holds no secrets', () => {
    expect(manifest.permissions).toEqual(['storage']);
    expect(JSON.stringify(manifest)).not.toMatch(/sk-|api[_-]?key/i);
  });

  it('blocks private areas', () => {
    expect(isAllowedPath('/home')).toBe(true);
    expect(isAllowedPath('/search')).toBe(true);
    expect(isAllowedPath('/someuser')).toBe(true);
    expect(isAllowedPath('/messages')).toBe(false);
    expect(isAllowedPath('/messages/1-2')).toBe(false);
    expect(isAllowedPath('/i/chat/abc')).toBe(false);
    expect(isAllowedPath('/settings/account')).toBe(false);
  });

  it('reads tweet id and handle', () => {
    const t = makeTweet({ handle: 'nasa' });
    expect(tweetInfo(t)).toMatchObject({ handle: 'nasa' });
    expect(tweetInfo(t).tweetId).toMatch(/^\d+$/);
  });
});
