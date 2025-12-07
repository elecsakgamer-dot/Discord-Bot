require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Para registrar en un servidor específico (desarrollo)

if (!TOKEN || !CLIENT_ID) {
    console.error('Error: Falta DISCORD_TOKEN o CLIENT_ID en .env');
    process.exit(1);
}

const commands = [];
const slashCommandsPath = path.join(__dirname, 'commands', 'slash');

if (fs.existsSync(slashCommandsPath)) {
    const commandFiles = fs.readdirSync(slashCommandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const cmd = require(path.join(slashCommandsPath, file));
        if (cmd.data) {
            commands.push(cmd.data.toJSON());
            console.log(`✓ Comando cargado: /${cmd.data.name}`);
        }
    }
}

if (commands.length === 0) {
    console.warn('⚠️ No se encontraron comandos slash para registrar.');
    process.exit(0);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`\n📝 Registrando ${commands.length} comando(s) de aplicación...`);

        if (GUILD_ID) {
            // Registrar en un servidor específico (más rápido, para desarrollo)
            console.log(`📌 Modo: Servidor específico (GUILD_ID: ${GUILD_ID})\n`);
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        } else {
            // Registrar globalmente (puede tomar hasta 1 hora)
            console.log('🌍 Modo: Global (puede tardar hasta 1 hora en aparecer)\n');
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        }

        console.log('✅ Comandos registrados exitosamente.');
    } catch (err) {
        console.error('❌ Error registrando comandos:', err);
        process.exit(1);
    }
})();
