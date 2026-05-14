import * as SQLite from "expo-sqlite";

const DB_NAME = "unihub.db";
const DEBUG_RESET_DB = false;

export const db = SQLite.openDatabaseSync(DB_NAME);

export const initializeDatabase = () => {
    // Enable WAL for better write performance on mobile
    db.execSync("PRAGMA journal_mode = WAL;");

    if (DEBUG_RESET_DB) {
        console.log("🛠 Resetting Database...");
        db.execSync(`
            DROP TABLE IF EXISTS checkins;
            DROP TABLE IF EXISTS registrations;
            DROP TABLE IF EXISTS workshops;
        `);
    }

    db.execSync(`
    CREATE TABLE IF NOT EXISTS workshops (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      status TEXT,
      is_active INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      workshop_id TEXT,
      mssv TEXT,
      full_name TEXT,
      email TEXT,
      faculty TEXT,
      class_name TEXT,
      registration_status TEXT,
      payment_status TEXT,
      server_checked_in_at TEXT,
      qr_code TEXT,
      FOREIGN KEY(workshop_id) REFERENCES workshops(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reg_mssv ON registrations(mssv);

    CREATE TABLE IF NOT EXISTS checkins (
      device_event_id TEXT PRIMARY KEY,
      workshop_id TEXT,
      mssv TEXT,
      registration_id TEXT,
      qr_code TEXT,
      scanned_at TEXT,
      sync_status TEXT DEFAULT 'pending',
      error_code TEXT,
      error_message TEXT,
      server_checkin_id TEXT,
      FOREIGN KEY(workshop_id) REFERENCES workshops(id)
    );

    CREATE INDEX IF NOT EXISTS idx_checkin_pending
      ON checkins(sync_status)
      WHERE sync_status = 'pending';
  `);

    console.log("SQLite Database Initialized");
};
