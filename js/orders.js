// Purchase orders: suggests reorders for low-stock items, receiving an order books the stock in.
const pad=n=>'PO-'+String(n).padStart(4,'0'),total=o=>o.items.reduce((a,i)=>a+i.qty*i.price,0);
const stTag={Draft:'amber',Ordered:'blue',Received:''};
boot('orders','Purchase Orders',async v=>{
  const [p,s,o]=await Promise.all(['products','suppliers','orders'].map(DB.all));
  o.sort((a,b)=>b.id-a.id);
  const open=new Set(o.filter(x=>x.status!=='Received').flatMap(x=>x.items.map(i=>i.pid)));
  const need=p.filter(x=>x.qty<=x.minStock&&!open.has(x.id)),by={};
  need.forEach(x=>(by[x.supplierId||0]=by[x.supplierId||0]||[]).push({pid:x.id,name:x.name,price:x.price,qty:Math.max(x.minStock*2-x.qty,1)}));
  v.innerHTML=`<h3>Suggested reorders</h3><div class="sugg">${Object.keys(by).length?Object.entries(by).map(([sid,it])=>`<div class="panel"><b>${esc(nm(s,sid))}</b><ul>${it.map(i=>`<li>${esc(i.name)} <span>x ${i.qty}</span></li>`).join('')}</ul><div class="bar" style="margin:0"><span style="flex:1;color:var(--muted)">${money(total({items:it}))}</span><button class="btn sm" data-s="${sid}">Create PO</button></div></div>`).join(''):'<div class="panel empty" style="grid-column:1/-1">Nothing to reorder right now.</div>'}</div>
 <h3>All orders</h3><div class="tw panel" style="padding:0"><table><thead><tr><th>PO no.</th><th>Supplier</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${o.length?o.map(x=>`<tr><td>${x.no}</td><td>${esc(nm(s,x.supplierId))}</td><td>${x.items.length}</td><td>${money(total(x))}</td><td><span class="tag ${stTag[x.status]}">${x.status}</span></td><td>${fmtDate(x.date)}</td><td><button class="btn sm ghost" data-v="${x.id}">View</button> ${x.status==='Draft'?`<button class="btn sm" data-o="${x.id}">Mark ordered</button> <button class="btn sm red" data-d="${x.id}">Delete</button>`:''}${x.status==='Ordered'?`<button class="btn sm" data-r="${x.id}">Receive</button>`:''}</td></tr>`).join(''):'<tr><td class="empty" colspan="7">No purchase orders yet.</td></tr>'}</tbody></table></div>`;
  v.onclick=async e=>{
    const b=e.target.closest('button');
    if(!b)return;
    const d=b.dataset,x=o.find(r=>r.id==(d.v||d.o||d.r||d.d));
    try{
      if(d.s!==undefined){
        await DB.put('orders',{
          no:pad(Math.max(0,...o.map(r=>r.id))+1),
          supplierId:+d.s,
          items:by[d.s],
          status:'Draft',
          date:new Date().toISOString()
        });
        toast('Draft order created')
      } else if(d.v)return view(x,s);
      else if(d.o){
        x.status='Ordered';
        await DB.put('orders',x);
        toast(x.no+' marked as ordered')
      } else if(d.d){
        if(!await confirmBox('Delete '+x.no+'?'))return;
        await DB.del('orders',x.id)
      } else if(d.r){
        if(!await confirmBox('Receive all items of '+x.no+' into stock?'))return;
        for(const i of x.items)await DB.move(i.pid,'IN',i.qty,x.no+' received');
        x.status='Received';
        await DB.put('orders',x);
        toast('Stock updated from '+x.no)
      }
      refresh()
    } catch(err){
      toast(err.message,'err')
    }
  }
});
const view=(x,s)=>{
  const m=modal(`<h3>${x.no} · ${esc(nm(s,x.supplierId))}</h3><p style="color:var(--muted)">${x.status} · ${fmtDate(x.date)}</p><table>${x.items.map(i=>`<tr><td>${esc(i.name)}</td><td>${i.qty} x ${money(i.price)}</td><td>${money(i.qty*i.price)}</td></tr>`).join('')}<tr><th colspan="2">Total</th><th>${money(total(x))}</th></tr></table><div class="row noprint"><button type="button" class="btn ghost" data-x>Close</button><button type="button" class="btn" data-p>Print</button></div>`,()=>{});
  m.querySelector('[data-p]').onclick=()=>print()
};
