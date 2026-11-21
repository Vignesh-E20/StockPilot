// Reports page: inventory valuation and date-filtered transactions, both exportable as CSV.

boot('reports','Reports',async v=>{
  const [p,c,t]=await Promise.all(['products','categories','transactions'].map(DB.all));
  t.sort((a,b)=>b.date.localeCompare(a.date));
  const R=p.map(x=>({
    ID:x.sku,
    Product:x.name,
    Category:nm(c,x.catId),
    Quantity:x.qty,
    Min_Stock:x.minStock,
    Unit_Price:x.price,
    Value:+(x.qty*x.price).toFixed(2)
  }));
  v.innerHTML=`<div class="bar"><h3 style="flex:1;margin:0">Stock &amp; inventory valuation</h3><button class="btn" id="e1">Export CSV</button></div>
 <div class="tw panel" style="padding:0"><table><thead><tr><th>ID</th><th>Product</th><th>Category</th><th>Qty</th><th>Unit price</th><th>Value</th></tr></thead><tbody>${R.length?R.map(r=>`<tr><td>${r.ID}</td><td>${esc(r.Product)}</td><td>${esc(r.Category)}</td><td>${r.Quantity}</td><td>${money(r.Unit_Price)}</td><td>${money(r.Value)}</td></tr>`).join('')+`<tr><th colspan="5">Total inventory value</th><th>${money(R.reduce((a,r)=>a+r.Value,0))}</th></tr>`:'<tr><td class="empty" colspan="6">No products yet.</td></tr>'}</tbody></table></div>
 <div class="bar"><h3 style="flex:1;margin:0">Transactions</h3><label style="margin:0">From <input type="date" id="d1"></label><label style="margin:0">To <input type="date" id="d2"></label><button class="btn" id="e2">Export CSV</button></div><div id="tl"></div>`;
  const sel=()=>t.filter(x=>(!$('#d1').value||x.date.slice(0,10)>=$('#d1').value)&&(!$('#d2').value||x.date.slice(0,10)<=$('#d2').value));
  const draw=()=>$('#tl').innerHTML=txTable(sel());
  $('#d1').onchange=$('#d2').onchange=draw;
  draw();
  $('#e1').onclick=()=>csv('stockpilot-products',R);
  $('#e2').onclick=()=>csv('stockpilot-transactions',sel().map(x=>({Date:x.date,Product:x.name,Type:x.type,Quantity:x.qty,Note:x.note})))
});
