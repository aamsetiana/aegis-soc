# Buku Panduan Penggunaan & Alur Operasional AegisSOC
**Enterprise Cyber Incident Response & SOC Case Management Platform**
*Sesuai Standar NIST SP 800-61 Rev. 2 & Kerangka Kerja OWASP Top 10*

---

## 1. Pengenalan Aplikasi
**AegisSOC** adalah platform manajemen investigasi dan penanganan insiden keamanan siber (*Incident Response*) yang dirancang untuk tim Security Operations Center (SOC). Platform ini memungkinkan analis keamanan, investigator forensik, dan pimpinan keamanan (CISO/Commander) untuk:
- Mendaftarkan dan mengklasifikasikan insiden siber secara terstruktur.
- Mengelola artefak indikator ancaman (*Indicators of Compromise / IOC*) seperti IP, domain, dan hash berkas berbahaya.
- Menjaga keabsahan bukti digital forensik (*Chain of Custody*) menggunakan algoritma kriptografi SHA-256.
- Menjalankan penanganan terkoordinasi (*Containment Tasks*) dan melacak durasi waktu penanganan (*MTTD* & *MTTR*).
- Menghasilkan laporan eksekutif formal (PDF) dan ekspor feed intelijen (CSV) untuk pimpinan dan regulator.

---

## 2. Kredensial Pengujian & Matriks Peran (RBAC)
Platform menyediakan 3 akun pengujian dengan hak akses berjenjang (*Principle of Least Privilege*):

| Peran (Role) | Email | Password | Hak Akses & Wewenang |
| :--- | :--- | :--- | :--- |
| **Incident Commander** *(Admin)* | `commander@aegissoc.io` | `PasswordAegis!2026` | Akses penuh seluruh modul, seluruh klasifikasi TLP (termasuk TLP:RED), mengubah seluruh status kasus, dan melihat seluruh log audit sistem. |
| **SOC Responder** *(Investigator)* | `responder@aegissoc.io` | `PasswordAegis!2026` | Menginvestigasi kasus, mengubah status siklus insiden, menambah IOC & bukti forensik, menyelesaikan tugas penanganan. Akses TLP: WHITE, GREEN, dan AMBER. |
| **Security Analyst** *(Tier-1 Triage)* | `analyst@aegissoc.io` | `PasswordAegis!2026` | Mendaftarkan insiden baru, mencatat temuan awal, melihat kasus terbuka. Dibatasi hanya pada TLP: WHITE dan GREEN. Dilarang mengakses TLP:RED & AMBER. |

---

## 3. Alur Kerja Operasional (NIST SP 800-61 Rev. 2 Lifecycle)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  1. Pendaftaran │ ───>  │ 2. Investigasi  │ ───>  │ 3. Penanganan   │ ───>  │ 4. Penyelesaian │
│  & Triage Awal  │       │ & Forensik SHA  │       │ & Isolasi Aset  │       │ & Laporan Akhir │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Langkah 1: Masuk ke Platform (Login)
1. Buka URL aplikasi: `http://localhost:3000/login` (atau URL Vercel live Anda).
2. Masukkan email salah satu akun demo di atas (misal: `commander@aegissoc.io`) dan password `PasswordAegis!2026`.
3. Klik tombol **Masuk ke SOC**. Anda akan diarahkan ke Dasbor Utama.

### Langkah 2: Memantau Dasbor Utama (`/dashboard`)
Di halaman Dasbor, Anda dapat melihat gambaran postur keamanan secara real-time:
- **5 Kartu Metrik:** Menampilkan total aktivitas firewall, deteksi malware, kesehatan sistem (98.7%), sesi aktif, dan jumlah IP yang diblokir.
- **Grafik Analisis & Volume:** Kurva *Breakdown* (lalu lintas masuk vs tertahan), *Volume Ancaman Mingguan*, serta *Aktivitas Firewall (Semi-Gauge 21%)*.
- **Tabel Antrean Peringatan (*Alert Queue*):** Menampilkan daftar insiden aktif hari ini. Klik pada salah satu ID kasus (misal `#INC-3127`) untuk langsung membuka dossier investigasinya.
- **Panel Operasional:** Metrik efisiensi SOC seperti rata-rata waktu deteksi (*MTTD: 14 menit*) dan rata-rata waktu respons (*MTTR: 42 menit*).

### Langkah 3: Melaporkan Insiden Baru (`/incidents/new`)
1. Klik tombol **Laporkan Insiden** di navigasi atas atau tombol **+ Laporkan Insiden Baru** di halaman `/incidents`.
2. Isi formulir sesuai temuan insiden:
   - **Judul Insiden:** Nama ringkas insiden (contoh: `Indikasi Kebocoran Kredensial Admin via Phishing`).
   - **Kronologi & Temuan Awal:** Deskripsikan kronologi waktu, indikasi anomali, dan dampak pada sistem.
   - **Sistem / Host Terdampak:** Sebutkan nama server/IP (contoh: `SRV-AUTH-01, 10.0.4.15`).
   - **Kategori Serangan:** Pilih dari dropdown (*Serangan Phishing, Infeksi Malware, Ransomware, Akses Tanpa Izin, DDoS*, dll).
   - **Tingkat Keparahan (Severity):** Pilih *Kritis*, *Tinggi*, *Sedang*, atau *Rendah*.
   - **Klasifikasi TLP 2.0:** Pilih tingkat kerahasiaan (*TLP:RED, TLP:AMBER, TLP:GREEN, TLP:WHITE*).
3. Klik **Simpan & Daftarkan Insiden**. Sistem akan menghasilkan nomor tiket unik (format: `INC-2026-XXXX`) dan mencatat event pembuatan ke audit log.

### Langkah 4: Melakukan Investigasi & Pengayaan Kasus (`/incidents/[id]`)
Setelah kasus terbuka, terdapat 4 tab navigasi dossier:
- **Tab 1: Ringkasan Kasus (`Overview`):** Menampilkan deskripsi kronologi, sistem terdampak, identitas pelapor, serta kalkulasi waktu penanganan (*MTTR*).
- **Tab 2: Indikator Ancaman (`IOC`):**
  - Masukkan artefak berbahaya yang ditemukan (contoh: IP penyerang `185.220.101.5` atau hash malware).
  - Pilih tipe indikator (*Alamat IP, Nama Domain, Hash SHA-256, Tautan URL*).
  - Klik **Simpan Indikator Ancaman**. Data langsung tersimpan di database Neon dan muncul di katalog intelijen.
- **Tab 3: Gudang Bukti Forensik (`Evidence Vault`):**
  - Masukkan nama berkas bukti (contoh: `memory_dump_srv01.raw` atau `pcap_capture.pcap`).
  - Masukkan nilai **Hash SHA-256** berkas untuk menjamin keutuhan bukti (*anti-tampering*).
  - Masukkan nama perangkat sumber (*Source Device*).
- **Tab 4: Tugas Penanganan (`Containment Tasks`):**
  - Tambahkan checklist tindakan teknis (contoh: `Blokir IP 185.220.101.5 pada Edge Firewall`, `Isolasi VLAN Server SRV-AUTH-01`, `Reset kredensial akun terkompromi`).
  - Saat tindakan selesai dilakukan oleh tim, klik lingkaran checklist untuk menandainya sebagai **Selesai**. Sistem akan mencatat siapa yang menyelesaikan tugas dan waktu penyelesaiannya.

### Langkah 5: Memperbarui Status Siklus Insiden
Di bagian atas dossier kasus, pengguna berwenang (*Commander* atau *Responder*) dapat mengubah dropdown status siklus:
- **Baru (*New*)** ➔ Kasus baru dilaporkan.
- **Ditelaah (*Triaged*)** ➔ Investigator mulai menganalisis dampak dan bukti.
- **Terkendali (*Contained*)** ➔ Sistem terdampak telah diisolasi dari jaringan utama.
- **Dibasmi (*Eradicated*)** ➔ Malware atau akses penyerang telah dibersihkan sepenuhnya.
- **Selesai (*Closed*)** ➔ Seluruh verifikasi selesai, durasi MTTR dihitung otomatis.

### Langkah 6: Membuat & Mengunduh Laporan Resmi (`/reports`)
1. Buka menu **Laporan Eksekutif** di sidebar.
2. Di halaman ini tersedia dua jenis ekspor:
   - **Ekspor Dokumen PDF Resmi:**
     - Pilih cakupan: *Ringkasan Kasus*, *Kasus + Feed IOC*, atau *Laporan Lengkap Forensik*.
     - Klik **Unduh Dokumen PDF Resmi**. Sistem secara otomatis menghasilkan berkas PDF berformat rapi dengan kop resmi AegisSOC, tabel rekapitulasi, status TLP, dan rekomendasi remediasi NIST SP 800-61 Rev. 2. Dokumen ini dapat langsung dilampirkan ke EdLink.
   - **Ekspor Data Mentah Spreadsheet (CSV):**
     - Klik **Unduh Rekapitulasi Kasus (CSV)** untuk analisis spreadsheet Excel.
     - Klik **Unduh Feed IOC (CSV)** untuk diintegrasikan ke firewall/IDS.

---

## 4. Panduan Demonstrasi Fitur Keamanan (Untuk Pengujian / Dosen)

Saat mendemonstrasikan aspek keamanan aplikasi di hadapan dosen penguji, lakukan langkah berikut:

### Skenario A: Uji Coba Isolasi Otorisasi (IDOR & TLP 2.0)
1. Login sebagai **Analyst** (`analyst@aegissoc.io`).
2. Perhatikan halaman `/incidents`: Kasus berlabel **TLP:RED** dan **TLP:AMBER** otomatis tidak ditampilkan (*hidden*).
3. Cobalah mengetikkan langsung ID kasus TLP:RED pada address bar URL (misal: `/incidents/clx...red`).
4. **Hasil Keamanan:** Server langsung menolak dengan status **403 Forbidden**, dan peristiwa pelanggaran akses dicatat otomatis ke menu *Jejak Audit* sebagai `UNAUTHORIZED_ACCESS_ATTEMPT - BLOCKED`.

### Skenario B: Uji Coba Jejak Audit Real-Time (*Immutable Audit Trail*)
1. Login kembali sebagai **Commander** (`commander@aegissoc.io`).
2. Buka menu **Jejak Audit (Logs)** di `/audit-logs`.
3. Perhatikan tabel log: Setiap kali login, logout, pembuatan insiden, perubahan status, atau percobaan akses terlarang (IDOR) tercatat permanen lengkap dengan:
   - Waktu kejadian presisi.
   - Nama pengguna dan perannya.
   - Alamat IP asal.
   - Status (*BERHASIL* atau *DIBLOKIR*).

### Skenario C: Uji Coba Perlindungan Brute Force (Rate Limiting)
1. Buka halaman `/login`.
2. Masukkan password yang salah berturut-turut sebanyak 5 kali.
3. **Hasil Keamanan:** Pada percobaan ke-6, server langsung memblokir sementara percobaan login dari IP tersebut dan menampilkan pesan penolakan (*Too Many Requests / Akun terkunci sementara*).

### Skenario D: Uji Coba Kepatuhan Kriptografi & Sanitasi (SQLi & XSS)
1. Buka menu **Kepatuhan Keamanan** di `/security`.
2. Halaman ini merangkum 6 kontrol keamanan bawaan serta **5 skenario uji mandiri (*Self-Testing Matrix*)** yang siap dipresentasikan, membuktikan sistem 100% menggunakan *Parameterized Queries Prisma* dan *JSX React Sanitization*.

---

## 5. Ringkasan Sitemap & Rute Aplikasi

| Rute URL | Nama Modul | Fungsi Utama |
| :--- | :--- | :--- |
| `/login` | Otentikasi Masuk | Form login dengan proteksi sliding-window rate limit & password hashing. |
| `/register` | Registrasi Akun | Pendaftaran analis SOC baru dengan validasi kata sandi kuat. |
| `/dashboard` | Dasbor Utama | Monitoring telemetri keamanan, grafik tren insiden, antrean kasus, dan performa MTTD/MTTR. |
| `/incidents` | Kasus Insiden | Katalog kasus insiden aktif dengan filter status dan isolasi hak akses TLP. |
| `/incidents/new` | Lapor Kasus Baru | Formulir pendaftaran insiden terstandarisasi NIST SP 800-61 Rev. 2. |
| `/incidents/[id]` | Dossier Investigasi | Manajemen investigasi kasus, pencatatan IOC, gudang bukti forensik SHA-256, dan checklist tindakan. |
| `/ioc` | Katalog IOC | Threat Intelligence feed seluruh indikator ancaman (IP, domain, hash) terintegrasi. |
| `/reports` | Pusat Laporan | Generator laporan PDF resmi eksekutif dan ekspor data CSV. |
| `/audit-logs` | Jejak Audit | Rekaman seluruh riwayat aktivitas sistem yang tidak dapat diubah (*immutable*). |
| `/team` | Tim & RBAC | Matriks peran pengguna dan pembagian kewenangan *Least Privilege*. |
| `/security` | Kontrol Keamanan | Dokumentasi mitigasi OWASP Top 10 dan matriks 5 skenario uji mandiri. |
