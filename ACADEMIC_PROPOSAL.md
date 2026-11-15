# ACADEMIC PROPOSAL: Rencana Riset Skripsi Tingkat 4

Dokumen ini disusun untuk memenuhi **Kriteria 5 Rubrik Penilaian Tugas Besar (Bobot 15%: Orisinalitas & Potensi Skripsi)** serta panduan penulisan **Poin 6 Dokumen Laporan EdLink**.

---

## 1. Usulan Judul Skripsi
> **"Rancang Bangun Sistem Manajemen Kasus Insiden Keamanan Siber (Incident Response Case Management System) Mengadopsi Standar NIST SP 800-61 Rev. 2 dan Traffic Light Protocol (TLP 2.0) untuk Efisiensi Penanganan Insiden dan Kepatuhan Forensik"**

---

## 2. Latar Belakang Masalah
Di era digitalisasi masif dan maraknya serangan siber (*ransomware, credential harvesting, data breach*), organisasi di Indonesia dituntut memiliki kapabilitas tanggap darurat (*Incident Response*) yang cepat dan terukur, terlebih pasca berlakunya UU Pelindungan Data Pribadi (UU PDP No. 27/2022). 

Namun, banyak organisasi skala menengah ke bawah masih mengelola insiden keamanan secara ad-hoc menggunakan spreadsheet atau grup perpesanan instan. Praktik ini menimbulkan beberapa kelemahan kritis:
1. **Kebocoran Informasi Sensitif**: Ketiadaan mekanisme isolasi data rahasia (*information leakage*) di internal tim.
2. **Kompromi Integritas Bukti Forensik**: Barang bukti digital (*artefak, dump file, file log*) rawan rusak atau diragukan legalitasnya (*chain of custody* tidak terbukti).
3. **Lambatnya Waktu Tanggap**: Tidak adanya standardisasi penanganan berdasarkan siklus hidup insiden terstruktur sehingga metrik MTTD (*Mean Time to Detect*) dan MTTR (*Mean Time to Respond*) menjadi sangat tinggi.

Aplikasi **AegisSOC** dikembangkan sebagai fondasi sistem tanggap insiden enterprise yang menjawab langsung permasalahan tersebut.

---

## 3. Rumusan Masalah Ilmiah
1. Bagaimana merancang arsitektur sistem manajemen kasus insiden keamanan siber yang mengintegrasikan panduan siklus penanganan **NIST SP 800-61 Rev. 2** (*Preparation, Detection & Analysis, Containment, Eradication, Post-Incident Activity*)?
2. Bagaimana menerapkan model kontrol akses berbasis **Traffic Light Protocol (TLP 2.0)** dan **Role-Based Access Control (RBAC)** untuk mencegah serangan *Broken Object Level Authorization* (BOLA/IDOR) terhadap kasus insiden berkategori sangat rahasia?
3. Bagaimana menjamin keabsahan dan integritas barang bukti digital (*digital chain of custody*) menggunakan *cryptographic hashing* pada sistem manajemen kasus berbasis web?
4. Seberapa besar peningkatan efisiensi respon penanganan insiden (diukur melalui metrik MTTR) sebelum dan sesudah penerapan sistem terotomasi ini?

---

## 4. Tujuan & Manfaat Penelitian
* **Tujuan**:
  1. Menghasilkan platform *Incident Response Case Management System* yang aman, modular, dan mematuhi kerangka kerja NIST SP 800-61 Rev. 2.
  2. Mengimplementasikan kebijakan kontrol akses TLP 2.0 di level arsitektur perangkat lunak untuk menjaga kerahasiaan data insiden.
  3. Membangun modul *Evidence Vault* dengan verifikasi hash SHA-256 untuk menjaga rantai integritas bukti forensik digital.
* **Manfaat**:
  - Menyediakan sistem operasional bagi tim *Blue Team / SOC Analyst* dalam melakukan triase dan kolaborasi penanganan insiden secara sistematis.
  - Menjadi studi kasus penerapan *Secure Software Development Life Cycle* (SSDLC) pada ranah aplikasi manajemen keamanan siber.

---

## 5. Rencana Fitur Lanjutan untuk Skripsi Tingkat 4
Fitur-fitur lanjutan yang direncanakan untuk diintegrasikan pada pengerjaan skripsi penuh:
1. **Automated SIEM Alert Ingestion**: Mengintegrasikan webhook API penerima alert otomatis dari *Wazuh EDR* atau *Suricata IDS*.
2. **Threat Intelligence API Enrichment**: Otomasi pencarian reputasi IP/Domain berbahaya secara real-time melalui integrasi API *VirusTotal* dan *AbuseIPDB*.
3. **Automated Playbook Execution (SOAR)**: Otomasi aksi mitigasi (seperti memblokir IP di firewall Mikrotik/Pfsense melalui webhook playbook).
4. **Digital Signature pada Laporan Post-Incident**: Penerapan tanda tangan digital kriptografis (ECDSA / X.509) pada laporan PDF untuk keabsahan hukum audit kepatuhan.

