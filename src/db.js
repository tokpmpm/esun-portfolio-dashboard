import Database from "better-sqlite3";

export const db = new Database("portfolio.db");

db.exec(`
CREATE TABLE IF NOT EXISTS snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  source TEXT NOT NULL,
  stock_value REAL NOT NULL DEFAULT 0,
  cash REAL NOT NULL DEFAULT 0,
  total_assets REAL NOT NULL DEFAULT 0,
  daily_pnl REAL NOT NULL DEFAULT 0,
  monthly_pnl REAL NOT NULL DEFAULT 0,
  raw_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id INTEGER NOT NULL,
  symbol TEXT,
  name TEXT,
  quantity REAL,
  price REAL,
  market_value REAL,
  unrealized_pnl REAL,
  raw_json TEXT NOT NULL,
  FOREIGN KEY(snapshot_id) REFERENCES snapshots(id)
);
`);
