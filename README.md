# 🤖 Daily Task Bot
> *"One Board. One Update. Every Deadline."*

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat-square&logo=discord&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

Daily Task Bot adalah Discord Bot yang dirancang untuk membantu mengelola kegiatan, memantau deadline, dan memberikan pengingat tugas secara otomatis di dalam Discord Server.

Bot menggunakan sistem **Daily Task Board** yang diperbarui satu kali setiap hari. Setiap kegiatan memiliki waktu mulai, deadline, status otomatis, dan anggota yang terlibat.

Proyek ini dikembangkan menggunakan Node.js dan Discord.js sebagai project pembelajaran sekaligus implementasi sistem manajemen tugas sederhana berbasis Discord.

## 📋 Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| 📝 **Task CRUD** | Membuat, melihat, mengubah, dan menghapus kegiatan. |
| 📅 **Task Schedule** | Menyimpan waktu mulai dan deadline setiap kegiatan. |
| 🟢 **Automatic Status** | Menentukan status kegiatan berdasarkan waktu menuju deadline. |
| 👥 **Task Members** | Menentukan anggota Discord yang terlibat dalam kegiatan. |
| 📋 **Daily Task Board** | Menampilkan daftar kegiatan dalam bentuk tabel Markdown. |
| ⚠️ **Deadline Reminder** | Menampilkan kegiatan yang mendekati deadline. |
| 🔄 **Daily Update** | Memperbarui Task Board satu kali setiap hari. |
| 🗃️ **Task History** | Menyimpan data kegiatan yang telah berakhir. |
| 🕐 **Timezone Support** | Menggunakan waktu `Asia/Jakarta` sebagai timezone utama. |

## 🚦 Task Status

Status kegiatan ditentukan secara otomatis berdasarkan sisa waktu menuju deadline.

| Status | Sisa Waktu |
| :--- | :--- |
| 🟢 **Aman** | 7–4 hari |
| 🟡 **Waspada** | 3–1 hari |
| 🔴 **Berakhir** | Deadline tiba atau telah lewat |

Kegiatan yang telah mencapai deadline masih dapat ditampilkan pada hari tersebut dan akan menghilang dari **Daily Task Board** pada update hari berikutnya.

Data kegiatan yang telah berakhir tidak langsung dihapus dari database dan dapat digunakan sebagai riwayat.

## 📋 Daily Task Board

Bot menggunakan satu pesan Discord sebagai **Daily Task Board**.

Pesan tersebut diperbarui satu kali setiap hari, sehingga bot tidak memenuhi channel dengan pesan baru setiap harinya.

Contoh:

```text
📋 DAILY TASK BOARD
Selasa, 10 November 2026

| Kegiatan | Mulai | Deadline | Status | Terlibat |
|---|---|---|---|---|
| Desain Poster | 10 Nov 10:00 | 14 Nov 20:00 | 🟢 Aman | @Nearby @Adit |
| Revisi Proposal | 9 Nov 13:00 | 12 Nov 23:59 | 🟡 Waspada | @Nearby @Raka |

⚠️ DEADLINE : 3 HARI

Revisi Proposal
@Nearby @Raka

Last updated: 10 November 2026, 08:00 WIB
