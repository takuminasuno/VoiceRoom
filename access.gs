
//===============================
// アクセス時の処理
//===============================

const serviceName = 'VoiceRoom';
const adminName = 'Takumi Nasuno';
const roomSheetName = 'roomRecord';

function doGet(e) {

  let prop = PropertiesService.getScriptProperties();
  
  const p = e.parameter.p ? e.parameter.p : 'home';
  let contentHtml = HtmlService.createTemplateFromFile(p).evaluate().getContent();
  
  const user = Session.getActiveUser().getEmail();
  const parentUrl = ScriptApp.getService().getUrl();  
  if (p == 'createRoom'){
    const routine = prop.getProperty('routine_' + user) ? JSON.parse(prop.getProperty('routine_' + user)) : null;
    const today = Utilities.formatDate(new Date(),'JST','yyyy/MM/dd');
    contentHtml = contentHtml
    .replace(/{name}/g,routine ? routine['name'] : '')
    .replace(/{description}/g,routine ? routine['description'] : '')
    .replace(/{date}/g,today)
    .replace(/{time}/g,routine ? routine['time'] : '');
  
  } else if (p == 'updateRoom'){
    const id = e.parameter.id;
    const record = getRoomRecord(id);
    if (record){
      contentHtml = contentHtml
      .replace(/{id}/g,id)
      .replace(/{name}/g,record['name'])
      .replace(/{description}/g,record['description'])
      .replace(/{date}/g,record['date'])
      .replace(/{time}/g,record['time'])
      .replace(/{url}/g,record['url'])
      .replace(/{movieUrl}/g,record['movieUrl'])
      .replace(/{documentUrl}/g,record['documentUrl']);
    } else {
      contentHtml = '<p>ルーム「id=' + id + '」は存在しません。</p><p>入れ違いで削除された可能性があります。ホームに戻ってください。</p>';
    }
  }

  let headerHtml = HtmlService.createTemplateFromFile('header').evaluate().getContent();
  let footerHtml = HtmlService.createTemplateFromFile('footer').evaluate().getContent();
  let html = headerHtml + contentHtml + footerHtml;
  
  html = html
  .replace(/{user}/g,user)
  .replace(/{parentUrl}/g,parentUrl)
  .replace(/{serviceName}/g,serviceName)
  .replace(/{adminName}/g,adminName);
  
  return HtmlService.createHtmlOutput(html)
    .setTitle(serviceName)
    .addMetaTag('viewport','width=device-width,initial-scale=1');
}