import { Router, type Response } from "express";
import { pool } from "./db";

/**
 * REST + realtime API pengganti Firestore.
 *   GET    /api/collections/:collection          -> daftar dokumen
 *   GET    /api/collections/:collection/events   -> SSE, kirim ulang daftar tiap ada perubahan
 *   PUT    /api/collections/:collection/:id      -> simpan / timpa dokumen
 *   DELETE /api/collections/:collection/:id      -> hapus dokumen
 *   DELETE /api/collections/:collection          -> kosongkan koleksi
 *   POST   /api/collections/:collection/batch    -> simpan banyak dokumen
 *   POST   /api/storage/import                   -> impor backup aplikasi
 */

const NAME_RE = /^[a-z0-9_]+$/;
const subscribers = new Map<string, Set<Response>>();

async function listCollection(collection: string): Promise<unknown[]> {
  const { rows } = await pool.query(
    "SELECT data FROM records WHERE collection = $1 ORDER BY id",
    [collection]
  );
  return rows.map((row) => row.data);
}

async function pushCollection(collection: string): Promise<void> {
  const listeners = subscribers.get(collection);
  if (!listeners || listeners.size === 0) return;
  const items = await listCollection(collection);
  const frame = `data: ${JSON.stringify(items)}\n\n`;
  listeners.forEach((res) => res.write(frame));
}

async function upsert(collection: string, item: { id: string }): Promise<void> {
  await pool.query(
    `INSERT INTO records (collection, id, data, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (collection, id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [collection, String(item.id), JSON.stringify(item)]
  );
}

async function upsertMany(collection: string, items: { id: string }[]): Promise<void> {
  if (items.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      if (!item || item.id === undefined || item.id === null) continue;
      await client.query(
        `INSERT INTO records (collection, id, data, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (collection, id)
         DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [collection, String(item.id), JSON.stringify(item)]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

const wrap =
  (handler: (req: any, res: any) => Promise<unknown>) =>
  (req: any, res: any) => {
    handler(req, res).catch((err: Error) => {
      console.error("[storage]", err);
      res.status(500).json({ error: err.message });
    });
  };

export const storageRouter = Router();

storageRouter.get(
  "/collections/:collection/events",
  wrap(async (req, res) => {
    const collection = req.params.collection;
    if (!NAME_RE.test(collection)) return res.status(400).json({ error: "Nama koleksi tidak valid" });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("retry: 3000\n\n");

    const items = await listCollection(collection);
    res.write(`data: ${JSON.stringify(items)}\n\n`);

    let listeners = subscribers.get(collection);
    if (!listeners) {
      listeners = new Set();
      subscribers.set(collection, listeners);
    }
    const group = listeners;
    group.add(res);

    const ping = setInterval(() => res.write(": ping\n\n"), 25000);
    req.on("close", () => {
      clearInterval(ping);
      group.delete(res);
    });
    return undefined;
  })
);

storageRouter.get(
  "/collections/:collection",
  wrap(async (req, res) => {
    const collection = req.params.collection;
    if (!NAME_RE.test(collection)) return res.status(400).json({ error: "Nama koleksi tidak valid" });
    res.json(await listCollection(collection));
  })
);

storageRouter.post(
  "/collections/:collection/batch",
  wrap(async (req, res) => {
    const collection = req.params.collection;
    if (!NAME_RE.test(collection)) return res.status(400).json({ error: "Nama koleksi tidak valid" });
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    await upsertMany(collection, items);
    await pushCollection(collection);
    res.json({ saved: items.length });
  })
);

storageRouter.put(
  "/collections/:collection/:id",
  wrap(async (req, res) => {
    const collection = req.params.collection;
    if (!NAME_RE.test(collection)) return res.status(400).json({ error: "Nama koleksi tidak valid" });
    const item = { ...req.body, id: req.params.id };
    await upsert(collection, item);
    await pushCollection(collection);
    res.json({ saved: true });
  })
);

storageRouter.delete(
  "/collections/:collection/:id",
  wrap(async (req, res) => {
    const collection = req.params.collection;
    if (!NAME_RE.test(collection)) return res.status(400).json({ error: "Nama koleksi tidak valid" });
    await pool.query("DELETE FROM records WHERE collection = $1 AND id = $2", [
      collection,
      req.params.id,
    ]);
    await pushCollection(collection);
    res.json({ deleted: true });
  })
);

storageRouter.delete(
  "/collections/:collection",
  wrap(async (req, res) => {
    const collection = req.params.collection;
    if (!NAME_RE.test(collection)) return res.status(400).json({ error: "Nama koleksi tidak valid" });
    await pool.query("DELETE FROM records WHERE collection = $1", [collection]);
    await pushCollection(collection);
    res.json({ cleared: true });
  })
);

// Kunci localStorage pada berkas backup -> nama koleksi di database.
const BACKUP_KEYS: Record<string, string> = {
  satdaf_santri: "santri",
  satdaf_guru: "guru",
  satdaf_kamar: "kamar",
  satdaf_logs: "logs",
  satdaf_keuangan: "keuangan",
  satdaf_pelanggaran: "pelanggaran",
  satdaf_prestasi: "prestasi",
  satdaf_mutabaah_targets: "mutabaah_targets",
  satdaf_mutabaah_records: "mutabaah_records",
  satdaf_kunjungan_berobat: "klinik_kunjungan",
  satdaf_stok_obat: "klinik_stok_obat",
  satdaf_rekam_medis: "klinik_rekam_medis",
  satdaf_absensi_petugas_klinik: "klinik_absensi_petugas",
  satdaf_pengguna_app: "pengguna_app",
  satdaf_karyawan_sdm: "karyawan_sdm",
  satdaf_penilaian_sdm: "penilaian_sdm",
  satdaf_program_litbang: "program_litbang",
  satdaf_tahfidz_setoran: "tahfidz_setoran",
};

storageRouter.post(
  "/storage/import",
  wrap(async (req, res) => {
    const data = req.body?.data ?? req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Payload backup tidak valid" });
    }

    const report: Record<string, number> = {};
    for (const [key, collection] of Object.entries(BACKUP_KEYS)) {
      const items = (data as Record<string, unknown>)[key];
      if (!Array.isArray(items) || items.length === 0) continue;
      await upsertMany(collection, items as { id: string }[]);
      await pushCollection(collection);
      report[collection] = items.length;
    }
    res.json({ imported: report });
  })
);
