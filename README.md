# Placement Dashboard

**Teach For America Washington — 2026 Corps**

A live operations dashboard that automates job board monitoring across six Washington school districts and gives the placement team a shared view of where every corps member stands in the hiring pipeline.

**Live site:** [levimogg.github.io/placement-tracker](https://levimogg.github.io/placement-tracker/)

---

## The Problem

Every year, TFA Washington places ~50 corps members into teaching roles across King and Pierce County school districts. That process depends on matching each corps member's certification area and grade-level fit to open positions scattered across six different district job boards — each with its own platform, its own update schedule, and its own quirks.

Before this tool, placement ran on manually maintained spreadsheets, informal job board checks, and institutional memory. Postings got missed. Matching was slow. There was no shared, at-a-glance view of where each corps member stood. Strategy sessions lost time to spreadsheet navigation instead of decisions.

## What This Solves

1. **No more missed postings.** The scraper checks all six district job boards automatically, filtering for certificated teaching positions only.
2. **Instant matching.** Open positions are matched to corps members by cert area and grade band automatically.
3. **Pipeline visibility.** A kanban board shows every CM's status — Unplaced, Pinged, Applied, Interviewing, Hired — with drag-and-drop that syncs back to the Google Sheet.
4. **Pace tracking.** Monthly milestone targets (Apr: 5, May: 15, Jun: 25, Jul: 40, Aug: 55) with velocity metrics so the team knows if they're on track.
5. **Intervention flags.** Automated alerts for CMs not applying, applications with no response, districts going quiet, and CMs with no matching postings.

## Architecture

```
┌─────────────────────────────┐
│  Google Sheet (Backend)     │  ← Team edits roster, statuses, notes
│  "Corps Member Roster" tab  │
│  "Activity Log" tab         │
└──────────┬──────────────────┘
           │ Apps Script proxy (read + write)
           ▼
┌─────────────────────────────┐
│  Placement Dashboard        │  ← Static site on GitHub Pages
│  index.html (login gate)    │
│  app.html (dashboard)       │
│  Password: access code      │
└──────────┬──────────────────┘
           │ Reads scraped job data
           ▼
┌─────────────────────────────┐
│  Scraper (node scraper.js)  │  ← Runs every 3 hours
│  Hits 6 district job boards │
│  Filters to certificated    │
│  teaching positions only    │
│  Writes to src/scraped-     │
│  data.js + job-data.json    │
└─────────────────────────────┘
```

**Data flows one direction.** The team enters and updates data in the Google Sheet. The dashboard reads from it via an Apps Script proxy. The scraper writes job posting data to local files that the dashboard imports. Dragging a card on the kanban POSTs back to the Apps Script, which updates the Sheet.

## Priority Districts

Listed in placement priority order:

| District | County | Platform | Scraper Status |
|----------|--------|----------|----------------|
| Federal Way | King | AppliTrack (Frontline) | Working |
| Renton | King | AppliTrack (Frontline) | Working |
| Auburn | King | AppliTrack (Frontline) | Working |
| Franklin Pierce | Pierce | HRMplus (DevExpress) | Working (currently 0 teaching openings) |
| Fife | Pierce | Red Rover (Next.js) | Working |
| Tacoma | Pierce | NEOGOV (Puppeteer) | Working (limited by JS rendering) |

## Dashboard Views

### Job Board
Real scraped teaching positions across all six districts. Filterable by district. Each posting shows matched CMs. Click a CM name to open their profile.

### Corps Members (Kanban)
Five columns: Unplaced → Pinged → Applied → Interviewing → Hired. Cards show cert area, grade band, target district, match count, and activity stats. Drag cards between columns to change status (syncs to Google Sheet). Click a card for the full profile — contact info, resume, activity history, matching positions.

### Districts
Per-district cards showing open posting count, CMs targeting that district, interviewing count, and placement count. Trend indicator (actively posting vs quiet).

### Flags
Grouped into three categories:
- **Needs Action:** No resume uploaded, jobs sent but not applying, no matching postings
- **At Risk:** Applied with no response, multiple interviews without an offer, no interview traction
- **District Alerts:** No teaching postings, district gone quiet

## Excluded Position Types

The scraper filters OUT these positions even when listed as certificated:
- Principals and assistant principals
- School psychologists
- Physical therapists, occupational therapists, speech-language pathologists
- Deans of students
- Counselors (school and CTE)
- JROTC instructors
- Summer school and ESY staff
- Substitute and guest teachers
- Coaches, paraeducators, classified support staff

## Google Sheet Structure

The backend is a Google Sheet with two tabs the dashboard reads:

**Tab: Corps Member Roster**

| Column | Description |
|--------|-------------|
| Name | Full name |
| Cert Area(s) | Comma-separated: Elementary Ed, Math, Science, ELL, Special Ed, English/LA, Social Studies, CTE, etc. |
| Grade Band | Elementary, Middle, or High |
| Status | Unplaced, Pinged, Applied, Interviewing, or Hired |
| Target District | Preferred district for placement |
| Placed District | Filled when hired |
| Placed School | Filled when hired |
| Email | Corps member email |
| Phone | Corps member phone |
| Resume Link | Google Drive share URL |
| Notes | Free text |

**Tab: Activity Log**

| Column | Description |
|--------|-------------|
| Date | YYYY-MM-DD |
| CM Name | Must match Name in roster exactly |
| Action | Job Sent, Applied, Interview Scheduled, or Hired |
| Job Reference | Description of the position |

## Apps Script Proxy

The Google Sheet is access-restricted to TFA. A Google Apps Script deployed as a web app acts as a proxy:
- **GET** `?tab=Corps Member Roster` — returns roster as JSON
- **GET** `?tab=Activity Log` — returns activity as JSON
- **POST** `{name, status}` — updates a CM's status in the roster

The Apps Script runs as the Sheet owner, so the Sheet stays locked to TFA while the dashboard can read/write through the proxy.

## Running the Scraper

```bash
cd /Users/lmogg/Projects/tfawashington/placement-tracker
node scraper.js
```

Requires `puppeteer-core` for Tacoma (NEOGOV) and Franklin Pierce (HRMplus). Uses local Chrome at `/Applications/Google Chrome.app`.

Output:
- `job-data.json` — full scraper data (all postings, all types)
- `src/scraped-data.js` — certificated teaching positions only (imported by dashboard)
- `scraper-log.json` — run history

After running the scraper, commit and push the updated `src/scraped-data.js` to update the live site.

## Deployment

- **Hosting:** GitHub Pages from the `main` branch
- **URL:** https://levimogg.github.io/placement-tracker/
- **Access:** Password-protected login page (access code)
- **Update flow:** Push to `main` → GitHub Pages auto-rebuilds (~60 seconds)

## Assumptions

1. **~50 corps members** for the 2026 placement season
2. **Placement target of 55** (stretch goal) by end of August, with monthly milestones: Apr 5, May 15, Jun 25, Jul 40, Aug 55
3. **Six priority districts** — Federal Way, Renton, Auburn, Franklin Pierce, Fife, Tacoma — cover the placement footprint
4. **Certificated teaching positions only** — the scraper excludes all non-classroom roles
5. **Google Sheet as single source of truth** — the team maintains roster data there; the dashboard reads from it
6. **No login wall on job boards** — all six districts show listings publicly; login is only required for applying
7. **Scraper runs on a local machine** — not deployed to a server; must be run manually or via cron/launchd
8. **Password gate is a convenience barrier**, not real security — the access code prevents casual access but is not encrypted

## Known Limitations

- **Tacoma coverage may be incomplete.** NEOGOV renders entirely via JavaScript. Puppeteer captures what's visible but may miss paginated results.
- **Franklin Pierce has no stable URLs** for individual postings. Links go to the main board page.
- **Scraper must be run locally** and results pushed to GitHub to update the live site. Not yet automated end-to-end.
- **Activity Log is manual.** The team enters Job Sent, Applied, Interview Scheduled, and Hired events by hand in the Sheet.
- **No email/Slack notifications yet.** Planned for a future phase.

## File Structure

```
placement-tracker/
├── index.html              ← Login gate (access code)
├── app.html                ← Main dashboard
├── config.js               ← Sensitive config (gitignored)
├── scraper.js              ← Job board scraper (Node.js)
├── job-data.json           ← Full scraper output
├── scraper-log.json        ← Scraper run history
├── src/
│   ├── data.js             ← Demo roster (50 CMs) + activity log
│   └── scraped-data.js     ← Certificated positions (auto-generated)
├── sheets/
│   ├── apps-script.js      ← Google Apps Script code
│   ├── Corps Member Roster.csv
│   ├── Activity Log.csv
│   ├── roster-paste.tsv    ← Paste-ready for Google Sheets
│   └── activity-paste.tsv
├── tfa-logo.svg            ← TFA 1-line logo (cream, for dark bg)
├── tfa-logo-navy.svg       ← TFA 1-line logo (navy, for light bg)
├── CHARTER.md              ← Original product charter
├── DISTRICT-RESEARCH.md    ← District job board research
└── README.md               ← This file
```

## Built With

- Vanilla HTML/CSS/JavaScript (no framework)
- Poppins font (Google Fonts)
- TFA 35th Anniversary brand guidelines (Combo 1: Blue Focus)
- Node.js + Cheerio + Puppeteer for scraping
- Google Sheets + Apps Script for data backend
- GitHub Pages for hosting
