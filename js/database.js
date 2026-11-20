// Storage layer. Live data sits in the browser's IndexedDB, so no server is needed.
// move() updates the product quantity and logs the transaction in one atomic step.

// IndexedDB layer: stores live app data in the browser (no server).
const DB={
  db:null,
  open(){
    return new Promise((res,rej)=>{
      const r=indexedDB.open('stockpilot',2);
      r.onupgradeneeded=()=>['categories','suppliers','products','transactions','orders'].forEach(s=>{
        if(!r.result.objectStoreNames.contains(s))r.result.createObjectStore(s,{keyPath:'id',autoIncrement:true})
      });
      r.onsuccess=async()=>{
        DB.db=r.result;
        try{
          await DB.seed();
          res()
        } catch(e){
          rej(e)
        }
      };
      r.onerror=()=>rej(r.error)
    })
  },
  tx(s,m,f){
    return new Promise((res,rej)=>{
      const t=DB.db.transaction(s,m),q=f(t.objectStore(s));
      t.oncomplete=()=>res(q&&q.result);
      t.onerror=()=>rej(t.error)
    })
  },
  all:s=>DB.tx(s,'readonly',o=>o.getAll()),
  put:(s,x)=>DB.tx(s,'readwrite',o=>o.put(x)),
  del:(s,id)=>DB.tx(s,'readwrite',o=>o.delete(id)),
  // Atomic stock movement: updates product qty and logs the transaction together; blocks negative stock.
  move(pid,type,qty,note){
    return new Promise((res,rej)=>{
      const t=DB.db.transaction(['products','transactions'],'readwrite'),ps=t.objectStore('products');
      ps.get(pid).onsuccess=e=>{
        const p=e.target.result;
        if(!p){
          t.abort();
          return rej(new Error('Product not found'))
        }
        const q=type==='IN'?p.qty+qty:p.qty-qty;
        if(q<0){
          t.abort();
          return rej(new Error(`Not enough stock: only ${p.qty} available`))
        }
        p.qty=q;
        ps.put(p);
        t.objectStore('transactions').add({productId:pid,name:p.name,type,qty,note,date:new Date().toISOString()})
      };
      t.oncomplete=()=>res();
      t.onerror=()=>rej(t.error)
    })
  },
  async seed(){
    if((await DB.all('categories')).length)return;
    const add=async(s,a)=>{
      for(const o of a)await DB.put(s,o)
    };
    await add('categories',[
      ['Electronics','Devices and accessories'],
      ['Stationery','Office supplies'],
      ['Furniture','Desks and chairs'],
      ['Packaging','Boxes and tape']
    ].map(c=>({name:c[0],desc:c[1]})));
    await add('suppliers',[
      [
        'TechSource Ltd',
        'Asha Rao',
        'sales@techsource.example',
        '+91 90000 11111'
      ],
      [
        'PaperWorld',
        'Ravi Kumar',
        'hello@paperworld.example',
        '+91 90000 22222'
      ],
      ['OfficeHub','Meena S','orders@officehub.example','+91 90000 33333']
    ].map(s=>({name:s[0],contact:s[1],email:s[2],phone:s[3]})));
    const P=[
      ['Wireless Mouse',1,1,799,40,10],
      ['USB-C Hub',1,1,1499,6,8],
      ['Notebook A5',2,2,60,120,30],
      ['Ballpoint Pens (box)',2,2,120,25,20],
      ['Office Chair',3,3,8999,5,3],
      ['Standing Desk',3,3,24999,2,3],
      ['Packing Tape',4,3,45,60,25],
      ['Shipping Box M',4,3,25,15,50]
    ];
    await add('products',P.map((p,i)=>({
      sku:'SP-'+String(i+1).padStart(4,'0'),
      name:p[0],
      catId:p[1],
      supplierId:p[2],
      price:p[3],
      qty:p[4],
      minStock:p[5]
    })));
    const T=[
      [1,'IN',50,'Opening purchase'],
      [3,'IN',100,'Bulk order'],
      [1,'OUT',10,'Order #1042'],
      [4,'OUT',5,'Office use'],
      [7,'IN',20,'Restock']
    ];
    await add('transactions',T.map((t,i)=>({
      productId:t[0],
      name:P[t[0]-1][0],
      type:t[1],
      qty:t[2],
      note:t[3],
      date:new Date(Date.now()-(5-i)*864e5).toISOString()
    })))
  }
};
