import express from "express";
import { db } from "./db.js";

const app = express();

app.get("/api/summary", (req, res) => {
  const latest = db
    .prepare(`
      SELECT * FROM snapshots
      ORDER BY date DESC, id DESC
      LIMIT 1
    `)
    .get();

  const history = db
    .prepare(`
      SELECT date, total_assets, daily_pnl, monthly_pnl
      FROM snapshots
      ORDER BY date ASC, id ASC
    `)
    .all();

  const positions = latest
    ? db
        .prepare(`
          SELECT symbol, name, quantity, price, market_value, unrealized_pnl
          FROM positions
          WHERE snapshot_id = ?
          ORDER BY market_value DESC
        `)
        .all(latest.id)
    : [];

  res.json({ latest, history, positions });
});

app.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portfolio</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f7f9; color: #15171a; }
    main { max-width: 720px; margin: 0 auto; padding: 16px; }
    h1 { font-size: 22px; margin: 8px 0 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .card { background: white; border: 1px solid #e4e6eb; border-radius: 8px; padding: 14px; }
    .label { color: #68707d; font-size: 13px; }
    .value { font-size: 24px; font-weight: 700; margin-top: 6px; }
    .wide { grid-column: 1 / -1; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 10px 6px; border-bottom: 1px solid #eceef2; }
    td.num, th.num { text-align: right; }
    .pos { color: #0a7f42; }
    .neg { color: #b42318; }
  </style>
</head>
<body>
<main>
  <h1>Portfolio</h1>
  <section class="grid">
    <div class="card wide"><div class="label">Total Assets</div><div id="total" class="value">-</div></div>
    <div class="card"><div class="label">Cash</div><div id="cash" class="value">-</div></div>
    <div class="card"><div class="label">Stock</div><div id="stock" class="value">-</div></div>
    <div class="card"><div class="label">Daily P&L</div><div id="daily" class="value">-</div></div>
    <div class="card"><div class="label">Monthly P&L</div><div id="monthly" class="value">-</div></div>
    <div class="card wide">
      <div class="label">Positions</div>
      <table>
        <thead><tr><th>Symbol</th><th>Name</th><th class="num">Value</th></tr></thead>
        <tbody id="positions"></tbody>
      </table>
    </div>
  </section>
</main>
<script>
const fmt = new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 });
function cls(n) { return n > 0 ? "pos" : n < 0 ? "neg" : ""; }
fetch("/api/summary").then(r => r.json()).then(({ latest, positions }) => {
  if (!latest) return;
  document.getElementById("total").textContent = fmt.format(latest.total_assets);
  document.getElementById("cash").textContent = fmt.format(latest.cash);
  document.getElementById("stock").textContent = fmt.format(latest.stock_value);
  const daily = document.getElementById("daily");
  daily.textContent = fmt.format(latest.daily_pnl || 0);
  daily.className = "value " + cls(latest.daily_pnl || 0);
  const monthly = document.getElementById("monthly");
  monthly.textContent = fmt.format(latest.monthly_pnl || 0);
  monthly.className = "value " + cls(latest.monthly_pnl || 0);
  const tbody = document.getElementById("positions");
  tbody.innerHTML = positions.length
    ? positions.map(p => \`<tr><td>\${p.symbol}</td><td>\${p.name}</td><td class="num">\${fmt.format(p.market_value)}</td></tr>\`).join("")
    : '<tr><td colspan="3">No Esun positions</td></tr>';
});
</script>
</body>
</html>`);
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Dashboard: http://localhost:${port}`);
});
