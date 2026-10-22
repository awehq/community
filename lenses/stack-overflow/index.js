// stack.overflow — awe lens for Stack Overflow questions.
//
// Renders the question + top-scoring answer using the public StackExchange API.
// No auth; rate-limited at 300/day per IP without a key (we don't ship one).
//
// URL pattern: https://stackoverflow.com/questions/<id>/<slug>

const manifest = {
  type: 'stack.overflow',
  version: 1,
  motive:
    'Show a Stack Overflow question with its top-scoring answer body, vote ' +
    'counts, and accepted-answer status — pulled live from the StackExchange API.',
  url_patterns: [
    'stackoverflow.com/questions/**',
    '*.stackoverflow.com/questions/**',
  ],
  ttl_seconds: 3600,
  requires: {
    network_domains: ['api.stackexchange.com', 'stackoverflow.com'],
    runs_js: false,
    paths: ['cheerio'],
    cookie_scope: 'ephemeral',
  },
  icon: '📚',
  category: 'dev',
  author: '@awe',
  license: 'MIT',
  extracts: [
    'question_title',
    'question_score',
    'question_view_count',
    'asker',
    'tags',
    'top_answer_score',
    'top_answer_body',
    'top_answer_author',
    'top_answer_accepted',
  ],
};

function questionIdFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const m = u.pathname.match(/\/questions\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export const card = {
  manifest,

  validate(_payload, sourceUrl) {
    if (!sourceUrl) return false;
    return questionIdFromUrl(sourceUrl) !== null;
  },

  async fetch(_payload, sourceUrl, ctx) {
    const qid = questionIdFromUrl(sourceUrl);
    if (!qid) throw new Error(`could not extract question id from URL: ${sourceUrl}`);

    // 1. Question metadata.
    const qUrl =
      `https://api.stackexchange.com/2.3/questions/${qid}` +
      `?site=stackoverflow&filter=!nNPvSNdWme`;
    const qRes = await ctx.fetchStatic(qUrl);
    if (qRes.status >= 400) {
      throw new Error(`stackexchange question api returned ${qRes.status}`);
    }
    const qBody = JSON.parse(qRes.body);
    const q = qBody.items?.[0];
    if (!q) throw new Error(`question ${qid} not found`);

    // 2. Top answer (sorted by votes).
    const aUrl =
      `https://api.stackexchange.com/2.3/questions/${qid}/answers` +
      `?site=stackoverflow&order=desc&sort=votes&filter=!9_bDDxJY5`;
    const aRes = await ctx.fetchStatic(aUrl);
    let topAnswer = null;
    if (aRes.status < 400) {
      const aBody = JSON.parse(aRes.body);
      // Prefer accepted answer if present; else highest-voted.
      topAnswer =
        (aBody.items || []).find((a) => a.is_accepted) ||
        (aBody.items || [])[0] ||
        null;
    }

    // Strip the answer body to roughly 1200 chars of plain text so we don't
    // dump pages into chat. Authors can fetch the full URL if they want depth.
    const stripHtml = (s) =>
      (s || '')
        .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, '\n```\n$1\n```\n')
        .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const answerBody = topAnswer
      ? stripHtml(topAnswer.body || '').slice(0, 1200)
      : '';

    return {
      question_title: q.title || '(no title)',
      question_score: q.score ?? 0,
      question_view_count: q.view_count ?? 0,
      asker: q.owner?.display_name || 'unknown',
      tags: Array.isArray(q.tags) ? q.tags.slice(0, 6) : [],
      top_answer_score: topAnswer?.score ?? 0,
      top_answer_body: answerBody,
      top_answer_author: topAnswer?.owner?.display_name || '',
      top_answer_accepted: !!topAnswer?.is_accepted,
    };
  },
};
