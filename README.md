# StockPilot – Inventory Management System
A static inventory app built with HTML, CSS and vanilla JavaScript. No backend, no localhost, no installs.

## Data storage (important)
- **Live data is stored in your browser's IndexedDB** (`js/database.js`). It is per browser and per device.
- `sql/database.sql` contains MySQL scripts for **learning and future backend integration only**. The website is **not** connected to MySQL.
- The login runs entirely in client-side JavaScript. It is fine for a portfolio/showcase build, but for protecting real data you would need a proper server-side login.
- All prices and totals are shown in **Indian Rupees (₹)**.

## Features
Dashboard (live totals, low-stock alerts, recent transactions) · Products (add/edit/delete/view, search, category filter, auto ID) · Categories · Suppliers · Stock In/Out with automatic quantities and no negative stock · Dashboard charts (7-day movement, stock by category) · Purchase Orders (reorder suggestions, receive into stock, print) · Reports (valuation, date filter, CSV export) · Light/dark theme toggle · "Reset data" in the sidebar restores the sample dataset.

## Structure
```
StockPilot/ index.html dashboard.html products.html categories.html suppliers.html transactions.html orders.html reports.html
  favicon.svg
  css/style.css
  js/ app.js database.js products.js master.js dashboard.js transactions.js orders.js reports.js
  sql/database.sql
```

## Upload to GitHub
1. Create a new repository on github.com (e.g. `StockPilot`), public.
2. Click **Add file → Upload files**, drag in the *contents* of the StockPilot folder (keep `css`, `js`, `sql` folders), then **Commit changes**.
   Or with Git: `git init && git add . && git commit -m "StockPilot" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`

## Deploy on GitHub Pages
1. Repo **Settings → Pages**. 2. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. 3. Save and wait ~1 minute.
4. Open `https://<your-username>.github.io/StockPilot/`.

## Deploy on Vercel
1. Sign in at vercel.com with GitHub. 2. **Add New → Project**, import the repo.
3. Framework Preset: **Other**; leave build command and output directory empty. 4. **Deploy**, then open the HTTPS URL.
