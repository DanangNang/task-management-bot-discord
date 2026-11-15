const { Events } = require('discord.js');
const taskCommand = require('../commands/task');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // 1. Slash Commands
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction);
                return;
            }

            // 2. Modal Submissions
            if (interaction.isModalSubmit()) {
                await taskCommand.handleModalSubmit(interaction);
                return;
            }

            // 3. User Select Menus
            if (interaction.isUserSelectMenu()) {
                await taskCommand.handleUserSelect(interaction);
                return;
            }

            // 4. Buttons
            if (interaction.isButton()) {
                await taskCommand.handleButton(interaction);
                return;
            }
        } catch (error) {
            console.error('[ERROR] Gagal memproses interaksi Discord:', error);
            const errorPayload = {
                content: '⚠️ Terjadi kesalahan internal saat memproses permintaan kamu.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorPayload);
            } else {
                await interaction.reply(errorPayload);
            }
        }
    },
};