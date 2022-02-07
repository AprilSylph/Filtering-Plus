browser.menus.create({
  documentUrlPatterns: ['*://www.tumblr.com/*'],
  contexts: ['link'],
  id: 'tagFiltering',
  targetUrlPatterns: [
    '*://www.tumblr.com/tagged/*',
    '*://www.tumblr.com/blog/view/*/search/*'
  ],
  title: 'Filter this tag'
});

browser.menus.create({
  documentUrlPatterns: ['*://www.tumblr.com/*'],
  contexts: ['selection'],
  id: 'contentFiltering',
  title: 'Filter the phrase: “%s”'
});

const getTag = linkUrl => {
  const { pathname } = new URL(linkUrl);
  const encodedTag = pathname.split('/').pop();
  const decodedTag = decodeURIComponent(encodedTag);
  return decodedTag;
};

const onMenuItemClicked = function ({ linkUrl, selectionText }, { id: tabId }) {
  const url = `/v2/user/filtered_${linkUrl ? 'tags' : 'content'}`;
  const body = linkUrl
    ? { filtered_tags: [getTag(linkUrl)] }
    : { filtered_content: [selectionText] };

  const code = `{
    const { nonce } = [...document.scripts].find(script => script.getAttributeNames().includes('nonce'));
    const script = document.createElement('script');
    script.setAttribute('nonce', nonce);
    script.textContent = 'window.tumblr.apiFetch("${url}", { method: "POST", body: ${JSON.stringify(body)} })';

    document.documentElement.append(script);
    script.remove();
  }`;

  browser.tabs.executeScript(tabId, { code });
};

browser.menus.onClicked.addListener(onMenuItemClicked);
