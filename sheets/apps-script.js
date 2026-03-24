/**
 * Google Apps Script — Data proxy for 2026 Corps Member Tracker
 *
 * SETUP:
 * 1. In Google Sheet → Extensions → Apps Script
 * 2. Replace the default code with this entire file
 * 3. Click Deploy → New Deployment
 * 4. Type: Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Click Deploy → copy the URL
 * 8. Paste the URL into the dashboard (APPS_SCRIPT_URL constant)
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var tab = (e && e.parameter && e.parameter.tab) || 'Corps Member Roster';

  var ws = sheet.getSheetByName(tab);
  if (!ws) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Tab not found: ' + tab }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = ws.getDataRange().getValues();
  if (data.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({ headers: data[0] || [], rows: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    var hasData = false;
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Convert dates to strings
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      row[headers[j]] = val !== undefined && val !== null ? String(val) : '';
      if (row[headers[j]]) hasData = true;
    }
    if (hasData) rows.push(row);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ headers: headers, rows: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
