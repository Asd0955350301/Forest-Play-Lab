const photoKeys=[['wood','driftwood','steel','concrete'],['rope','hemp','oldrope','paperrope'],['wood','wood','plastic','cardboard']];
const parts=['主幹','拉繩','座椅'];
const data=[[
['🪵','再利用木柱','完整、經檢查；可作支撐',3.2,true,'#997746'],['🌊','漂流木','外觀完整，但內部已腐朽',1.1,false,'#b5a080'],['🏗','新製鋼柱','符合本遊戲支撐條件',28.4,true,'#8b999a'],['🧱','水泥柱','符合本遊戲支撐條件',19.8,true,'#b0afa4']],
[['🪢','再利用合格繩索','經檢查，符合拉力需求',.8,true,'#d1be85'],['🌾','新麻繩','符合本遊戲拉力需求',2.3,true,'#b8a16c'],['〰','老化塑膠繩','日曬老化，纖維容易斷裂',.4,false,'#819c8f'],['📃','細棉線','線徑過細，不符合本遊戲拉力需求',.2,false,'#e2d4b4']],
[['🪵','回收木板','完整、經處理；可作座椅',1.4,true,'#a38151'],['🌳','新木板','符合本遊戲承載條件',5.7,true,'#cb9f67'],['♻','再生塑膠板','符合本遊戲承載條件',4.6,true,'#7c9b81'],['📦','紙板','不符合本遊戲承載條件',.3,false,'#c8ab7d']]];
const $=s=>document.querySelector(s);let saved;try{saved=JSON.parse(localStorage.getItem('forest-v1'))}catch{}let state=saved||{name:'森林旅人',mode:null,attempts:0,history:[],selected:[null,null,null]};let step=0,busy=false;const modal=$('#modal');
function persist(){try{localStorage.setItem('forest-v1',JSON.stringify(state))}catch{}}
function open(html){modal.innerHTML=html;if(!modal.open)modal.showModal()}
function start(){open(`<span class="eyebrow">歡迎來到森林工作坊</span><h2>讓快樂轉起來。</h2><p>依序挑選主幹、拉繩與座椅，按下開始製作。成功後比較碳排，失敗也能從回饋中調整。每輪最多五次。</p><label>你的暱稱<input id="name" maxlength="16" placeholder="森林旅人" value=""></label><p>選擇本輪模式，五次期間固定使用：</p><div class="choices"><button onclick="begin('show')">顯示碳排<br><small>邊比較，邊選擇</small></button><button onclick="begin('hide')">隱藏碳排<br><small>完成後再揭曉</small></button></div><p class="fine">原型版：碳排為未核實示範值；排行榜為本機紀錄。五次限制僅限此瀏覽器，可另開新一輪體驗。</p>`)}
function begin(mode){state.name=$('#name').value.trim()||'森林旅人';state.mode=mode;persist();modal.close();render()}
function render(){ $('#steps').innerHTML=parts.map((p,i)=>`<button ${busy?'disabled':''} class="${i===step?'active':''} ${state.selected[i]!==null?'done':''}" onclick="go(${i})">0${i+1} ${p}</button>`).join('');$('#partTitle').textContent='選擇'+parts[step]+'材料';$('#partHint').textContent=['撐起整座遊具，先從穩固的主幹開始。','連接每一份快樂，留意繩索的狀況。','坐得穩，也想想材料從哪裡來。'][step];$('#materials').innerHTML=data[step].map((m,i)=>`<button class="material ${state.selected[step]===i?'selected':''}" ${busy||state.attempts>=5?'disabled':''} onclick="select(${i})"><img class="material-photo" src="${photoKeys[step][i]}.jpg" alt="${m[1]}實物示意照片"><span><b>${m[1]}</b><small>${m[2]}</small></span><span class="carbon">${state.mode==='show'?m[3].toFixed(1):'？'}<small>kg CO₂e · 示範</small></span></button>`).join('');$('#remaining').textContent=`剩餘 ${5-state.attempts} / 5 次`;$('#summary').textContent=parts.map((p,i)=>p+'：'+(state.selected[i]===null?'待選擇':data[i][state.selected[i]][1])).join('　／　');$('#build').disabled=busy||state.attempts>=5||state.selected.some(x=>x===null);$('#build').textContent=busy?'製作中…':state.attempts>=5?'本輪挑戰已完成':'開始製作 ↗';if(state.selected[0]!==null)$('#pole').setAttribute('fill',data[0][state.selected[0]][5]);if(state.selected[1]!==null)$('#ropes').setAttribute('stroke',data[1][state.selected[1]][5]);if(state.selected[2]!==null)$('#seat').setAttribute('fill',data[2][state.selected[2]][5])}
function go(i){if(!busy){step=i;render()}}function select(i){if(busy||state.attempts>=5)return;state.selected[step]=i;$('.scene').classList.remove('success','failed');persist();render();if(step<2)setTimeout(()=>{if(!busy){step++;render()}},200)}
function build(){if(busy||state.attempts>=5||state.selected.some(x=>x===null))return;busy=true;state.attempts++;persist();$('.scene').className='scene building';$('#sceneCaption').textContent='森林工作坊正在敲敲打打…';render();setTimeout(()=>{const chosen=state.selected.map((x,i)=>data[i][x]);const failed=chosen.map((x,i)=>!x[4]?parts[i]:null).filter(Boolean);const total=+chosen.reduce((a,m)=>a+m[3],0).toFixed(1);const result={success:!failed.length,total,materials:chosen.map(x=>x[1]),name:state.name,mode:state.mode,attempt:state.attempts};state.history.push(result);persist();busy=false;$('.scene').className='scene '+(result.success?'success':'failed');$('#sceneCaption').textContent=result.success?'建造成功！讓森林裡的快樂旋轉起來。':'這次沒有成功。調整材料，再試一次。';render();setTimeout(()=>showResult(result,failed),1100)},3000)}
function showResult(r,failed){open(`<span class="eyebrow">第 ${r.attempt} 次挑戰 · ${r.success?'建造成功':'再調整一下'}</span><h2>${r.success?'你的遊具轉起來了！':'找到需要改進的地方。'}</h2>${r.success?`<div class="big">${r.total.toFixed(1)} <small style="font:14px sans-serif">kg CO₂e</small></div><p>示範碳排估算，數值尚未核實。</p>`:`<p>${failed.join('、')}不符合本遊戲設定的結構條件，請依材料卡上的狀況與特性更換。</p>`}${r.materials.map((m,i)=>`<div class="row"><span>${parts[i]} · ${m}</span><span>${data[i][state.selected[i]][3].toFixed(1)} kg CO₂e</span></div>`).join('')}<p>剩餘 ${5-state.attempts} 次機會。${r.success?'試著比較其他符合條件的材料。':'完整與適用性，也是選材的重要條件。'}</p><button class="primary" onclick="modal.close()">${state.attempts<5?'回到工作臺':'查看作品'}</button><button class="secondary" onclick="showBoard()">查看挑戰紀錄</button>`)}
function showBoard(){const rows=state.history.filter(x=>x.success&&x.mode===state.mode).sort((a,b)=>a.total-b.total);let rank=0;open(`<span class="eyebrow">${state.mode==='hide'?'隱藏':'顯示'}碳排模式 · 本機紀錄</span><h2>森林低碳榜</h2><p>這裡保存本瀏覽器的成功挑戰，尚未連接多人排行榜。碳排相同者並列。</p>${rows.length?rows.map((r,i)=>{if(!i||r.total!==rows[i-1].total)rank=i+1;return `<div class="row"><span>第 ${rank} 名 · 第 ${r.attempt} 次挑戰</span><b>${r.total.toFixed(1)} kg CO₂e</b></div>`}).join(''):'<p>還沒有成功作品，完成第一座遊具吧。</p>'}<p>已使用 ${state.attempts}／5 次；成功 ${rows.length} 次。</p><button class="primary" onclick="modal.close()">回到森林</button>${state.attempts>=5?'<button class="secondary" onclick="newRound()">另開新一輪體驗</button>':''}`)}
function newRound(){state={name:'森林旅人',mode:null,attempts:0,history:[],selected:[null,null,null]};step=0;persist();$('.scene').className='scene';render();start()}
function showInfo(){open(`<span class="eyebrow">FOREST PLAY LAB</span><h2>森林建造指南</h2><p>① 選擇主幹、拉繩與座椅。<br>② 三個部位選齊後，按「開始製作」。<br>③ 每次製作使用一次機會，成功或失敗都計次。<br>④ 成功後比較碳排，五次中越低越好。</p><p>材料照片為外觀示意，回收狀態與適用性依卡片文字設定。<a href="credits.html" target="_blank" rel="noopener">照片來源與授權</a>。本版碳排是未核實的示範數值，僅展示玩法；正式版需補充材料用量、排放係數、來源與計算範圍。結構判定為簡化教學規則。</p><button class="primary" onclick="modal.close()">我知道了</button>`)}
modal.addEventListener('cancel',e=>{if(!state.mode)e.preventDefault()});render();if(!state.mode)start();

// A rigid horizontal carousel revolves around a stationary vertical axis.
// Each beam, rope and seat is projected individually so front/back depth stays visible.
const svgNS='http://www.w3.org/2000/svg';
const rotor=document.querySelector('#ride');
const poleNode=document.querySelector('#pole');
const rotorBack=document.createElementNS(svgNS,'g');
const rotorFront=document.createElementNS(svgNS,'g');
rotorBack.id='rotor-back';rotorFront.id='rotor-front';
rotor.parentNode.insertBefore(rotorBack,poleNode);
rotor.parentNode.appendChild(rotorFront);
rotor.style.display='none';
function projectPoint(x,z,y=333){return [350+x,y+z*.29]}
function svgShape(tag,attrs){const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n}
function drawCarousel(angle){
 rotorBack.replaceChildren();rotorFront.replaceChildren();
 const seatColor=state.selected[2]===null?'#a38151':data[2][state.selected[2]][5];
 const ropeColor=state.selected[1]===null?'#d5c8a1':data[1][state.selected[1]][5];
 const items=[];const count=8,radius=205;
 const point=(a,r=radius,y=333)=>{const x=Math.cos(a)*r,z=Math.sin(a)*r;return {x,z,p:projectPoint(x,z,y)}};
 for(let i=0;i<count;i++){
  const a=angle+i*Math.PI*2/count,b=angle+(i+1)*Math.PI*2/count;
  const p=point(a),q=point(b),inner=point(a,36);
  items.push({z:(p.z+q.z)/2,n:svgShape('line',{x1:p.p[0],y1:p.p[1],x2:q.p[0],y2:q.p[1],stroke:'#6b5034','stroke-width':11,'stroke-linecap':'round'})});
  items.push({z:p.z/2,n:svgShape('line',{x1:inner.p[0],y1:inner.p[1],x2:p.p[0],y2:p.p[1],stroke:'#a38253','stroke-width':8,'stroke-linecap':'round'})});
  items.push({z:p.z/2,n:svgShape('line',{x1:350,y1:132,x2:p.p[0],y2:p.p[1],stroke:ropeColor,'stroke-width':3.5})});
  // Distinct planks and coloured cloth markers make the circular travel legible.
  const corners=[point(a-.17,178,329),point(a+.17,178,329),point(a+.17,224,329),point(a-.17,224,329)];
  items.push({z:p.z,n:svgShape('polygon',{points:corners.map(c=>c.p.join(',')).join(' '),fill:seatColor,stroke:'#634a31','stroke-width':2.5,'stroke-linejoin':'round'})});
  if(i%2===0){const tail=point(a,220,350);items.push({z:p.z+1,n:svgShape('path',{d:`M ${p.p[0]} ${p.p[1]} Q ${tail.p[0]+8} ${tail.p[1]+20} ${tail.p[0]-3} ${tail.p[1]+35}`,stroke:['#428f9d','#e0ba50','#8b9b48','#b97a59'][i/2],'stroke-width':9,fill:'none','stroke-linecap':'round'})})}
 }
 items.sort((a,b)=>a.z-b.z).forEach(o=>(o.z<0?rotorBack:rotorFront).appendChild(o.n));
 rotorFront.appendChild(svgShape('ellipse',{cx:350,cy:333,rx:20,ry:9,fill:'#bd9b65',stroke:'#674c31','stroke-width':3}));
}
let carouselAngle=.32,previousFrame=0;
function animateCarousel(timestamp){const dt=previousFrame?Math.min((timestamp-previousFrame)/1000,.05):0;previousFrame=timestamp;if(document.querySelector('.scene').classList.contains('success')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)carouselAngle+=dt*.8;drawCarousel(carouselAngle);requestAnimationFrame(animateCarousel)}
requestAnimationFrame(animateCarousel);
