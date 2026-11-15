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
const { parseInputDate, formatDateIndo } = require('../utils/dateUtils');
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
            sub
                .setName('view')
                .setDescription('Melihat detail lengkap sebuah task')
                .addIntegerOption(opt =>
                    opt.setName('id').setDescription('ID Task').setRequired(true)
                )
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
        ),

    // 1. Handler Slash Command (/task ...)
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const modal = new ModalBuilder()
                .setCustomId('modal_task_create')
                .setTitle('Buat Task Kegiatan Baru');

            const nameInput = new TextInputBuilder()
                .setCustomId('task_name')
                .setLabel('Nama Kegiatan')
                .setPlaceholder('Contoh: Desain Poster Event')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const startInput = new TextInputBuilder()
                .setCustomId('task_start')
                .setLabel('Waktu Mulai (YYYY-MM-DD HH:mm)')
                .setPlaceholder('Contoh: 2026-11-13 09:00')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const deadlineInput = new TextInputBuilder()
                .setCustomId('task_deadline')
                .setLabel('Deadline (YYYY-MM-DD HH:mm)')
                .setPlaceholder('Contoh: 2026-11-16 23:59')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(startInput),
                new ActionRowBuilder().addComponents(deadlineInput)
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

            const startInput = new TextInputBuilder()
                .setCustomId('task_start')
                .setLabel('Waktu Mulai (YYYY-MM-DD HH:mm)')
                .setValue(formatDateIndo(task.startAt, 'YYYY-MM-DD HH:mm'))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const deadlineInput = new TextInputBuilder()
                .setCustomId('task_deadline')
                .setLabel('Deadline (YYYY-MM-DD HH:mm)')
                .setValue(formatDateIndo(task.deadline, 'YYYY-MM-DD HH:mm'))
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(startInput),
                new ActionRowBuilder().addComponents(deadlineInput)
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
                .setFooter({ text: 'Gunakan /task view id:<nomor> untuk detail lengkap' });

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'view') {
            const taskId = interaction.options.getInteger('id');
            const task = await taskService.getTaskById(taskId);

            if (!task || task.guildId !== interaction.guildId) {
                return await interaction.reply({
                    content: `❌ Task dengan ID **#${taskId}** tidak ditemukan.`,
                    ephemeral: true,
                });
            }

            const st = calculateTaskStatus(task.deadline);
            const mentions = task.members.length > 0
                ? task.members.map(m => `<@${m.discordUserId}>`).join(', ')
                : 'Tidak ada anggota ditugaskan';

            const embed = new EmbedBuilder()
                .setTitle(`📌 Detail Task #${task.id}: ${task.name}`)
                .addFields(
                    { name: 'Status Sistem', value: task.status, inline: true },
                    { name: 'Status Deadline', value: `${st.emoji} ${st.label} (${st.daysLeft} hari)`, inline: true },
                    { name: 'Waktu Mulai', value: formatDateIndo(task.startAt), inline: false },
                    { name: 'Deadline', value: formatDateIndo(task.deadline), inline: false },
                    { name: 'Orang yang Terlibat', value: mentions, inline: false },
                    { name: 'Dibuat Oleh', value: `<@${task.createdBy}> pada ${formatDateIndo(task.createdAt)}`, inline: false }
                )
                .setColor(0x5865f2);

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
    },

    // 2. Handler Submit Modal (Create & Edit)
    async handleModalSubmit(interaction) {
        const isCreate = interaction.customId === 'modal_task_create';
        const isEdit = interaction.customId.startsWith('modal_task_edit_');
        if (!isCreate && !isEdit) return;

        const name = interaction.fields.getTextInputValue('task_name').trim();
        const startStr = interaction.fields.getTextInputValue('task_start');
        const deadlineStr = interaction.fields.getTextInputValue('task_deadline');

        const startParsed = parseInputDate(startStr);
        const deadlineParsed = parseInputDate(deadlineStr);

        if (!startParsed || !deadlineParsed) {
            return await interaction.reply({
                content: '❌ Format tanggal tidak valid! Gunakan format **`YYYY-MM-DD HH:mm`** (contoh: `2026-11-15 20:00`).',
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
    },
};