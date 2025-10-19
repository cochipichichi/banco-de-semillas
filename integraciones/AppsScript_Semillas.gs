// == Banco de Semillas — Apps Script ==
const SHEET_ID = 'REEMPLAZA_CON_TU_SHEET_ID';
const API_KEY  = '';
function doOptions(e){return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT).setHeaders({'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});}
function doPost(e){try{const body=JSON.parse(e.postData.contents);const out=ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);out.setHeaders({'Access-Control-Allow-Origin':'*'});
if(API_KEY && (!body || body.apiKey!==API_KEY)) return ContentService.createTextOutput('forbidden').setMimeType(ContentService.MimeType.TEXT);
const ss=SpreadsheetApp.openById(SHEET_ID);const type=body.type||'unknown';const page=body.page||'';const ts=new Date();
if(type==='ticket'){const sh=ensureSheet_(ss,'Ticket',['ts','type','page','nombre','aprendizaje','dificil','mejora','auto']);const d=body.data||{};sh.appendRow([ts,type,page,d.nombre||'',d.aprendizaje||'',d.dificil||'',d.mejora||'',d.auto||'']);return out;}
if(type==='quiz'){const sh=ensureSheet_(ss,'Quiz',['ts','type','page','nombre','species','total','correct','score_pct','answers_json']);const d=body.data||{};sh.appendRow([ts,type,page,d.nombre||'',d.species||'',d.total||'',d.correct||'',d.score_pct||'',d.answers_json||'']);return out;}
const sh=ensureSheet_(ss,'Log',['ts','type','page','payload']);sh.appendRow([ts,type,page,JSON.stringify(body)]);return out;}catch(err){const out=ContentService.createTextOutput('error').setMimeType(ContentService.MimeType.TEXT);out.setHeaders({'Access-Control-Allow-Origin':'*'});return out;}}
function ensureSheet_(ss,name,headers){let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(sh.getLastRow()===0){sh.appendRow(headers);}else{const range=sh.getRange(1,1,1,headers.length);const vals=range.getValues()[0];let needs=false;for(let i=0;i<headers.length;i++){if(vals[i]!==headers[i]){needs=true;break}}if(needs){sh.insertRowBefore(1);sh.getRange(1,1,1,headers.length).setValues([headers]);}}return sh;}
