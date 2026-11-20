// Dashboard: summary cards, 7-day movement chart, stock-by-category donut, low-stock alerts.

// last 7 days of stock movement, grouped by day
const week=t=>{
  const o=[];
  for(let i=6;i>=0;i--){
    const d=new Date(Date.now()-i*864e5);
    o.push({
      k:d.toISOString().slice(0,10),
      l:d.toLocaleDateString('en-IN',{weekday:'short'}),
      in:0,
      out:0
    })
  }
  t.forEach(x=>{
    const r=o.find(d=>d.k===x.date.slice(0,10));
    if(r)r[x.type==='IN'?'in':'out']+=x.qty
  });
  return o
};
const bars=d=>{
  const m=Math.max(1,...d.flatMap(x=>[x.in,x.out])),h=v=>v/m*100;
  return `<svg viewBox="0 0 320 150" class="chart" role="img" aria-label="Stock in and out for the last 7 days">`+d.map((x,i)=>`<rect x="${i*45+6}" y="${115-h(x.in)}" width="16" height="${h(x.in)}" rx="3" class="b-in"><title>${x.l}: ${x.in} in</title></rect><rect x="${i*45+24}" y="${115-h(x.out)}" width="16" height="${h(x.out)}" rx="3" class="b-out"><title>${x.l}: ${x.out} out</title></rect><text x="${i*45+23}" y="134" text-anchor="middle">${x.l}</text>`).join('')+'</svg>'
};
const COL=[
  'var(--primary)',
  'var(--primary-2)',
  'var(--amber)',
  'var(--red)',
  'var(--green)'
];
const donut=(p,c)=>{
  const g=c.map(x=>({n:x.name,v:p.filter(y=>y.catId===x.id).reduce((a,y)=>a+y.qty,0)})).filter(x=>x.v),tot=g.reduce((a,x)=>a+x.v,0);
  if(!tot)return '<p class="empty">No stock yet.</p>';
  let off=25;
  return `<div class="donut"><svg viewBox="0 0 42 42" role="img" aria-label="Stock by category"><circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--surface-2)" stroke-width="6"/>`+g.map((x,i)=>{
    const s=x.v/tot*100,o=`<circle cx="21" cy="21" r="15.9" fill="none" stroke="${COL[i%5]}" stroke-width="6" stroke-dasharray="${s} ${100-s}" stroke-dashoffset="${off}"><title>${esc(x.n)}: ${x.v}</title></circle>`;
    off-=s;
    return o
  }).join('')+`<text x="21" y="22.5" text-anchor="middle" class="dn">${tot}</text></svg><ul>`+g.map((x,i)=>`<li><i style="background:${COL[i%5]}"></i>${esc(x.n)} <b>${x.v}</b></li>`).join('')+'</ul></div>'
};
boot('dashboard','Dashboard',async v=>{
  const [p,c,s,t]=await Promise.all(['products','categories','suppliers','transactions'].map(DB.all));
  const low=p.filter(x=>x.qty<=x.minStock),card=(l,n,w)=>`<div class="card ${w?'warn':''}"><small>${l}</small><b>${n}</b></div>`;
  v.innerHTML=`<div class="cards">${card('Products',p.length)}${card('Categories',c.length)}${card('Suppliers',s.length)}${card('Total stock',p.reduce((a,x)=>a+x.qty,0))}${card('Low-stock products',low.length,low.length)}${card('Inventory value',money(p.reduce((a,x)=>a+x.qty*x.price,0)))}</div>
 <div class="split"><div class="panel"><h3>Last 7 days <span class="key"><i class="k-in"></i>In <i class="k-out"></i>Out</span></h3>${bars(week(t))}</div><div class="panel"><h3>Stock by category</h3>${donut(p,c)}</div></div>
 <h3>Low-stock alerts</h3><div class="tw panel" style="padding:0"><table><thead><tr><th>Product</th><th>In stock</th><th>Minimum</th></tr></thead><tbody>${low.length?low.map(x=>`<tr><td>${esc(x.name)}</td><td><span class="tag low">${x.qty}</span></td><td>${x.minStock}</td></tr>`).join(''):'<tr><td class="empty" colspan="3">All products are above their minimum stock.</td></tr>'}</tbody></table></div>
 <h3>Recent transactions</h3>${txTable(t.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8))}`;
  if(low.length&&!sessionStorage.getItem('warned')){
    sessionStorage.setItem('warned',1);
    toast(`${low.length} product(s) are at or below minimum stock`,'warn')
  }
});
