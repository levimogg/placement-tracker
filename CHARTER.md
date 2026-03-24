# PlaceRight
### TFA Washington Corps Member Placement System

---

## The Problem We're Solving

Every year, TFA Washington places 48–55 corps members into teaching roles across King and Pierce County school districts. That placement process depends on matching each corps member's certification area and grade-level fit to open positions scattered across six different district job boards — each with its own platform, its own update schedule, and its own quirks.

Today, this work runs on manually maintained spreadsheets, informal job board checks, and institutional memory.

The consequences:

- **Postings get missed.** Districts post jobs without notice. Nobody is watching all six boards consistently. A position opens Monday, gets filled Thursday, and no one on the team ever saw it.
- **Matching is slow.** Connecting an opening to the right corps member means cross-referencing multiple tabs across unwieldy spreadsheets that only one person fully understands.
- **Pipeline visibility is poor.** There is no shared, at-a-glance view of where each corps member stands — who's been sent jobs, who has applied, who is stuck, who needs a push.
- **Strategy sessions lose time to spreadsheet navigation.** When the team sits down to talk placement, the conversation gets lost in tab-switching and row-scanning instead of focused on decisions and action.

The core problem isn't effort — the team works hard. The problem is that **the information architecture doesn't support the speed, clarity, or coordination the work requires.**

---

## Why This Matters Beyond Placement

This tool is a proof point for a bigger idea: **AI-assisted tools can replace the massive franken-sheets that accumulate across every organization.**

Every team has them. Spreadsheets with 15 tabs. Color-coded rows only one person understands. Formulas that break when someone inserts a column. They technically hold the information, but they make it harder to:

- **Context-switch** between different views of the same data
- **Parse what matters right now** vs. what's noise
- **Talk about the right things** in meetings
- **Onboard someone new** to the data without a 30-minute walkthrough

PlaceRight demonstrates that a lightweight, AI-built tool can take the same underlying data — a Google Sheet the team already maintains — and make it **easier to read, easier to act on, and easier to use as a team.** Not by adding complexity, but by presenting information in the shape the work actually needs.

If it works here, the pattern works everywhere: donor pipeline, program monitoring, staff onboarding, partner tracking. The franken-sheet problem is universal. This is the first proof that we can solve it.

---

## What PlaceRight Does

Three connected layers replace scattered spreadsheets and manual board-checking:

1. **Automated scanning** of six priority district job boards to catch every relevant posting — filtering for external, certificated teaching positions only
2. **Smart matching** that connects open positions to corps members by certification area and grade level
3. **A shared dashboard** where the full team can see the pipeline, review openings, and make placement decisions together — designed for six people around a table, not one person scrolling through tabs

---

## Architecture

```
┌─────────────────────────────────────┐
│   Google Sheet (Backend)            │
│   Maintained by placement team      │
│   - Corps member roster             │
│   - Cert areas + grade levels       │
│   - Placement status updates        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   n8n Automation Layer              │
│   - Daily job board scans (6 AM)    │
│   - External positions only         │
│   - Cert + grade matching           │
│   - Daily digest email (Tierra)     │
│   - Real-time Slack pings           │
│   - Manual "scan now" trigger       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   PlaceRight Dashboard              │
│   Password-protected web app        │
│   Reads from Google Sheet           │
│   - Job board tracker               │
│   - Corps member pipeline           │
│   - District summary                │
│   - Intervention flags              │
└─────────────────────────────────────┘
```

**Data flows one direction.** The team enters and updates data in the Google Sheet. The dashboard reads from it. The scraper writes new postings to it. No competing sources of truth.

**Internal vs. External:** All six district job boards distinguish between internal positions (for current district employees) and external positions (open to outside candidates). The scrapers target **external certificated postings only** — internal positions aren't relevant for corps member placement.

---

## Priority Districts

| # | District | County | Platform | Scraper Difficulty |
|---|----------|--------|----------|:--:|
| 1 | Tacoma | Pierce | NEOGOV / SchoolJobs | Medium |
| 2 | Franklin Pierce | Pierce | HRMplus | Hard |
| 3 | Fife | Pierce | Red Rover | Easy |
| 4 | Auburn | King | AppliTrack (Frontline) | Easy |
| 5 | Renton | King | AppliTrack (Frontline) | Easy |
| 6 | Federal Way | King | AppliTrack (Frontline) | Easy |

**No login blockers.** All six boards show job listings publicly. Login is only required for applying — not for viewing or scraping. No accounts needed for the automation layer.

**One template covers three districts.** Auburn, Renton, and Federal Way all run AppliTrack/Frontline with nearly identical URL structures. One scraper template, parameterized by district slug.

---

## Dashboard Views

### View 1: Job Board Tracker
A running log of every external teaching posting scraped, organized by district.

| Field | Source |
|-------|--------|
| Date posted | Scraper |
| District | Scraper |
| School | Scraper |
| Position title | Scraper |
| Cert area | Scraper (parsed from title/description) |
| Grade level | Scraper (parsed from title/school type) |
| Direct link | Scraper |
| Matched CMs | Auto-matched from roster |
| Status | New / Sent / Expired |

Includes historical data to surface posting patterns — when districts ramp up hiring, when they go quiet.

### View 2: Corps Member Pipeline
One row per corps member showing placement status at a glance.

| Field | Source |
|-------|--------|
| Name | Google Sheet |
| Cert area(s) | Google Sheet |
| Grade band | Google Sheet |
| Status | Unplaced → Pinged → Applied → Interviewing → Hired |
| Target district | Google Sheet |
| Jobs sent | Auto-counted |
| Jobs applied to | Google Sheet (team entry) |
| Notes | Google Sheet |

Visual pipeline bar shows the full cohort breakdown across all stages.

### View 3: District Summary
A district-level rollup — the view you use when strategizing about where to focus energy.

| Field | Derived from |
|-------|-------------|
| District | — |
| Open positions | Job tracker |
| Unplaced CMs targeting this district | Pipeline |
| CMs currently interviewing | Pipeline |
| CMs placed | Pipeline |
| Posting trend (active / quiet) | Job tracker history |

### View 4: Intervention Flags
Automated alerts that surface where the process is stuck.

| Flag | Trigger | Action |
|------|---------|--------|
| Not applying | CM sent 5+ jobs, 0 applications | Tierra follows up with CM |
| No response | CM applied 5+ days ago, no update | Trigger principal outreach |
| District quiet | Priority district, no postings in 14+ days | Flag for relationship check |

---

## Notifications

### Daily Digest Email (to Tierra)
One email each morning at 6:30 AM, grouped by district.

```
Subject: PlaceRight — Mar 24, 2026 Daily Digest

TACOMA (3 new postings)
━━━━━━━━━━━━━━━━━━━━━━
• 4th Grade Teacher — Lincoln Elementary
  Cert: Elementary Ed | Grade: K-5
  Link: [url]
  Matched CMs: Maria S., James T.

• Middle School Math — Stewart Middle
  Cert: Math | Grade: 6-8
  Link: [url]
  Matched CMs: Andre W.

AUBURN (1 new posting)
━━━━━━━━━━━━━━━━━━━━━━
• Math Teacher — Auburn Riverside HS
  ...
```

### Real-Time Slack Pings
Immediate notification in a dedicated Slack channel when a new posting matches an unplaced CM.

```
🔔 New match: Math Teacher — Auburn Riverside HS (Auburn)
   Matched CMs: Marcus L.
   Link: [url]
```

---

## Google Sheet Structure

The team maintains one Google Sheet with three tabs:

**Tab 1: Corps Member Roster** (team-maintained)

| Column | Description |
|--------|-------------|
| Name | Full name |
| Cert Area(s) | e.g., Elementary Ed, Math, Science, ELL, Special Ed |
| Grade Band | Elementary / Middle / High |
| Status | Unplaced / Pinged / Applied / Interviewing / Hired |
| Target District | Preferred or assigned district |
| Placed District | Filled when hired |
| Placed School | Filled when hired |
| Notes | Free text |

**Tab 2: Job Postings** (auto-populated by scraper)

| Column | Description |
|--------|-------------|
| Date Scraped | Auto |
| District | Auto |
| School | Auto |
| Position Title | Auto |
| Position Type | External (filtered; internal excluded) |
| Cert Area | Auto-categorized from title/description |
| Grade Level | Auto-categorized |
| Link | Auto |
| Matched CMs | Auto |
| Status | New / Sent / Expired |

**Tab 3: Activity Log** (auto-populated)

| Column | Description |
|--------|-------------|
| Date | Auto |
| CM Name | Auto / team entry |
| Action | Job Sent / Applied / Interview Scheduled / Hired |
| Job Reference | Link to posting |

---

## Build Phases

| Phase | Deliverable | Depends On | Status |
|-------|-------------|------------|--------|
| **0: Foundation** | Google Sheet with roster, postings, and activity log tabs | Tierra provides current roster | Pending |
| **1: District Research** | Structured report on all 6 boards — platforms, access, scrapability | None | ✅ Complete |
| **2: Scrapers** | n8n workflows scanning each board daily, writing to Sheet | Phase 1 | Next |
| **3: Notifications** | Daily digest email + real-time Slack pings | Phase 0 + 2 | Queued |
| **4: Dashboard** | PlaceRight web app — all 4 views reading from Sheet | Phase 0 | Prototype built |
| **5: Refinement** | Pattern analytics, improved matching, team feedback | Phase 4 in use | Future |

---

## Decisions Made

| Decision | Answer |
|----------|--------|
| Tool name | PlaceRight |
| Backend data source | Google Sheet, maintained by placement team |
| Scraper target | External certificated positions only (not internal) |
| Notification preference | Both daily digest email AND real-time Slack pings |
| Dashboard access | Shared with full placement team (~6 people) |
| Scan frequency | Daily at 6 AM + manual trigger |
| Heat map | Deferred to v2; replaced by district summary table |
| Kanban drag-and-drop | Deferred; status managed via Google Sheet dropdown |
| CM status flow | Unplaced → Pinged → Applied → Interviewing → Hired |
| "Pinged" auto-set | On job send; "Applied" onward entered by team |

---

## Open Items

| Item | Owner | Needed By |
|------|-------|-----------|
| Current CM roster (names, certs, grade bands, targets) | Tierra | Before Phase 0 |
| Slack channel for real-time pings — existing or new? | Levi | Before Phase 3 |
| Dashboard hosting (Vercel, Netlify, other) | Levi | Before Phase 4 launch |
| Dashboard password / auth approach | Levi | Before Phase 4 launch |

---

## What Success Looks Like

**In 30 days:**
- Every relevant external teaching posting across 6 districts is captured automatically
- Tierra receives a daily briefing with matched corps members
- No posting goes unseen for more than 24 hours

**In 60 days:**
- The full team uses PlaceRight in weekly placement strategy sessions
- Pipeline visibility replaces spreadsheet scrolling
- Intervention flags catch stuck corps members before it's too late

**In 90 days:**
- Historical posting data reveals district hiring patterns
- The team can predict windows and prepare corps members in advance
- Placement rate improves because the system supports the work instead of slowing it down

---

*PlaceRight — Built by TFA Washington using AI-assisted development. Proving that purpose-built tools can replace the franken-sheets and give teams cleaner data, faster decisions, and more time for the work that matters.*
