// Shared helpers used by every page: formatting, icons, light/dark theme, toasts and modals,
// CSV export, the page shell (boot) and the generic crud() table used by products/categories/suppliers.

const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₹'+(+n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtDate=d=>new Date(d).toLocaleString('en-IN');
const nm=(a,id)=>(a.find(x=>x.id==id)||{}).name||'—';
/* ---------- icon set (inline SVG, no external assets) ---------- */
const ICON={
  logo:'<svg viewBox="0 0 24 24"><path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="M3 7l9 5 9-5M12 12v9"/></svg>',
  dashboard:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  products:'<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  categories:'<svg viewBox="0 0 24 24"><path d="M20.5 12.5 12 21l-9-9V4h8l9.5 8.5Z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
  suppliers:'<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
  transactions:'<svg viewBox="0 0 24 24"><path d="M7 3v12M7 15 3.5 11.5M7 15l3.5-3.5M17 21V9M17 9l3.5 3.5M17 9l-3.5 3.5"/></svg>',
  orders:'<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
  reports:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M20 20H4"/></svg>',
  logout:'<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  reset:'<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 1 3 6.7M3 12v5M3 12h5"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeoff:'<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  download:'<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
};
/* ---------- brand logo: a cube (stock) with a navigation arrow (pilot) ---------- */
const logoSvg=(v='color')=>{
  const c=v==='color',g=`url(#spg-${v})`;
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="spg-${v}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a5bff"/><stop offset="1" stop-color="#2fc5a0"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="${c?g:'#fff'}"/><path d="M24 9 37 16.5 24 24 11 16.5Z" fill="${c?'#fff':g}"/><path d="M11 16.5 24 24v15L11 31.5Z" fill="${c?'#fff':g}" opacity=".72"/><path d="M37 16.5 24 24v15l13-7.5Z" fill="${c?'#fff':g}" opacity=".45"/><path d="M24 12 28.4 18.6 24 16.6 19.6 18.6Z" fill="${c?g:'#fff'}"/></svg>`
};
const ic=k=>`<span class="icon">${ICON[k]||''}</span>`;
/* ---------- theme (light / dark) ---------- */
const THEME_KEY='sp_theme';
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  try{
    localStorage.setItem(THEME_KEY,t)
  } catch(e){}
}
function currentTheme(){
  return document.documentElement.getAttribute('data-theme')==='dark'?'dark':'light'
}
function initTheme(){
  let t;
  try{
    t=localStorage.getItem(THEME_KEY)
  } catch(e){}
  if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  applyTheme(t)
}
function toggleTheme(){
  applyTheme(currentTheme()==='dark'?'light':'dark')
}
function wireThemeToggle(btn){
  if(!btn)return;
  const paint=()=>btn.innerHTML=ic(currentTheme()==='dark'?'sun':'moon');
  paint();
  btn.onclick=()=>{
    toggleTheme();
    paint()
  }
}
initTheme();
function toast(m,t=''){
  let c=$('#toasts');
  if(!c){
    c=document.createElement('div');
    c.id='toasts';
    document.body.append(c)
  }
  const e=document.createElement('div');
  e.className='toast '+t;
  e.textContent=m;
  c.append(e);
  setTimeout(()=>e.remove(),3800)
}
function modal(html,onSubmit){
  const d=document.createElement('dialog');
  d.innerHTML='<form>'+html+'</form>';
  document.body.append(d);
  const f=d.firstChild;
  f.onsubmit=async e=>{
    e.preventDefault();
    try{
      if(await onSubmit(Object.fromEntries(new FormData(f)))!==false)d.close()
    } catch(x){
      toast(x.message,'err')
    }
  };
  f.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>d.close());
  d.onclose=()=>d.remove();
  d.showModal();
  return d
}
const confirmBox=m=>new Promise(r=>{
  const d=modal(`<p>${esc(m)}</p><div class="row"><button type="button" class="btn ghost" data-x>Cancel</button><button class="btn red">Confirm</button></div>`,()=>{
    r(true)
  });
  d.addEventListener('close',()=>r(false))
});
const fieldHtml=(f,v)=>`<label>${f.label}`+(f.options?`<select name="${f.k}">${f.options.map(o=>`<option value="${esc(o[0])}" ${String(o[0])===String(v[f.k])?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`:`<input name="${f.k}" type="${f.type||'text'}" value="${esc(v[f.k]??'')}" ${f.req?'required':''} ${f.type==='number'?'min="0" step="any"':''}>`)+'</label>';
const formModal=(title,fields,v,save)=>modal(`<h3>${title}</h3>${fields.map(f=>fieldHtml(f,v)).join('')}<div class="row"><button type="button" class="btn ghost" data-x>Cancel</button><button class="btn">Save</button></div>`,save);
function csv(name,rows){
  if(!rows.length)return toast('Nothing to export','warn');
  const k=Object.keys(rows[0]),q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([k.join(',')+'\n'+rows.map(r=>k.map(c=>q(r[c])).join(',')).join('\n')],{type:'text/csv'}));
  a.download=name+'.csv';
  a.click()
}
const txTable=t=>`<div class="tw panel" style="padding:0"><table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Note</th></tr></thead><tbody>${t.length?t.map(x=>`<tr><td>${fmtDate(x.date)}</td><td>${esc(x.name)}</td><td><span class="tag ${x.type==='OUT'?'low':''}">${x.type}</span></td><td>${x.qty}</td><td>${esc(x.note)}</td></tr>`).join(''):'<tr><td class="empty" colspan="5">No transactions yet. Record a stock in or out.</td></tr>'}</tbody></table></div>`;
const NAV=[
  ['dashboard','Dashboard'],
  ['products','Products'],
  ['categories','Categories'],
  ['suppliers','Suppliers'],
  ['transactions','Stock In / Out'],
  ['orders','Purchase Orders'],
  ['reports','Reports']
];
async function boot(page,title,render){
  if(sessionStorage.getItem('sp_auth')!=='1'){
    location.href='index.html';
    return
  }
  document.body.innerHTML=`<div class="shell"><aside id="side"><div class="brand"><span class="mark">${logoSvg('light')}</span><h2>StockPilot</h2></div>${NAV.map(n=>`<a href="${n[0]}.html" class="${n[0]===page?'on':''}">${ic(n[0])}<span>${n[1]}</span></a>`).join('')}<span class="sp"></span><a href="#" id="reset">${ic('reset')}<span>Reset data</span></a><a href="#" id="out">${ic('logout')}<span>Log out</span></a></aside><main><div class="top"><button class="btn ghost icon-btn" id="menu" aria-label="Menu">${ic('menu')}</button><h1>${title}</h1><button class="btn ghost icon-btn" id="theme-toggle" aria-label="Toggle dark mode"></button></div><div id="view"></div></main></div>`;
  $('#menu').onclick=()=>$('#side').classList.toggle('open');
  $('#out').onclick=e=>{
    e.preventDefault();
    sessionStorage.clear();
    location.href='index.html'
  };
  $('#reset').onclick=async e=>{
    e.preventDefault();
    if(await confirmBox('Delete all data and restore the sample data?')){
      DB.db.close();
      indexedDB.deleteDatabase('stockpilot').onsuccess=()=>location.reload()
    }
  };
  wireThemeToggle($('#theme-toggle'));
  try{
    await DB.open();
    window.refresh=()=>render($('#view')).catch(fail);
    await refresh()
  } catch(e){
    fail(e)
  }
}
const fail=e=>{
  $('#view').innerHTML=`<div class="panel empty">Could not load data: ${esc(e.message)}. Check that your browser allows IndexedDB (not in private mode).</div>`
};
// Generic CRUD table: search, optional filter, add/edit/delete with validation.
async function crud(v,c){
  const rows=await DB.all(c.store),ctx=c.ctx?await c.ctx():{},fl=c.filter?c.filter(ctx):null;
  v.innerHTML=`<div class="bar"><input id="q" placeholder="Search ${c.label}s…" aria-label="Search">${fl?`<select id="f"><option value="">All ${fl.name}</option>${fl.opts.map(o=>`<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select>`:''}<button class="btn" id="add">+ Add ${c.label}</button></div><div class="tw panel" style="padding:0"><table><thead><tr>${c.cols.map(x=>`<th>${x[0]}</th>`).join('')}<th></th></tr></thead><tbody id="tb"></tbody></table></div>`;
  const draw=()=>{
    const q=$('#q').value.toLowerCase(),f=fl?$('#f').value:'';
    const r=rows.filter(x=>(!q||JSON.stringify(Object.values(x)).toLowerCase().includes(q))&&(!f||String(x[fl.key])===f));
    $('#tb').innerHTML=r.length?r.map(x=>`<tr>${c.cols.map(y=>`<td>${y[1](x,ctx)}</td>`).join('')}<td>${c.view?`<button class="btn sm ghost" data-v="${x.id}">View</button> `:''}<button class="btn sm ghost" data-e="${x.id}">Edit</button> <button class="btn sm red" data-d="${x.id}">Delete</button></td></tr>`).join(''):`<tr><td class="empty" colspan="${c.cols.length+1}">${rows.length?'No matches.':`No ${c.label}s yet. Add your first one.`}</td></tr>`
  };
  const edit=x=>{
    try{
      c.guard?.(ctx)
    } catch(e){
      return toast(e.message,'warn')
    }
    const fs=c.fields(ctx,x);
    formModal((x.id?'Edit ':'Add ')+c.label,fs,x,async d=>{
      const o={...x};
      for(const f of fs){
        const val=String(d[f.k]??'').trim();
        if(f.req&&!val)throw new Error(f.label+' is required');
        o[f.k]=f.type==='number'||f.num?+val:val;
        if(f.type==='number'&&(isNaN(o[f.k])||o[f.k]<0))throw new Error(f.label+' must be 0 or more')
      }
      if(!x.id&&c.onNew)c.onNew(o,rows);
      await DB.put(c.store,o);
      toast(c.label+' saved');
      refresh()
    })
  };
  $('#q').oninput=draw;
  fl&&($('#f').onchange=draw);
  $('#add').onclick=()=>edit({});
  $('#tb').onclick=async e=>{
    const b=e.target.closest('button');
    if(!b)return;
    const x=rows.find(r=>r.id==(b.dataset.v||b.dataset.e||b.dataset.d));
    if(b.dataset.v)return c.view(x,ctx);
    if(b.dataset.e)return edit(x);
    if(await confirmBox(`Delete this ${c.label}?`)){
      try{
        await c.canDelete?.(x);
        await DB.del(c.store,x.id);
        toast(c.label+' deleted');
        refresh()
      } catch(err){
        toast(err.message,'err')
      }
    }
  };
  draw()
}
