/**
 * PlaceRight District Job Scraper
 * Scrapes 6 priority district job boards for external certificated teaching positions.
 * Filters out non-placement roles (principals, OTs, PTs, SLPs, etc.).
 * Districts ordered by placement priority.
 */

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
let puppeteer;
try { puppeteer = require('puppeteer-core'); } catch (e) { /* optional */ }

const PROJECT_DIR = path.resolve(__dirname);
const DATA_FILE = path.join(PROJECT_DIR, 'job-data.json');
const LOG_FILE = path.join(PROJECT_DIR, 'scraper-log.json');

// Districts ordered by placement priority
const DISTRICTS = [
  { name: 'Federal Way', platform: 'applitrack', slug: 'federalway', county: 'King' },
  { name: 'Renton', platform: 'applitrack', slug: 'rentonschools', county: 'King' },
  { name: 'Auburn', platform: 'applitrack', slug: 'auburnsd', county: 'King' },
  { name: 'Franklin Pierce', platform: 'hrmplus', url: 'https://franklinpiercejobs.hrmplus.net/JobOpenings.aspx', county: 'Pierce' },
  { name: 'Fife', platform: 'redrover', url: 'https://jobs.redroverk12.com/org/fifeschools', county: 'Pierce' },
  { name: 'Tacoma', platform: 'neogov', url: 'https://www.schooljobs.com/careers/tacomapublicschools', county: 'Pierce' },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ===== FILTERS =====

const INTERNAL_KEYWORDS = [
  'internal only', 'internal applicants only', 'current employees only',
  'internal transfer only', 'internal posting only', 'open to current staff only'
];

function isInternal(text) {
  const lower = text.toLowerCase();
  return INTERNAL_KEYWORDS.some(kw => lower.includes(kw));
}

// Positions that are NOT corps member placements — applied to position title only
const EXCLUDED_PATTERNS = [
  // Levi's explicit exclusion list
  /\bprincipal\b/i,
  /\bdean\b/i,
  /\bpsychologist\b/i,
  /\bphysical therapist/i,
  /\boccupational therapist/i,
  /\bspeech[\s-]?language/i,
  /\bslp\b/i,
  /\bjrotc\b/i,
  /\bsummer\b/i,
  /\besy\b/i,
  /\bextended school year/i,
  /\bcounselor\b/i,
  // Non-teaching positions that shouldn't appear
  /\bsubstitute\b/i,
  /\bguest\b/i,
  /\bcoach\b/i,
  /\bcrossing guard/i,
  /\bnutrition/i,
  /\bparaeducator/i,
  /\bbus driver/i,
  /\bfood service/i,
  /\bcustodian/i,
  /\bsecretary/i,
  /\bhealth clerk/i,
  /\binstructional assistant/i,
  /\bsupport professional/i,
  /\bintern\b/i,
  /\bnurse\b/i,
  /\blibrarian\b/i,
  /\btutor\b/i,
  /\badvisor\b/i,
];

function isExcludedPosition(positionTitle) {
  return EXCLUDED_PATTERNS.some(p => p.test(positionTitle));
}

// Broad certificated match for platforms with position type metadata
const CERTIFICATED_TYPES = [
  'certificated', 'classroom teacher', 'teacher', 'cte teacher',
  'elementary teacher', 'special education'
];

// ===== CLASSIFICATION =====

function detectGradeLevel(text) {
  const lower = text.toLowerCase();
  if (lower.includes('elementary') || lower.includes('k-5') || lower.includes('k-6') || /[1-5](st|nd|rd|th)\s*grade/i.test(lower)) return 'Elementary';
  if (lower.includes('middle') || lower.includes('6-8') || lower.includes('junior high') || /[6-8](th)\s*grade/i.test(lower)) return 'Middle';
  if (lower.includes('high school') || lower.includes('9-12') || lower.includes('secondary') || /\bhs\b/.test(lower)) return 'High';
  return 'Unknown';
}

// Checks title first (most reliable), then description as fallback
function detectCertArea(title, description) {
  const fromTitle = _matchCertArea(title);
  if (fromTitle !== 'General') return fromTitle;
  if (description) return _matchCertArea(description);
  return 'General';
}

function _matchCertArea(text) {
  const lower = text.toLowerCase();
  if (/special ed|sped|life skills|\bslc\b|structured learning|resource room|self[- ]contained/i.test(lower)) return 'Special Ed';
  if (/\bell\b|\besl\b|bilingual|dual language/i.test(lower)) return 'ELL';
  if (/\bmath/i.test(lower)) return 'Math';
  if (/science|biology|chemistry|physics/i.test(lower)) return 'Science';
  if (/english|language arts|\bela\b|\breading\b/i.test(lower)) return 'English/LA';
  if (/social studies|history|government/i.test(lower)) return 'Social Studies';
  if (/elementary teacher|[1-5](st|nd|rd|th)\s*grade/i.test(lower)) return 'Elementary Ed';
  if (/\bmusic\b/i.test(lower)) return 'Music';
  if (/\bart teacher|visual art/i.test(lower)) return 'Art';
  if (/physical education|\bpe\b/i.test(lower)) return 'PE';
  if (/\bcte\b|career.{0,10}tech|technology ed/i.test(lower)) return 'CTE';
  if (/world language|spanish|french/i.test(lower)) return 'World Languages';
  return 'General';
}

// ===== SCRAPERS =====

// --- APPLITRACK (Federal Way, Renton, Auburn) ---
async function scrapeAppliTrack(district) {
  const results = [];
  let excludedCount = 0;
  try {
    const url = `https://www.applitrack.com/${district.slug}/onlineapp/jobpostings/view.asp?embed=1&all=1&detail=1`;
    const res = await fetch(url, { headers: HEADERS });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('ul.postingsList').each((_, ul) => {
      const ulId = $(ul).attr('id') || '';
      const jobIdMatch = ulId.match(/p(\d+)_/);
      if (!jobIdMatch) return;

      const jobId = jobIdMatch[1];
      const title = $(ul).find('td#wrapword').text().trim();
      if (!title) return;
      if (isExcludedPosition(title)) { excludedCount++; return; }

      const fields = {};
      $(ul).find('li').each((_, li) => {
        const label = $(li).find('span.label').first().text().trim().replace(':', '');
        const value = $(li).find('span.normal').first().text().trim();
        if (label && value) fields[label] = value;
      });

      const posType = fields['Position Type'] || '';
      const location = fields['Location'] || '';
      const datePosted = fields['Date Posted'] || '';
      const closingDate = fields['Closing Date'] || '';

      const descId = `DescriptionText${jobId}_`;
      const descText = $(`#${descId}`).text().trim();
      const fullText = `${title} ${posType} ${location} ${descText}`;

      if (isInternal(fullText)) return;

      const isCertificated = CERTIFICATED_TYPES.some(t => posType.toLowerCase().includes(t));
      const link = `https://www.applitrack.com/${district.slug}/OnlineApp/JobPostings/view.asp?all=1&AppliTrackJobId=${jobId}&AppliTrackLayoutMode=detail&AppliTrackViewPosting=1`;

      results.push({
        id: `${district.slug}-${jobId}`,
        district: district.name,
        county: district.county,
        positionTitle: title,
        school: location,
        positionType: posType,
        isCertificated,
        certArea: detectCertArea(title, descText),
        gradeLevel: detectGradeLevel(`${title} ${location}`),
        link,
        datePosted,
        closingDate,
        dateScraped: new Date().toISOString().split('T')[0],
        platform: 'AppliTrack',
        status: 'Active',
        isExternal: true
      });
    });

    const cert = results.filter(r => r.isCertificated).length;
    console.log(`  [${district.name}] ${results.length} postings, ${excludedCount} excluded, ${cert} certificated`);
  } catch (err) {
    console.error(`  [${district.name}] Error: ${err.message}`);
  }
  return results;
}

// --- RED ROVER (Fife) ---
async function scrapeRedRover(district) {
  const results = [];
  let excludedCount = 0;
  try {
    const res = await fetch(district.url, { headers: HEADERS });
    const html = await res.text();

    // Red Rover RSC: escaped JSON in self.__next_f.push() chunks
    const postingRegex = /\\"id\\":\\"(\d{6})\\"[^}]{0,50}\\"name\\":\\"([^\\]+)\\"/g;
    let m;
    const seen = new Set();

    while ((m = postingRegex.exec(html)) !== null) {
      const id = m[1];
      const name = m[2];
      if (parseInt(id) < 100000) continue;
      if (seen.has(id)) continue;
      seen.add(id);

      if (isExcludedPosition(name)) { excludedCount++; continue; }

      // Extract category and site from nearby context
      const contextEnd = Math.min(html.length, m.index + 800);
      const context = html.substring(m.index, contextEnd);

      const catMatch = context.match(/JobPostingCategory[^}]*?\\"name\\":\\"([^\\]+)\\"/);
      const category = catMatch ? catMatch[1] : '';

      const siteMatch = context.match(/__typename\\":\\"Site\\"[^}]*?\\"name\\":\\"([^\\]+)\\"/);
      const school = siteMatch ? siteMatch[1] : '';

      const fullText = `${name} ${category} ${school}`;
      if (isInternal(fullText)) continue;

      results.push({
        id: `fife-${id}`,
        district: district.name,
        county: district.county,
        positionTitle: name,
        school,
        positionType: category,
        isCertificated: /teacher|certificated|special ed/i.test(fullText),
        certArea: detectCertArea(name, category),
        gradeLevel: detectGradeLevel(`${name} ${school}`),
        link: `https://jobs.redroverk12.com/org/fifeschools/opening/${id}`,
        datePosted: '',
        closingDate: '',
        dateScraped: new Date().toISOString().split('T')[0],
        platform: 'Red Rover',
        status: 'Active',
        isExternal: true
      });
    }

    const cert = results.filter(r => r.isCertificated).length;
    console.log(`  [${district.name}] ${results.length} postings, ${excludedCount} excluded, ${cert} certificated`);
  } catch (err) {
    console.error(`  [${district.name}] Error: ${err.message}`);
  }
  return results;
}

// --- NEOGOV (Tacoma) ---
// NEOGOV renders via Knockout.js. Requires Puppeteer.
// Tries multiple page loads: default, keyword search, category filter.
async function scrapeNEOGOV(district) {
  const results = [];
  let excludedCount = 0;

  if (!puppeteer) {
    console.log(`  [${district.name}] Skipped — puppeteer-core not installed`);
    return results;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const seen = new Set();

    // Try multiple URLs to maximize coverage
    const urls = [
      district.url + '?sort=PostingDate%7CDescending',
      district.url + '?keywords=teacher&sort=PostingDate%7CDescending',
      district.url + '?keywords=certificated&sort=PostingDate%7CDescending',
    ];

    for (const pageUrl of urls) {
      const page = await browser.newPage();
      await page.setUserAgent(HEADERS['User-Agent']);

      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000));

        // Scroll to load more results
        let previousHeight = 0;
        for (let i = 0; i < 8; i++) {
          const newHeight = await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            return document.body.scrollHeight;
          });
          if (newHeight === previousHeight) break;
          previousHeight = newHeight;
          await new Promise(r => setTimeout(r, 1500));
        }

        // Extract all job links
        const jobs = await page.evaluate(() => {
          const items = [];
          const linksSeen = new Set();
          document.querySelectorAll('a[href*="/jobs/"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            const match = href.match(/\/jobs\/(\d+)/);
            if (!match) return;
            const id = match[1];
            if (linksSeen.has(id)) return;
            linksSeen.add(id);
            const title = link.textContent.trim();
            if (!title || title.length < 5 || title === 'Apply' || title === 'View') return;
            items.push({ id, title });
          });
          return items;
        });

        for (const job of jobs) {
          if (seen.has(job.id)) continue;
          seen.add(job.id);
          if (isExcludedPosition(job.title)) { excludedCount++; continue; }
          if (isInternal(job.title)) continue;

          results.push({
            id: `tacoma-${job.id}`,
            district: district.name,
            county: district.county,
            positionTitle: job.title,
            school: '',
            positionType: '',
            isCertificated: /teacher|certificated|specialist/i.test(job.title),
            certArea: detectCertArea(job.title),
            gradeLevel: detectGradeLevel(job.title),
            link: `https://www.schooljobs.com/careers/tacomapublicschools/jobs/${job.id}`,
            datePosted: '',
            closingDate: '',
            dateScraped: new Date().toISOString().split('T')[0],
            platform: 'NEOGOV',
            status: 'Active',
            isExternal: true
          });
        }
      } catch (e) {
        console.log(`  [${district.name}] Page load failed for ${pageUrl}: ${e.message}`);
      } finally {
        await page.close();
      }
    }

    const cert = results.filter(r => r.isCertificated).length;
    console.log(`  [${district.name}] ${results.length} postings, ${excludedCount} excluded, ${cert} certificated`);
  } catch (err) {
    console.error(`  [${district.name}] Error: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
  return results;
}

// --- HRMPLUS (Franklin Pierce) ---
// DevExpress grid: table id="...grdJobs_DXMainTable", rows id="...DXDataRow{n}"
// Columns: Position Type | Info | Year | ID | Position | Location | Hours | Days | FTE | Closing
// Paginated: must click through pages.
async function scrapeHRMplus(district) {
  const results = [];
  let excludedCount = 0;

  if (!puppeteer) {
    console.log(`  [${district.name}] Skipped — puppeteer-core not installed`);
    return results;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent(HEADERS['User-Agent']);

    await page.goto(district.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 6000));

    const seenIds = new Set();

    // Extract jobs from all pages
    let pageNum = 1;
    while (pageNum <= 5) { // safety cap
      const jobs = await page.evaluate(() => {
        const items = [];
        const rows = document.querySelectorAll('tr[id*="DXDataRow"]');
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          // Known column order: [0]=PositionType, [1]=Info(button), [2]=Year, [3]=ID, [4]=Position, [5]=Location, [6]=Hours, [7]=Days, [8]=FTE, [9]=Closing, [10]=status
          if (cells.length < 6) return;
          const posType = cells[0] ? cells[0].textContent.trim() : '';
          const year = cells[2] ? cells[2].textContent.trim() : '';
          const jobId = cells[3] ? cells[3].textContent.trim() : '';
          const title = cells[4] ? cells[4].textContent.trim() : '';
          const location = cells[5] ? cells[5].textContent.trim() : '';
          const closing = cells[9] ? cells[9].textContent.trim() : '';
          if (!title || title.length < 3) return;
          items.push({ posType, year, jobId, title, location, closing });
        });
        return items;
      });

      if (jobs.length === 0) break;

      for (const job of jobs) {
        if (seenIds.has(job.jobId)) continue;
        seenIds.add(job.jobId);
        if (isExcludedPosition(job.title)) { excludedCount++; continue; }
        if (isInternal(job.title)) continue;

        const isCert = /certificated|classroom teacher/i.test(job.posType) ||
                       /teacher/i.test(job.title);

        results.push({
          id: `franklinpierce-${job.jobId || seenIds.size}`,
          district: district.name,
          county: district.county,
          positionTitle: job.title,
          school: job.location,
          positionType: job.posType,
          isCertificated: isCert,
          certArea: detectCertArea(job.title),
          gradeLevel: detectGradeLevel(`${job.title} ${job.location}`),
          link: district.url,
          datePosted: '',
          closingDate: job.closing,
          dateScraped: new Date().toISOString().split('T')[0],
          platform: 'HRMplus',
          status: 'Active',
          isExternal: true
        });
      }

      // Try to click next page via DevExpress pager
      const hasNext = await page.evaluate(() => {
        const pageNums = document.querySelectorAll('td[class*="dxpPageNumber"]');
        let foundCurrent = false;
        for (const td of pageNums) {
          if (foundCurrent) {
            // Click the <a> inside the next page number cell
            const link = td.querySelector('a');
            if (link) { link.click(); return true; }
            td.click();
            return true;
          }
          if (td.className.includes('CurrentPageNumber')) foundCurrent = true;
        }
        return false;
      });

      if (!hasNext) break;
      pageNum++;
      await new Promise(r => setTimeout(r, 3000));
    }

    const cert = results.filter(r => r.isCertificated).length;
    console.log(`  [${district.name}] ${results.length} postings (${pageNum} page${pageNum > 1 ? 's' : ''}), ${excludedCount} excluded, ${cert} certificated`);
  } catch (err) {
    console.error(`  [${district.name}] Error: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
  return results;
}

// ===== MAIN =====

async function runScrape() {
  const startTime = new Date();
  console.log(`\n=== PlaceRight Scraper ===`);
  console.log(`Started: ${startTime.toISOString()}`);
  console.log(`Target: ${DISTRICTS.length} districts\n`);

  let existingData = { postings: [], lastScrape: null, scrapeHistory: [] };
  try {
    if (fs.existsSync(DATA_FILE)) {
      existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('  No existing data file, starting fresh');
  }

  const previousPostings = existingData.postings || [];
  const previousIds = new Set(previousPostings.map(p => p.id));

  let allNewPostings = [];

  for (const district of DISTRICTS) {
    console.log(`\nScraping ${district.name} (${district.platform})...`);

    let postings = [];
    switch (district.platform) {
      case 'applitrack':
        postings = await scrapeAppliTrack(district);
        break;
      case 'redrover':
        postings = await scrapeRedRover(district);
        break;
      case 'neogov':
        postings = await scrapeNEOGOV(district);
        break;
      case 'hrmplus':
        postings = await scrapeHRMplus(district);
        break;
    }

    allNewPostings = allNewPostings.concat(postings);
  }

  // Reconcile with previous data
  const newIds = new Set(allNewPostings.map(p => p.id));
  const reconciledPostings = [];

  allNewPostings.forEach(p => {
    const existing = previousPostings.find(ep => ep.id === p.id);
    p.dateFirstSeen = existing ? (existing.dateFirstSeen || existing.dateScraped) : p.dateScraped;
    reconciledPostings.push(p);
  });

  const expiredCount = previousPostings.filter(p => !newIds.has(p.id) && p.status === 'Active').length;
  const newCount = allNewPostings.filter(p => !previousIds.has(p.id)).length;
  const totalCertificated = reconciledPostings.filter(p => p.isCertificated).length;

  const outputData = {
    postings: reconciledPostings,
    lastScrape: startTime.toISOString(),
    stats: {
      totalAll: reconciledPostings.length,
      totalCertificated,
      newThisScrape: newCount,
      expiredThisScrape: expiredCount,
      byDistrict: {}
    },
    scrapeHistory: [
      ...(existingData.scrapeHistory || []).slice(-50),
      {
        timestamp: startTime.toISOString(),
        totalFound: allNewPostings.length,
        certificated: totalCertificated,
        newPostings: newCount,
        expired: expiredCount
      }
    ]
  };

  DISTRICTS.forEach(d => {
    const all = reconciledPostings.filter(p => p.district === d.name);
    const cert = all.filter(p => p.isCertificated);
    outputData.stats.byDistrict[d.name] = { total: all.length, certificated: cert.length };
  });

  // Write full data
  fs.writeFileSync(DATA_FILE, JSON.stringify(outputData, null, 2));

  // Write dashboard module — certificated teaching positions only
  const certPostings = reconciledPostings.filter(p => p.isCertificated);
  const dashboardData = `// Auto-generated by PlaceRight Scraper — ${startTime.toISOString()}
// DO NOT EDIT — overwritten on each scrape
// ${certPostings.length} certificated teaching positions across ${DISTRICTS.length} districts

const SCRAPED_POSTINGS = ${JSON.stringify(certPostings.map(p => ({
    id: p.id,
    district: p.district,
    county: p.county,
    positionTitle: p.positionTitle,
    school: p.school,
    certArea: p.certArea,
    gradeLevel: p.gradeLevel,
    link: p.link,
    datePosted: p.datePosted,
    dateScraped: p.dateScraped,
    status: p.status
  })), null, 2)};

const SCRAPE_META = {
  lastScrape: "${startTime.toISOString()}",
  totalCertificated: ${certPostings.length},
  totalAll: ${reconciledPostings.length},
  newThisScrape: ${newCount},
  expiredThisScrape: ${expiredCount}
};

const DISTRICTS = ${JSON.stringify(DISTRICTS.map(d => d.name))};

export { SCRAPED_POSTINGS, SCRAPE_META, DISTRICTS };
`;
  fs.writeFileSync(path.join(PROJECT_DIR, 'src', 'scraped-data.js'), dashboardData);

  // Write log
  const logEntry = {
    timestamp: startTime.toISOString(),
    duration: `${((new Date() - startTime) / 1000).toFixed(1)}s`,
    totalPostings: reconciledPostings.length,
    certificatedPostings: totalCertificated,
    newPostings: newCount,
    expiredPostings: expiredCount,
    byDistrict: outputData.stats.byDistrict
  };

  let logHistory = [];
  try {
    if (fs.existsSync(LOG_FILE)) logHistory = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  } catch (e) {}
  logHistory.push(logEntry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logHistory.slice(-100), null, 2));

  console.log(`\n=== Scrape Complete ===`);
  console.log(`Duration: ${logEntry.duration}`);
  console.log(`Total postings: ${reconciledPostings.length}`);
  console.log(`Certificated teaching: ${totalCertificated}`);
  console.log(`New this scrape: ${newCount}`);
  console.log(`\nBy district:`);
  Object.entries(outputData.stats.byDistrict).forEach(([d, stats]) => {
    console.log(`  ${d}: ${stats.total} total, ${stats.certificated} certificated`);
  });

  return outputData;
}

if (require.main === module) {
  runScrape().catch(err => {
    console.error('Scraper failed:', err);
    process.exit(1);
  });
}

module.exports = { runScrape };
