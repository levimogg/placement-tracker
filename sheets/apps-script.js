/**
 * Google Apps Script — Data proxy for Placement Dashboard
 *
 * SETUP:
 * 1. In Google Sheet -> Extensions -> Apps Script
 * 2. Replace the default code with this entire file
 * 3. Click Deploy -> New Deployment
 * 4. Type: Web app | Execute as: Me | Who has access: Anyone
 * 5. Deploy -> copy the URL
 *
 * SUPPORTS:
 * GET  ?tab=Corps Member Roster  — returns all roster data as JSON
 * GET  ?tab=Activity Log         — returns all activity data as JSON
 * POST {name, status}            — updates a CM's status in the roster
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

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var name = body.name;
    var newStatus = body.status;

    if (!name || !newStatus) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Missing name or status' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ws = sheet.getSheetByName('Corps Member Roster');
    if (!ws) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Corps Member Roster tab not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = ws.getDataRange().getValues();
    var headers = data[0];
    var nameCol = headers.indexOf('Name');
    var statusCol = headers.indexOf('Status');

    if (nameCol === -1 || statusCol === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Name or Status column not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    for (var i = 1; i < data.length; i++) {
      if (data[i][nameCol] === name) {
        ws.getRange(i + 1, statusCol + 1).setValue(newStatus);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, name: name, status: newStatus }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'CM not found: ' + name }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
