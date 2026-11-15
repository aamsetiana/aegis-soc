# TESTING PLAYBOOK: Security Self-Testing (AegisSOC)

Dokumen ini merupakan panduan pengujian keamanan mandiri (*self-testing*) sesuai ketentuan **Poin 3f** berkas tugas besar. Dokumen ini mendokumentasikan skenario uji nyata, vektor serangan (payload), prosedur eksekusi, serta hasil verifikasi keamanan (*before vs after fix*).

---

## 1. Metodologi Pengujian
Pengujian dilakukan dengan kombinasi pendekatan:
1. **Manual Black-Box Testing**: Pengujian input secara langsung melalui antarmuka web dan manipulasi request browser.
2. **Automated & Tool-Based Testing**:
   - `curl` / Postman untuk pengujian *header tampering* dan simulasi *brute force*.
   - Browser DevTools (Network & Application tab) untuk inspeksi atribut keamanan cookie.
   - Pengecekan Security Headers daring (*securityheaders.com*).
   - Audit Kerentanan Dependensi melalui terminal (`npm audit`).

---

## 2. Matriks 5 Skenario Self-Testing Wajib

| Skenario ID | Target Pengujian | Vektor Serangan / Payload Uji | Cara Pengujian | Hasil yang Diharapkan | Status Hasil |
|---|---|---|---|---|---|
| **SEC-TEST-01** | **SQL Injection (SQLi)** pada Form Autentikasi & Pencarian | Payload: `' OR '1'='1' --`<br>`admin'--`<br>`' UNION SELECT null, username, password FROM "User"--` | Masukkan payload ke dalam form login email, password, dan kotak filter pencarian kasus insiden. | Sistem menolak login (kredensial tidak valid), tidak ada eksekusi SQL liar, query dijalankan sebagai *literal string* via Prisma ORM parameterized queries. | **LOLOS (PASS)** |
| **SEC-TEST-02** | **Cross-Site Scripting (Stored & Reflected XSS)** | Payload: `<script>alert('XSS-DETECTED')</script>`<br>`<img src=x onerror=alert(1)>`<br>`javascript:alert(document.domain)` | Input payload pada judul kasus, deskripsi investigasi, dan catatan IOC. Simpan lalu render halaman detail kasus. | Tag HTML di-*escape* secara otomatis oleh engine React/Next.js dan divalidasi oleh Zod. Payload tampil murni sebagai teks biasa tanpa pernah dieksekusi di browser. | **LOLOS (PASS)** |
| **SEC-TEST-03** | **Broken Object Level Authorization (IDOR & TLP Bypass)** | Manipulasi direct URL `/incidents/[id]` kasus berkategori `TLP:RED` menggunakan akun berkedudukan `ANALYST`. | 1. Login sebagai `ANALYST`.<br>2. Buka URL langsung kasus `TLP:RED` milik `COMMANDER`. | Server merespons `403 Forbidden` atau me-redirect pengguna dengan pesan peringatan keamanan. Percobaan akses ilegal dicatat ke `AuditLog`. | **LOLOS (PASS)** |
| **SEC-TEST-04** | **Brute Force & Rate Limiting** | Otomasi pengiriman 15 percobaan login gagal berturut-turut dalam rentang 30 detik untuk satu alamat IP/email. | Eksekusi script pengulangan curl POST ke `/api/auth/login` dengan password salah. | Percobaan 1–5 ditolak dengan status 401 (*Invalid credentials*). Mulai percobaan ke-6, server memblokir dengan respons **429 Too Many Requests**. | **LOLOS (PASS)** |
| **SEC-TEST-05** | **Security Headers & Dependency Audit** | Inspeksi header HTTP respons server dan audit keamanan paket `node_modules`. | 1. Eksekusi `npm audit` di terminal.<br>2. Verifikasi header respons via cURL (`curl -I https://[domain]`). | Skor Security Headers **A / A+** (CSP, HSTS, X-Frame-Options aktif). `npm audit` menghasilkan **0 vulnerabilities**. Tidak ada secret `.env` di repositori Git. | **LOLOS (PASS)** |

---

## 3. Detail Prosedur & Bukti Perbaikan (Before vs After Remediation)

### Skenario 1: Penanganan SQL Injection
* **Sebelum Perbaikan (Vulnerable Pattern)**:
  ```typescript
  // Rentan: Penggabungan string langsung (concatenation)
  const result = await db.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = '${email}'`);
  ```
* **Setelah Perbaikan (AegisSOC Secure Pattern)**:
  ```typescript
  // Aman: Parameterized query melalui Prisma ORM dengan skema validasi Zod
  const validatedEmail = z.string().email().parse(email);
  const user = await prisma.user.findUnique({
    where: { email: validatedEmail }
  });
  ```
* **Hasil**: Payload SQLi tidak dapat mengubah struktur sintaks query SQL database.

---

### Skenario 2: Pencegahan Cross-Site Scripting (XSS)
* **Sebelum Perbaikan**:
  ```tsx
  // Rentan: Render HTML mentah tanpa sanitasi
  <div dangerouslySetInnerHTML={{ __html: incident.description }} />
  ```
* **Setelah Perbaikan (AegisSOC Secure Pattern)**:
  ```tsx
  // Aman: React JSX default auto-escaping dan validasi schema Zod
  <p className="text-sm text-slate-300 break-words whitespace-pre-wrap">
    {incident.description}
  </p>
  ```
* **Hasil**: Payload `<script>alert(1)</script>` di-render literal sebagai string teks, tidak ada kode JavaScript yang dieksekusi di context DOM pengguna.

---

### Skenario 3: Pencegahan IDOR & Penegakan TLP
* **Sebelum Perbaikan**:
  ```typescript
  // Rentan: Hanya mencari berdasarkan ID tanpa memeriksa wewenang peran
  const incident = await prisma.incidentCase.findUnique({ where: { id: caseId } });
  return NextResponse.json(incident);
  ```
* **Setelah Perbaikan (AegisSOC Secure Pattern)**:
  ```typescript
  // Aman: Verifikasi otorisasi RBAC & aturan TLP secara server-side
  const session = await getSession();
  const incident = await prisma.incidentCase.findUnique({ where: { id: caseId } });
  
  if (!incident) return notFound();
  
  // Aturan TLP:RED hanya untuk COMMANDER atau penugasan eksplisit
  if (incident.tlp === 'RED' && session.role !== 'COMMANDER' && incident.assignedToId !== session.userId) {
    await logSecurityAudit({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resource: `INCIDENT:${caseId}`,
      status: 'BLOCKED',
      userId: session.userId
    });
    return forbiddenResponse();
  }
  ```
* **Hasil**: Permintaan akses tidak sah diblokir seketika dan upaya pembobolan tercatat di log audit.

---

### Skenario 4: Proteksi Brute Force & Rate Limiting
* **Sebelum Perbaikan**:
  Endpoint login tidak memiliki batasan request, penyerang dapat menjalankan wordlist ratusan password per detik.
* **Setelah Perbaikan (AegisSOC Secure Pattern)**:
  Implementasi algoritma *Sliding Window Rate Limiter* di `lib/security/rate-limit.ts`.
  - Ambang batas: 5 percobaan gagal per alamat IP dalam 300 detik.
  - Sanksi: Mengembalikan header `Retry-After` dan status kode `429 Too Many Requests`.
* **Hasil**: Penyerang terhenti secara efektif, beban server tetap terjaga aman.

