import { Pool } from "pg";

/**
 * PostgreSQL pool. Semua data aplikasi disimpan di satu tabel `records`:
 * (collection, id) -> JSONB, sehingga struktur dokumen bebas seperti sebelumnya.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb(retries = 20): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS records (
          collection text NOT NULL,
          id text NOT NULL,
          data jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (collection, id)
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS records_collection_idx ON records (collection)
      `);
      console.log("[db] PostgreSQL siap");
      return;
    } catch (err) {
      console.warn(
        `[db] belum bisa terhubung (${attempt}/${retries}): ${(err as Error).message}`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Database PostgreSQL tidak bisa dihubungi");
}
