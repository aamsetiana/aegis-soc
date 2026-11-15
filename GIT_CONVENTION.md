# GIT & COMMIT CONVENTION: AegisSOC

Dokumen ini mendefinisikan standar pengerjaan repositori Git untuk memastikan kepatuhan terhadap **Ketentuan Teknis Poin 3d** berkas tugas besar:
> *"Riwayat commit harus mencerminkan pengerjaan bertahap oleh mahasiswa sendiri."*

---

## 1. Format Conventional Commits

Setiap commit wajib mengikuti format standar industri berikut:

```text
<tipe>(<lingkup/cakupan>): <deskripsi singkat dalam bahasa indonesia/inggris>

[opsional: penjelasan rinci perubahan dan alasan keamanan]
```

### Tipe Commit yang Digunakan:
* `feat`: Penambahan fitur baru (misal: registrasi, modul insiden, export PDF).
* `security`: Implementasi atau perbaikan kontrol keamanan (misal: rate limiting, hashing password, isolasi IDOR, security headers).
* `fix`: Perbaikan bug atau celah penanganan data.
* `test`: Penambahan skenario pengujian mandiri (*self-testing*) atau unit test.
* `docs`: Pembaruan dokumentasi (README, dokumen arsitektur, laporan pengujian).
* `chore`: Konfigurasi dependensi, build tool, atau setup lingkungan pengembangan.

---

## 2. Rencana Riwayat Commit Bertahap (Staged Commit Plan)

Untuk merefleksikan proses pengembangan bertahap yang realistis dan profesional bagi mahasiswa, tahapan commit direncanakan sebagai berikut:

1. `chore(init): inisialisasi project Next.js TypeScript, konfigurasi Tailwind dan Prisma ORM`
2. `docs(spec): penyusunan dokumen acuan AGENT.md, ARCHITECTURE.md, dan SECURITY.md`
3. `feat(db): perancangan skema database Prisma untuk User, Incident, IOC, Evidence, dan AuditLog`
4. `feat(auth): implementasi registrasi dan login dengan hashing bcrypt dan verifikasi password kuat`
5. `security(auth): penerapan cookie sesi HttpOnly/Secure/SameSite dan sliding-window rate limiter`
6. `feat(rbac): implementasi middleware otorisasi berbasis peran (Commander, Responder, Analyst)`
7. `feat(incidents): modul CRUD pendaftaran kasus insiden dan penanganan siklus hidup NIST SP 800-61`
8. `security(idor): penegakan kontrol akses data bertingkat berdasarkan Traffic Light Protocol (TLP 2.0)`
9. `feat(evidence): modul evidence vault dengan perhitungan checksum SHA-256 untuk menjaga chain of custody`
10. `feat(dashboard): perancangan visualisasi metrik keamanan (MTTD, MTTR, grafik distribusi ancaman)`
11. `feat(reports): implementasi generator laporan eksekutif PDF dan ekspor threat intelligence feed CSV`
12. `security(headers): injeksi security headers lengkap (CSP, HSTS, X-Frame-Options) dengan skor A+`
13. `test(security): eksekusi 5 skenario self-testing keamanan (SQLi, XSS, IDOR, brute force, header audit)`
14. `docs(readme): finalisasi README.md repositori dan panduan instalasi lokal`
15. `chore(deploy): konfigurasi environment variable dan setup deployment publik Vercel`

