// Categories and suppliers pages. Both use the same crud() helper with a different config.

// Categories and suppliers share one generic CRUD config (page chosen by data-page).
const pg=document.body.dataset.page,used=k=>async x=>{
  const n=(await DB.all('products')).filter(p=>p[k]===x.id).length;
  if(n)throw new Error(`Cannot delete: ${n} product(s) use it`)
};
const CFG={
  categories:{
    title:'Categories',
    store:'categories',
    label:'category',
    fields:()=>[{k:'name',label:'Name',req:1},{k:'desc',label:'Description'}],
    cols:[['Name',x=>esc(x.name)],['Description',x=>esc(x.desc)]],
    canDelete:used('catId')
  },
  suppliers:{
    title:'Suppliers',
    store:'suppliers',
    label:'supplier',
    fields:()=>[
      {k:'name',label:'Company',req:1},
      {k:'contact',label:'Contact person'},
      {k:'email',label:'Email',type:'email'},
      {k:'phone',label:'Phone'}
    ],
    cols:[
      ['Company',x=>esc(x.name)],
      ['Contact',x=>esc(x.contact)],
      ['Email',x=>esc(x.email)],
      ['Phone',x=>esc(x.phone)]
    ],
    canDelete:used('supplierId')
  }
}[pg];
boot(pg,CFG.title,v=>crud(v,CFG));
