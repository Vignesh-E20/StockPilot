// Stock In / Out page. Quantities are changed only through DB.move() so stock can never go negative.

boot('transactions','Stock In / Out',async v=>{
  const [p,t]=await Promise.all([DB.all('products'),DB.all('transactions')]);
  v.innerHTML=`<form class="panel bar" id="tf"><select name="pid" aria-label="Product">${p.length?p.map(x=>`<option value="${x.id}">${esc(x.name)} (stock: ${x.qty})</option>`).join(''):'<option value="">No products yet</option>'}</select><select name="type" aria-label="Type"><option value="IN">Stock In</option><option value="OUT">Stock Out</option></select><input name="qty" type="number" min="1" step="1" placeholder="Quantity" required><input name="note" placeholder="Note (order #, supplier…)"><button class="btn">Record</button></form>${txTable(t.sort((a,b)=>b.date.localeCompare(a.date)))}`;
  $('#tf').onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(e.target));
    try{
      if(!d.pid)throw new Error('Add a product first');
      const q=+d.qty;
      if(!Number.isInteger(q)||q<1)throw new Error('Quantity must be a whole number of 1 or more');
      await DB.move(+d.pid,d.type,q,d.note.trim());
      toast('Transaction recorded');
      refresh()
    } catch(x){
      toast(x.message,'err')
    }
  }
});
