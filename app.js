const $=id=>document.getElementById(id);
const STORAGE_KEY="transactions";
let transactions=loadTransactions(), editingId=null, pnlType="profit";

const els={
 totalAssets:$("totalAssets"),profit:$("profit"),returnRate:$("returnRate"),netDeposit:$("netDeposit"),cash:$("cash"),stockValue:$("stockValue"),
 holdingList:$("holdingList"),holdingCount:$("holdingCount"),recordList:$("recordList"),recordCount:$("recordCount"),
 modal:$("modal"),modalTitle:$("modalTitle"),form:$("transactionForm"),type:$("type"),stockName:$("stockName"),stockSuggestions:$("stockSuggestions"),
 stockNameField:$("stockNameField"),buySharesField:$("buySharesField"),buyShares:$("buyShares"),amountField:$("amountField"),amountLabel:$("amountLabel"),amount:$("amount"),
 sellSharesField:$("sellSharesField"),sellShares:$("sellShares"),sellSharesHint:$("sellSharesHint"),pnlField:$("pnlField"),pnlAmount:$("pnlAmount"),
 profitButton:$("profitButton"),lossButton:$("lossButton"),date:$("date"),note:$("note"),formError:$("formError"),
 manageModal:$("manageModal"),importFile:$("importFile"),toast:$("toast"),
 analysisStart:$("analysisStart"),analysisEnd:$("analysisEnd"),periodNet:$("periodNet"),periodProfit:$("periodProfit"),periodLoss:$("periodLoss"),stockAnalysisList:$("stockAnalysisList")
};

function loadTransactions(){
 try{
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw){const p=JSON.parse(raw); if(Array.isArray(p)) return p;}
  for(const key of ["capital_tracker_transactions_v4","capital_tracker_transactions_v3","capital_tracker_transactions_v2"]){
   const r=localStorage.getItem(key); if(r){const p=JSON.parse(r); if(Array.isArray(p)){localStorage.setItem(STORAGE_KEY,JSON.stringify(p)); return p;}}
  }
 }catch(e){console.error(e)}
 return [];
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(transactions))}
function today(){const d=new Date(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${d.getFullYear()}-${m}-${day}`}
function money(n){n=Number(n)||0;return `${n<0?"-":""}NT$ ${Math.abs(Math.round(n)).toLocaleString("zh-TW")}`}
function signed(n){n=Number(n)||0;return `${n>0?"+":""}${money(n)}`}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function toast(msg){els.toast.textContent=msg;els.toast.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove("show"),1600)}
function setColor(el,n){el.classList.remove("positive","negative");if(n>0)el.classList.add("positive");if(n<0)el.classList.add("negative")}
function sortTx(items){return [...items].sort((a,b)=>String(a.date).localeCompare(String(b.date))||(Number(a.id)||0)-(Number(b.id)||0))}
function stockName(t){return String(t.stockName||"").trim()}

function analyze(items){
 let cash=0,deposits=0,withdrawals=0;const holdings={},derived={};
 for(const t of sortTx(items)){
  if(t.type==="deposit"){const a=Number(t.amount)||0;cash+=a;deposits+=a;continue}
  if(t.type==="withdraw"){const a=Number(t.amount)||0;cash-=a;withdrawals+=a;continue}
  if(t.type==="buy"){
   const n=stockName(t),a=Number(t.amount)||0,s=Number(t.shares)||0;
   cash-=a;
   if(!holdings[n])holdings[n]={shares:0,cost:0,legacyCost:0};
   if(s>0)holdings[n].shares+=s; else holdings[n].legacyCost+=a;
   holdings[n].cost+=a;continue;
  }
  if(t.type==="sell"){
   const n=stockName(t),p=Number(t.pnl)||0,s=Number(t.shares)||0,oldSellCost=Number(t.sellCost)||0;
   if(!holdings[n])holdings[n]={shares:0,cost:0,legacyCost:0};
   let soldCost=0;
   if(s>0&&holdings[n].shares>0){
    const avg=holdings[n].cost/holdings[n].shares;
    soldCost=s>=holdings[n].shares?holdings[n].cost:avg*s;
    holdings[n].shares=Math.max(0,holdings[n].shares-s);
    holdings[n].cost=Math.max(0,holdings[n].cost-soldCost);
   }else if(oldSellCost>0){
    soldCost=Math.min(oldSellCost,holdings[n].cost);
    holdings[n].cost=Math.max(0,holdings[n].cost-soldCost);
   }
   const proceeds=soldCost+p; cash+=proceeds;
   derived[String(t.id)]={soldCost,proceeds,pnl:p,sellShares:s};
  }
 }
 const stockCost=Object.values(holdings).reduce((x,h)=>x+(Number(h.cost)||0),0);
 const assets=cash+stockCost, net=deposits-withdrawals, pnl=assets+withdrawals-deposits;
 return {cash,deposits,withdrawals,stockCost,assets,net,pnl,rate:deposits>0?pnl/deposits*100:0,holdings,derived};
}

function updateFields(){
 const t=els.type.value;
 [els.stockNameField,els.buySharesField,els.sellSharesField,els.pnlField].forEach(x=>x.style.display="none");
 els.amountField.style.display="block";els.amountLabel.textContent="金額";
 if(t==="buy"){els.stockNameField.style.display="block";els.buySharesField.style.display="block";els.amountLabel.textContent="花費金額"}
 if(t==="sell"){els.stockNameField.style.display="block";els.amountField.style.display="none";els.sellSharesField.style.display="block";els.pnlField.style.display="block";updateSellHint()}
}
function setPnl(type){pnlType=type;els.profitButton.classList.toggle("selected",type==="profit");els.lossButton.classList.toggle("selected",type==="loss")}
function formError(msg=""){els.formError.hidden=!msg;els.formError.textContent=msg}
function openModal(t=null){
 editingId=t?Number(t.id):null;els.form.reset();els.modalTitle.textContent=t?"編輯紀錄":"新增紀錄";els.date.value=t?.date||today();els.note.value=t?.note||"";els.type.value=t?.type||"deposit";els.stockName.value=t?.stockName||"";
 if(t?.type==="buy"){els.buyShares.value=t.shares||"";els.amount.value=t.amount||""}
 else if(t?.type==="sell"){els.sellShares.value=t.shares||"";setPnl((Number(t.pnl)||0)<0?"loss":"profit");els.pnlAmount.value=Math.abs(Number(t.pnl)||0)}
 else if(t)els.amount.value=t.amount||"";
 if(!t)setPnl("profit");formError();updateFields();els.modal.classList.add("show");els.modal.setAttribute("aria-hidden","false")
}
function closeModal(){els.modal.classList.remove("show");els.modal.setAttribute("aria-hidden","true");editingId=null;formError()}

function buildForm(){
 const base={id:editingId??Date.now(),type:els.type.value,date:els.date.value,note:els.note.value.trim(),stockName:""};
 if(!base.date){formError("請選擇日期");return null}
 if(base.type==="deposit"||base.type==="withdraw"){
  const a=Number(els.amount.value);if(!(a>0)){formError("請輸入大於 0 的金額");return null}base.amount=a;return base;
 }
 const n=stockName({stockName:els.stockName.value});if(!n){formError("請輸入股票名稱");return null}base.stockName=n;
 if(base.type==="buy"){
  const s=Number(els.buyShares.value),a=Number(els.amount.value);if(!Number.isInteger(s)||s<=0){formError("請輸入正確的買入股數");return null}if(!(a>0)){formError("請輸入花費金額");return null}
  base.shares=s;base.amount=a;return base;
 }
 const s=Number(els.sellShares.value),p=Number(els.pnlAmount.value);
 if(!Number.isInteger(s)||s<=0){formError("請輸入正確的賣出股數");return null}
 if(els.pnlAmount.value===""||!Number.isFinite(p)||p<0){formError("損益金額請輸入 0 或正數");return null}
 base.shares=s;base.pnl=pnlType==="loss"?-p:p;return base;
}
function saveForm(){
 const t=buildForm();if(!t)return;
 const candidate=editingId===null?[...transactions,t]:transactions.map(x=>Number(x.id)===editingId?t:x);
 // 新格式的賣出，檢查股數
 if(t.type==="sell"&&Number(t.shares)>0){
  const before=analyze(candidate.filter(x=>Number(x.id)!==Number(t.id)||x===t?true:true)); // compatibility handled below
  const prior=analyze(candidate.filter(x=>String(x.date)<String(t.date)||(String(x.date)===String(t.date)&&(Number(x.id)||0)<(Number(t.id)||0))));
  const h=prior.holdings[t.stockName];
  if(!h||Number(h.shares)<=0){formError("這個日期之前沒有可用股數的這檔持股。若是舊版買入紀錄，請先編輯它並補上買入股數。");return}
  if(Number(t.shares)>Number(h.shares)){formError(`當時只有 ${Math.round(h.shares).toLocaleString("zh-TW")} 股，不能賣出更多。`);return}
 }
 transactions=candidate;save();updateUI();closeModal();toast(editingId===null?"已新增紀錄":"已更新紀錄")
}
function updateSellHint(){
 const n=els.stockName.value.trim(),a=analyze(transactions),h=a.holdings[n];
 els.sellSharesHint.textContent=h&&h.shares>0?`目前約有 ${Math.round(h.shares).toLocaleString("zh-TW")} 股，持股成本 ${money(h.cost)}。可部分賣出。`:"可部分賣出；如果這是舊版買入紀錄，請先替買入紀錄補上股數。";
}

function renderHoldings(a){
 const rows=Object.entries(a.holdings).filter(([,h])=>h.cost>0);
 els.holdingCount.textContent=`${rows.length} 檔`;
 if(!rows.length){els.holdingList.className="empty";els.holdingList.textContent="尚無持股";return}
 els.holdingList.className="holding-list";
 els.holdingList.innerHTML=rows.map(([n,h])=>`<div class="holding-item"><div><strong>${esc(n||"未命名股票")}</strong><div class="holding-meta">${h.shares>0?Math.round(h.shares).toLocaleString("zh-TW")+" 股":"舊版紀錄・未設定股數"}</div></div><strong>${money(h.cost)}</strong></div>`).join("");
}
function renderRecords(a){
 els.recordCount.textContent=`${transactions.length} 筆`;
 if(!transactions.length){els.recordList.className="empty";els.recordList.textContent="尚無紀錄";return}
 els.recordList.className="record-list";
 const arr=[...transactions].sort((x,y)=>String(y.date).localeCompare(String(x.date))||(Number(y.id)||0)-(Number(x.id)||0));
 els.recordList.innerHTML=arr.map(t=>{
  const names={deposit:"入金",withdraw:"出金",buy:"買入股票",sell:"賣出股票"};let detail="",right="",cls="";
  if(t.type==="deposit"||t.type==="withdraw")right=money(t.amount);
  if(t.type==="buy"){detail=` · ${esc(t.stockName)}${t.shares?` · ${Number(t.shares).toLocaleString("zh-TW")} 股`:""}`;right=money(t.amount)}
  if(t.type==="sell"){detail=` · ${esc(t.stockName)}${t.shares?` · ${Number(t.shares).toLocaleString("zh-TW")} 股`:""}`;right=signed(t.pnl);cls=Number(t.pnl)>0?"positive":Number(t.pnl)<0?"negative":""}
  return `<div class="record-item"><div class="record-info"><strong>${names[t.type]||t.type}</strong><p>${esc(t.date)}${detail}${t.note?` · ${esc(t.note)}`:""}</p></div><div class="record-right"><strong class="${cls}">${right}</strong><div class="record-actions"><button class="edit-button" data-id="${t.id}" type="button">編輯</button><button class="delete-button" data-id="${t.id}" type="button">刪除</button></div></div></div>`;
 }).join("");
}
function suggestions(){const n=[...new Set(transactions.map(stockName).filter(Boolean))];els.stockSuggestions.innerHTML=n.map(x=>`<option value="${esc(x)}"></option>`).join("")}

function analyzePeriod(){
 let start=els.analysisStart.value,end=els.analysisEnd.value;if(start&&end&&start>end){[start,end]=[end,start];els.analysisStart.value=start;els.analysisEnd.value=end}
 const sells=transactions.filter(t=>t.type==="sell"&&(!start||t.date>=start)&&(!end||t.date<=end));
 let gains=0,losses=0;const by={};
 for(const t of sells){const p=Number(t.pnl)||0,n=stockName(t)||"未命名股票";if(p>0)gains+=p;if(p<0)losses+=Math.abs(p);if(!by[n])by[n]={gain:0,loss:0,net:0,count:0};by[n].count++;by[n].net+=p;if(p>0)by[n].gain+=p;if(p<0)by[n].loss+=Math.abs(p)}
 const net=gains-losses;els.periodNet.textContent=signed(net);els.periodProfit.textContent=`+${money(gains)}`;els.periodLoss.textContent=losses?`-${money(losses)}`:money(0);setColor(els.periodNet,net);setColor(els.periodProfit,gains);setColor(els.periodLoss,-losses);
 const rows=Object.entries(by).sort((a,b)=>b[1].net-a[1].net);
 if(!rows.length){els.stockAnalysisList.className="analysis-empty";els.stockAnalysisList.textContent="這段期間尚無股票賣出紀錄";return}
 els.stockAnalysisList.className="stock-analysis-list";
 els.stockAnalysisList.innerHTML=rows.map(([n,v])=>`<div class="stock-analysis-item"><div class="stock-analysis-head"><div><div class="stock-analysis-name">${esc(n)}</div><div class="stock-analysis-meta">賣出 ${v.count} 次</div></div><strong class="${v.net>0?"positive":v.net<0?"negative":""}">${signed(v.net)}</strong></div><div class="stock-analysis-numbers"><div><span>總獲利</span><strong class="positive">+${money(v.gain)}</strong></div><div><span>總虧損</span><strong class="${v.loss?"negative":""}">${v.loss?"-"+money(v.loss):money(0)}</strong></div><div><span>淨損益</span><strong>${signed(v.net)}</strong></div></div></div>`).join("");
}
function setRange(r){
 const now=new Date(),end=today(),d=new Date(now);let start;
 if(r==="month"){start=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`}
 else if(r==="year"){start=`${now.getFullYear()}-01-01`}
 else{d.setDate(d.getDate()-(Number(r)-1));start=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
 els.analysisStart.value=start;els.analysisEnd.value=end;document.querySelectorAll(".range-button").forEach(b=>b.classList.toggle("active",b.dataset.range===String(r)));analyzePeriod()
}
function updateUI(){
 const a=analyze(transactions);els.totalAssets.textContent=money(a.assets);els.netDeposit.textContent=money(a.net);els.cash.textContent=money(a.cash);els.stockValue.textContent=money(a.stockCost);els.profit.textContent=signed(a.pnl);els.returnRate.textContent=`${a.rate>0?"+":""}${a.rate.toFixed(2)}%`;setColor(els.profit,a.pnl);setColor(els.returnRate,a.rate);renderHoldings(a);renderRecords(a);suggestions();updateSellHint();analyzePeriod()
}
function download(name,text,type){const b=new Blob([text],{type}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function backup(){download(`capital-tracker-${today()}.json`,JSON.stringify({version:5,transactions},null,2),"application/json;charset=utf-8")}
function exportCsv(){const head=["日期","類型","股票名稱","股數","金額","損益","備註"],names={deposit:"入金",withdraw:"出金",buy:"買入股票",sell:"賣出股票"},q=v=>`"${String(v??"").replaceAll('"','""')}"`;const rows=transactions.map(t=>[t.date,names[t.type],t.stockName||"",t.shares||"",t.amount||"",t.pnl??"",t.note||""]);download(`capital-tracker-${today()}.csv`,"\uFEFF"+[head,...rows].map(r=>r.map(q).join(",")).join("\r\n"),"text/csv;charset=utf-8")}

$("addButton").onclick=()=>openModal();$("closeButton").onclick=closeModal;$("cancelButton").onclick=closeModal;els.type.onchange=updateFields;els.stockName.oninput=updateSellHint;els.profitButton.onclick=()=>setPnl("profit");els.lossButton.onclick=()=>setPnl("loss");els.form.onsubmit=e=>{e.preventDefault();saveForm()};
els.recordList.onclick=e=>{const ed=e.target.closest(".edit-button"),del=e.target.closest(".delete-button");if(ed){const t=transactions.find(x=>Number(x.id)===Number(ed.dataset.id));if(t)openModal(t)}if(del&&confirm("確定刪除這筆紀錄嗎？")){transactions=transactions.filter(x=>Number(x.id)!==Number(del.dataset.id));save();updateUI();toast("已刪除")}};
$("manageButton").onclick=()=>els.manageModal.classList.add("show");$("closeManageButton").onclick=()=>els.manageModal.classList.remove("show");$("backupButton").onclick=backup;$("csvButton").onclick=exportCsv;$("importButton").onclick=()=>els.importFile.click();
els.importFile.onchange=()=>{const f=els.importFile.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result),arr=Array.isArray(p)?p:p.transactions;if(!Array.isArray(arr))throw 0;if(confirm(`匯入 ${arr.length} 筆資料並取代目前資料？`)){transactions=arr;save();updateUI();els.manageModal.classList.remove("show")}}catch(e){alert("備份格式不正確")}};r.readAsText(f)};
$("resetButton").onclick=()=>{if(confirm("確定清空所有資料？建議先備份。")&&confirm("最後確認：真的全部刪除？")){transactions=[];save();updateUI();els.manageModal.classList.remove("show")}};
$("analyzeButton").onclick=analyzePeriod;document.querySelectorAll(".range-button").forEach(b=>b.onclick=()=>setRange(b.dataset.range));
[els.modal,els.manageModal].forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("show")}));

// 這版暫時停用舊 Service Worker，避免 iPhone 持續吃到舊快取。
if("serviceWorker" in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{})}
els.date.value=today();setRange(30);updateFields();updateUI();
