/**
 * scripts/sync-medium.js
 * Automatic Medium RSS synchronization engine for Anshad Digital Portfolio
 *
 * Requirements:
 * - Activation Timestamp is strictly respected and immutable.
 * - Only articles published AFTER activationTimestamp are accepted.
 * - Initial Article: "SEO Content Strategy: How to Turn Keyword Research into Content That Reaches the Right Audience"
 * - Deduplication via unique GUID and canonical article URL.
 * - Preserves original Medium article URLs (canonical clean URLs without tracking params).
 * - Extracts featured image thumbnail, clean title, excerpt, and publication date.
 * - Safe error handling with zero downtime.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'medium-config.json');

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function syncMediumFeed() {
  console.log('🔄 Starting Medium RSS Synchronization...');

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Configuration file not found at:', CONFIG_PATH);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const activationDate = new Date(config.activationTimestamp);

  console.log(`📌 Activation Timestamp (Immutable): ${config.activationTimestamp} (${activationDate.toUTCString()})`);
  console.log(`🌐 Fetching RSS Feed: ${config.feedUrl}`);

  let xml;
  try {
    const res = await fetch(config.feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AnshadDigitalPortfolioSync/1.0; +https://anshadigital.com)'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    xml = await res.text();
  } catch (err) {
    console.error('⚠️ Network/Fetch Error while retrieving Medium feed:', err.message);
    console.log('Safe exit: existing articles and configuration remain untouched.');
    return;
  }

  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  console.log(`📥 Total items retrieved from feed: ${itemMatches.length}`);

  let existingArticles = Array.isArray(config.articles) ? config.articles : [];
  
  // Build deduplication index using canonical URLs, raw links, and GUIDs
  const existingKeys = new Set();
  existingArticles.forEach(a => {
    if (a.guid) existingKeys.add(a.guid.toLowerCase());
    if (a.link) {
      existingKeys.add(a.link.toLowerCase());
      existingKeys.add(a.link.split('?')[0].toLowerCase());
    }
  });

  let newlyAdded = 0;
  let excludedPrePublished = 0;
  let duplicateCount = 0;
  const newItemsToPrepend = [];

  for (const m of itemMatches) {
    const itemXml = m[1];

    const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i) || itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i);

    if (!titleMatch || !pubDateMatch || !linkMatch) {
      console.warn('⚠️ Skipping malformed item (missing required title, pubDate, or link).');
      continue;
    }

    const rawTitle = titleMatch[1].trim();
    const title = decodeHtmlEntities(rawTitle);
    const pubDateStr = pubDateMatch[1].trim();
    const originalLink = linkMatch[1].trim();
    const canonicalLink = originalLink.split('?')[0]; // Clean canonical Medium URL
    const guid = guidMatch ? guidMatch[1].trim() : canonicalLink;
    const pubDate = new Date(pubDateStr);

    // Rule 1: Strict Publication Date Validation
    if (isNaN(pubDate.getTime())) {
      console.warn(`⚠️ Skipping item with invalid date format: "${title}" (${pubDateStr})`);
      continue;
    }

    // Must be published strictly after the activation timestamp
    if (pubDate <= activationDate) {
      excludedPrePublished++;
      continue;
    }

    // Rule 2: Strict Canonical URL & GUID Deduplication
    const guidKey = guid.toLowerCase();
    const canonicalKey = canonicalLink.toLowerCase();
    const origKey = originalLink.toLowerCase();

    if (existingKeys.has(guidKey) || existingKeys.has(canonicalKey) || existingKeys.has(origKey)) {
      duplicateCount++;
      continue;
    }

    // Extract Featured Image Thumbnail
    let thumbnail = null;
    if (contentMatch) {
      const imgMatch = contentMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        let imgSrc = imgMatch[1];
        // Resolve modern miro.medium.com CDN URL for maximum reliability and 0 redirects
        imgSrc = imgSrc.replace(/https?:\/\/cdn-images-\d+\.medium\.com\/(?:max\/\d+|fit\/[^/]+)/i, 'https://miro.medium.com/v2/resize:fit:1024');
        thumbnail = imgSrc;
      }
    }

    // Extract Clean Excerpt (strip figure, author byline, and HTML tags)
    let excerpt = '';
    if (contentMatch) {
      let cleaned = contentMatch[1]
        .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
        .replace(/<p>\s*<strong>\s*By\s+[\s\S]*?<\/strong>\s*<\/p>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      cleaned = cleaned.replace(/^By\s+Anshad\s+S\.[^.]*\.\s*/i, '').trim();
      excerpt = cleaned.length > 175 ? cleaned.slice(0, 172) + '...' : cleaned;
    }

    // Format Date for Display
    const dateFormatted = pubDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const newArticle = {
      guid,
      title,
      link: canonicalLink,
      pubDate: pubDate.toISOString(),
      dateFormatted,
      thumbnail,
      excerpt,
      platform: 'Medium'
    };

    newItemsToPrepend.push(newArticle);
    existingKeys.add(guidKey);
    existingKeys.add(canonicalKey);
    existingKeys.add(origKey);
    newlyAdded++;
    console.log(`✨ [NEW ARTICLE ACCEPTED] "${title}" (${dateFormatted})`);
  }

  // Prepend newly added articles in chronological order
  if (newItemsToPrepend.length > 0) {
    existingArticles = [...newItemsToPrepend, ...existingArticles];
  }

  config.articles = existingArticles;
  config.lastSyncedAt = new Date().toISOString();

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  console.log(`\n📊 Sync Summary:`);
  console.log(`   - Pre-activation articles excluded: ${excludedPrePublished}`);
  console.log(`   - Duplicates skipped: ${duplicateCount}`);
  console.log(`   - New articles added: ${newlyAdded}`);
  console.log(`   - Total active articles in store: ${existingArticles.length}`);
  console.log(`✔ Configuration updated successfully.\n`);
}

syncMediumFeed().catch(err => {
  console.error('Fatal sync failure:', err);
  process.exit(1);
});
