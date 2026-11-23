const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.join(__dirname,'..');
const rows={
 'No verified date for the next arc':['Sem data confirmada para o próximo arco','Sin fecha confirmada para el próximo arco','Дата следующей арки не подтверждена','Sonraki arkın tarihi doğrulanmadı'],
 'Campaign year not stated':['Ano da campanha não informado','Año de campaña no indicado','Год кампании не указан','Kampanya yılı belirtilmedi'],
 'Route list only; no dated timeline or completed events are inferred.':['Lista de rotas; não indica datas nem eventos concluídos.','Lista de rutas; no indica fechas ni eventos completados.','Список маршрутов без предполагаемых дат и завершённых событий.','Yalnızca rota listesi; tarih veya tamamlanmış olay varsayılmaz.'],
};
for(const [i,lang] of ['pt-BR','es','ru','tr'].entries()){
 const p=path.join(root,'i18n',lang+'.json'),s=fs.readFileSync(p,'utf8'),data=JSON.parse(s);for(const [key,v] of Object.entries(rows))data[key]=v[i];
 fs.writeFileSync(p,JSON.stringify(data,null,1)+'\n');
}
const f=path.join(root,'dist/frontend.js');let source=fs.readFileSync(f,'utf8');
source=source.replace(/(\/\* I18N:BEGIN \*\/ )(.+?)( \/\* I18N:END \*\/)/,(all,a,b,c)=>{const d=JSON.parse(b);Object.assign(d.t,rows);return a+JSON.stringify(d)+c;});fs.writeFileSync(f,source);
for(const name of ['README.md','CHANGELOG.md']){
 const p=path.join(root,name),s=fs.readFileSync(p,'utf8');if(s.includes('1.7.1'))continue;
 const head=name==='README.md'?'> **1.7.1:** Fixed undated Mushoku arcs, partial campaign years and branch display. [Update and installation notes](UPDATE-1.7.1.md). No new preset needed.\n\n':'# 1.7.1 — Partial dates and saga display\n\nNo fabricated K.null/K.0 timeline, no false “last arc”, preserved reported years, and correct branch highlighting. [Details and validation](UPDATE-1.7.1.md).\n\n';
 fs.writeFileSync(p,head+s);
}
const sums=path.join(root,'SHA256SUMS.txt'),existing=fs.readFileSync(sums,'utf8').trim().split(/\r?\n/).map(l=>l.slice(66));
const paths=[...new Set([...existing,'UPDATE-1.7.1.md','tests/saga-dates.cjs','tests/fixtures/swipe-rank-prefix.txt','tools/prepare-171.cjs'])].sort();
const bytes=p=>process.argv.includes('--index')?require('child_process').execFileSync('git',['show',':'+p],{cwd:root,maxBuffer:16*1024*1024}):fs.readFileSync(path.join(root,p));
fs.writeFileSync(sums,paths.map(p=>crypto.createHash('sha256').update(bytes(p)).digest('hex')+'  '+p).join('\n')+'\n');
