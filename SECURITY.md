# SECURITY POLICY & GUIDELINES: AegisSOC

Dokumen ini memuat kebijakan keamanan siber, standar kriptografi, dan kepatuhan mitigasi **OWASP Top 10** yang ditegakkan di seluruh lini aplikasi AegisSOC.

---

## 1. Standar Kriptografi & Manajemen Kredensial

1. **Hashing Password**:
   - Algoritma: `bcrypt` dengan *salt cost factor* minimal **12**.
   - Penolakan Password Lemah: Validasi regex Zod mewajibkan minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus (`@$!%*?&#^()_-+=`).
   - Larangan mutlak penyimpanan password dalam format *plaintext* atau *reversible encryption*.
2. **Manajemen Sesi & Token**:
   - Token otentikasi disimpan dalam cookie bertipe:
     - `HttpOnly`: Mencegah pembacaan cookie oleh script JavaScript (mitigasi XSS).
     - `Secure`: Wajib dikirim melalui kanal terenkripsi HTTPS pada mode produksi.
     - `SameSite=Lax`: Mencegah serangan *Cross-Site Request Forgery* (CSRF).
     - `Max-Age`: Berlaku maksimal 24 jam dengan mekanisme *explicit invalidation* saat pengguna menekan tombol Logout.
3. **Pengelolaan Secret & Kunci Lingkungan**:
   - Variabel rahasia seperti `DATABASE_URL` dan `JWT_SECRET` dikelola secara eksklusif melalui berkas `.env` lokal atau *Environment Variables* di dashboard Vercel.
   - Larangan keras men-commit berkas `.env` ke repositori publik Git (dicegah melalui aturan `.gitignore`).
   - Hanya variabel publik yang diawali dengan `NEXT_PUBLIC_` yang dapat diakses oleh client browser.

---

## 2. Mitigasi OWASP Top 10 Web Application Security

| Kategori OWASP | Risiko & Vektor Serangan | Mekanisme Pertahanan AegisSOC |
|---|---|---|
| **A01: Broken Access Control** | Penyerang mengakses kasus `TLP:RED` atau fungsi admin dengan mengganti ID di URL (IDOR). | Matriks RBAC & TLP dievaluasi di tingkat server pada setiap *query resolver*. Jika pengguna tidak memiliki wewenang, server segera melempar exception `403 Forbidden` dan mencatat insiden ke `AuditLog`. |
| **A02: Cryptographic Failures** | Kebocoran data sensitif akibat komunikasi tidak terenkripsi atau hashing lemah. | 1. Penegakan protokol wajib HTTPS dengan SSL/TLS valid.<br>2. Hashing password menggunakan `bcrypt` 12 rounds.<br>3. *Cryptographic hashing* SHA-256 untuk verifikasi bukti artefak. |
| **A03: Injection (SQLi & Command)** | Penyisipan perintah SQL jahat melalui kolom input form atau URL parameter. | 1. 100% interaksi database menggunakan parameterized query otomatis via **Prisma ORM**.<br>2. Validasi tipe data dan sanitasi input via **Zod schema** sebelum menyentuh lapisan database. |
| **A04: Insecure Design** | Ketiadaan perlindungan brute force terhadap akun dengan hak akses tinggi. | Implementasi *sliding-window rate limiter* pada rute login dan registrasi. |
| **A05: Security Misconfiguration** | Informasi server bocor melalui header respons HTTP atau ketiadaan proteksi browser. | Konfigurasi **Security Headers** ketat (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy). |
| **A06: Vulnerable Components** | Penggunaan pustaka pihak ketiga dengan kerentanan CVE yang diketahui. | Pelaksanaan audit rutin dependensi menggunakan `npm audit`. Menjaga skor 0 *high/critical vulnerabilities*. |
| **A07: Identification & Auth Failures** | Pemalsuan sesi atau serangan *credential stuffing*. | Pembaruan sesi yang aman, penolakan password mudah ditebak, dan masa kadaluarsa sesi yang terdefinisi. |
| **A08: Software & Data Integrity Failures** | Manipulasi integritas bukti forensik digital. | Setiap bukti digital yang didaftarkan ke *Evidence Locker* dihitung nilai hash SHA-256 dan disimpan secara permanen untuk menjaga *chain of custody*. |
| **A09: Security Logging & Monitoring Failures** | Aksi pembajakan atau percobaan serangan tidak terdeteksi. | Sistem *Audit Logging* merekam semua upaya login gagal, percobaan akses terlarang (IDOR), dan mutasi data sensitif secara detail (User, IP, User-Agent, Timestamp). |
| **A10: Server-Side Request Forgery (SSRF)** | Penyerang mengarahkan server untuk menghubungi jaringan internal. | Endpoint aplikasi tidak melakukan fetch sembarangan ke URL input luar tanpa validasi *whitelisting*. |

---

## 3. Konfigurasi Security Headers (Standar A+)

Header respons berikut diinjeksikan pada seluruh request HTTP:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
```

