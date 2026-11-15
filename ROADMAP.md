# ROADMAP & TAHAPAN PENGERJAAN: AegisSOC

Roadmap ini mengatur alur kerja bertahap (*incremental development*) agar riwayat pengerjaan terstruktur rapi, commit Git mencerminkan proses belajar yang baik, dan semua rubrik penilaian terpenuhi tanpa ada yang terlewat.

---

## 📌 Fase 1: Inisialisasi Proyek & Pondasi Keamanan Dasar
- [ ] Inisialisasi Next.js (App Router, TypeScript, Tailwind CSS, ESLint).
- [ ] Konfigurasi Git repositori lokal (`.gitignore` ketat: `.env*`, `node_modules`, `.next`).
- [ ] Instalasi dependensi inti:
  - ORM & Database: `@prisma/client`, `prisma`
  - Validasi: `zod`
  - Keamanan & Kriptografi: `bcryptjs`, `@types/bcryptjs`, `jose`
  - Ikon & Komponen: `lucide-react`, `clsx`, `tailwind-merge`
  - Visualisasi & Laporan: `recharts`, `jspdf`, `jspdf-autotable`
- [ ] Pembuatan berkas `.env.example`.
- [ ] Penyiapan skema Prisma (`prisma/schema.prisma`): User, IncidentCase, IOC, Evidence, ContainmentTask, AuditLog.
- [ ] Pembuatan Seeder Database (`prisma/seed.ts`) berisi 3 akun pengujian awal (Commander, Responder, Analyst) serta data insiden contoh realistis.

---

## 📌 Fase 2: Sistem Autentikasi, Sesi, & Otorisasi RBAC
- [ ] Helper keamanan & kriptografi:
  - `lib/auth/password.ts`: Fungsi hash & verifikasi password menggunakan `bcryptjs` (salt rounds 12).
  - `lib/auth/session.ts`: Pembuatan & verifikasi token sesi menggunakan `jose` dengan payload peran (Role).
  - Cookie flags: `HttpOnly`, `Secure` (pada production), `SameSite=Lax`, `Path=/`, `Max-Age=86400` (24 jam).
- [ ] Mekanisme **Rate Limiting**:
  - `lib/security/rate-limit.ts`: Membatasi percobaan login (maksimal 5x gagal per IP/email dalam 5 menit).
- [ ] Server Actions & Halaman Autentikasi:
  - Halaman Register (`/register`): Validasi kompleksitas password, cegah pendaftaran duplikat.
  - Halaman Login (`/login`): Verifikasi password, rate-limit check, penerbitan cookie sesi, pencatatan ke `AuditLog`.
  - Tombol Logout: Penghapusan cookie sesi dan pencatatan audit.
- [ ] Middleware Akses (`middleware.ts`):
  - Melindungi rute private (`/dashboard`, `/incidents`, `/audit-logs`, dll.).
  - Redireksi otomatis jika sesi tidak valid.
  - Penegakan role checking awal.

---

## 📌 Fase 3: Pengelolaan Kasus Insiden (CRUD Kompleks & Aturan TLP)
- [ ] Modul Kasus Insiden:
  - Form Pendaftaran Insiden (`/incidents/new`): Validasi Zod lengkap (Kategori serangan, Severity, TLP, Kronologi).
  - Halaman Daftar Kasus (`/incidents`): Filter dinamis berdasarkan status, severity, dan TLP; fitur pencarian cepat.
  - Halaman Detail Kasus (*Case Dossier* - `/incidents/[id]`):
    - Penegakan **Proteksi IDOR & TLP**: Jika kasus bertanda `TLP:RED`, hanya pembuat dan role `COMMANDER`/`RESPONDER` terdaftar yang diizinkan membukanya.
    - Manajemen IOC: Tambah, lihat, dan hapus indikator ancaman (IP, Domain, MD5/SHA256 hash).
    - Evidence Locker: Pencatatan artefak bukti forensik dan perhitungan checksum hash SHA-256 integritas file.
    - Containment Checklist: Checklist langkah mitigasi (misal: *Isolate Host, Block IP on Firewall, Revoke Credentials*).
  - Pembatalan / Hapus Kasus: Khusus `COMMANDER` dengan audit trail.

---

## 📌 Fase 4: Dashboard Analitik Keamanan & Ekspor Laporan
- [ ] Dashboard Utama (`/dashboard`):
  - Kartu Ringkasan Metrik: Total Insiden Aktif, Insiden Kritis, MTTD (*Mean Time to Detect*), MTTR (*Mean Time to Respond*).
  - Grafik Interaktif Recharts:
    - Diagram Lingkaran: Distribusi Kategori Serangan (*Phishing, Ransomware, Unauthorized Access*, dll.).
    - Diagram Batang: Tren Insiden berdasarkan Severity & Status Penanganan.
  - Widget Aktivitas Terkini (Insiden terbaru & alert keamanan).
- [ ] Fitur Laporan Eksekutif (`/reports`):
  - Generator Dokumen **PDF**: Menghasilkan *Executive Incident Summary Report* berformat resmi, lengkap dengan nomor kasus, status penanganan, dampak, dan tabel IOC.
  - Generator Dokumen **CSV**: Ekspor *Threat Intelligence Feed* (daftar seluruh IOC berbahaya untuk diimpor ke firewall/SIEM).

---

## 📌 Fase 5: Penguatan Keamanan Lanjutan & Hardening
- [ ] Security Headers di `next.config.js` / `middleware.ts`:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options: DENY` (anti-clickjacking)
  - `X-Content-Type-Options: nosniff` (anti-MIME sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] Sanitasi Input & Anti-XSS:
  - Penggunaan React escape bawaan + sanitasi input Zod.
- [ ] Pencatatan Audit Log Lengkap (`/audit-logs`):
  - Halaman pemantauan log audit (khusus `COMMANDER`) yang menampilkan seluruh event penting.

---

## 📌 Fase 6: Self-Testing Keamanan, Deployment Publik & Berkas Laporan
- [ ] Pelaksanaan 5 Skenario Self-Testing:
  - Uji 1: SQL Injection (Login & Parameter) -> Bukti keamanan ORM.
  - Uji 2: Cross-Site Scripting (Payload XSS di input insiden) -> Bukti sanitasi.
  - Uji 3: IDOR & TLP Bypass (Akses kasus TLP:RED oleh akun unauthorized) -> Bukti pemblokiran 403 & log.
  - Uji 4: Brute Force Login -> Bukti pemblokiran Rate Limiter (429 Too Many Requests).
  - Uji 5: Scan Security Headers & `npm audit` -> Bukti skor A dan 0 vulnerability.
- [ ] Deployment ke Platform Publik:
  - Setup database PostgreSQL di cloud (Neon Serverless).
  - Push repository ke GitHub.
  - Deploy ke Vercel (mendapatkan domain HTTPS `https://....vercel.app`).
- [ ] Penyusunan README.md Lengkap di Repositori Git.
- [ ] Penyusunan Draf Laporan PDF (`TugasProject_CyberSec_NamaLengkap_NIM.pdf`).

