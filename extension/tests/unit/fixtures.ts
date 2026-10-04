let counter = 0;

/** يبني تغريدة بنفس بنية X (data-testid) لاختبار الاكتشاف */
export function makeTweet(opts: { video?: boolean; text?: string; lang?: string; protectedAccount?: boolean; handle?: string; gif?: boolean } = {}): HTMLElement {
  const id = ++counter;
  const article = document.createElement('article');
  article.setAttribute('data-testid', 'tweet');
  const handle = opts.handle ?? `user${id}`;
  article.innerHTML = `
    <div>
      <div data-testid="User-Name"><a href="/${handle}">@${handle}</a>${opts.protectedAccount ? '<svg data-testid="icon-lock"></svg>' : ''}</div>
      <a href="/${handle}/status/${1000 + id}">time</a>
      ${opts.text !== undefined ? `<div data-testid="tweetText" lang="${opts.lang ?? 'en'}">${opts.text}</div>` : ''}
      ${opts.video ? `<div data-testid="videoPlayer"><div><video ${opts.gif ? 'src="https://video.twimg.com/tweet_video/abc.mp4"' : 'src="blob:https://x.com/abc"'}></video></div></div>` : ''}
    </div>`;
  return article;
}
