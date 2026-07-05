/**
 * SelfGongMate Google Apps Script Database Backoffice
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new).
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Replace the entire code with this content.
 * 4. Save and click "Deploy" -> "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "SelfGongMate API Backend"
 * 7. Set Execute as: "Me (your-email@gmail.com)"
 * 8. Set Who has access: "Anyone"
 * 9. Click "Deploy", authorize the permissions, and copy the Web App URL.
 * 10. Paste the Web App URL into the `GAS_WEB_APP_URL` variable in `index.html`.
 */

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const data = params.data;
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'registerUser') {
      const sheetName = 'accounts';
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.appendRow(['Timestamp', 'Username', 'Password']);
      }
      
      // Check if username already exists
      const dataRows = sheet.getDataRange().getValues();
      for (let i = 1; i < dataRows.length; i++) {
        if (dataRows[i][1] === data.username) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: '이미 가입된 아이디입니다.' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      sheet.appendRow([
        new Date().toISOString(),
        data.username || '',
        data.password || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: '회원가입이 완료되었습니다!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'loginUser') {
      const sheetName = 'accounts';
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: '가입된 사용자가 없습니다. 회원가입을 먼저 진행해 주세요.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const dataRows = sheet.getDataRange().getValues();
      for (let i = 1; i < dataRows.length; i++) {
        if (dataRows[i][1] === data.username && dataRows[i][2] === data.password) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: '로그인에 성공했습니다!' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: '아이디 또는 비밀번호가 일치하지 않습니다.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'saveUserData') {
      const sheetName = 'users';
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
      }
      // Force correct headers in row 1 even if the sheet already existed with incorrect headers
      sheet.getRange(1, 1, 1, 8).setValues([['Timestamp', 'Username', 'Persona', 'Math Stats', 'English Stats', 'Social Stats', 'Science Stats', 'Korean Stats']]);
      
      sheet.appendRow([
        new Date().toISOString(),
        data.name || '',
        data.persona || '',
        data.stats ? data.stats.math : 50,
        data.stats ? data.stats.english : 50,
        data.stats ? data.stats.social : 50,
        data.stats ? data.stats.science : 50,
        data.stats ? data.stats.korean : 50
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: 'User data appended.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'saveSchedule') {
      const sheetName = 'schedules';
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.appendRow(['Timestamp', 'Username', 'Day', 'Target Hours', 'Fixed Blocks JSON']);
      }
      sheet.appendRow([
        new Date().toISOString(),
        data.username || '',
        data.day || '',
        data.targetHours || 0,
        data.fixedBlocks ? JSON.stringify(data.fixedBlocks) : '[]'
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: 'Schedule saved.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'saveRetroactiveLog') {
      const sheetName = 'logs';
      let sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.appendRow(['Timestamp', 'Username', 'Period', 'Subject', 'Preparation Check']);
      }
      
      const logs = data.logs || [];
      const username = data.username || 'unknown';
      const timestamp = new Date().toISOString();
      
      logs.forEach(row => {
        sheet.appendRow([
          timestamp,
          username,
          row.period || '',
          row.subject || '',
          row.prep ? 'O' : 'X'
        ]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: 'Retroactive logs saved.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: 'Unknown action.' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'RUNNING', message: 'SelfGongMate GAS API is active.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
