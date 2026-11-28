function el(tag,text,cls){
  const node=document.createElement(tag);
  if(text!==undefined) node.textContent=text;
  if(cls) node.className=cls;
  return node;
}
function state(p,i){return p.counts[i]===tiles[i].goal?'done':p.counts[i]?'part':'';}
function fraction(p,i){return p.counts[i]+'/'+tiles[i].goal;}
function playerLink(name){const url=new URL('progress.html',location.href);url.searchParams.set('player',name);return url.href;}
function mini(p){
  const grid=el('span',undefined,'mini');grid.setAttribute('aria-hidden','true');
  tiles.forEach((t,i)=>{
    const status=state(p,i);
    const cell=el('i',status==='done'?'✓':status==='part'?'•':'','cell '+status+(p.winning.has(i)?' win':''));
    cell.title=t.name+' '+fraction(p,i);grid.append(cell);
  });
  return grid;
}
function card(p){
  const link=el('a',undefined,'card');link.href=playerLink(p.name);
  const info=el('div');info.append(el('strong',p.name),el('small',p.total+'/9 tiles complete'));
  if(p.won.length) info.append(el('span',p.total===9?'Full board!':'Bingo · '+p.won.length+' '+(p.won.length===1?'line':'lines'),'note'));
  else if(p.close.size) info.append(el('span','One tile away · '+[...p.close.keys()].map(i=>tiles[i].name).join(' or '),'note'));
  link.append(mini(p),info);return link;
}
const content=document.querySelector('#content'), title=document.querySelector('#title'), statusNode=document.querySelector('#status');
function overview(players){
  title.textContent='Clan progress';
  const closeCount=players.filter(p=>!p.won.length && p.close.size).length;
  content.append(el('p',players.length+' players · '+closeCount+' one tile from bingo · '+players.filter(p=>p.won.length).length+' with bingo'));
  content.append(el('p','• In progress　✓ Complete　Gold outline = bingo','legend'));
  const wall=el('div',undefined,'wall');
  players.forEach(p=>wall.append(card(p)));content.append(wall);
}
function detail(p){
  title.textContent=p.name;document.title=p.name+' · Coxmas progress';
  content.append(el('p',p.total+'/9 tiles complete'+(p.total===9?' · Full board!':'')));
  if(p.won.length) content.append(el('p','Bingo! '+p.won.join(' · '),'near'));
  if(p.close.size){
    const box=el('div',undefined,'notice');box.append(el('h2',p.won.length?'One tile from another line':'One tile from bingo'));
    const list=el('ul');
    for(const [i,names] of p.close) list.append(el('li',tiles[i].name+' ('+fraction(p,i)+') completes the '+names.join(' and ')+'.'));
    box.append(list);content.append(box);
  }
  const board=el('div',undefined,'board');
  tiles.forEach((t,i)=>{
    const tile=el('div',undefined,'tile'+(p.winning.has(i)?' win':''));
    const img=el('img');img.src=t.image;img.alt=t.name;tile.title=t.rule;
    tile.append(img,el('span',(state(p,i)==='done'?'✓ ':'')+fraction(p,i),'count cell '+state(p,i)));board.append(tile);
  });
  content.append(board);
  const share=el('a','Link to this player board');share.href=playerLink(p.name);content.append(share);
}
const selected=new URLSearchParams(location.search).get('player');
let displayed=null, loading=false;
function showPlayers(players){
  content.replaceChildren();
  if(!selected){overview(players); return;}
  const player=players.find(p=>p.name.toLowerCase()===selected.toLowerCase());
  if(player) detail(player);
  else content.append(el('p','Player not found in this roster. Open Clan overview to browse player names.'));
}
function displayTime(at){
  return new Date(at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
function displaySnapshot(snapshot){
  if(!displayed || JSON.stringify(displayed.rows)!==JSON.stringify(snapshot.rows)){
    showPlayers(playersFromRows(snapshot.rows));
  }
  displayed=snapshot;
}
async function refresh(){
  if(loading) return;
  loading=true;
  const button=document.querySelector('#refresh');button.disabled=true;
  statusNode.textContent='Checking live sheet…';
  try{
    const started=new Date().toISOString();
    const previous=displayed || cachedSnapshot();
    const rows=await loadRows();
    if(JSON.stringify(rows)!==JSON.stringify(previous.rows)){
      const confirmation=await loadRows();
      if(JSON.stringify(rows)!==JSON.stringify(confirmation)){
        throw Error('Google returned two different boards. Waiting for a consistent update.');
      }
    }
    const saved=cachedSnapshot();
    const next=Date.parse(saved.at)>Date.parse(started) ? saved : {at:started,rows};
    displaySnapshot(next);
    try{localStorage.setItem(cacheKey,JSON.stringify(next));}catch{}
    statusNode.textContent='Sheet checked at '+displayTime(next.at)+' · Refreshes every minute';
  }catch(error){
    const detail=location.protocol==='file:' || location.origin==='null'
      ? 'Open the leaderboard on GitHub Pages to read the live sheet.'
      : error.name==='AbortError' ? 'The Google Sheets request timed out.'
      : error instanceof TypeError ? 'The browser could not reach Google Sheets.' : error.message;
    if(!displayed) displaySnapshot(cachedSnapshot());
    statusNode.textContent=detail+' Showing saved progress from '+displayTime(displayed.at)+'.';
    const sheet=el('a','View published sheet');
    sheet.href=tableURL;sheet.target='_blank';sheet.rel='noopener';
    statusNode.append(' ',sheet);
  }finally{loading=false;button.disabled=false;}
}
window.addEventListener('storage',event=>{
  if(event.key!==cacheKey || !event.newValue) return;
  const saved=cachedSnapshot();
  if(!displayed || Date.parse(saved.at)>Date.parse(displayed.at)){
    displaySnapshot(saved);
    statusNode.textContent='Sheet checked at '+displayTime(saved.at)+' in another tab';
  }
});
window.addEventListener('pageshow',event=>{if(event.persisted) refresh();});
document.querySelector('#refresh').addEventListener('click',refresh);
setInterval(()=>{if(!document.hidden) refresh();},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) refresh();});
refresh();
