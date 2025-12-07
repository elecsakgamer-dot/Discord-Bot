const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listforms')
    .setDescription('Lista formularios enviados (admins)')
    .setDefaultMemberPermissions(0), // requiere permisos (ADMINISTRATOR) o via check
  async execute(interaction) {
    // Solo permitir a administradores o miembros con ManageGuild
    if (!interaction.memberPermissions || !interaction.memberPermissions.has('ManageGuild')) {
      return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
    }

    const filePath = path.join(__dirname, '..', '..', 'data', 'forms.json');
    if (!fs.existsSync(filePath)) return interaction.reply({ content: 'No hay formularios guardados.', ephemeral: true });

    const raw = fs.readFileSync(filePath, 'utf8') || '[]';
    let arr = [];
    try { arr = JSON.parse(raw); } catch (e) { return interaction.reply({ content: 'Error leyendo formularios.', ephemeral: true }); }
    if (!arr.length) return interaction.reply({ content: 'No hay formularios guardados.', ephemeral: true });

    // Paginación: 5 por página
    const pageSize = 5;
    const page = 0;
    const totalPages = Math.ceil(arr.length / pageSize);

    const entries = arr.map((f, idx) => ({ index: idx+1, id: f.id, user: f.user, timestamp: f.timestamp }));

    const buildEmbed = (p) => {
      const start = p * pageSize;
      const chunk = arr.slice(start, start + pageSize);
      const embed = new EmbedBuilder()
        .setTitle(`Formularios — página ${p+1}/${totalPages}`)
        .setColor(0x00cc99)
        .setTimestamp();

      if (!chunk.length) embed.setDescription('No hay entradas en esta página.');
      else {
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i];
          embed.addFields({ name: `#${start + i + 1} — ${item.user.tag}`, value: `ID: ${item.id}\nFecha: ${item.timestamp}`, inline: false });
        }
      }
      return embed;
    };

    const prev = new ButtonBuilder().setCustomId('forms_prev').setLabel('Anterior').setStyle(ButtonStyle.Secondary).setDisabled(true);
    const next = new ButtonBuilder().setCustomId('forms_next').setLabel('Siguiente').setStyle(ButtonStyle.Primary).setDisabled(totalPages <= 1);

    const row = new ActionRowBuilder().addComponents(prev, next);

    // Crear fila de botones para ver cada entrada en la página (máx 5)
    const start = page * pageSize;
    const chunk = entries.slice(start, start + pageSize);
    const viewButtons = chunk.map((it, i) => {
      return new ButtonBuilder()
        .setCustomId(`forms_view:${it.id}`)
        .setLabel(`#${start + i + 1}`)
        .setStyle(ButtonStyle.Primary);
    });
    const viewRow = new ActionRowBuilder();
    if (viewButtons.length) viewRow.addComponents(...viewButtons);

    const replyComponents = viewButtons.length ? [row, viewRow] : [row];

    const reply = await interaction.reply({ embeds: [buildEmbed(page)], components: replyComponents, fetchReply: true, ephemeral: false });

    // Guardar estado en memoria (será leído por index.js)
    // index.js mantiene el mapa formsPages
    // Guardaremos con la key = message.id and value = { entries: arr, pageSize, page }

    // Intentar exponer un objeto global para index.js: client.formsPages
    if (interaction.client && interaction.client.formsPages) {
      interaction.client.formsPages.set(reply.id, { entries: arr, pageSize, page, totalPages });
    }
  }
};
