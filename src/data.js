// Mock data — 50 corps members with realistic placement season distribution
// Will be replaced when Google Sheet is connected

const MOCK_ROSTER = [
  // === UNPLACED (20) ===
  { name: "Maria Santos", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Strong in bilingual ed", districtTarget: "Federal Way" },
  { name: "Carlos Rivera", certAreas: ["Social Studies"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "" },
  { name: "Marcus Lee", certAreas: ["Math"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Open to any district", districtTarget: "" },
  { name: "Keisha Brown", certAreas: ["Science"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Auburn" },
  { name: "Destiny Washington", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Jordan Nguyen", certAreas: ["Math"], gradeBand: "Middle", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Prefers King County", districtTarget: "Renton" },
  { name: "Aaliyah Jackson", certAreas: ["ELL"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Spanish bilingual", districtTarget: "Federal Way" },
  { name: "Ethan Morales", certAreas: ["Special Ed"], gradeBand: "Middle", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Renton" },
  { name: "Sofia Hernandez", certAreas: ["Elementary Ed", "ELL"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Dual language certified", districtTarget: "Auburn" },
  { name: "Trevon Harris", certAreas: ["English/LA"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "" },
  { name: "Hannah Park", certAreas: ["Science"], gradeBand: "Middle", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Isaiah Coleman", certAreas: ["Special Ed"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Has K-8 endorsement", districtTarget: "Franklin Pierce" },
  { name: "Mia Thompson", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Fife" },
  { name: "Liam O'Brien", certAreas: ["Math", "Science"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Renton" },
  { name: "Camila Reyes", certAreas: ["ELL"], gradeBand: "Middle", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Tacoma" },
  { name: "Noah Bennett", certAreas: ["Special Ed"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Emotional/behavioral focus", districtTarget: "Federal Way" },
  { name: "Zara Ahmed", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Auburn" },
  { name: "Jaylen Moore", certAreas: ["English/LA"], gradeBand: "Middle", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Grace Kim", certAreas: ["Music"], gradeBand: "Elementary", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "K-8 music certified", districtTarget: "" },
  { name: "Diego Gutierrez", certAreas: ["CTE"], gradeBand: "High", status: "Unplaced", placedDistrict: "", placedSchool: "", notes: "Business ed background", districtTarget: "Auburn" },

  // === PINGED (12) ===
  { name: "Sarah Mitchell", certAreas: ["English/LA"], gradeBand: "Middle", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "2nd year CM", districtTarget: "Federal Way" },
  { name: "Tyler Park", certAreas: ["Science"], gradeBand: "Middle", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Tacoma" },
  { name: "Olivia Foster", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Renton" },
  { name: "DeAndre Williams", certAreas: ["Math"], gradeBand: "High", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Emma Chen", certAreas: ["Special Ed"], gradeBand: "Elementary", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "Resource room preferred", districtTarget: "Auburn" },
  { name: "Ryan Patel", certAreas: ["Science"], gradeBand: "High", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "Chemistry endorsement", districtTarget: "Renton" },
  { name: "Jasmine Taylor", certAreas: ["ELL", "Elementary Ed"], gradeBand: "Elementary", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Brandon Scott", certAreas: ["Social Studies"], gradeBand: "Middle", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Franklin Pierce" },
  { name: "Natalie Cruz", certAreas: ["Math"], gradeBand: "Middle", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Renton" },
  { name: "Christopher Adams", certAreas: ["Special Ed"], gradeBand: "High", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "SLC experience", districtTarget: "Auburn" },
  { name: "Ava Robinson", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Fife" },
  { name: "Michael Tran", certAreas: ["English/LA"], gradeBand: "High", status: "Pinged", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Tacoma" },

  // === APPLIED (8) ===
  { name: "James Thompson", certAreas: ["Elementary Ed", "ELL"], gradeBand: "Elementary", status: "Applied", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Tacoma" },
  { name: "Aisha Johnson", certAreas: ["Special Ed"], gradeBand: "Elementary", status: "Applied", placedDistrict: "", placedSchool: "", notes: "Has K-8 endorsement", districtTarget: "Fife" },
  { name: "Daniel Garcia", certAreas: ["Math"], gradeBand: "High", status: "Applied", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Brittany Lewis", certAreas: ["Science"], gradeBand: "Middle", status: "Applied", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Renton" },
  { name: "Kevin Okafor", certAreas: ["Special Ed"], gradeBand: "Middle", status: "Applied", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Franklin Pierce" },
  { name: "Samantha White", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Applied", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },
  { name: "Luis Ramirez", certAreas: ["ELL"], gradeBand: "Middle", status: "Applied", placedDistrict: "", placedSchool: "", notes: "Vietnamese bilingual", districtTarget: "Renton" },
  { name: "Alexis Turner", certAreas: ["English/LA"], gradeBand: "Middle", status: "Applied", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Auburn" },

  // === INTERVIEWING (5) ===
  { name: "Andre Williams", certAreas: ["Math"], gradeBand: "Middle", status: "Interviewing", placedDistrict: "", placedSchool: "", notes: "Prefers Pierce County", districtTarget: "Franklin Pierce" },
  { name: "Priya Patel", certAreas: ["ELL", "Elementary Ed"], gradeBand: "Elementary", status: "Interviewing", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Auburn" },
  { name: "Jessica Hawkins", certAreas: ["Special Ed"], gradeBand: "High", status: "Interviewing", placedDistrict: "", placedSchool: "", notes: "SEB program interview", districtTarget: "Federal Way" },
  { name: "Marcus Young", certAreas: ["Science"], gradeBand: "High", status: "Interviewing", placedDistrict: "", placedSchool: "", notes: "Bio + chem", districtTarget: "Renton" },
  { name: "Stephanie Flores", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Interviewing", placedDistrict: "", placedSchool: "", notes: "", districtTarget: "Federal Way" },

  // === HIRED (5) ===
  { name: "David Chen", certAreas: ["Math", "Science"], gradeBand: "High", status: "Hired", placedDistrict: "Renton", placedSchool: "Lindbergh HS", notes: "", districtTarget: "Renton" },
  { name: "Rachel Kim", certAreas: ["Elementary Ed"], gradeBand: "Elementary", status: "Hired", placedDistrict: "Federal Way", placedSchool: "Camelot Elementary", notes: "", districtTarget: "Federal Way" },
  { name: "Terrence Brooks", certAreas: ["Special Ed"], gradeBand: "Middle", status: "Hired", placedDistrict: "Auburn", placedSchool: "Olympic MS", notes: "", districtTarget: "Auburn" },
  { name: "Amanda Fischer", certAreas: ["Math"], gradeBand: "Middle", status: "Hired", placedDistrict: "Federal Way", placedSchool: "Lakota MS", notes: "", districtTarget: "Federal Way" },
  { name: "Jonathan Lee", certAreas: ["English/LA"], gradeBand: "High", status: "Hired", placedDistrict: "Renton", placedSchool: "Hazen HS", notes: "", districtTarget: "Renton" },
];

const MOCK_POSTINGS = [
  { dateScraped: "2026-03-23", district: "Federal Way", school: "Federal Way Public Academy", positionTitle: "Certificated Teacher - Mathematics", certArea: "Math", gradeLevel: "Unknown", link: "#", matchedCMs: [], status: "New" },
  { dateScraped: "2026-03-23", district: "Federal Way", school: "Camelot Elementary", positionTitle: "Special Education Teacher - SEB", certArea: "Special Ed", gradeLevel: "Elementary", link: "#", matchedCMs: [], status: "New" },
  { dateScraped: "2026-03-22", district: "Auburn", school: "Pioneer Elementary", positionTitle: "Elementary Teacher - Dual Language", certArea: "ELL", gradeLevel: "Elementary", link: "#", matchedCMs: [], status: "New" },
  { dateScraped: "2026-03-22", district: "Auburn", school: "Auburn Riverside HS", positionTitle: "CTE Teacher - Business and Marketing", certArea: "CTE", gradeLevel: "High", link: "#", matchedCMs: [], status: "Sent" },
  { dateScraped: "2026-03-21", district: "Renton", school: "Nelsen Middle School", positionTitle: "Leave Replacement Math Teacher", certArea: "Math", gradeLevel: "Middle", link: "#", matchedCMs: [], status: "New" },
  { dateScraped: "2026-03-21", district: "Fife", school: "", positionTitle: "Special Education - Resource Room", certArea: "Special Ed", gradeLevel: "Unknown", link: "#", matchedCMs: [], status: "New" },
  { dateScraped: "2026-03-20", district: "Tacoma", school: "Edison Elementary", positionTitle: "MTSS Teacher Elementary", certArea: "General", gradeLevel: "Elementary", link: "#", matchedCMs: [], status: "New" },
];

const MOCK_ACTIVITY = [
  // Hired CMs
  { date: "2026-03-10", cmName: "David Chen", action: "Hired", jobReference: "Math/Science — Lindbergh HS (Renton)" },
  { date: "2026-03-12", cmName: "Rachel Kim", action: "Hired", jobReference: "Elem Teacher — Camelot Elem (Federal Way)" },
  { date: "2026-03-14", cmName: "Terrence Brooks", action: "Hired", jobReference: "SPED — Olympic MS (Auburn)" },
  { date: "2026-03-18", cmName: "Amanda Fischer", action: "Hired", jobReference: "Math — Lakota MS (Federal Way)" },
  { date: "2026-03-20", cmName: "Jonathan Lee", action: "Hired", jobReference: "ELA — Hazen HS (Renton)" },

  // Interviewing CMs — applied earlier
  { date: "2026-03-15", cmName: "Andre Williams", action: "Applied", jobReference: "7th Grade Math — Keithley MS (Franklin Pierce)" },
  { date: "2026-03-18", cmName: "Andre Williams", action: "Interview Scheduled", jobReference: "7th Grade Math — Keithley MS (Franklin Pierce)" },
  { date: "2026-03-16", cmName: "Priya Patel", action: "Applied", jobReference: "Elem Dual Language — Pioneer Elem (Auburn)" },
  { date: "2026-03-20", cmName: "Priya Patel", action: "Interview Scheduled", jobReference: "Elem Dual Language — Pioneer Elem (Auburn)" },
  { date: "2026-03-17", cmName: "Jessica Hawkins", action: "Applied", jobReference: "SPED SEB — Camelot Elem (Federal Way)" },
  { date: "2026-03-21", cmName: "Jessica Hawkins", action: "Interview Scheduled", jobReference: "SPED SEB — Camelot Elem (Federal Way)" },
  { date: "2026-03-14", cmName: "Marcus Young", action: "Applied", jobReference: "Science — Lindbergh HS (Renton)" },
  { date: "2026-03-19", cmName: "Marcus Young", action: "Interview Scheduled", jobReference: "Science — Lindbergh HS (Renton)" },
  { date: "2026-03-16", cmName: "Stephanie Flores", action: "Applied", jobReference: "Elem Teacher — Mirror Lake Elem (Federal Way)" },
  { date: "2026-03-22", cmName: "Stephanie Flores", action: "Interview Scheduled", jobReference: "Elem Teacher — Mirror Lake Elem (Federal Way)" },

  // Applied CMs — jobs sent then applied
  { date: "2026-03-18", cmName: "James Thompson", action: "Job Sent", jobReference: "Elem Teacher — Lincoln Elem (Tacoma)" },
  { date: "2026-03-20", cmName: "James Thompson", action: "Applied", jobReference: "Elem Teacher — Lincoln Elem (Tacoma)" },
  { date: "2026-03-17", cmName: "Aisha Johnson", action: "Job Sent", jobReference: "SPED Resource — Fife HS (Fife)" },
  { date: "2026-03-19", cmName: "Aisha Johnson", action: "Applied", jobReference: "SPED Resource — Fife HS (Fife)" },
  { date: "2026-03-19", cmName: "Daniel Garcia", action: "Job Sent", jobReference: "Math — FW Public Academy (Federal Way)" },
  { date: "2026-03-21", cmName: "Daniel Garcia", action: "Applied", jobReference: "Math — FW Public Academy (Federal Way)" },
  { date: "2026-03-18", cmName: "Brittany Lewis", action: "Job Sent", jobReference: "Science — Nelsen MS (Renton)" },
  { date: "2026-03-21", cmName: "Brittany Lewis", action: "Applied", jobReference: "Science — Nelsen MS (Renton)" },
  { date: "2026-03-20", cmName: "Kevin Okafor", action: "Job Sent", jobReference: "SPED — Washington HS (Franklin Pierce)" },
  { date: "2026-03-22", cmName: "Kevin Okafor", action: "Applied", jobReference: "SPED — Washington HS (Franklin Pierce)" },
  { date: "2026-03-19", cmName: "Samantha White", action: "Job Sent", jobReference: "Elem Teacher — Camelot Elem (Federal Way)" },
  { date: "2026-03-22", cmName: "Samantha White", action: "Applied", jobReference: "Elem Teacher — Camelot Elem (Federal Way)" },
  { date: "2026-03-20", cmName: "Luis Ramirez", action: "Job Sent", jobReference: "ELL — Nelsen MS (Renton)" },
  { date: "2026-03-22", cmName: "Luis Ramirez", action: "Applied", jobReference: "ELL — Nelsen MS (Renton)" },
  { date: "2026-03-18", cmName: "Alexis Turner", action: "Job Sent", jobReference: "ELA — Olympic MS (Auburn)" },
  { date: "2026-03-21", cmName: "Alexis Turner", action: "Applied", jobReference: "ELA — Olympic MS (Auburn)" },

  // Pinged CMs — jobs sent but not yet applied
  { date: "2026-03-21", cmName: "Sarah Mitchell", action: "Job Sent", jobReference: "ELA Teacher — Lakota MS (Federal Way)" },
  { date: "2026-03-20", cmName: "Tyler Park", action: "Job Sent", jobReference: "Science — Giaudrone MS (Tacoma)" },
  { date: "2026-03-22", cmName: "Olivia Foster", action: "Job Sent", jobReference: "Elem Teacher — Hazelwood Elem (Renton)" },
  { date: "2026-03-21", cmName: "DeAndre Williams", action: "Job Sent", jobReference: "Math — FW Public Academy (Federal Way)" },
  { date: "2026-03-22", cmName: "DeAndre Williams", action: "Job Sent", jobReference: "Math — Thomas Jefferson HS (Federal Way)" },
  { date: "2026-03-20", cmName: "Emma Chen", action: "Job Sent", jobReference: "SPED Resource — Lea Hill Elem (Auburn)" },
  { date: "2026-03-22", cmName: "Emma Chen", action: "Job Sent", jobReference: "SPED SLC — Pioneer Elem (Auburn)" },
  { date: "2026-03-21", cmName: "Ryan Patel", action: "Job Sent", jobReference: "Science — Lindbergh HS (Renton)" },
  { date: "2026-03-22", cmName: "Jasmine Taylor", action: "Job Sent", jobReference: "Elem Dual Language — Pioneer Elem (Auburn)" },
  { date: "2026-03-23", cmName: "Jasmine Taylor", action: "Job Sent", jobReference: "Elem Teacher — Camelot Elem (Federal Way)" },
  { date: "2026-03-22", cmName: "Brandon Scott", action: "Job Sent", jobReference: "Social Studies — Keithley MS (Franklin Pierce)" },
  { date: "2026-03-23", cmName: "Natalie Cruz", action: "Job Sent", jobReference: "Math — Nelsen MS (Renton)" },
  { date: "2026-03-21", cmName: "Christopher Adams", action: "Job Sent", jobReference: "SPED SLC — Auburn Riverside HS (Auburn)" },
  { date: "2026-03-23", cmName: "Christopher Adams", action: "Job Sent", jobReference: "SPED Resource — ARHS (Auburn)" },
  { date: "2026-03-22", cmName: "Ava Robinson", action: "Job Sent", jobReference: "SPED Resource — Fife (Fife)" },
  { date: "2026-03-22", cmName: "Michael Tran", action: "Job Sent", jobReference: "ELA — Stadium HS (Tacoma)" },
];

const DISTRICTS = ["Federal Way", "Renton", "Auburn", "Franklin Pierce", "Fife", "Tacoma"];

const STATUS_ORDER = ["Unplaced", "Pinged", "Applied", "Interviewing", "Hired"];

export { MOCK_ROSTER, MOCK_POSTINGS, MOCK_ACTIVITY, DISTRICTS, STATUS_ORDER };
