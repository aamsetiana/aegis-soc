import {
  PrismaClient,
  Role,
  Severity,
  TLP,
  IncidentStatus,
  IncidentCategory,
  IOCType,
  AuditAction,
  AuditStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🛡️  Memulai proses database seeding AegisSOC ke Neon PostgreSQL...')

  // Hashing password pengujian menggunakan bcrypt salt 12
  const hashedPassword = await bcrypt.hash('PasswordAegis!2026', 12)

  // 1. Buat 3 Akun Pengujian Sesuai Matriks RBAC
  console.log('👤 Membuat akun pengguna pengujian (Commander, Responder, Analyst)...')

  const commander = await prisma.user.upsert({
    where: { email: 'commander@aegissoc.io' },
    update: {},
    create: {
      name: 'Ahmad Komandan (Admin)',
      email: 'commander@aegissoc.io',
      password: hashedPassword,
      role: Role.COMMANDER,
      department: 'Security Operations Command',
    },
  })

  const responder = await prisma.user.upsert({
    where: { email: 'responder@aegissoc.io' },
    update: {},
    create: {
      name: 'Budi Responder (Investigator)',
      email: 'responder@aegissoc.io',
      password: hashedPassword,
      role: Role.RESPONDER,
      department: 'Digital Forensics & IR Team',
    },
  })

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@aegissoc.io' },
    update: {},
    create: {
      name: 'Citra Analyst (Tier-1)',
      email: 'analyst@aegissoc.io',
      password: hashedPassword,
      role: Role.ANALYST,
      department: 'SOC Tier-1 Monitoring',
    },
  })

  console.log('✅ Akun pengguna berhasil disiapkan.')

  // 2. Buat Kasus Insiden Realistis (NIST SP 800-61 Life Cycle)
  console.log('🚨 Mendaftarkan kasus-kasus insiden keamanan...')

  // Kasus 1: Critical Ransomware (TLP:RED)
  const inc1 = await prisma.incidentCase.upsert({
    where: { caseNumber: 'INC-4271' },
    update: {},
    create: {
      caseNumber: 'INC-4271',
      title: 'Core-Api Volumetric Ransomware & Ingestion Attack',
      description:
        'Aktivitas ransomware LockBit 3.0 terdeteksi pada server Core-API dan storage cluster. Beberapa file log terenkripsi dengan ekstensi .lockbit. Diperlukan isolasi jaringan segera untuk mencegah penyebaran lateral.',
      category: IncidentCategory.RANSOMWARE,
      severity: Severity.CRITICAL,
      tlp: TLP.RED,
      status: IncidentStatus.NEW,
      affectedSystems: 'CORE-API-CLUSTER, STORAGE-NAS-01, DB-PRIMARY',
      reportedById: commander.id,
      assignedToId: responder.id,
      detectedAt: new Date(Date.now() - 3600000 * 4),
    },
  })

  // Kasus 2: Phishing Campaign (TLP:AMBER)
  const inc2 = await prisma.incidentCase.upsert({
    where: { caseNumber: 'INC-3130' },
    update: {},
    create: {
      caseNumber: 'INC-3130',
      title: 'HR-portal Mass Phishing & Credential Harvest',
      description:
        'Kampanye email phishing massal meniru tampilan login Microsoft 365 yang menargetkan seluruh staf departemen HR. Dua pengguna terindikasi telah memasukkan kredensial pada landing page palsu.',
      category: IncidentCategory.PHISHING,
      severity: Severity.HIGH,
      tlp: TLP.AMBER,
      status: IncidentStatus.TRIAGED,
      affectedSystems: 'HR-PORTAL-WEB, MAIL-GATEWAY-02',
      reportedById: analyst.id,
      assignedToId: responder.id,
      detectedAt: new Date(Date.now() - 3600000 * 12),
    },
  })

  // Kasus 3: Network Firewall Drop Spikes (TLP:AMBER)
  const inc3 = await prisma.incidentCase.upsert({
    where: { caseNumber: 'INC-3127' },
    update: {},
    create: {
      caseNumber: 'INC-3127',
      title: 'Network-Firewall Anomaly & Packet Drop Spikes',
      description:
        'Lonjakan paket drop pada firewall perbatasan (border firewall). Terdeteksi port scanning masif (SYN scan) terhadap port 22, 80, 443, dan 3389 dari subnet IP luar negeri.',
      category: IncidentCategory.DDOS,
      severity: Severity.HIGH,
      tlp: TLP.AMBER,
      status: IncidentStatus.CONTAINED,
      affectedSystems: 'EDGE-FW-01, DMZ-ROUTER-01',
      reportedById: analyst.id,
      assignedToId: responder.id,
      detectedAt: new Date(Date.now() - 3600000 * 24),
      containedAt: new Date(Date.now() - 3600000 * 18),
    },
  })

  // Kasus 4: Unauthorized Access (TLP:GREEN)
  const inc4 = await prisma.incidentCase.upsert({
    where: { caseNumber: 'INC-3134' },
    update: {},
    create: {
      caseNumber: 'INC-3134',
      title: 'Payment-Gateway Unauthorized API Token Replay',
      description:
        'Upaya replay serangan authorization token pada endpoint pembayaran internal dari alamat IP eksternal yang tidak dikenal. Permintaan berhasil digagalkan oleh gateway rate limiter.',
      category: IncidentCategory.UNAUTHORIZED_ACCESS,
      severity: Severity.MEDIUM,
      tlp: TLP.GREEN,
      status: IncidentStatus.ERADICATED,
      affectedSystems: 'PAYMENT-API-GATEWAY',
      reportedById: analyst.id,
      assignedToId: responder.id,
      detectedAt: new Date(Date.now() - 3600000 * 48),
      containedAt: new Date(Date.now() - 3600000 * 40),
      eradicatedAt: new Date(Date.now() - 3600000 * 30),
    },
  })

  // Kasus 5: SSH Brute Force (TLP:GREEN)
  const inc5 = await prisma.incidentCase.upsert({
    where: { caseNumber: 'INC-3140' },
    update: {},
    create: {
      caseNumber: 'INC-3140',
      title: 'Server-Auth Multiple Failed SSH Root Logins',
      description:
        'Percobaan login SSH brute force sebanyak 1,420 kali dalam 15 menit terhadap server pengembangan DEV-SRV-04. Alamat IP penyerang telah diblokir secara permanen di iptables.',
      category: IncidentCategory.UNAUTHORIZED_ACCESS,
      severity: Severity.MEDIUM,
      tlp: TLP.GREEN,
      status: IncidentStatus.CLOSED,
      affectedSystems: 'DEV-SRV-04',
      reportedById: analyst.id,
      assignedToId: responder.id,
      detectedAt: new Date(Date.now() - 3600000 * 96),
      containedAt: new Date(Date.now() - 3600000 * 94),
      eradicatedAt: new Date(Date.now() - 3600000 * 90),
      closedAt: new Date(Date.now() - 3600000 * 85),
    },
  })

  console.log('✅ Kasus-kasus insiden berhasil didaftarkan.')

  // 3. Tambahkan IOC (Indicators of Compromise)
  console.log('🔍 Mendaftarkan indikator ancaman (IOCs)...')
  await prisma.iOC.createMany({
    data: [
      {
        caseId: inc1.id,
        type: IOCType.SHA256_HASH,
        value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        threatLevel: Severity.CRITICAL,
        notes: 'Hash biner malware payload ransomware',
      },
      {
        caseId: inc1.id,
        type: IOCType.IP_ADDRESS,
        value: '185.220.101.47',
        threatLevel: Severity.CRITICAL,
        notes: 'IP C2 Command & Control Server TOR exit node',
      },
      {
        caseId: inc2.id,
        type: IOCType.URL,
        value: 'https://login-microsoft365-verify.phishingsite.ru/auth',
        threatLevel: Severity.HIGH,
        notes: 'Credential harvest landing page',
      },
      {
        caseId: inc2.id,
        type: IOCType.EMAIL,
        value: 'admin-support@microsoft-security-alert.cc',
        threatLevel: Severity.HIGH,
        notes: 'Alamat pengirim email phishing',
      },
      {
        caseId: inc3.id,
        type: IOCType.IP_ADDRESS,
        value: '45.142.212.100',
        threatLevel: Severity.HIGH,
        notes: 'Sumber scanning DDoS port scanner',
      },
      {
        caseId: inc5.id,
        type: IOCType.IP_ADDRESS,
        value: '194.165.16.98',
        threatLevel: Severity.MEDIUM,
        notes: 'IP penyerang SSH brute-force',
      },
    ],
  })

  // 4. Tambahkan Artefak Bukti Forensik (Evidence Locker)
  console.log('🔐 Mendaftarkan artefak bukti forensik digital...')
  await prisma.evidence.createMany({
    data: [
      {
        caseId: inc1.id,
        name: 'lockbit_payload_sample.bin',
        fileHash: 'a7c8e9b0d1f2a3c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
        fileType: 'application/octet-stream',
        sourceDevice: 'STORAGE-NAS-01',
        description: 'Sampel biner ransomware yang diekstraksi dari memory dump',
        collectedById: responder.id,
      },
      {
        caseId: inc2.id,
        name: 'phishing_raw_email_header.eml',
        fileHash: 'f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5',
        fileType: 'message/rfc822',
        sourceDevice: 'MAIL-GATEWAY-02',
        description: 'Header email asli lengkap dengan DKIM/SPF fail analysis',
        collectedById: responder.id,
      },
    ],
  })

  // 5. Tambahkan Containment Tasks
  console.log('📋 Mendaftarkan checklist mitigasi & containment...')
  await prisma.containmentTask.createMany({
    data: [
      {
        caseId: inc1.id,
        title: 'Isolasi host CORE-API-CLUSTER dari VLAN utama',
        isCompleted: true,
        completedById: responder.id,
        completedAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        caseId: inc1.id,
        title: 'Blokir IP C2 185.220.101.47 pada border firewall',
        isCompleted: true,
        completedById: responder.id,
        completedAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        caseId: inc1.id,
        title: 'Lakukan pemindaian memori pada server terhubung',
        isCompleted: false,
      },
      {
        caseId: inc1.id,
        title: 'Restore data dari immutable offline backup',
        isCompleted: false,
      },
      {
        caseId: inc2.id,
        title: 'Reset password dan revoke sesi 2 pengguna terdampak',
        isCompleted: true,
        completedById: responder.id,
        completedAt: new Date(Date.now() - 3600000 * 10),
      },
      {
        caseId: inc2.id,
        title: 'Blacklist domain phishingsite.ru pada DNS Resolver perusahaan',
        isCompleted: false,
      },
    ],
  })

  // 6. Tambahkan Log Audit Awal
  console.log('📜 Mencatat security audit trail awal...')
  await prisma.auditLog.createMany({
    data: [
      {
        action: AuditAction.LOGIN_SUCCESS,
        userId: commander.id,
        resource: 'AUTH',
        status: AuditStatus.SUCCESS,
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AegisSOC-Admin',
      },
      {
        action: AuditAction.INCIDENT_CREATED,
        userId: commander.id,
        resource: `INCIDENT:${inc1.id}`,
        status: AuditStatus.SUCCESS,
        details: { caseNumber: 'INC-4271', severity: 'CRITICAL', tlp: 'RED' },
        ipAddress: '192.168.1.10',
      },
      {
        action: AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
        userId: analyst.id,
        resource: `INCIDENT:${inc1.id}`,
        status: AuditStatus.BLOCKED,
        details: { reason: 'Analyst role denied access to TLP:RED case', idor_prevented: true },
        ipAddress: '192.168.1.25',
      },
      {
        action: AuditAction.RATE_LIMIT_TRIGGERED,
        resource: 'AUTH',
        status: AuditStatus.BLOCKED,
        details: { ip: '45.33.32.156', reason: 'Brute force login threshold exceeded' },
        ipAddress: '45.33.32.156',
        userAgent: 'python-requests/2.28.0 (Scanner)',
      },
    ],
  })

  console.log('\n🎉 Seeding selesai dengan sempurna!')
  console.log('====================================================')
  console.log('Akun Uji Coba Tersedia:')
  console.log('1. Commander (Admin)  : commander@aegissoc.io | Password: PasswordAegis!2026')
  console.log('2. Responder (IR)     : responder@aegissoc.io | Password: PasswordAegis!2026')
  console.log('3. Analyst (Tier-1)   : analyst@aegissoc.io   | Password: PasswordAegis!2026')
  console.log('====================================================')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Gagal seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
