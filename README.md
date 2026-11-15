# AegisSOC — Enterprise Cyber Incident Response & SOC Case Management Platform

[![Security: NIST SP 800-61 Rev. 2](https://img.shields.io/badge/Security-NIST%20SP%20800--61%20Rev.%202-red)](https://csrc.nist.gov/pubs/sp/800/61/r2/final)
[![TLP: 2.0 Standard](https://img.shields.io/badge/Classification-TLP%202.0-amber)](https://www.first.org/tlp/)
[![Framework: Next.js 14+](https://img.shields.io/badge/Framework-Next.js%2014+-black)](https://nextjs.org/)
[![Database: PostgreSQL + Prisma](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-blue)](https://www.prisma.io/)
[![GitHub: aamsetiana](https://img.shields.io/badge/Author-aamsetiana-orange)](https://github.com/aamsetiana)

> **Tugas Besar Mata Kuliah Cyber Security — Semester Ganjil / Pra-UTS**  
> **Author / Mahasiswa**: Aam Setiana (`aamsetiana`)  
> **Calon Topik Skripsi Tingkat 4**: *"Rancang Bangun Incident Response Case Management System Menggunakan Standar NIST SP 800-61 Rev. 2 dan Traffic Light Protocol (TLP 2.0) untuk Efisiensi Penanganan Insiden Siber"*

---

## 1. Deskripsi Aplikasi
**AegisSOC** adalah platform manajemen penanganan insiden keamanan siber (*Security Operations Center*) berbasis web yang dirancang khusus untuk memfasilitasi tim *Blue Team*, *SOC Analyst*, dan *Incident Commander* dalam menangani insiden siber secara terstruktur, terisolasi, dan mematuhi kaidah forensik digital.

Platform ini mengadopsi standar internasional **NIST SP 800-61 Rev. 2** (*Computer Security Incident Handling Guide*) dan klasifikasi kerahasiaan **Traffic Light Protocol (TLP 2.0)**. Seluruh arsitektur dikembangkan dengan prinsip **Security-by-Design** untuk mencegah serangan web modern seperti *SQL Injection*, *Cross-Site Scripting (XSS)*, *Broken Object Level Authorization / Insecure Direct Object Reference (IDOR)*, serta *Brute Force Credential Stuffing*.

---

## 2. Fitur Utama & Kepatuhan Rubrik Penilaian

| Modul & Fitur | Deskripsi Fungsional & Aspek Keamanan |
|---|---|
| **Autentikasi & Sesi Aman** | Registrasi akun dengan validasi password kuat (Zod regex), hashing password menggunakan `bcrypt` (*salt rounds* 12), manajemen sesi berbasis cookie `HttpOnly`, `Secure`, dan `SameSite=Lax` via token terenkripsi `jose`. Dilengkapi sliding-window **Rate Limiter** anti brute-force. |
| **Otorisasi Ketat (RBAC)** | Pemisahan wewenang 3 tingkat: **COMMANDER** (Akses penuh & audit global), **RESPONDER** (Investigasi & eksekusi containment), dan **ANALYST** (Triase awal & deteksi). |
| **Manajemen Kasus (CRUD)** | Pendaftaran kasus insiden, pembaharuan siklus penanganan (*New → Triaged → Contained → Eradicated → Closed*), penugasan investigator, dan penghapusan kasus aman. |
| **Proteksi IDOR & TLP 2.0** | Isolasi akses data berdasarkan tingkat kerahasiaan: `TLP:RED` hanya dapat diakses oleh Commander & assignee resmi; percobaan akses liar via URL langsung dicegat di server (*403 Forbidden*) dan dicatat ke log. |
| **Evidence Vault Forensik** | Pencatatan artefak barang bukti digital dengan kalkulasi **SHA-256 Cryptographic Checksum** untuk menjaga keabsahan rantai bukti (*chain of custody*). |
| **Threat Intel IOC Tracker** | Manajemen *Indicators of Compromise* (IP Malicious, Malware Domain, Hash SHA-256, URL phishing) yang dapat diekspor menjadi *Threat Intel Feed*. |
| **Dashboard Analitik SOC** | Visualisasi metrik keamanan: *Mean Time to Detect* (MTTD), *Mean Time to Respond* (MTTR), diagram kurva *Breakdown*, grouped bar chart *Alert Volume*, dan semi-gauge meter *Firewall Activity* (sesuai standar dark SOC UI modern). |
| **Ekspor Laporan Resmi** | 1. **PDF**: *Executive Incident Summary & Post-Incident Review Report* berformat formal siap cetak.<br>2. **CSV**: Ekspor feed IOC dan rekapitulasi seluruh insiden untuk integrasi SIEM/Firewall. |
| **Immutable Audit Logging** | Tabel log aktivitas keamanan yang merekam setiap login gagal, mutasi data, dan percobaan serangan IDOR (mencakup Timestamp, User, Status, IP, dan User-Agent). |

---

## 3. Akun Uji Coba (Demo Credentials)

Untuk keperluan pengujian dan demonstrasi oleh dosen penguji:

| Peran (Role) | Email Login | Password | Hak Akses Utama |
|---|---|---|---|
| **Incident Commander (Admin)** | `commander@aegissoc.io` | `PasswordAegis!2026` | Akses penuh seluruh TLP (RED, AMBER, GREEN), audit log global, kelola pengguna. |
| **Forensic Responder** | `responder@aegissoc.io` | `PasswordAegis!2026` | Akses TLP:AMBER/GREEN, mutasi status kasus, input IOC, upload bukti forensik. |
| **SOC Tier-1 Analyst** | `analyst@aegissoc.io` | `PasswordAegis!2026` | Pendaftaran kasus baru, akses TLP:GREEN/WHITE (Akses TLP:RED otomatis terblokir). |

---

## 4. Arsitektur & Teknologi

* **Frontend**: Next.js 14+ (App Router, Server Components & Client Actions)
* **Bahasa**: TypeScript (Strict Type Safety)
* **Styling**: Tailwind CSS + Lucide Icons + Recharts (Dark Cybersecurity Theme)
* **Database & ORM**: PostgreSQL + Prisma ORM (Parameterized Queries)
* **Autentikasi**: Jose JWT + HttpOnly SameSite Cookie + Bcryptjs
* **Validasi Skema**: Zod Validation Engine
* **Ekspor Dokumen**: jsPDF + jspdf-autotable (PDF Generator) & RFC-4180 CSV Engine
* **Deployment Publik**: Vercel Serverless Platform (HTTPS SSL/TLS Valid)
* **Database Cloud**: Neon Serverless PostgreSQL / Supabase SSL

---

## 5. Panduan Instalasi & Menjalankan Secara Lokal

### Prasyarat:
* Node.js v20.x atau v24.x
* npm v10.x atau lebih baru
* Git

### Langkah Instalasi:

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/aamsetiana/aegis-soc.git
   cd aegis-soc
   ```

2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Salin berkas template lingkungan:
   ```bash
   cp .env.example .env.local
   ```
   Buka berkas `.env.local` dan sesuaikan nilainya:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/aegissoc?sslmode=require"
   JWT_SECRET="ganti-dengan-kunci-rahasia-acak-minimal-32-karakter"
   NODE_ENV="development"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Inisialisasi Database & Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

6. **Build Produksi**:
   ```bash
   npm run build
   npm run start
   ```

---

## 6. Ringkasan Hasil Self-Testing Keamanan (Poin 3f Panduan)

Aplikasi telah melalui pengujian keamanan mandiri (*self-testing*) mencakup 5 skenario kritis:

| ID Uji | Skenario Pengujian | Vektor Serangan / Payload | Hasil Pengujian & Status |
|---|---|---|---|
| **SEC-01** | **SQL Injection (SQLi)** | `' OR '1'='1' --`<br>`admin'--` pada login & filter search | **LOLOS (PASS)**: Input disanitasi oleh Zod, query dieksekusi sebagai parameter literal via Prisma ORM. Tidak ada struktur query yang dapat dimanipulasi. |
| **SEC-02** | **Stored & Reflected XSS** | `<script>alert(1)</script>`<br>`<img src=x onerror=alert('XSS')>` | **LOLOS (PASS)**: Engine React JSX auto-escaping membersihkan tag HTML; string disimpan murni sebagai teks; cookie dilindungi flag `HttpOnly`. |
| **SEC-03** | **IDOR & TLP 2.0 Bypass** | Akses direct URL kasus `TLP:RED` oleh akun `ANALYST` | **LOLOS (PASS)**: Server merespons `403 Forbidden`, halaman diblokir seketika, percobaan akses ilegal dicatat ke `AuditLog`. |
| **SEC-04** | **Brute Force & Rate Limit** | Pengulangan 10x POST login salah dalam 30 detik | **LOLOS (PASS)**: Percobaan ke-6 diblokir dengan status `429 Too Many Requests` disertai header `Retry-After`. |
| **SEC-05** | **Security Headers & Secrets** | Scan security headers daring & `npm audit` | **LOLOS (PASS)**: Skor **A/A+** (CSP, HSTS, X-Frame-Options DENY, nosniff aktif). Nol rahasia `.env` ter-commit ke Git. |

*Dokumentasi detail skenario uji dan bukti kode perbaikan (before vs after) dapat dilihat pada dokumen [TESTING.md](./TESTING.md).*

---

## 7. Transparansi Penggunaan AI Agent (Poin 3e Panduan)

Sesuai ketentuan kejujuran akademik pada panduan tugas besar:
* **Alat AI yang Digunakan**: Antigravity AI Agent (DeepMind Engine & Claude Architecture).
* **Bagian Pekerjaan yang Dibantu**:
  1. Perancangan skema database Prisma untuk model NIST SP 800-61 dan TLP 2.0.
  2. Implementasi algoritma sliding-window rate limiter dan middleware keamanan.
  3. Desain antarmuka responsif dark SOC dashboard dan generator laporan PDF client-side.
  4. Penyusunan matriks skenario self-testing keamanan dan analisis STRIDE threat model.
* **Cara Mahasiswa Meninjau & Memverifikasi**:
  - Seluruh kode hasil AI ditinjau secara manual (*code review*), diuji kompilasinya menggunakan `npm run build`, diverifikasi keamanannya dari serangan SQLi/XSS/IDOR, dan dipahami alur logikanya untuk kesiapan sesi demonstrasi/tanya jawab dosen.

---

## 8. Dokumen Terkait
- [AGENT.md](./AGENT.md) — Pedoman dan Batasan Proyek
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arsitektur & STRIDE Threat Modeling
- [SECURITY.md](./SECURITY.md) — Kebijakan Keamanan & Kepatuhan OWASP Top 10
- [TESTING.md](./TESTING.md) — Playbook Self-Testing Keamanan (Before vs After)
- [ACADEMIC_PROPOSAL.md](./ACADEMIC_PROPOSAL.md) — Usulan Riset Skripsi Tingkat 4
- [GIT_CONVENTION.md](./GIT_CONVENTION.md) — Standar Riwayat Commit Bertahap

---
*AegisSOC Platform — Developed by Aam Setiana (aamsetiana) for Cyber Security Course.*
