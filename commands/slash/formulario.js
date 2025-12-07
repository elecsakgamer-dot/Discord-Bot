const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('formulario')
    .setDescription('Envía un botón para abrir un formulario de soporte'),
  async execute(interaction) {
    // Crear el botón que abre el modal
    const button = new ButtonBuilder()
      .setCustomId('open-form-button')
      .setLabel('Abrir Formulario')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      content: 'Para rellenar el formulario presiona aquí 👇',
      components: [row],
      ephemeral: false
    });
  }
};
