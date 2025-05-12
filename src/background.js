browser.menus.create({
  contexts: ['link'],
  documentUrlPatterns: ['*://www.tumblr.com/*'],
  id: 'tagFiltering',
  targetUrlPatterns: [
    '*://www.tumblr.com/tagged/*',
    '*://www.tumblr.com/*/tagged/*'
  ],
  title: 'Filter this tag'
});

browser.menus.create({
  contexts: ['selection'],
  documentUrlPatterns: ['*://www.tumblr.com/*'],
  id: 'contentFiltering',
  title: 'Filter the phrase: “%s”'
});

const getTag = linkUrl => {
  const { pathname } = new URL(linkUrl);
  const encodedTag = pathname.split('/').pop();
  const decodedTag = decodeURIComponent(encodedTag);
  return decodedTag;
};

const func = ({ url, body }) => window.tumblr.apiFetch(url, { method: 'POST', body });

const onMenuItemClicked = function ({ linkUrl, menuItemId, selectionText }, { id: tabId }) {
  const url = menuItemId === 'tagFiltering'
    ? '/v2/user/filtered_tags'
    : '/v2/user/filtered_content';

  const body = menuItemId === 'tagFiltering'
    ? { filtered_tags: [getTag(linkUrl)] }
    : { filtered_content: [selectionText] };

  browser.scripting.executeScript({
    target: { tabId },
    func,
    args: [{ url, body }],
    world: 'MAIN'
  });
};

browser.menus.onClicked.addListener(onMenuItemClicked);
