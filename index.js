require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { 
    Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, 
    ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const formCache = new Map();
client.formsPages = new Map();

client.once('ready', () => {
    console.log(`✅ Bot conectado como: ${client.user.tag}`);
});

// ========== CARGAR COMANDOS ==========
client.slashCommands = new Map();
const slashCommandsPath = path.join(__dirname, 'commands', 'slash');
if (fs.existsSync(slashCommandsPath)) {
    for (const file of fs.readdirSync(slashCommandsPath).filter(f => f.endsWith('.js'))) {
        const cmd = require(path.join(slashCommandsPath, file));
        if (cmd?.data) client.slashCommands.set(cmd.data.name, cmd);
    }
}

client.commands = new Map();
const prefix = process.env.PREFIX || '!';
const commandsPath = path.join(__dirname, 'commands', 'prefix');
if (fs.existsSync(commandsPath)) {
    for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
        const cmd = require(path.join(commandsPath, file));
        if (cmd?.name) client.commands.set(cmd.name, cmd);
    }
}

// ========== PRE-CONSTRUIR MODALES PARA VELOCIDAD ==========
function crearModalPaso1() {
    const modal = new ModalBuilder()
        .setCustomId('form-step-1')
        .setTitle('Formulario - Paso 1');

    const inputs = [
        { id: 'q1_name', label: '1. Nombre y Apellido', placeholder: 'Tu respuesta...', style: TextInputStyle.Short },
        { id: 'q2_id', label: '2. ID general', placeholder: 'Ej: 123456789', style: TextInputStyle.Short },
        { id: 'q3_weapons', label: '3. ¿Posees habilidades de armas?', placeholder: 'Describe tus habilidades...', style: TextInputStyle.Short },
        { id: 'q4_oxxos', label: '4. ¿Un mafioso puede robar oxxos?', placeholder: 'Si o No — explica si quieres', style: TextInputStyle.Short },
        { id: 'q5_steal_civils', label: '5. ¿Un mafioso puede robar civiles?', placeholder: 'Si o No — explica si quieres', style: TextInputStyle.Short }
    ];

    inputs.forEach(input => {
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(input.id)
                    .setLabel(input.label)
                    .setStyle(input.style)
                    .setPlaceholder(input.placeholder)
                    .setRequired(true)
            )
        );
    });

    return modal;
}

function crearModalPaso2() {
    const modal = new ModalBuilder()
        .setCustomId('form-step-2')
        .setTitle('Formulario - Paso 2');

    const inputs = [
        { id: 'q6_bike', label: '6. ¿Qué se considera en las siglas de rol?', placeholder: 'Si me tiro de una montaña en bici — explica las siglas', style: TextInputStyle.Paragraph },
        { id: 'q7_micro', label: '7. ¿Cuentas con microfono/grabador funcional?', placeholder: 'Si o No — indica modelo si aplica', style: TextInputStyle.Short },
        { id: 'q8_warn', label: '8. ¿Tienes warn? (Si es así, justifica.)', placeholder: 'Explica los warns y razones', style: TextInputStyle.Short },
        { id: 'q9_abatir', label: '9. ¿Abatir en Zona Roja/Bizwar sin aviso?', placeholder: 'Si o No — aclara condiciones', style: TextInputStyle.Short },
        { id: 'q10_platform', label: '10. ¿Juegas en android o PC?', placeholder: 'Android o PC', style: TextInputStyle.Short }
    ];

    inputs.forEach(input => {
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(input.id)
                    .setLabel(input.label)
                    .setStyle(input.style)
                    .setPlaceholder(input.placeholder)
                    .setRequired(true)
            )
        );
    });

    return modal;
}

// Map de etiquetas para mostrar en el embed de resultados
const QUESTION_LABELS = {
    q1_name: 'Nombre y Apellido',
    q2_id: 'ID general',
    q3_weapons: '¿Posees habilidades de armas?',
    q4_oxxos: '¿Un mafioso puede robar oxxos?',
    q5_steal_civils: '¿Un mafioso puede robar civiles?',
    q6_bike: 'Si me tiro de una montaña en bici ¿Qué se considera en las siglas de rol?',
    q7_micro: '¿Cuentas con microfono/grabador funcional?',
    q8_warn: '¿Tienes warn? (Si es así, justifica.)',
    q9_abatir: '¿Puedo abatir en Zona Roja/Bizwar sin aviso?',
    q10_platform: '¿Juegas en android o PC?'
};

// ========== MANEJADOR CENTRALIZADO DE INTERACCIONES ==========
client.on('interactionCreate', async (interaction) => {
    try {
        // 1️⃣ COMANDOS SLASH - DEFER INMEDIATAMENTE
        if (interaction.isChatInputCommand()) {
            const command = client.slashCommands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (err) {
                console.error('Error en comando:', err);
                try {
                    const method = interaction.deferred ? 'editReply' : 'reply';
                    await interaction[method]({ content: 'Error al ejecutar.', ephemeral: true });
                } catch (e) {}
            }
            return;
        }

        // 2️⃣ BOTÓN DEL FORMULARIO - RESPONDER YA
        if (interaction.isButton() && interaction.customId === 'open-form-button') {
            try {
                const modal = crearModalPaso1();
                await interaction.showModal(modal);
                console.log('✓ Modal paso 1 mostrado a:', interaction.user.tag);
            } catch (err) {
                console.error('Error showModal:', err.message);
            }
            return;
        }

        // BOTÓN: abrir paso 2 (mostrado después del submit del paso 1)
        if (interaction.isButton() && interaction.customId === 'open-form-step-2') {
            try {
                const modal2 = crearModalPaso2();
                await interaction.showModal(modal2);
                console.log('✓ Modal paso 2 mostrado (desde botón) a:', interaction.user.tag);
            } catch (err) {
                console.error('Error showModal paso 2:', err.message);
                try {
                    await interaction.reply({ content: 'No se pudo abrir el Paso 2. Inténtalo de nuevo.', ephemeral: true });
                } catch (e) {}
            }
            return;
        }

        // 3️⃣ MODAL PASO 1 - RÁPIDO
        if (interaction.isModalSubmit() && interaction.customId === 'form-step-1') {
            console.log('--- handling form-step-1:', { user: interaction.user?.tag, type: interaction.type, customId: interaction.customId, hasShowModal: typeof interaction.showModal });
            try {
                const step1 = {
                    q1_name: interaction.fields.getTextInputValue('q1_name'),
                    q2_id: interaction.fields.getTextInputValue('q2_id'),
                    q3_weapons: interaction.fields.getTextInputValue('q3_weapons'),
                    q4_oxxos: interaction.fields.getTextInputValue('q4_oxxos'),
                    q5_steal_civils: interaction.fields.getTextInputValue('q5_steal_civils')
                };

                // Guardar paso 1 en cache
                formCache.set(interaction.user.id, { step1, channelId: interaction.channelId });

                // No intentar abrir el siguiente modal directamente desde un submit (puede fallar).
                // En su lugar, enviamos un mensaje efímero con un botón para abrir el Paso 2.
                const continueBtn = new ButtonBuilder()
                    .setCustomId('open-form-step-2')
                    .setLabel('Continuar al Paso 2')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(continueBtn);

                await interaction.reply({ content: 'Paso 1 recibido. Pulsa el botón para abrir el Paso 2.', ephemeral: true, components: [row] });
                console.log('✓ Paso 1 almacenado y botón para paso 2 enviado a:', interaction.user.tag);
            } catch (err) {
                console.error('Error form-step-1 full:', err);
                try { await interaction.reply({ content: 'Error al procesar Paso 1. Inténtalo de nuevo.', ephemeral: true }); } catch (e) {}
            }
            return;
        }

        // 4️⃣ MODAL PASO 2 - GUARDAR Y ENVIAR
        if (interaction.isModalSubmit() && interaction.customId === 'form-step-2') {
            try {
                const userId = interaction.user.id;
                const cache = formCache.get(userId);
                if (!cache) {
                    return interaction.reply({ content: 'Sesión expirada.', ephemeral: true });
                }

                const step2 = {
                    q6_bike: interaction.fields.getTextInputValue('q6_bike'),
                    q7_micro: interaction.fields.getTextInputValue('q7_micro'),
                    q8_warn: interaction.fields.getTextInputValue('q8_warn'),
                    q9_abatir: interaction.fields.getTextInputValue('q9_abatir'),
                    q10_platform: interaction.fields.getTextInputValue('q10_platform')
                };

                const formId = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const fullForm = {
                    id: formId,
                    user: { id: userId, tag: interaction.user.tag },
                    timestamp: new Date().toISOString(),
                    channelId: cache.channelId,
                    data: { ...cache.step1, ...step2 }
                };

                // Guardar a archivo
                const filePath = path.join(__dirname, 'data', 'forms.json');
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }

                let forms = [];
                if (fs.existsSync(filePath)) {
                    try {
                        forms = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
                    } catch (e) {}
                }
                forms.push(fullForm);
                fs.writeFileSync(filePath, JSON.stringify(forms, null, 2));

                // Enviar resultado al canal
                const resultsChannel = interaction.guild?.channels.cache.get(process.env.FORM_RESULTS_CHANNEL || '1446760324144300042');
                if (resultsChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('📋 Nuevo Formulario')
                        .setColor(0x00ff00)
                        .addFields(
                            { name: 'Usuario', value: `${interaction.user.tag}`, inline: false },
                            { name: 'ID', value: formId, inline: false }
                        );

                    Object.entries(fullForm.data).forEach(([k, v]) => {
                        const label = QUESTION_LABELS[k] || k.replace(/_/g, ' ');
                        // Asegurar string y longitud razonable
                        const value = (v === null || v === undefined) ? '—' : String(v).slice(0, 1024);
                        embed.addFields({ name: label, value, inline: false });
                    });

                    embed.setTimestamp();
                    resultsChannel.send({ embeds: [embed] }).catch(e => console.error('Error enviando embed:', e.message));
                }

                // Responder
                await interaction.reply({ content: '✅ Formulario enviado.', ephemeral: true });
                formCache.delete(userId);
                console.log('✓ Formulario enviado por:', interaction.user.tag);
            } catch (err) {
                console.error('Error form-step-2:', err.message);
                try {
                    await interaction.reply({ content: 'Error al procesar.', ephemeral: true });
                } catch (e) {}
            }
            return;
        }

        // 5️⃣ BOTONES DE PAGINACIÓN
        if (interaction.isButton()) {
            const cid = interaction.customId || '';
            if (!cid.startsWith('forms_')) return;

            const msgId = interaction.message?.id;
            if (!msgId) return;

            const state = client.formsPages.get(msgId);
            if (!state) return;

            const { entries = [], pageSize = 5, totalPages = 1 } = state;
            let { page = 0 } = state;

            if (cid === 'forms_prev') page = Math.max(0, page - 1);
            else if (cid === 'forms_next') page = Math.min(totalPages - 1, page + 1);

            state.page = page;

            const start = page * pageSize;
            const chunk = entries.slice(start, start + pageSize);

            const embed = new EmbedBuilder()
                .setTitle(`Formularios — ${page + 1}/${totalPages}`)
                .setColor(0x00cc99)
                .setTimestamp();

            if (chunk.length === 0) {
                embed.setDescription('Sin entradas.');
            } else {
                chunk.forEach((item, i) => {
                    embed.addFields({ name: `#${start + i + 1} — ${item.user.tag}`, value: `ID: ${item.id}`, inline: false });
                });
            }

            const prevBtn = new ButtonBuilder().setCustomId('forms_prev').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(page === 0);
            const nextBtn = new ButtonBuilder().setCustomId('forms_next').setLabel('▶').setStyle(ButtonStyle.Primary).setDisabled(page === totalPages - 1);
            const row = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

            try {
                await interaction.update({ embeds: [embed], components: [row] });
            } catch (err) {
                console.error('Error paginación:', err.message);
            }
            return;
        }

        // 6️⃣ MENSAJES CON PREFIJO
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket-menu') {
            const cat = decodeURIComponent(interaction.values[0].split(':').slice(1).join(':'));
            const guild = interaction.guild;
            if (!guild) return interaction.reply({ content: 'Solo en servidores.', ephemeral: true });

            const user = interaction.user;
            const ticketCat = process.env.TICKET_CATEGORY_ID;
            const supportRole = process.env.TICKET_ROLE_ID;

            const slug = `${cat}-${user.username.toLowerCase().slice(0, 8)}-${Date.now().toString().slice(-4)}`.replace(/[^a-z0-9-]/g, '-');

            try {
                await interaction.deferReply({ ephemeral: true });

                const perms = [
                    { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
                    { id: user.id, allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'ReadMessageHistory'] },
                    { id: client.user.id, allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ReadMessageHistory'] }
                ];

                if (supportRole) {
                    perms.push({ id: supportRole, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] });
                }

                const ch = await guild.channels.create({
                    name: slug,
                    type: 0,
                    parent: ticketCat || undefined,
                    permissionOverwrites: perms,
                    topic: `ticket:${user.id}:${cat}`
                });

                await ch.send({ content: `${user}, tu ticket de **${cat}** creado.`, allowedMentions: { users: [user.id] } });
                await interaction.editReply({ content: `Ticket: ${ch}`, ephemeral: true });
            } catch (err) {
                console.error('Error ticket:', err.message);
                try { await interaction.editReply({ content: 'Error al crear.', ephemeral: true }); } catch (e) {}
            }
            return;
        }

    } catch (err) {
        console.error('Error crítico:', err.message);
    }
});

// Mensajes por prefijo
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (err) {
        console.error('Error comando prefijo:', err);
        message.reply('Error al ejecutar.');
    }
});

client.login(process.env.DISCORD_TOKEN);
