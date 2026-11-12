# 🤖 Daily Task Bot

> *"One Board. One Update. Every Deadline."*

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Daily Task Bot** adalah Discord Bot yang digunakan untuk mengelola kegiatan, deadline,
dan anggota yang terlibat dalam sebuah Discord Server.

Bot menyediakan sistem **CRUD Task**, perhitungan status deadline secara otomatis,
serta **Daily Task Board** yang diperbarui satu kali setiap hari.

Daripada mengirim pesan baru setiap hari, bot akan menggunakan **satu pesan utama**
yang diperbarui secara otomatis sehingga channel tetap rapi dan tidak dipenuhi laporan
yang sama berulang kali.

---

## 📋 Fitur Utama

| Fitur | Deskripsi |
|---|---|
| ➕ Create Task | Membuat kegiatan baru beserta waktu mulai, deadline, dan anggota yang terlibat |
| 👁️ View Task | Melihat detail kegiatan tertentu |
| 📋 List Task | Menampilkan daftar kegiatan yang sedang aktif |
| ✏️ Edit Task | Mengubah informasi kegiatan |
| 🗑️ Delete Task | Menghapus kegiatan dari sistem |
| ✅ Complete Task | Menandai kegiatan sebagai selesai |
| ⏱️ Auto Status | Status kegiatan dihitung otomatis berdasarkan deadline |
| 📢 Daily Task Board | Satu pesan Discord yang diperbarui setiap hari |
| ⚠️ Deadline Reminder | Menampilkan kegiatan yang memasuki masa Waspada |
| 👥 Task Members | Menyimpan anggota Discord yang terlibat dalam kegiatan |
| 🗃️ Task History | Kegiatan yang sudah berakhir tetap disimpan di database |
| 🔄 Auto Update | Board diperbarui otomatis berdasarkan jadwal yang ditentukan |

---

## ⏱️ Sistem Status Deadline

Status kegiatan ditentukan berdasarkan waktu yang tersisa menuju deadline.

| Status | Sisa Waktu | Keterangan |
|---|---:|---|
| 🟢 Aman | 7–4 hari | Deadline masih cukup jauh |
| 🟡 Waspada | 3–1 hari | Deadline mulai mendekat |
| 🔴 Berakhir | Deadline tercapai/lewat | Kegiatan telah mencapai deadline |

> Status dihitung secara otomatis berdasarkan waktu saat sistem melakukan update.

Kegiatan yang deadline-nya sudah tercapai masih dapat muncul sebagai **🔴 Berakhir**
pada update hari tersebut.

Pada update hari berikutnya, kegiatan tersebut tidak lagi ditampilkan pada
**Daily Task Board**, tetapi datanya tetap tersimpan di database sebagai histori.

---

## 📊 Daily Task Board

Bot menggunakan **satu pesan Discord** sebagai papan tugas utama.

Pesan tersebut akan diedit secara otomatis setiap hari tanpa membuat pesan baru.

Contoh:

```text
# 📋 DAILY TASK BOARD

**Selasa, 10 November 2026**

| Kegiatan | Mulai | Deadline | Status | Terlibat |
|---|---|---|---|---|
| Desain Poster | 10 Nov 10:00 | 14 Nov 20:00 | 🟢 Aman | @Nearby @Adit |
| Revisi Proposal | 9 Nov 13:00 | 12 Nov 23:59 | 🟡 Waspada | @Nearby @Raka |
| Upload Konten | 8 Nov 09:00 | 10 Nov 18:00 | 🔴 Berakhir | @Nearby |

---

## ⚠️ DEADLINE : 3 HARI

**Revisi Proposal**

@Nearby @Raka

---

*Last updated: 10 November 2026, 08:00 WIB*
```

Jika tidak ada kegiatan yang masuk status **Waspada**, bagian reminder dapat
menampilkan:

```text
## ✅ DEADLINE REMINDER

Tidak ada deadline yang mendekat.
```

---

## 🔄 Alur Sistem

```text
                 ┌──────────────────┐
                 │   Discord User   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Slash Command   │
                 │ /task create     │
                 │ /task edit       │
                 │ /task delete     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   Task Service   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Prisma + SQLite  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Deadline Service │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Daily Report     │
                 │ Service          │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Existing Discord │
                 │ Board Message    │
                 └──────────────────┘
```

---

## 🔁 Alur Daily Update

```text
          Scheduler
              │
              ▼
      ┌───────────────┐
      │ Ambil Task    │
      │ dari Database │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ Hitung Sisa   │
      │ Waktu Deadline│
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ Tentukan      │
      │ Status Task   │
      └───────┬───────┘
              │
              ▼
      ┌────────────────┐
      │ Task Berakhir? │
      └───────┬────────┘
              │
       ┌──────┴──────┐
       │             │
      Tidak          Ya
       │             │
       │       ┌─────▼─────────┐
       │       │ Tidak tampil  │
       │       │ di board      │
       │       └───────────────┘
       │
       ▼
┌──────────────────┐
│ Generate Daily   │
│ Task Board       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Edit Existing    │
│ Discord Message  │
└──────────────────┘
```

---

## ⚠️ Deadline Reminder

Reminder hanya ditampilkan untuk kegiatan dengan status **🟡 Waspada**.

Contoh:

```text
## ⚠️ DEADLINE : 3 HARI

**Revisi Proposal**
@Nearby @Raka

**Desain Feed**
@Nearby @Adit
```

Jika terdapat beberapa kegiatan dengan jumlah hari tersisa yang berbeda,
reminder dapat dikelompokkan:

```text
## ⚠️ DEADLINE : 3 HARI

**Revisi Proposal**
@Nearby @Raka

---

## ⚠️ DEADLINE : 2 HARI

**Desain Feed**
@Nearby @Adit

---

## ⚠️ DEADLINE : 1 HARI

**Upload Konten**
@Nearby
```

---

## 🛠️ Tech Stack

- **Node.js** — Runtime JavaScript
- **JavaScript** — Bahasa pemrograman utama
- **discord.js** — Framework/library untuk Discord Bot
- **Prisma** — ORM untuk mengelola database
- **SQLite** — Database untuk penyimpanan task
- **node-cron** — Scheduler untuk daily update
- **dotenv** — Pengelolaan environment variable
- **npm** — Package manager
- **Git & GitHub** — Version control

---

## 🧠 Konsep Utama

### CRUD

Sistem task menggunakan konsep:

```text
Create
  ↓
Read
  ↓
Update
  ↓
Delete
```

User dapat membuat, melihat, mengubah, dan menghapus kegiatan.

### Automatic Deadline Calculation

Status tidak ditentukan secara manual.

```text
Current Time
     │
     ▼
Deadline
     │
     ▼
Calculate Remaining Time
     │
     ├── 7–4 Days → 🟢 Aman
     ├── 3–1 Days → 🟡 Waspada
     └── ≤ Deadline → 🔴 Berakhir
```

### Persistent Task History

Task yang sudah berakhir tidak langsung dihapus dari database.

```text
Active Task
    │
    ▼
Deadline Reached
    │
    ├── Tidak tampil di Daily Board
    │
    └── Tetap tersimpan di Database
```

Hal ini memungkinkan data task tetap tersedia sebagai histori untuk
pengembangan fitur berikutnya.

---

## 📁 Struktur Project

```text
discord-task-bot/
│
├── src/
│   │
│   ├── commands/
│   │   ├── task-create.js
│   │   ├── task-list.js
│   │   ├── task-view.js
│   │   ├── task-edit.js
│   │   ├── task-delete.js
│   │   └── task-complete.js
│   │
│   ├── services/
│   │   ├── taskService.js
│   │   ├── deadlineService.js
│   │   ├── dailyReportService.js
│   │   └── notificationService.js
│   │
│   ├── database/
│   │   └── prisma.js
│   │
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── statusUtils.js
│   │   └── formatUtils.js
│   │
│   ├── events/
│   │   └── ready.js
│   │
│   └── index.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🗄️ Struktur Database

### Task

Menyimpan informasi utama dari sebuah kegiatan.

```text
Task
├── id
├── name
├── startAt
├── deadline
├── createdBy
├── createdAt
└── updatedAt
```

### TaskMember

Menyimpan anggota Discord yang terlibat dalam sebuah kegiatan.

```text
TaskMember
├── id
├── taskId
└── discordUserId
```

### BotConfiguration

Menyimpan konfigurasi Daily Task Board.

```text
BotConfiguration
├── id
├── guildId
├── channelId
├── dailyBoardMessageId
├── dailyUpdateTime
└── timezone
```

### Relasi

```text
Task
 │
 ├───────────────┐
 │               │
 ▼               ▼
TaskMember   createdBy
 │
 ▼
Discord User
```

---

## 💬 Discord Commands

| Command | Fungsi |
|---|---|
| `/task create` | Membuat task baru |
| `/task list` | Melihat daftar task aktif |
| `/task view` | Melihat detail task |
| `/task edit` | Mengubah task |
| `/task delete` | Menghapus task |
| `/task complete` | Menandai task selesai |

Contoh:

```text
/task create
```

Bot kemudian dapat menggunakan **Discord Modal** untuk meminta:

```text
Nama Kegiatan
Mulai
Deadline
Orang Terlibat
```

Untuk pemilihan anggota, bot dapat menggunakan **Discord User Select Menu**
sehingga anggota yang terlibat dapat langsung dipilih dari server.

---

## 🔐 Permission

Pembagian akses dasar:

```text
Member
├── Melihat Daily Task Board
└── Melihat task

Staff / Authorized User
├── Create Task
├── Edit Task
├── Complete Task
└── Delete Task

Administrator
└── Konfigurasi Daily Task Board
```

Bot tidak menggunakan username yang di-hardcode.
Anggota disimpan menggunakan **Discord User ID** sehingga mention tetap valid
meskipun username berubah.

---

## ⚙️ Konfigurasi Environment

Buat file `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_discord_server_id

TIMEZONE=Asia/Jakarta
DAILY_UPDATE_TIME=08:00
```

> Jangan pernah meng-upload file `.env` ke GitHub.

Gunakan `.env.example` sebagai template:

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=

TIMEZONE=Asia/Jakarta
DAILY_UPDATE_TIME=08:00
```

---

## 🚀 Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/username/discord-task-bot.git
cd discord-task-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Prisma

```bash
npx prisma init --datasource-provider sqlite
```

Kemudian jalankan migration:

```bash
npx prisma migrate dev --name init
```

### 4. Konfigurasi `.env`

Isi token dan ID Discord:

```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
```

### 5. Jalankan Bot

```bash
node src/index.js
```

Untuk development:

```bash
node --watch src/index.js
```

---

## 📦 Instalasi Dependency

Dependency utama yang digunakan:

```bash
npm install discord.js
npm install prisma @prisma/client
npm install dotenv
npm install node-cron
npm install -D prisma
```

---

## 🕐 Daily Scheduler

Daily Task Board secara default diperbarui setiap hari pada:

```text
08:00 WIB
Asia/Jakarta
```

Scheduler akan menjalankan proses:

```text
08:00 WIB
   │
   ▼
Ambil Task
   │
   ▼
Hitung Deadline
   │
   ▼
Update Status
   │
   ▼
Filter Task Berakhir
   │
   ▼
Generate Board
   │
   ▼
Edit Discord Message
```

Perubahan task yang dilakukan sebelum daily update akan otomatis muncul
pada update berikutnya.

Tidak ada bagian khusus seperti:

```text
+ Kegiatan Baru
✏️ Kegiatan Diubah
```

Perubahan hanya akan terlihat melalui isi **Daily Task Board** yang terbaru.

---

## 📝 Contoh Task

```text
Nama:
Desain Poster

Mulai:
10 November 2026, 10:00 WIB

Deadline:
14 November 2026, 20:00 WIB

Terlibat:
@Nearby
@Adit

Status:
🟢 Aman
```

Setelah deadline semakin dekat:

```text
10 Nov → 🟢 Aman
11 Nov → 🟢 Aman
12 Nov → 🟡 Waspada
13 Nov → 🟡 Waspada
14 Nov → 🔴 Berakhir
15 Nov → Tidak tampil di Daily Board
```

Task tetap tersimpan di database setelah tanggal 15 November.

---

## 📌 Catatan Pengembangan

- Menggunakan **Asia/Jakarta** sebagai timezone utama.
- Daily Task Board menggunakan satu pesan Discord yang terus diperbarui.
- Task yang berakhir tidak langsung dihapus dari database.
- Status deadline dihitung berdasarkan waktu aktual.
- Mention anggota menggunakan Discord User ID.
- Token Discord disimpan di `.env`.
- SQLite digunakan untuk tahap awal pengembangan.
- Prisma digunakan agar pengelolaan database lebih terstruktur.
- Tidak membutuhkan frontend untuk versi awal.
- Tidak menggunakan Express atau Next.js karena bot berjalan langsung melalui Discord.

---

## 🔮 Future Development

Beberapa fitur yang dapat dikembangkan selanjutnya:

- 📊 Dashboard statistik task
- 📈 Progress tracking
- 🔔 Reminder otomatis beberapa jam sebelum deadline
- 📅 Integrasi Google Calendar
- 🏷️ Kategori dan prioritas task
- 🔎 Search dan filter task
- 📜 Riwayat task
- 📊 Statistik produktivitas anggota
- 🧾 Export task ke CSV/Excel
- 🌐 PostgreSQL untuk production
- ⚙️ Konfigurasi bot melalui Discord
- 🔐 Permission system yang lebih detail
- 🖥️ Web dashboard untuk admin
- 📱 Mobile-friendly dashboard

---

## 🎯 Development Roadmap

```text
Phase 1
Setup Project
   │
   ▼
Phase 2
Database + Prisma
   │
   ▼
Phase 3
Task CRUD + Discord Commands
   │
   ▼
Phase 4
Deadline & Status System
   │
   ▼
Phase 5
Daily Task Board
   │
   ▼
Phase 6
Scheduler + Reminder
   │
   ▼
Phase 7
Permission + Error Handling
   │
   ▼
Phase 8
Testing + Documentation
   │
   ▼
Phase 9
Deployment
```

---

## 📄 License

This project is created for learning and personal project purposes.

---

<div align="center">

**🤖 Daily Task Bot**

*One Board. One Update. Every Deadline.*

Made with ☕ and JavaScript.

</div>
```

Nah, ini sudah **satu paket utuh**. Jadi struktur project, database, flow, command, instalasi, konfigurasi, sampai roadmap semuanya ada dalam **satu `README.md`** dan tinggal ditempel ke GitHub.
