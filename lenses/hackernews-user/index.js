// hackernews.user — awe lens for HN user profiles.
// Uses the Firebase API (same as hackernews.item built-in).
// URL: https://news.ycombinator.com/user?id=<username>

const manifest = {
  type: 'hackernews.user',
  version: 1,
  motive:
    'Show a Hacker News user profile: karma, account age, about text, and ' +
    'latest 5 submissions — pulled live from the Firebase API.',
  url_patterns: ['news.ycombinator.com/user*'],
  ttl_seconds: 1800,
  requires: {
    network_domains: ['news.ycombinator.com', 'hacker-news.firebaseio.com'],
    runs_js: false,
    paths: ['cheerio'],
    cookie_scope: 'ephemeral',
  },
  icon: '🟠',
  category: 'social',
  author: '@awe',
  license: 'MIT',
  extracts: ['username', 'karma', 'created_at', 'about', 'submission_count', 'latest_submissions'],
};

function usernameFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    return u.searchParams.get('id');
  } catch {
    return null;
  }
}

export const card = {
  manifest,

  validate(_payload, sourceUrl) {
    return !!sourceUrl && !!usernameFromUrl(sourceUrl);
  },

  async fetch(_payload, sourceUrl, ctx) {
    const username = usernameFromUrl(sourceUrl);
    if (!username) throw new Error(`could not extract username: ${sourceUrl}`);
    const userUrl = `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(username)}.json`;
    const res = await ctx.fetchStatic(userUrl);
    if (res.status >= 400) throw new Error(`hn user api returned ${res.status}`);
    const user = JSON.parse(res.body);
    if (!user || !user.id) throw new Error(`hn user not found: ${username}`);

    // Fetch first 5 submissions in parallel for the body preview.
    const submissionIds = (user.submitted || []).slice(0, 5);
    const submissions = await Promise.all(
      submissionIds.map(async (id) => {
        try {
          const r = await ctx.fetchStatic(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (r.status >= 400) return null;
          const it = JSON.parse(r.body);
          return it && it.type
            ? {
                id,
                type: it.type,
                title: it.title || it.text?.slice(0, 100) || '(no title)',
                score: it.score ?? 0,
                url: it.url || `https://news.ycombinator.com/item?id=${id}`,
              }
            : null;
        } catch {
          return null;
        }
      })
    );

    const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').slice(0, 400);

    return {
      username: user.id,
      karma: user.karma ?? 0,
      created_at: user.created ? new Date(user.created * 1000).toISOString().slice(0, 10) : '',
      about: stripHtml(user.about),
      submission_count: (user.submitted || []).length,
      latest_submissions: submissions.filter(Boolean),
    };
  },
};
