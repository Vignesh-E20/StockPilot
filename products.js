// Products page: add / edit / delete / view with search and category filter.

boot('products','Products',v=>crud(v,{
  store:'products',
  label:'product',
  ctx:async()=>({cats:await DB.all('categories'),sups:await DB.all('suppliers')}),
  guard:c=>{
    if(!c.cats.length)throw new Error('Add a category first')
  },
  filter:c=>({name:'categories',key:'catId',opts:c.cats.map(x=>[x.id,x.name])}),
  fields:(c,x)=>[
    {k:'name',label:'Product name',req:1},
    {k:'catId',label:'Category',num:1,options:c.cats.map(y=>[y.id,y.name])},
    {
      k:'supplierId',
      label:'Supplier',
      num:1,
      options:[[0,'None'],...c.sups.map(y=>[y.id,y.name])]
    },
    {k:'price',label:'Unit price',type:'number',req:1},
    ...(x.id?[]:[{k:'qty',label:'Opening quantity',type:'number',req:1}]),
    {
      k:'minStock',
      label:'Minimum stock (low-stock alert level)',
      type:'number',
      req:1
    }
  ],
  cols:[
    ['ID',x=>x.sku],
    ['Name',x=>esc(x.name)],
    ['Category',(x,c)=>esc(nm(c.cats,x.catId))],
    ['Price',x=>money(x.price)],
    ['Qty',x=>x.qty],
    [
      'Status',
      x=>x.qty<=x.minStock?'<span class="tag low">Low</span>':'<span class="tag">OK</span>'
    ]
  ],
  onNew:(o,rows)=>{
    o.sku='SP-'+String(Math.max(0,...rows.map(r=>+r.sku.slice(3)))+1).padStart(4,'0')
  },
  view:(x,c)=>modal(`<h3>${esc(x.name)}</h3><p>ID: ${x.sku}<br>Category: ${esc(nm(c.cats,x.catId))}<br>Supplier: ${esc(nm(c.sups,x.supplierId))}<br>Unit price: ${money(x.price)}<br>In stock: ${x.qty} (alert at ${x.minStock})<br>Stock value: ${money(x.qty*x.price)}</p><div class="row"><button class="btn" data-x>Close</button></div>`,()=>{})
}));
