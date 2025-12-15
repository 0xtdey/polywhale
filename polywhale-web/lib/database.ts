/**
 * Database manager for storing whale transactions.
 * Uses better-sqlite3 for synchronous SQLite operations.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { DEFAULT_WHALE_THRESHOLD } from "./config";
import type { WhaleTrade } from "./polymarket-api";

// Database path in user's data directory
const DATA_DIR = path.join(
  process.env.HOME || "/tmp",
  ".local",
  "share",
  "polywhale-web"
);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "whale_trades.db");

// Singleton database instance
let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    initSchema(db);
  }
  return db;
}

/**
 * Initialize database schema
 */
function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS whale_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      market_name TEXT,
      market_id TEXT,
      outcome TEXT,
      side TEXT,
      trader_address TEXT,
      timestamp INTEGER NOT NULL,
      details_json TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_timestamp ON whale_transactions(timestamp DESC);
  `);
}

export interface StoredTransaction {
  id: number;
  tx_hash: string;
  amount: number;
  market_name: string | null;
  market_id: string | null;
  outcome: string | null;
  side: string | null;
  trader_address: string | null;
  timestamp: number;
  details_json: string | null;
  created_at: number;
}

/**
 * Insert a new whale transaction
 * @returns true if inserted, false if duplicate
 */
export function insertTransaction(trade: WhaleTrade): boolean {
  const database = getDb();
  const now = Math.floor(Date.now() / 1000);

  try {
    const stmt = database.prepare(`
      INSERT INTO whale_transactions (
        tx_hash, amount, market_name, market_id, outcome,
        side, trader_address, timestamp, details_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      trade.tx_hash,
      trade.amount,
      trade.market_name,
      trade.market_id,
      trade.outcome,
      trade.side,
      trade.trader_address,
      trade.timestamp,
      JSON.stringify(trade.details),
      now
    );

    return true;
  } catch (error) {
    // SQLite UNIQUE constraint error
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return false;
    }
    throw error;
  }
}

/**
 * Get all whale transactions ordered by timestamp
 */
export function getAllTransactions(limit?: number): StoredTransaction[] {
  const database = getDb();

  let query = `SELECT * FROM whale_transactions ORDER BY timestamp DESC`;
  if (limit) {
    query += ` LIMIT ${limit}`;
  }

  const rows = database.prepare(query).all() as StoredTransaction[];

  return rows.map((row) => ({
    id: row.id,
    tx_hash: row.tx_hash,
    amount: Number(row.amount) || 0,
    market_name: row.market_name,
    market_id: row.market_id,
    outcome: row.outcome,
    side: row.side,
    trader_address: row.trader_address,
    timestamp: Number(row.timestamp) || 0,
    details_json: row.details_json,
    created_at: Number(row.created_at) || 0,
  }));
}

/**
 * Get transaction count
 */
export function getTransactionCount(): number {
  const database = getDb();
  const row = database
    .prepare("SELECT COUNT(*) as count FROM whale_transactions")
    .get() as { count: number };
  return row.count;
}

/**
 * Check if transaction exists
 */
export function transactionExists(txHash: string): boolean {
  const database = getDb();
  const row = database
    .prepare("SELECT 1 FROM whale_transactions WHERE tx_hash = ? LIMIT 1")
    .get(txHash);
  return row !== undefined;
}

/**
 * Get a setting value
 */
export function getSetting(key: string): string | null {
  const database = getDb();
  const row = database
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

/**
 * Set a setting value
 */
export function setSetting(key: string, value: string): void {
  const database = getDb();
  database
    .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
    .run(key, value);
}

/**
 * Get last fetch time
 */
export function getLastFetchTime(): number | null {
  const value = getSetting("last_fetch_time");
  return value ? parseInt(value, 10) : null;
}

/**
 * Set last fetch time
 */
export function setLastFetchTime(timestamp: number): void {
  setSetting("last_fetch_time", timestamp.toString());
}

/**
 * Get whale threshold
 */
export function getWhaleThreshold(): number {
  const value = getSetting("whale_threshold");
  return value ? parseFloat(value) : DEFAULT_WHALE_THRESHOLD;
}

/**
 * Set whale threshold
 */
export function setWhaleThreshold(amount: number): void {
  setSetting("whale_threshold", amount.toString());
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
