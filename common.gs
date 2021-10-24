
//===============================
// 汎用関数
//===============================

function include(fileName,params) {
  if (fileName === undefined){fileName = 'home'}
  let template = HtmlService.createTemplateFromFile(fileName);
  if (params) {
    for (const key in params) {
      template[key] = params[key];
    }
  }
  return template.evaluate().getContent();
}

function getDateFormat(dateText){
  const date = new Date(dateText);
  const week = ['日','月','火','水','木','金','土'][date.getDay()];
  return dateText + ' (' + week + ')';
};
