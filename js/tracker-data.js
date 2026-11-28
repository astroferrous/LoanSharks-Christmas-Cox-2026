'use strict';
// Use the published HTML URL for the tab containing the Tile Progress header.
const tableURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRSRXXlzMOU9qbJ1QTXHrE8JCvBsAmvEJn9xW86WehBQ_MHaVuSoBb6bld7BA6ZSCAcSS0msgtitie/pubhtml/sheet?headers=false&gid=0';
const cacheKey = 'coxmas-progress-v1:' + tableURL;
const lines = [
  ['top row',0,1,2],['middle row',3,4,5],['bottom row',6,7,8],
  ['left column',0,3,6],['middle column',1,4,7],['right column',2,5,8],
  ['top-left diagonal',0,4,8],['top-right diagonal',2,4,6]
];
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]/g,'');
function playersFromRows(rows){
  const headerRow=rows.findIndex(row=>row.some(cell=>normalize(cell)==='tileprogress'));
  if(headerRow<0) throw Error('The published tab is missing the Tile Progress header.');
  const headers=rows[headerRow].map(normalize);
  const nameColumn=headers.indexOf('tileprogress');
  const columns=tiles.map(t=>headers.indexOf(normalize(t.name)));
  if(columns.includes(-1)) throw Error('The published tab is missing a tile column.');
  // The tile rules reuse column H below the blank separator rows.
  const playersBelowHeader=rows.slice(headerRow+1);
  const separator=playersBelowHeader.findIndex(row=>!row[nameColumn]?.trim());
  const playerRows=separator<0 ? playersBelowHeader : playersBelowHeader.slice(0,separator);
  return playerRows.map(row=>{
    const name=row[nameColumn].trim();
    const counts=columns.map((column,i)=>{
      const value=(row[column]||'').trim();
      if(!value) return 0;
      const match=/^(\d+)\s*\/\s*(\d+)$/.exec(value);
      if(!match || +match[2]!==tiles[i].goal || +match[1]>tiles[i].goal) throw Error('Check '+name+'’s '+tiles[i].name+' count in the sheet.');
      return +match[1];
    });
    return {name,counts,...score(counts)};
  });
}
function score(counts){
  const won=[], close=new Map(), winning=new Set();
  for(const [name,...indices] of lines){
    const missing=indices.filter(i=>counts[i]<tiles[i].goal);
    if(!missing.length){won.push(name); indices.forEach(i=>winning.add(i));}
    if(missing.length===1){
      const i=missing[0];
      if(!close.has(i)) close.set(i,[]);
      close.get(i).push(name);
    }
  }
  return {won,close,winning,total:counts.filter((n,i)=>n===tiles[i].goal).length};
}
function cachedSnapshot(){
  try{
    const saved=JSON.parse(localStorage.getItem(cacheKey));
    if(saved && Date.parse(saved.at)>=Date.parse(bundledSnapshot.at)){
      playersFromRows(saved.rows);
      return saved;
    }
  }catch{}
  return bundledSnapshot;
}
async function loadRows(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),20000);
  try{
    const requestURL=new URL(tableURL);
    requestURL.searchParams.set('_refresh',Date.now().toString());
    const response=await fetch(requestURL,{credentials:'omit',cache:'no-store',signal:controller.signal});
    if(!response.ok) throw Error('Google returned HTTP '+response.status+'.');
    const players=playersFromRows(tableRows(await response.text()));
    return [['Tile Progress',...tiles.map(t=>t.name)],
      ...players.map(p=>[p.name,...p.counts.map((count,i)=>count+'/'+tiles[i].goal)])];
  }finally{clearTimeout(timer);}
}
function tableRows(source){
  const template=document.createElement('template');
  template.innerHTML=source;
  return Array.from(template.content.querySelectorAll('table tr'),row=>
    Array.from(row.cells).filter(cell=>cell.tagName==='TD').map(cell=>cell.textContent.trim()));
}
