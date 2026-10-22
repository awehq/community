// pypi.package — awe lens for pypi.org/project/<name> pages.
// Pure public PyPI JSON API; no auth.

const manifest = {
  type: 'pypi.package',
  version: 1,
  motive:
    'Show a PyPI package summary: latest version, summary, license, author, ' +
    'project URLs, and required Python version — pulled live from the PyPI JSON API.',
  url_patterns: ['pypi.org/project/**', '*.pypi.org/project/**'],
  ttl_seconds: 21600,
  requires: {
    network_domains: ['pypi.org'],
    runs_js: false,
    paths: ['cheerio'],
    cookie_scope: 'ephemeral',
  },
  icon: '🐍',
  category: 'dev',
  author: '@awe',
  license: 'MIT',
  extracts: [
    'name',
    'version',
    'summary',
    'license',
    'author',
    'requires_python',
    'homepage',
    'project_urls',
    'classifiers',
  ],
};

function packageNameFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const m = u.pathname.match(/^\/project\/([^/]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

export const card = {
  manifest,

  validate(_payload, sourceUrl) {
    return !!sourceUrl && packageNameFromUrl(sourceUrl) !== null;
  },

  async fetch(_payload, sourceUrl, ctx) {
    const pkg = packageNameFromUrl(sourceUrl);
    if (!pkg) throw new Error(`could not extract package name from URL: ${sourceUrl}`);
    const apiUrl = `https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`;
    const res = await ctx.fetchStatic(apiUrl);
    if (res.status === 404) throw new Error(`pypi package not found: ${pkg}`);
    if (res.status >= 400) throw new Error(`pypi api returned ${res.status} for ${pkg}`);
    let data;
    try { data = JSON.parse(res.body); }
    catch (e) { throw new Error(`pypi api non-JSON body for ${pkg}`); }
    const info = data.info || {};
    // project_urls is { Homepage: "...", Documentation: "..." }; keep small.
    const project_urls = {};
    if (info.project_urls && typeof info.project_urls === 'object') {
      for (const [k, v] of Object.entries(info.project_urls).slice(0, 6)) {
        if (typeof v === 'string') project_urls[k] = v;
      }
    }
    return {
      name: info.name || pkg,
      version: info.version || '?',
      summary: info.summary || '',
      license: info.license || 'UNKNOWN',
      author: info.author || info.author_email || 'unknown',
      requires_python: info.requires_python || '',
      homepage: info.home_page || info.project_url || `https://pypi.org/project/${pkg}/`,
      project_urls,
      classifiers: Array.isArray(info.classifiers) ? info.classifiers.slice(0, 5) : [],
    };
  },
};
