const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Manajemen Daily Task Server')
        .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Membuat task kegiatan baru')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Menampilkan daftar task aktif')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Melihat detail task berdasarkan ID')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID Task')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('complete')
                .setDescription('Menandai task sebagai selesai')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID Task')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Menghapus task dari sistem')
                .addIntegerOption(opt =>
                    opt.setName('id')
                        .setDescription('ID Task')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Respon sementara untuk pengujian Phase 1
        await interaction.reply({
            content: `📌 Subcommand \`/task ${subcommand}\` berhasil diterima! (Fungsi logika akan dipasang di Phase berikutnya).`,
            ephemeral: true
        });
    }
};