import { EsunTrade } from "esun-trade";
import { db } from "./db.js";

const esun = new EsunTrade({ configPath: "../secret/config.ini" });
const today = new Date().toISOString().slice(0, 10);

function n(value) {
  const parsed = Number(String(value ?? 0).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

console.log("Logging in to Esun read-only account APIs...");
await esun.login();

const inventories = await esun.getInventories();
const settlements = await esun.getSettlements();
const transactions = await esun.getTransactions({ startDate: today, endDate: today });
const balance = await esun.getBalance();

const positions = Array.isArray(inventories)
  ? inventories.map((x) => {
      const quantity = n(pick(x, ["qty", "quantity", "stkQty"]));
      const price = n(pick(x, ["priceMkt", "price", "close"]));
      const marketValue = n(pick(x, ["valueMkt", "marketValue"]));
      return {
        symbol: String(pick(x, ["stkNo", "symbol"]) ?? ""),
        name: String(pick(x, ["stkNa", "name"]) ?? ""),
        quantity,
        price,
        marketValue,
        unrealizedPnl: n(pick(x, ["makeASum", "unrealizedPnl"])),
        raw: x
      };
    })
  : [];

const stockValue = positions.reduce((sum, x) => sum + x.marketValue, 0);
const cash = n(balance?.availableBalance);
const totalAssets = stockValue + cash;

const previous = db
  .prepare(`
    SELECT * FROM snapshots
    WHERE date < ?
    ORDER BY date DESC, id DESC
    LIMIT 1
  `)
  .get(today);

const dailyPnl = previous ? totalAssets - previous.total_assets : 0;
const month = today.slice(0, 7);
const priorMonthly = db
  .prepare(`
    SELECT COALESCE(SUM(daily_pnl), 0) AS monthly_pnl
    FROM snapshots
    WHERE substr(date, 1, 7) = ? AND date < ?
  `)
  .get(month, today);

const monthlyPnl = n(priorMonthly?.monthly_pnl) + dailyPnl;

const insertSnapshot = db.prepare(`
  INSERT INTO snapshots (
    date, source, stock_value, cash, total_assets, daily_pnl, monthly_pnl, raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPosition = db.prepare(`
  INSERT INTO positions (
    snapshot_id, symbol, name, quantity, price, market_value, unrealized_pnl, raw_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
  const old = db.prepare("SELECT id FROM snapshots WHERE date = ? AND source = ?").all(today, "esun");
  for (const row of old) db.prepare("DELETE FROM positions WHERE snapshot_id = ?").run(row.id);
  db.prepare("DELETE FROM snapshots WHERE date = ? AND source = ?").run(today, "esun");

  const result = insertSnapshot.run(
    today,
    "esun",
    stockValue,
    cash,
    totalAssets,
    dailyPnl,
    monthlyPnl,
    JSON.stringify({ inventories, settlements, transactions, balance })
  );

  for (const p of positions) {
    insertPosition.run(
      result.lastInsertRowid,
      p.symbol,
      p.name,
      p.quantity,
      p.price,
      p.marketValue,
      p.unrealizedPnl,
      JSON.stringify(p.raw)
    );
  }
})();

console.log(
  JSON.stringify(
    {
      date: today,
      source: "esun",
      stockValue,
      cash,
      totalAssets,
      dailyPnl,
      monthlyPnl,
      positionCount: positions.length
    },
    null,
    2
  )
);
