import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initDb } from "./server/db";
import { storageRouter } from "./server/storage";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Penyimpanan aplikasi (PostgreSQL): REST + realtime untuk semua koleksi data.
  app.use("/api", storageRouter);

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant Endpoint using Gemini API
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY belum dikonfigurasi di environment server." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { prompt, context, chatHistory } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt pertanyaan tidak boleh kosong." });
      }

      const systemInstruction = `Anda adalah "Asisten AI SATDAF" (Sistem Administrasi Terpadu Darul Arifin Jambi).
Tugas dan Fungsi Utama Anda:
1. Menjawab pertanyaan pengguna dengan akurat berdasarkan data sistem SATDAF yang tersedia dalam konteks (Data Santri, Kamar/Asrama, Mutabaah Yaumiyah, Pelanggaran, Prestasi, Pengasuh/Guru, Keuangan, dll).
2. Memberikan analisa mendalam & REKOMENDASI SOLUSI KONKRET untuk kendala di asrama/kamar yang bermasalah (misal: kamar dengan skor mutabaah rendah, kebersihan kurang, tingkat kedisiplinan rendah, atau wali kamar butuh bimbingan).
3. Memberikan analisa & REKOMENDASI PENANGANAN / SOLUSI PEMBINAAN untuk SANTRI BERMASALAH (sering melanggar, mutabaah rendah, tidak disiplin, poin pelanggaran tinggi).
4. Memberikan REKOMENDASI REWARD / PENGHARGAAN / APRESIASI yang pantas, Islami, dan mendidik bagi SANTRI BERPRESTASI atau KAMAR TELADAN (misal: skor mutabaah tinggi, juara lomba, bebas pelanggaran, santri paling disiplin).

Aturan Gaya Bahasa & Respon:
- Gunakan bahasa Indonesia yang santun, islami, hangat, ramah, dan profesional khas pengasuhan pondok pesantren (seperti seorang Ustadz Penasihat Senior).
- Format jawaban dengan sangat rapi menggunakan Markdown (Gunakan Judul/Header, Bold, Bullet points, Poin Angka, dan Tabel jika relevan) agar sangat mudah dibaca.
- Selalu sebutkan nama santri, nama kamar, poin pelanggaran, atau skor mutabaah secara spesifik sesuai data konteks yang relevan.
- Untuk Rekomendasi Solusi/Langkah Pembinaan: Buatlah langkah operasional bertahap (misal: Pembinaan Persuasif -> Panggilan Orang Tua -> Bimbingan Khusus).
- Untuk Rekomendasi Reward: Berikan ide reward konkret (misal: Piagam Penghargaan, Bebas Piket Asrama 1 Pekan, Hadiah Kitab/Buku, Beasiswa Uang Saku, Rihlah/Wisata Edukasi, Pengumuman saat Apel).`;

      // Build contents array including context and history if available
      const contentsPayload: any[] = [];

      // Include contextual data summary
      if (context) {
        contentsPayload.push({
          role: "user",
          parts: [{
            text: `[RINGKASAN DATA KONTEN SISTEM SATDAF TERKINI]:\n${JSON.stringify(context)}`
          }]
        });
        contentsPayload.push({
          role: "model",
          parts: [{
            text: "Terima kasih. Saya telah membaca dan menganalisis seluruh data sistem SATDAF terkini (Data Santri, Kamar, Mutabaah, Pelanggaran, Prestasi, dan Pengasuh). Silakan sampaikan pertanyaan atau bantuan analisis yang Anda butuhkan."
          }]
        });
      }

      // Append chat history if provided
      if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatHistory.forEach((msg: { sender: string; text: string }) => {
          contentsPayload.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });
      }

      // Append current user prompt
      contentsPayload.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contentsPayload,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({ response: response.text });
    } catch (error: any) {
      console.error("Error calling Gemini API in AI Assistant:", error);
      return res.status(500).json({ 
        error: error.message || "Gagal memproses analisis AI Assistant. Silakan coba beberapa saat lagi." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  try {
    await initDb();
  } catch (err) {
    console.error("[db] inisialisasi gagal:", (err as Error).message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server SATDAF running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
