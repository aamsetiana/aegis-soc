# AGENT.MD — Pedoman, Batasan, dan Arsitektur Proyek

## 1. Identitas Proyek
* **Nama Aplikasi**: **AegisSOC** (*Enterprise Cyber Incident Response & SOC Case Management Platform*)
* **Mata Kuliah**: Cyber Security (Pra-UTS)
* **Kategori**: Aplikasi Web Siap Pakai & Dipublikasikan Online (Full-Stack Web Security)
* **Pondasi Topik Skripsi Tingkat 4**: 
  > *"Rancang Bangun Incident Response Case Management System Menggunakan Standar NIST SP 800-61 Rev. 2 dan Traffic Light Protocol (TLP) untuk Efisiensi Penanganan Insiden Siber"*

---

## 2. Visi & Tujuan Aplikasi
AegisSOC adalah platform manajemen penanganan insiden keamanan siber (*Security Operations Center*) yang mengadopsi standar internasional **NIST SP 800-61 Rev. 2** (*Computer Security Incident Handling Guide*) dan klasifikasi kerahasiaan **Traffic Light Protocol (TLP 2.0)**. 

Aplikasi ini memfasilitasi tim keamanan dalam melakukan triase deteksi ancaman, investigasi forensik, pelacakan *Indicators of Compromise* (IOC), penegakan *containment checklist*, pemeliharaan integritas barang bukti digital (*chain of custody*), hingga pembuatan laporan ringkasan eksekutif pasca-insiden (*Post-Incident Review*).

---

## 3. Batasan Sistem (Scope & Boundaries)

Untuk menjamin kualitas kode, kepatuhan 100% pada rubrik penilaian tugas besar, dan penyelesaian tepat waktu tanpa *over-engineering*, ditetapkan batasan ruang lingkup berikut:

### ✅ In-Scope (Wajib Diimplementasikan Penuh):
1. **Autentikasi & Otorisasi Ketat**:
   - Registrasi akun dengan validasi password ketat (panjang minimal 8 karakter, kombinasi huruf besar, kecil, angka, dan simbol).
   - Password hashing menggunakan algoritma aman (`bcrypt` dengan *salt rounds* 12).
   - Mekanisme sesi berbasis cookie `HttpOnly`, `Secure`, dan `SameSite=Lax` untuk mencegah pencurian token melalui JavaScript (XSS).
   - Proteksi brute-force login menggunakan **Rate Limiting** (maksimal 5 percobaan gagal per IP/User dalam jendela waktu tertentu).
   - Otorisasi berbasis peran (**RBAC**) dengan 3 tingkatan:
     - `COMMANDER` (Admin/Incident Commander): Akses penuh ke seluruh kasus, manajemen user, konfigurasi sistem, dan audit log global.
     - `RESPONDER` (Lead Forensic Investigator / Tier-2): Mengelola kasus yang ditugaskan, memvalidasi bukti forensik, mengeksekusi containment checklist.
     - `ANALYST` (SOC Tier-1 Triage Analyst): Melaporkan deteksi baru, mencatat IOC awal, melihat kasus yang berklasifikasi publik/internal.
2. **Pengelolaan Kasus Insiden (CRUD Kompleks)**:
   - **Create**: Formulir pendaftaran insiden (Judul, Kategori Ancaman, Severity/Dampak, Klasifikasi TLP, Ringkasan Kronologi, Pelapor).
   - **Read**: Daftar insiden interaktif dengan filter (TLP, Severity, Status), pencarian cepat, dan tampilan detail kasus (*Case Dossier*).
   - **Update**: Pembaruan status siklus hidup insiden (*New*, *Triaged*, *Contained*, *Eradicated*, *Closed*), penugasan investigator, dan checklist penanganan.
   - **Delete**: Soft-delete atau pembatalan kasus dengan izin khusus Commander (dilengkapi konfirmasi keamanan).
3. **Manajemen Artefak & IOC (Evidence & IOC Locker)**:
   - Pencatatan IOC (IP Malicious, Malware Domain, Hash SHA-256/MD5).
   - Pencatatan artefak bukti digital dengan perhitungan *cryptographic hash integrity* untuk menjamin *chain-of-custody*.
4. **Proteksi Akses Data Berjenjang & Anti-IDOR**:
   - Penerapan aturan **Traffic Light Protocol (TLP 2.0)**:
     - `TLP:RED`: Hanya dapat diakses oleh pembuat kasus dan Commander/Assignee khusus.
     - `TLP:AMBER`: Dapat diakses oleh seluruh tim internal SOC (Commander & Responder).
     - `TLP:GREEN` / `TLP:WHITE`: Dapat diakses oleh seluruh level akun (termasuk Analyst).
   - Verifikasi otorisasi di *server-side* pada setiap endpoint dan Server Action untuk memblokir serangan IDOR (*Insecure Direct Object Reference*).
5. **Dashboard & Laporan (Reporting & Exporting)**:
   - Dashboard analitik dengan visualisasi grafik interaktif:
     - Distribusi jenis serangan siber (*Ransomware, Phishing, Unauthorized Access, DDoS, Data Leak*).
     - Metrik efisiensi keamanan: *Mean Time to Detect* (MTTD) dan *Mean Time to Respond* (MTTR).
     - Statistik insiden berdasarkan tingkat keparahan (*Critical, High, Medium, Low*).
   - **Ekspor Dokumen Formal**:
     - **PDF**: *Executive Incident Summary & Post-Incident Review Report* siap cetak untuk manajemen/dosen.
     - **CSV**: *Threat Intelligence Feed / IOC Data Export* untuk integrasi keamanan.
6. **Activity & Audit Logging (Keamanan Tingkat Lanjut)**:
   - Pencatatan seluruh aksi kritikal ke dalam tabel *Immutable Audit Logs* (Login berhasil/gagal, perubahan status kasus insiden, percobaan akses ilegal/IDOR, penghapusan data).
   - Menyimpan atribut: *Timestamp*, *User ID*, *Event Type*, *Target Resource*, *IP Address*, dan *User-Agent*.
7. **Keamanan Aplikasi (Secure by Default)**:
   - Validasi skema input berlapis menggunakan **Zod** (client dan server-side).
   - 100% Parameterized queries melalui **Prisma ORM** (anti-SQL Injection).
   - Sanitasi konten untuk mencegah Stored & Reflected XSS.
   - Konfigurasi **Security Headers** lengkap (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) dengan target skor A/A+ di *securityheaders.com*.
8. **Deployment & Publikasi**:
   - Di-hosting pada platform cloud publik (Vercel) dengan nama domain/subdomain FQDN (misal: `https://aegis-soc.vercel.app`).
   - Wajib beroperasi di bawah protokol **HTTPS dengan sertifikat SSL/TLS valid**.
   - Database cloud terisolasi (PostgreSQL via Neon / Supabase).
9. **Self-Testing Keamanan (5 Skenario Wajib)**:
   - Uji SQL Injection (Form login & parameter search).
   - Uji XSS (Form input insiden & preview).
   - Uji Otorisasi & IDOR (Bypass URL kasus TLP:RED oleh user non-authorized).
   - Uji Brute Force Login & Rate Limiting.
   - Uji Security Headers & Audit Dependency (`npm audit`).

### ❌ Out-of-Scope (Tidak Dikerjakan Agar Fokus & Efisien):
* Tidak mengintegrasikan ke SIEM pihak ketiga yang berbayar (seperti Splunk Cloud API atau IBM QRadar API nyata); integrasi disediakan melalui *mock ingestion endpoint* atau export CSV/JSON standar.
* Tidak mengeksekusi malware/payload di browser (sandbox dinamis); pengelolaan bukti difokuskan pada metadata forensik, hashing, dan *chain of custody*.
* Tidak menggunakan payment gateway atau fitur e-commerce karena di luar ranah SOC Platform.

---

## 4. Arsitektur Teknologi (Tech Stack)

| Komponen | Pilihan Teknologi | Alasan Keamanan & Performa |
|---|---|---|
| **Framework Utama** | **Next.js 14+ (App Router)** | Framework React full-stack dengan Server Components dan Server Actions, mengeksekusi kode rahasia hanya di server (zero client leak). |
| **Bahasa Pemrograman**| **TypeScript** (Strict Mode) | Type-safety penuh, meminimalkan error fatal runtime dan manipulasi tipe data payload. |
| **Styling & UI Kit** | **Tailwind CSS + Lucide Icons** | Utility-first, styling konsisten, antarmuka dark-mode modern bergaya Security Operations Center. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | Skema strongly typed, migrasi database otomatis, parameterized SQL queries bawaan (kebal SQL Injection). |
| **Database Hosting** | **Neon / Supabase Serverless** | Database PostgreSQL cloud serverless dengan koneksi SSL terenkripsi secara default. |
| **Autentikasi & Kripto**| **Bcryptjs + Jose / Secure Cookie**| Algoritma hashing teruji industri + cookie HttpOnly/Secure/SameSite mencegah pembajakan sesi. |
| **Validasi Skema** | **Zod** | Menolak payload liar, membersihkan whitespace, dan menegakkan tipe data ketat sebelum menyentuh logika bisnis. |
| **Visualisasi Data** | **Recharts** | Render grafik interaktif (Bar, Pie, Area) untuk metrik MTTD, MTTR, dan severity. |
| **Ekspor Laporan** | **jsPDF / AutoTable & CSV Engine** | Pembuatan berkas PDF laporan eksekutif dan CSV IOC secara dinamis di browser/server. |
| **Platform Hosting** | **Vercel** | FQDN publik otomatis, HTTPS SSL valid, edge network cepat, dan manajemen Environment Variable yang aman. |

---

## 5. Rencana Skema Database (Prisma Schema Overview)

1. **`User`**:
   - `id` (UUID), `name`, `email` (Unique), `password` (Hashed), `role` (`COMMANDER`, `RESPONDER`, `ANALYST`), `department`, `createdAt`, `updatedAt`.
2. **`IncidentCase`**:
   - `id` (UUID), `caseNumber` (misal: `INC-2026-001`), `title`, `description`, `category` (PHISHING, MALWARE, RANSOMWARE, UNAUTHORIZED_ACCESS, DDOS, DATA_LEAK), `severity` (CRITICAL, HIGH, MEDIUM, LOW), `tlp` (RED, AMBER, GREEN, WHITE), `status` (NEW, TRIAGED, CONTAINED, ERADICATED, CLOSED), `reportedById`, `assignedToId`, `detectedAt`, `containedAt`, `closedAt`, `createdAt`, `updatedAt`.
3. **`IOC` (Indicator of Compromise)**:
   - `id` (UUID), `caseId`, `type` (IP, DOMAIN, URL, MD5_HASH, SHA256_HASH, EMAIL), `value`, `threatLevel`, `notes`, `createdAt`.
4. **`Evidence` (Chain-of-Custody Artefact)**:
   - `id` (UUID), `caseId`, `name`, `fileHash` (SHA-256), `fileType`, `sourceDevice`, `collectedBy`, `description`, `createdAt`.
5. **`ContainmentTask`**:
   - `id` (UUID), `caseId`, `title`, `isCompleted`, `completedAt`, `completedBy`.
6. **`AuditLog` (Immutable Security Trail)**:
   - `id` (UUID), `userId` (Nullable jika failed login), `action`, `resource`, `status` (SUCCESS, FAILED, BLOCKED), `details` (JSON string), `ipAddress`, `userAgent`, `timestamp`.

---

## 6. Skenario Self-Testing Keamanan (Poin 3f Panduan)

Aplikasi akan dilengkapi dengan dokumentasi dan skenario uji mandiri berikut:

| No | Kategori Pengujian | Vektor Uji / Skenario | Target Hasil |
|---|---|---|---|
| 1 | **SQL Injection (SQLi)** | Injeksi query `' OR '1'='1` pada login email dan parameter search kasus | Input ditolak/disanitasi, ORM parameterized query memastikan query dieksekusi sebagai nilai literal, database aman. |
| 2 | **Cross-Site Scripting (XSS)** | Penyisipan `<script>alert(document.cookie)</script>` pada judul kasus, deskripsi, dan catatan IOC | Script tidak dieksekusi (*escaped* secara otomatis oleh framework dan disanitasi), cookie HttpOnly tidak dapat dibaca. |
| 3 | **Broken Access Control (IDOR & TLP)** | User berkedudukan `ANALYST` mencoba mengakses langsung URL kasus `TLP:RED` milik `COMMANDER` | Server merespons `403 Forbidden` dan mencatat insiden percobaan akses ilegal ke `AuditLog`. |
| 4 | **Brute Force & Rate Limiting** | Percobaan login berulang kali (lebih dari 5x gagal) dalam rentang 1 menit | Endpoint merespons `429 Too Many Requests`, akun terkunci sementara, event dicatat di log keamanan. |
| 5 | **Security Headers & Dependency Audit** | Pengujian via header scanner dan eksekusi `npm audit` di terminal | Nilai Security Headers A/A+ di web analyzer, 0 kerentanan kritis (*zero high/critical vulnerabilities*). |

---

## 7. Format Luaran Tugas & Laporan (EdLink Ready)
Sesuai instruksi Bagian 4 berkas panduan, proyek ini akan menghasilkan:
1. **Aplikasi Web Aktif**: `https://[nama-subdomain].vercel.app` (HTTPS, aktif 24/7).
2. **Repositori GitHub Publik**: Commit history bertahap dan rapi, tanpa *leaked secret*.
3. **Akun Uji Coba Siap Pakai**:
   - Akun Commander/Admin: `commander@aegissoc.io` / `PasswordAegis!2026`
   - Akun Responder: `responder@aegissoc.io` / `PasswordAegis!2026`
   - Akun Analyst: `analyst@aegissoc.io` / `PasswordAegis!2026`
4. **README.md Standar Industri**: Dokumentasi instalasi, teknologi, konfigurasi env, ringkasan pengujian keamanan, dan transparansi AI Agent.
5. **Draf Laporan PDF Akhir**: Tersusun sesuai poin 1–10 format panduan pengumpulan tugas.

---
*Dokumen ini menjadi acuan batas kerja (source of truth) seluruh proses pengembangan AegisSOC.*

