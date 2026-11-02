/**
 * scripts/sync-medium.js
 * Automatic Medium RSS synchronization engine for Anshad Digital Portfolio
 *
 * Rules:
 * - Activation Timestamp is strictly respected and immutable.
 * - Only articles published AFTER activationTimestamp are accepted.
 * - Deduplication via unique GUID and original Medium URL.
 * - Safe error handling with zero downtime.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'medium-config.json');

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
  const existingKeys = new Set(existingArticles.map(a => a.guid || a.link));

  let newlyAdded = 0;
  let excludedPrePublished = 0;
  let duplicateCount = 0;

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

    const title = titleMatch[1].trim();
    const pubDateStr = pubDateMatch[1].trim();
    const originalLink = linkMatch[1].trim();
    const guid = guidMatch ? guidMatch[1].trim() : originalLink;
    const pubDate = new Date(pubDateStr);

    // Rule 1: Strict Publication Date Validation
    if (isNaN(pubDate.getTime())) {
      console.warn(`⚠️ Skipping item with invalid date format: "${title}" (${pubDateStr})`);
      continue;
    }

    if (pubDate <= activationDate) {
      excludedPrePublished++;
      continue;
    }

    // Rule 2: Duplicate Prevention
    if (existingKeys.has(guid) || existingKeys.has(originalLink)) {
      duplicateCount++;
      continue;
    }

    // Extract Thumbnail
    let thumbnail = null;
    if (contentMatch) {
      const imgMatch = contentMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        thumbnail = imgMatch[1];
      }
    }

    // Extract Excerpt
    let excerpt = '';
    if (contentMatch) {
      const textOnly = contentMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      excerpt = textOnly.length > 175 ? textOnly.slice(0, 172) + '...' : textOnly;
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
      link: originalLink,
      pubDate: pubDate.toISOString(),
      dateFormatted,
      thumbnail,
      excerpt,
      platform: 'Medium'
    };

    existingArticles.unshift(newArticle);
    existingKeys.add(guid);
    existingKeys.add(originalLink);
    newlyAdded++;
    console.log(`✨ [NEW ARTICLE ACCEPTED] "${title}" (${dateFormatted})`);
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
