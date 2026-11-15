const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    UserSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require('discord.js');

const taskService = require('../services/taskService');
const { combineDateAndTime, formatDateIndo, getCurrentDate } = require('../utils/dateUtils');
const { calculateTaskStatus } = require('../utils/statusUtils');

// Penyimpanan sementara di memori sebelum user selesai memilih member di Select Menu
const pendingTaskDrafts = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Manajemen Daily Task Server')
        .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
        .addSubcommand(sub =>
            sub.setName('create').setDescription('Membuat task kegiatan baru')
        )
        .addSubcommand(sub =>
            sub.setName('list').setDescription('Menampilkan daftar task aktif saat ini')
        )
        .addSubcommand(sub =>
            sub.setName('all').setDescription('Menampilkan semua riwayat task (Aktif, Terlewat, Deleted)')
        )
        .addSubcommand(sub =>
            sub
                .setName('edit')
                .setDescription('Mengubah data task yang sudah ada')
                .addIntegerOption(opt =>
                    opt.setName('id').setDescription('ID Task yang akan diedit').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('complete')
                .setDescription('Menandai task sebagai selesai')
                .addIntegerOption(opt =>
                    opt.setName('id').setDescription('ID Task').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('delete')
                .setDescription('Menghapus task dari daftar aktif')
                .addIntegerOption(opt =>
                    opt.setName('id').setDescription('ID Task').setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('clear')
                .setDescription('Menghapus permanen semua task berstatus Deleted & merapikan urutan ID')
        ),

    // 1. Handler Slash Command (/task ...)
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const todayStr = getCurrentDate().format('YYYY-MM-DD');

            const modal = new ModalBuilder()
                .setCustomId('modal_task_create')
                .setTitle('Buat Task Kegiatan Baru');

            const nameInput = new TextInputBuilder()
                .setCustomId('task_name')
                .setLabel('Nama Kegiatan')
                .setPlaceholder('Contoh: Desain Poster Event')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const startDateInput = new TextInputBuilder()
                .setCustomId('task_start_date')
                .setLabel('Tanggal Mulai (YYYY-MM-DD)')
                .setValue(todayStr) // Otomatis terisi tanggal hari ini
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const startTimeInput = new TextInputBuilder()
                .setCustomId('task_start_time')
                .setLabel('Jam Mulai (HH:mm) - Kosongkan = 08:00')
                .setPlaceholder('08:00')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const deadlineDateInput = new TextInputBuilder()
                .setCustomId('task_deadline_date')
                .setLabel('Tanggal Deadline (YYYY-MM-DD)')
                .setPlaceholder('Contoh: 2026-11-20')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const deadlineTimeInput = new TextInputBuilder()
                .setCustomId('task_deadline_time')
                .setLabel('Jam Deadline (HH:mm) - Kosongkan = 23:59')
                .setPlaceholder('23:59')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(startDateInput),
                new ActionRowBuilder().addComponents(startTimeInput),
                new ActionRowBuilder().addComponents(deadlineDateInput),
                new ActionRowBuilder().addComponents(deadlineTimeInput)
            );

            return await interaction.showModal(modal);
        }

        if (subcommand === 'edit') {
            const taskId = interaction.options.getInteger('id');
            const task = await taskService.getTaskById(taskId);

            if (!task || task.guildId !== interaction.guildId || task.status !== 'ACTIVE') {
                return await interaction.reply({
                    content: `❌ Task dengan ID **#${taskId}** tidak ditemukan atau sudah tidak aktif.`,
                    ephemeral: true,
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`modal_task_edit_${task.id}`)
                .setTitle(`Edit Task #${task.id}`);

            const nameInput = new TextInputBuilder()
                .setCustomId('task_name')
                .setLabel('Nama Kegiatan')
                .setValue(task.name)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const startDateInput = new TextInputBuilder()
                .setCustomId('task_start_date')
                .setLabel('Tanggal Mulai (YYYY-MM-DD)')
                .setValue(formatDateIndo(task.startAt, 'YYYY-MM-DD'))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const startTimeInput = new TextInputBuilder()
                .setCustomId('task_start_time')
                .setLabel('Jam Mulai (HH:mm)')
                .setValue(formatDateIndo(task.startAt, 'HH:mm'))
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const deadlineDateInput = new TextInputBuilder()
                .setCustomId('task_deadline_date')
                .setLabel('Tanggal Deadline (YYYY-MM-DD)')
                .setValue(formatDateIndo(task.deadline, 'YYYY-MM-DD'))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const deadlineTimeInput = new TextInputBuilder()
                .setCustomId('task_deadline_time')
                .setLabel('Jam Deadline (HH:mm)')
                .setValue(formatDateIndo(task.deadline, 'HH:mm'))
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(startDateInput),
                new ActionRowBuilder().addComponents(startTimeInput),
                new ActionRowBuilder().addComponents(deadlineDateInput),
                new ActionRowBuilder().addComponents(deadlineTimeInput)
            );

            return await interaction.showModal(modal);
        }

        if (subcommand === 'list') {
            const tasks = await taskService.getActiveTasks(interaction.guildId);

            if (tasks.length === 0) {
                return await interaction.reply({
                    content: '📭 Belum ada task aktif di server ini.',
                    ephemeral: true,
                });
            }

            const lines = tasks.map(t => {
                const st = calculateTaskStatus(t.deadline);
                const mentions = t.members.length > 0
                    ? t.members.map(m => `<@${m.discordUserId}>`).join(' ')
                    : '_Tidak ada_';
                return `**#${t.id}** | ${st.emoji} **${st.label}** — **${t.name}**\n└ Deadline: \`${formatDateIndo(t.deadline)}\` | Terlibat: ${mentions}`;
            });

            const embed = new EmbedBuilder()
                .setTitle('📋 Daftar Task Aktif')
                .setDescription(lines.join('\n\n'))
                .setColor(0x2b2d31)
                .setFooter({ text: 'Gunakan /task all untuk melihat seluruh riwayat task' });

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'all') {
            const tasks = await taskService.getAllTasks(interaction.guildId);

            if (tasks.length === 0) {
                return await interaction.reply({
                    content: '📭 Belum ada riwayat task sama sekali di server ini.',
                    ephemeral: true,
                });
            }

            const aktifTasks = tasks.filter(t => t.status === 'ACTIVE');
            const terlewatTasks = tasks.filter(t => t.status === 'EXPIRED' || t.status === 'COMPLETED');
            const deletedTasks = tasks.filter(t => t.status === 'DELETED');

            const formatSection = (list, showDeadlineBadge = false) => {
                if (list.length === 0) return '_Tidak ada task_';
                return list
                    .map(t => {
                        const mentions = t.members.length > 0
                            ? t.members.map(m => `<@${m.discordUserId}>`).join(' ')
                            : '_Tidak ada_';
                        const badge = showDeadlineBadge ? `${calculateTaskStatus(t.deadline).emoji} ` : '';
                        return `**#${t.id}** | ${badge}**${t.name}**\n└ Mulai: \`${formatDateIndo(t.startAt)}\` → Deadline: \`${formatDateIndo(t.deadline)}\` | ${mentions}`;
                    })
                    .join('\n\n');
            };

            const embed = new EmbedBuilder()
                .setTitle('🗂️ Semua Riwayat Task Server')
                .addFields(
                    {
                        name: `🟢 Aktif (${aktifTasks.length})`,
                        value: formatSection(aktifTasks, true),
                        inline: false,
                    },
                    {
                        name: `⏳ Terlewat (${terlewatTasks.length})`,
                        value: formatSection(terlewatTasks, false),
                        inline: false,
                    },
                    {
                        name: `🗑️ Deleted (${deletedTasks.length})`,
                        value: formatSection(deletedTasks, false),
                        inline: false,
                    }
                )
                .setColor(0x5865f2)
                .setFooter({ text: 'Menampilkan seluruh data task berdasarkan status' });

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'complete') {
            const taskId = interaction.options.getInteger('id');
            const task = await taskService.getTaskById(taskId);

            if (!task || task.guildId !== interaction.guildId || task.status !== 'ACTIVE') {
                return await interaction.reply({
                    content: `❌ Task **#${taskId}** tidak ditemukan atau sudah selesai/dihapus.`,
                    ephemeral: true,
                });
            }

            await taskService.completeTask(taskId);
            return await interaction.reply({
                content: `✅ Task **#${task.id} (${task.name})** telah ditandai sebagai **Selesai**! Perubahan akan tercermin pada Daily Task Board berikutnya.`,
                ephemeral: true,
            });
        }

        if (subcommand === 'delete') {
            const taskId = interaction.options.getInteger('id');
            const task = await taskService.getTaskById(taskId);

            if (!task || task.guildId !== interaction.guildId || task.status === 'DELETED') {
                return await interaction.reply({
                    content: `❌ Task **#${taskId}** tidak ditemukan.`,
                    ephemeral: true,
                });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_delete_confirm_${task.id}`)
                    .setLabel('Ya, Hapus Task')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('btn_delete_cancel')
                    .setLabel('Batal')
                    .setStyle(ButtonStyle.Secondary)
            );

            return await interaction.reply({
                content: `⚠️ Apakah kamu yakin ingin menghapus task **#${task.id} — ${task.name}**?`,
                components: [row],
                ephemeral: true,
            });
        }
        if (subcommand === 'clear') {
            const allTasks = await taskService.getAllTasks(interaction.guildId);
            const deletedTasks = allTasks.filter(t => t.status === 'DELETED');

            if (deletedTasks.length === 0) {
                return await interaction.reply({
                    content: '✨ Tidak ada task berstatus **Deleted** yang perlu dibersihkan.',
                    ephemeral: true,
                });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_clear_confirm')
                    .setLabel(`Ya, Bersihkan ${deletedTasks.length} Task`)
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('btn_clear_cancel')
                    .setLabel('Batal')
                    .setStyle(ButtonStyle.Secondary)
            );

            return await interaction.reply({
                content: `⚠️ Kamu akan menghapus permanen **${deletedTasks.length} task** di kategori **Deleted** dan mereset urutan ID task aktif mulai dari **#1**.\nLanjutkan?`,
                components: [row],
                ephemeral: true,
            });
        }
    },

    // 2. Handler Submit Modal (Create & Edit)
    async handleModalSubmit(interaction) {
        const isCreate = interaction.customId === 'modal_task_create';
        const isEdit = interaction.customId.startsWith('modal_task_edit_');
        if (!isCreate && !isEdit) return;

        const name = interaction.fields.getTextInputValue('task_name').trim();
        const startDateStr = interaction.fields.getTextInputValue('task_start_date');
        const startTimeStr = interaction.fields.getTextInputValue('task_start_time');
        const deadlineDateStr = interaction.fields.getTextInputValue('task_deadline_date');
        const deadlineTimeStr = interaction.fields.getTextInputValue('task_deadline_time');

        const startParsed = combineDateAndTime(startDateStr, startTimeStr, '08:00');
        const deadlineParsed = combineDateAndTime(deadlineDateStr, deadlineTimeStr, '23:59');

        if (!startParsed || !deadlineParsed) {
            return await interaction.reply({
                content: '❌ Format tanggal atau jam tidak valid!\n• Tanggal wajib format **`YYYY-MM-DD`** (contoh: `2026-11-20`)\n• Jam wajib format **`HH:mm`** (contoh: `15:30` atau kosongkan untuk default)',
                ephemeral: true,
            });
        }

        if (startParsed.isAfter(deadlineParsed)) {
            return await interaction.reply({
                content: '❌ Waktu mulai tidak boleh lebih besar daripada deadline!',
                ephemeral: true,
            });
        }

        const draftKey = `${interaction.guildId}_${interaction.user.id}`;
        const taskId = isEdit ? Number(interaction.customId.replace('modal_task_edit_', '')) : null;

        pendingTaskDrafts.set(draftKey, {
            mode: isCreate ? 'create' : 'edit',
            taskId,
            name,
            startAt: startParsed.toDate(),
            deadline: deadlineParsed.toDate(),
        });

        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('select_task_members')
            .setPlaceholder('Pilih anggota yang terlibat dalam task ini...')
            .setMinValues(1)
            .setMaxValues(10);

        const row = new ActionRowBuilder().addComponents(userSelect);

        return await interaction.reply({
            content: `📝 Data awal untuk **${name}** berhasil divalidasi.\nSilakan pilih **anggota yang terlibat** pada menu di bawah ini:`,
            components: [row],
            ephemeral: true,
        });
    },

    // 3. Handler User Select Menu (Menyimpan Task ke SQLite)
    async handleUserSelect(interaction) {
        if (interaction.customId !== 'select_task_members') return;

        const draftKey = `${interaction.guildId}_${interaction.user.id}`;
        const draft = pendingTaskDrafts.get(draftKey);

        if (!draft) {
            return await interaction.update({
                content: '⚠️ Sesi pembuatan/edit task telah kedaluwarsa. Silakan ulangi perintah `/task`.',
                components: [],
            });
        }

        const selectedMemberIds = interaction.values;

        if (draft.mode === 'create') {
            const newTask = await taskService.createTask({
                guildId: interaction.guildId,
                name: draft.name,
                startAt: draft.startAt,
                deadline: draft.deadline,
                createdBy: interaction.user.id,
                memberIds: selectedMemberIds,
            });

            pendingTaskDrafts.delete(draftKey);
            const mentions = selectedMemberIds.map(id => `<@${id}>`).join(', ');

            return await interaction.update({
                content: `✅ **Task Baru Berhasil Dibuat! (ID: #${newTask.id})**\n• **Kegiatan:** ${newTask.name}\n• **Mulai:** ${formatDateIndo(newTask.startAt)}\n• **Deadline:** ${formatDateIndo(newTask.deadline)}\n• **Terlibat:** ${mentions}\n\n_Task ini akan tampil di Daily Task Board pada jadwal update berikutnya._`,
                components: [],
            });
        }

        if (draft.mode === 'edit') {
            const updatedTask = await taskService.updateTask(draft.taskId, {
                name: draft.name,
                startAt: draft.startAt,
                deadline: draft.deadline,
                memberIds: selectedMemberIds,
            });

            pendingTaskDrafts.delete(draftKey);
            const mentions = selectedMemberIds.map(id => `<@${id}>`).join(', ');

            return await interaction.update({
                content: `✏️ **Task #${updatedTask.id} Berhasil Diperbarui!**\n• **Kegiatan:** ${updatedTask.name}\n• **Mulai:** ${formatDateIndo(updatedTask.startAt)}\n• **Deadline:** ${formatDateIndo(updatedTask.deadline)}\n• **Terlibat:** ${mentions}`,
                components: [],
            });
        }
    },

    // 4. Handler Tombol Konfirmasi Delete
    async handleButton(interaction) {
        if (interaction.customId === 'btn_delete_cancel') {
            return await interaction.update({
                content: '❎ Penghapusan task dibatalkan.',
                components: [],
            });
        }

        if (interaction.customId.startsWith('btn_delete_confirm_')) {
            const taskId = Number(interaction.customId.replace('btn_delete_confirm_', ''));
            await taskService.deleteTask(taskId);

            return await interaction.update({
                content: `🗑️ Task **#${taskId}** berhasil dihapus dari daftar aktif (tersimpan di riwayat database).`,
                components: [],
            });
        }
        if (interaction.customId === 'btn_clear_cancel') {
            return await interaction.update({
                content: '❎ Pembersihan riwayat Deleted dibatalkan.',
                components: [],
            });
        }

        if (interaction.customId === 'btn_clear_confirm') {
            const result = await taskService.clearDeletedTasks(interaction.guildId);

            return await interaction.update({
                content: `🧹 Berhasil membersihkan **${result.deletedCount} task** berstatus Deleted!\nUrutan ID untuk **${result.remainingCount} task** yang tersisa telah dirapikan mulai dari **#1**.`,
                components: [],
            });
        }
    },
};