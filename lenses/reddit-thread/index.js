// reddit.thread — awe lens for Reddit threads.
//
// Reddit serves any thread URL as JSON when you append `.json`. No auth.
// Schema: [thread_listing, comment_listing].

const manifest = {
  type: 'reddit.thread',
  version: 1,
  motive:
    'Show a Reddit thread: title, OP body, score, top 5 comments with their ' +
    'scores and authors — pulled via reddit.com/<path>/.json with no auth.',
  url_patterns: [
    'reddit.com/r/*/comments/**',
    'www.reddit.com/r/*/comments/**',
    'old.reddit.com/r/*/comments/**',
  ],
  ttl_seconds: 1800,
  requires: {
    network_domains: ['reddit.com', 'www.reddit.com'],
    runs_js: false,
    paths: ['cheerio'],
    cookie_scope: 'ephemeral',
  },
  icon: '👽',
  category: 'social',
  author: '@awe',
  license: 'MIT',
  extracts: ['title', 'subreddit', 'author', 'score', 'body', 'comment_count', 'top_comments'],
};

function normalizeUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    // Force www.reddit.com (old.reddit redirects/scopes inconsistently for .json).
    return `https://www.reddit.com${u.pathname.replace(/\/?$/, '')}.json?limit=20&raw_json=1`;
  } catch {
    return null;
  }
}

export const card = {
  manifest,

  validate(_payload, sourceUrl) {
    return !!sourceUrl && /reddit\.com\/r\/[^/]+\/comments\//.test(sourceUrl);
  },

  async fetch(_payload, sourceUrl, ctx) {
    const apiUrl = normalizeUrl(sourceUrl);
    if (!apiUrl) throw new Error(`bad reddit URL: ${sourceUrl}`);
    const res = await ctx.fetchStatic(apiUrl);
    if (res.status >= 400) throw new Error(`reddit returned ${res.status}`);
    let data;
    try { data = JSON.parse(res.body); }
    catch (e) { throw new Error(`reddit non-JSON body`); }
    if (!Array.isArray(data) || data.length < 2) throw new Error(`reddit unexpected shape`);
    const post = data[0]?.data?.children?.[0]?.data;
    if (!post) throw new Error(`reddit post not found in payload`);
    const commentListing = data[1]?.data?.children || [];
    const top_comments = commentListing
      .filter((c) => c.kind === 't1' && c.data && !c.data.stickied)
      .slice(0, 5)
      .map((c) => ({
        author: c.data.author || '[deleted]',
        score: c.data.score ?? 0,
        body: (c.data.body || '').slice(0, 320),
      }));
    return {
      title: post.title || '(no title)',
      subreddit: post.subreddit_name_prefixed || `r/${post.subreddit || '?'}`,
      author: post.author || '[deleted]',
      score: post.score ?? 0,
      body: (post.selftext || '').slice(0, 600),
      comment_count: post.num_comments ?? 0,
      top_comments,
    };
  },
};
