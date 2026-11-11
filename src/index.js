require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

client.commands = new Collection();

// 1. Memuat file Command secara dinamis
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandsData = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
    }
}

// 2. Memuat file Event secara dinamis
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// 3. Mendaftarkan Slash Commands ke Discord API
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('[INIT] Mendaftarkan Slash Commands...');

        if (process.env.GUILD_ID) {
            // Registrasi khusus ke Server Development (Bisa langsung muncul tanpa menunggu delay global)
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commandsData }
            );
            console.log('[INIT] Slash Commands berhasil terdaftar di Server Development.');
        } else {
            // Registrasi secara Global
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commandsData }
            );
            console.log('[INIT] Slash Commands berhasil terdaftar secara Global.');
        }

        // 4. Login Bot
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('[FATAL] Gagal menginisialisasi bot:', error);
    }
})();