import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { XScanner, type Mounted } from '../../src/content/scanner';
import { HOST_ATTR } from '../../src/content/mount';
import { makeTweet } from './fixtures';

function fakeMount(kind: 'video' | 'tweet', place: (host: HTMLElement) => void): Mounted {
  const host = document.createElement('div');
  host.setAttribute(HOST_ATTR, kind);
  place(host);
  return { host, dispose: vi.fn(() => host.remove()) };
}

function createScanner(enabled = true) {
  const mountVideo = vi.fn(({ container }) => fakeMount('video', (h) => container.appendChild(h)));
  const mountTweetText = vi.fn(({ element }) => fakeMount('tweet', (h) => element.insertAdjacentElement('afterend', h)));
  const scanner = new XScanner(document, { mountVideo, mountTweetText }, () => enabled);
  return { scanner, mountVideo, mountTweetText };
}

const flush = () => new Promise((r) => setTimeout(r, 250));

describe('XScanner', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main></main>';
    window.history.replaceState({}, '', '/home');
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds a translate overlay to each public video', () => {
    document.querySelector('main')!.append(makeTweet({ video: true }), makeTweet({ video: true, text: 'hi' }));
    const { scanner, mountVideo } = createScanner();
    scanner.scan();
    expect(mountVideo).toHaveBeenCalledTimes(2);
    expect(document.querySelectorAll(`[${HOST_ATTR}="video"]`)).toHaveLength(2);
  });

  it('never duplicates the button when scanning repeatedly', () => {
    document.querySelector('main')!.append(makeTweet({ video: true, text: 'Hello' }));
    const { scanner, mountVideo, mountTweetText } = createScanner();
    scanner.scan();
    scanner.scan();
    scanner.scan();
    expect(mountVideo).toHaveBeenCalledTimes(1);
    expect(mountTweetText).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll(`[${HOST_ATTR}]`)).toHaveLength(2);
  });

  it('re-inserts the same overlay (keeps state) when X re-renders and removes it', () => {
    document.querySelector('main')!.append(makeTweet({ video: true }));
    const { scanner, mountVideo } = createScanner();
    scanner.scan();
    const host = document.querySelector(`[${HOST_ATTR}="video"]`)!;
    host.remove();
    scanner.scan();
    expect(mountVideo).toHaveBeenCalledTimes(1);
    expect(document.querySelector(`[${HOST_ATTR}="video"]`)).toBe(host);
  });

  it('detects videos added later while scrolling (MutationObserver)', async () => {
    const { scanner, mountVideo } = createScanner();
    scanner.start();
    expect(mountVideo).toHaveBeenCalledTimes(0);
    document.querySelector('main')!.append(makeTweet({ video: true }));
    await flush();
    expect(mountVideo).toHaveBeenCalledTimes(1);
    document.querySelector('main')!.append(makeTweet({ video: true }), makeTweet({ video: true }));
    await flush();
    expect(mountVideo).toHaveBeenCalledTimes(3);
    expect(scanner.videoCount).toBe(3);
    scanner.stop();
  });

  it('disposes overlays (stops processing) when tweets leave the page', async () => {
    const tweet = makeTweet({ video: true });
    document.querySelector('main')!.append(tweet);
    const { scanner, mountVideo } = createScanner();
    scanner.start();
    const mounted = mountVideo.mock.results[0].value as Mounted;
    tweet.remove();
    await flush();
    expect(mounted.dispose).toHaveBeenCalled();
    expect(scanner.videoCount).toBe(0);
    scanner.stop();
  });

  it('skips protected (private) accounts and animated GIFs', () => {
    document.querySelector('main')!.append(
      makeTweet({ video: true, text: 'secret', protectedAccount: true }),
      makeTweet({ video: true, gif: true }),
    );
    const { scanner, mountVideo, mountTweetText } = createScanner();
    scanner.scan();
    expect(mountVideo).not.toHaveBeenCalled();
    expect(mountTweetText).not.toHaveBeenCalled();
  });

  it('never runs on direct messages and removes UI when navigating there', () => {
    document.querySelector('main')!.append(makeTweet({ video: true }));
    const { scanner } = createScanner();
    scanner.scan();
    expect(scanner.videoCount).toBe(1);
    window.history.pushState({}, '', '/messages/123-456');
    scanner.scan();
    expect(scanner.videoCount).toBe(0);
    expect(document.querySelector(`[${HOST_ATTR}]`)).toBeNull();
  });

  it('does nothing when the extension is disabled', () => {
    document.querySelector('main')!.append(makeTweet({ video: true }));
    const { scanner, mountVideo } = createScanner(false);
    scanner.scan();
    expect(mountVideo).not.toHaveBeenCalled();
  });
});
