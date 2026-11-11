const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[INFO] Bot berhasil online sebagai ${client.user.tag}`);
    console.log(`[INFO] Terhubung ke ${client.guilds.cache.size} server.`);
  },
};