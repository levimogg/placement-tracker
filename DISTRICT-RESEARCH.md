# District Job Board Research Report

**TFA Washington Placement Tracker — Phase 1**
**Date: March 23, 2026**

---

## Summary

| District | Platform | Public Access | Filter by Teaching | Direct Links | Scrapable | Blocker |
|----------|----------|:---:|:---:|:---:|:---:|---------|
| Tacoma | NEOGOV / SchoolJobs | Yes | Partial | Yes | Medium | JS-heavy rendering |
| Franklin Pierce | HRMplus | Yes | Yes | No | Hard | ASP.NET callbacks, no stable URLs |
| Fife | Red Rover | Yes | Yes | Yes | Easy | None — clean REST-like URLs |
| Auburn | AppliTrack (Frontline) | Yes | Yes | Yes | Easy | None |
| Renton | AppliTrack (Frontline) | Yes | Yes | Yes | Easy | None |
| Federal Way | AppliTrack (Frontline) | Yes | Yes | Yes | Easy | None |

**Bottom line:** 4 of 6 districts are on AppliTrack/Frontline — we build one scraper template and reuse it. Fife (Red Rover) is clean and easy. Franklin Pierce is the only real challenge.

---

## Scraper Strategy

### Tier 1: AppliTrack Districts (Auburn, Renton, Federal Way) — One Template
All three use Frontline's AppliTrack with nearly identical URL structures:
- Auburn: `applitrack.com/auburnsd/onlineapp/`
- Renton: `applitrack.com/rentonschools/onlineapp/`
- Federal Way: `applitrack.com/federalway/onlineapp/`

**Filter URL pattern:** `jobpostings/view.asp?embed=1&Category=Certificated`

Each provides: job title, school/location, date posted, category, and direct links via `AppliTrackJobId` parameter. Grade level and cert area are embedded in job titles, not discrete fields — will need text parsing.

**Approach:** Build one n8n HTTP Request node template, parameterize the district slug. Parse the HTML response for posting cards. JS-dependent but the embedded detail view (`embed=1&detail=1`) renders enough in static HTML for scraping.

### Tier 2: Fife (Red Rover) — Easiest
Clean Next.js platform with stable URLs: `jobs.redroverk12.com/org/fifeschools/opening/{id}`

Has category filters (Teacher, Paraeducator, etc.), location filters, pay ranges, and full descriptions. The cleanest board of all six.

**Approach:** Fetch the main listing page, parse job cards. Stable individual URLs make it easy to track new vs. existing postings.

### Tier 3: Tacoma (NEOGOV/SchoolJobs) — Medium Difficulty
Uses NEOGOV at `schooljobs.com/careers/tacomapublicschools`. The listing page is JS-heavy, but individual job bulletins at `/jobs/newprint/{id}` are static HTML and fully public.

The district's own site organizes by Certificated/Classified, but the NEOGOV portal's filtering is JS-dependent.

**Approach:** Use the NEOGOV sort-by-date URL, or explore if NEOGOV has an undocumented API (many NEOGOV instances expose JSON endpoints). Fallback: fetch the newprint bulletin pages directly.

### Tier 4: Franklin Pierce (HRMplus) — Hardest
ASP.NET WebForms with DevExpress controls. No stable URLs for individual postings. All interactions use JavaScript callbacks. Not indexed by Google.

**Has a critical advantage:** Position Type dropdown with "Classroom Teacher" filter works without login.

**Approach options:**
1. **Headless browser** (Puppeteer in n8n) — load the page, select "Teacher" filter, extract the grid content
2. **Intercept the callback** — the DevExpress grid likely makes XHR/callback requests that return data; capture and replay those
3. **Manual monitoring** — Franklin Pierce is small enough that weekly manual checks may be sufficient while we automate the other 5

**Recommendation:** Start with options 1-2. If too brittle, fall back to manual + alert Tierra to check this board weekly.

---

## District Detail Reports

### 1. Tacoma Public Schools

| Check | Answer |
|-------|--------|
| Job board URL | `schooljobs.com/careers/tacomapublicschools` |
| Platform | NEOGOV / SchoolJobs.com |
| Public access | Yes — listings visible without login |
| Login wall | Only for applying |
| Filter for teaching | Partial — district site separates Certificated; NEOGOV filter is JS-dependent |
| Data fields | Job title, job number, department, division, school + address, salary, FTE, closing date |
| School location | Yes — specific school name and street address |
| Direct links | Yes — `/jobs/newprint/{id}` for static bulletins |
| Technology | JavaScript-heavy SPA; static bulletin pages available |
| RSS/API | No RSS; possible undocumented NEOGOV JSON API |

**Quirks:** The best scraping target is the "newprint" bulletin pages which render as clean static HTML. The main listing page requires JS execution. NEOGOV instances sometimes expose a JSON API at paths like `/api/recruitmentjobs`.

---

### 2. Franklin Pierce School District

| Check | Answer |
|-------|--------|
| Job board URL | `franklinpiercejobs.hrmplus.net/JobOpenings.aspx` |
| Platform | HRMplus (ASP.NET + DevExpress) |
| Public access | Yes — listings visible without login |
| Login wall | Only for applying |
| Filter for teaching | Yes — "Position Type" dropdown: Classroom Teacher, Certificated Support |
| Data fields | Position name, location/school, job ID, hours/day, days/year, FTE, closing date |
| School location | Yes — school name shown |
| Direct links | No — modal/callback architecture, no stable URLs |
| Technology | ASP.NET WebForms + DevExpress, JS-heavy callbacks |
| RSS/API | None |

**Quirks:** The hardest board to scrape. No stable URLs for individual postings. Grade level and cert area not shown in the grid — may be in PDF detail views. Small district though, so posting volume is low. The legacy HRMplus platform is uncommon.

---

### 3. Fife School District

| Check | Answer |
|-------|--------|
| Job board URL | `jobs.redroverk12.com/org/fifeschools` |
| Platform | Red Rover Hiring (Next.js) |
| Public access | Yes — fully public |
| Login wall | Only for applying |
| Filter for teaching | Yes — category filter includes Teacher, Paraeducator, etc. |
| Data fields | Job title, employment type, pay range, location/school, category, full description |
| School location | Yes |
| Direct links | Yes — `jobs.redroverk12.com/org/fifeschools/opening/{id}` |
| Technology | Next.js (React), clean REST-like URLs |
| RSS/API | No public API, but clean URL structure |

**Quirks:** The cleanest board. Also has a legacy HRMplus system still live at `fifejobs.hrmplus.net` but appears deprecated. Fife is a small district — expect low posting volume. Grade level and specific cert endorsement are in description text, not structured fields.

---

### 4. Auburn School District

| Check | Answer |
|-------|--------|
| Job board URL | `applitrack.com/auburnsd/onlineapp/` |
| Platform | Frontline / AppliTrack |
| Public access | Yes |
| Login wall | Only for applying |
| Filter for teaching | Yes — "Certificated" category with sub-types (CTE, Elementary, SPED, etc.) |
| Data fields | Job title, job ID, position type, date posted, location/school, date available, closing date, salary, FTE |
| School location | Yes — specific building |
| Direct links | Yes — via `AppliTrackJobId` parameter |
| Technology | jQuery-based, some JS dependency but embedded views render well |
| RSS/API | No |

**Quirks:** 16 current certificated openings — active board. The embedded detail view (`embed=1&detail=1`) is the best scraping target. Sub-categories break certificated into Elementary Teacher, CTE Teacher, SPED, etc. — useful for matching. Has attached PDF job specs.

---

### 5. Renton School District

| Check | Answer |
|-------|--------|
| Job board URL | `applitrack.com/rentonschools/onlineapp/` |
| Platform | Frontline / AppliTrack |
| Public access | Yes |
| Login wall | Only for applying |
| Filter for teaching | Yes — "Certificated" category (7 current openings) |
| Data fields | Job title, position type, date posted, location/school, date available, contract type, FTE, salary schedule, cert requirements |
| School location | Yes — school name in title and location field |
| Direct links | Yes — via `AppliTrackJobId` parameter |
| Technology | jQuery, JS-dependent tabs but embedded view works |
| RSS/API | No |

**Quirks:** School name and subject area are embedded in job titles (e.g., "Nelsen Middle School - Leave Replacement Math Teacher"). 21 school/location filter options. Cert endorsement requirements noted in postings.

---

### 6. Federal Way Public Schools

| Check | Answer |
|-------|--------|
| Job board URL | `applitrack.com/federalway/onlineapp/` |
| Platform | Frontline / AppliTrack |
| Public access | Yes — 107 current openings visible |
| Login wall | Only for applying |
| Filter for teaching | Yes — "Certificated" category (4 openings), plus "Summer Certificated" (12) |
| Data fields | Job title, job ID, category/subcategory, location/school, date posted, hours/day, days/year |
| School location | Yes — specific school |
| Direct links | Yes — via `AppliTrackJobId` parameter |
| Technology | jQuery, same AppliTrack template as Auburn/Renton |
| RSS/API | No |

**Quirks:** Has separate "Summer Certificated" category (12 openings) — may be relevant for CMs. Also separates "Nurse, OT, PT, Psych, SLP" into its own category. Relatively low certificated posting count right now (4), but the board is large overall (107 total). Has a zip code proximity search feature.

---

## Account Creation Plan

**No accounts needed for scraping.** All six districts allow public viewing of job listings without login. Accounts are only required for applying.

For corps members who need to apply, the account creation process for each platform:

| Platform | Districts | Account Process |
|----------|-----------|-----------------|
| AppliTrack/Frontline | Auburn, Renton, Federal Way | Create account at each district's AppliTrack portal. Can reuse credentials across Frontline districts. |
| NEOGOV/SchoolJobs | Tacoma | Create account at schooljobs.com. Reusable across all NEOGOV districts. |
| Red Rover | Fife | Create account at redroverk12.com |
| HRMplus | Franklin Pierce | Create account at franklinpiercejobs.hrmplus.net |

**Recommendation:** Have Tierra help CMs create accounts on all four platforms as part of onboarding. One Frontline account covers 3 of 6 districts.

---

## Next Steps

1. **Build AppliTrack scraper template** — covers Auburn, Renton, Federal Way (3 districts, one codebase)
2. **Build Red Rover scraper** — Fife (clean, fast)
3. **Build NEOGOV scraper** — Tacoma (explore JSON API first, fall back to HTML parsing)
4. **Assess Franklin Pierce** — try headless browser approach; if too brittle, add to manual monitoring list
5. **Set up Google Sheet** — create the three-tab structure from the charter
6. **Wire scrapers to Sheet** — n8n writes new postings to Tab 2, triggers notifications
