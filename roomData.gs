
//===============================
// ルーム情報の操作
//===============================

//スプレッドシートがなかった時に新規作成する関数
function createRoomSheet(roomName){
  
  const sheetName = '投稿情報';
  const table = [
    ['日にち','時刻','タイトル','動画']
  ];
  
  let spreadsheet = SpreadsheetApp.create(roomName);
  let sheet = spreadsheet.getSheets()[0];
  sheet.setName(sheetName)
    .setFrozenRows(1)
    .getRange(1,1,table.length,table[0].length).setValues(table);
    
  return 'https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit#gid={sheetId}'
    .replace('{spreadsheetId}',spreadsheet.getId())
    .replace('{sheetId}',sheet.getSheetId());

}

//シートオブジェクト取得する関数
function getRoomSheet(){
  let prop = PropertiesService.getScriptProperties();
  let spreadsheetId = prop.getProperty('spreadsheetId');
  let spreadsheet;
  if (spreadsheetId){
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create(serviceName);
    spreadsheetId = spreadsheet.getId();
    spreadsheet.getSheets()[0].setName(roomSheetName);
    prop.setProperty('spreadsheetId',spreadsheetId);
  }
  return spreadsheet.getSheetByName(roomSheetName);
}

//シートの内容を取得する関数
function getRoomRecordList(){
  let sheet = getRoomSheet();
  let table = sheet.getDataRange().getValues();
  let recordList = table.map(function(row){
    return JSON.parse(row[0]);
  }).filter(function(row){
    return row['del'] != true;
  }).sort(function(a,b){
    if (a['date'] < b['date']){return 1};
    if (a['date'] > b['date']){return -1};
    return 0;
  });
  return recordList;
}

//シートから特定のIDのルーム情報を取得する関数
function getRoomRecord(id){
  const roomRecordList = getRoomRecordList();
  let record;
  for (let iRecord = 0; iRecord < roomRecordList.length; iRecord++){
    if (roomRecordList[iRecord]['id'] == id){
      record = roomRecordList[iRecord];
      break;
    }
  }
  return record;
}

//シートにレコードを追加する関数
function createRoomRecord(name,description,date,time,url,movieUrl,documentUrl){
  
  //ユーザー情報の取得
  const user = Session.getActiveUser().getEmail();
  
  //連番IDの取得
  let prop = PropertiesService.getScriptProperties();
  let id = prop.getProperty('roomId') ? parseInt(prop.getProperty('roomId')) + 1 : 1;
  prop.setProperty('roomId',id);
  
  //シートに保存
  const record = {id:id,user:user,name:name,description:description,date:date,time:time,url:url,movieUrl:movieUrl,documentUrl:documentUrl,del:false};  
  const sheet = getRoomSheet();
  sheet.appendRow([JSON.stringify(record)]);
  
  //ルーチン的情報をプロパティに保存
  const routine = {name:name,description:description,time:time};
  prop.setProperty('routine_' + user, JSON.stringify(routine));
  
  return '作成が完了しました';
}

//シートのレコードを更新する関数
function updateRoomRecord(id,name,description,date,time,url,movieUrl,documentUrl){
  
  //ユーザー情報の取得
  const user = Session.getActiveUser().getEmail();
  id = parseInt(id);
    
  //シートをチェック
  let updateRow;
  const sheet = getRoomSheet();
  const table = sheet.getDataRange().getValues();
  for (let iRow = 0; iRow < table.length; iRow++){
    let record = JSON.parse(table[iRow][0]);
    if (record['id'] == id){
      if (record['user'] != user){
        //作成者と異なるユーザーの場合、エラーを返す
        return '作成者ではないため、更新できませんでした。<br>作成者：' + record['user'];
      }
      updateRow = iRow;
      break;
    }
  }
  if (updateRow === undefined){
    return '該当データが確認できませんでした。終了します。';
  }
  
  //更新する
  const record = {id:id,user:user,name:name,description:description,date:date,time:time,url:url,movieUrl:movieUrl,documentUrl:documentUrl,del:false};
  const json = JSON.stringify(record);
  sheet.getRange(1 + updateRow,1).setValue(json);

  //ルーチン的情報をプロパティに保存
  const routine = {name:name,description:description,time:time};
  let prop = PropertiesService.getScriptProperties();
  prop.setProperty('routine_' + user, JSON.stringify(routine));
  
  return '更新が完了しました。';
}

//シートのレコードを削除する関数
function deleteRoomRecord(id){
  
  //ユーザー情報の取得
  const user = Session.getActiveUser().getEmail();
  id = parseInt(id);
    
  //シートをチェック
  let updateRow;
  const sheet = getRoomSheet();
  const table = sheet.getDataRange().getValues();
  for (let iRow = 0; iRow < table.length; iRow++){
    let record = JSON.parse(table[iRow][0]);
    if (record['id'] == id){
      if (record['user'] != user){
        //作成者と異なるユーザーの場合、エラーを返す
        return '作成者ではないため、削除できませんでした。<br>作成者：' + record['user'];
      }
      updateRow = iRow;
      break;
    }
  }
  if (updateRow === undefined){
    return '該当データが確認できませんでした。終了します。';
  }
  
  //更新する
  let record = JSON.parse(table[updateRow][0]);
  record['del'] = true;
  const json = JSON.stringify(record);
  sheet.getRange(1 + updateRow,1).setValue(json);

  return '削除が完了しました。';
}
