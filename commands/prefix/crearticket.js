const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'creartickets',
  description: 'Publica un menú interactivo para crear tickets por categoría',
  async execute(message, args) {
    // Leer categorías de env o usar por defecto
    const raw = process.env.TICKET_CATEGORIES || 'Postular al trabajo,Comprar armas';
    const categories = raw.split(',').map(s => s.trim()).filter(Boolean);

    if (categories.length === 0) return message.reply('No hay categorías configuradas. Define TICKET_CATEGORIES en .env');

    // Leer URL de imagen opcional
    const imageUrl = process.env.TICKET_IMAGE_URL || null;

    const embed = new EmbedBuilder()
      .setTitle('ꜱᴇʀᴠɪᴄɪᴏꜱ ´´ᴄᴏꜱᴀ ɴᴏꜱᴛʀᴀ´´')
      .setDescription('𝘌𝘯 𝘦𝘴𝘵𝘦 𝘢𝘱𝘢𝘳𝘵𝘢𝘥𝘰 𝘦𝘯𝘤𝘰𝘯𝘵𝘳𝘢𝘳𝘢𝘴 𝘭𝘢𝘴 𝘴𝘪𝘨𝘶𝘪𝘦𝘯𝘵𝘦𝘴 𝘰𝘱𝘤𝘪𝘰𝘯𝘦𝘴:\n\n- 💼 𝘗𝘰𝘴𝘵𝘶𝘭𝘢𝘳 𝘱𝘢𝘳𝘢 𝘦𝘭 𝘵𝘳𝘢𝘣𝘢𝘫𝘰.\n- 💰 𝘊𝘰𝘮𝘱𝘳𝘢𝘳.\n\n¡¡𝘌𝘴 𝘪𝘮𝘱𝘰𝘳𝘵𝘢𝘯𝘵𝘦 𝘢𝘣𝘳𝘪𝘳 𝘦𝘭 𝘵𝘪𝘤𝘬𝘦𝘵 𝘦𝘯 𝘭𝘢 𝘤𝘢𝘵𝘦𝘨𝘰𝘳í𝘢 𝘥𝘦𝘴𝘵𝘪𝘯𝘢𝘥𝘢!!\n\n((𝘛𝘦𝘯 𝘦𝘯 𝘤𝘶𝘦𝘯𝘵𝘢 𝘲𝘶𝘦 𝘢𝘭 𝘢𝘣𝘳𝘪𝘳 𝘵𝘪𝘤𝘬𝘦𝘵, 𝘵𝘰𝘥𝘰 𝘧𝘶𝘯𝘤𝘪𝘰𝘯𝘢 𝘤𝘰𝘮𝘰 𝘤𝘢𝘯𝘢𝘭 𝘐𝘊.))\n\n𝘛𝘰𝘥𝘰 𝘵𝘪𝘤𝘬𝘦𝘵 𝘦𝘴𝘵á 𝘱𝘳𝘰𝘵𝘦𝘨𝘪𝘥𝘰 𝘱𝘰𝘳 𝘶𝘯𝘢 𝘝𝘗𝘕 𝘱𝘳𝘪𝘷𝘢𝘥𝘢 𝘤𝘰𝘯 𝘶𝘯𝘢 𝘐𝘗 𝘲𝘶𝘦 𝘯𝘰 𝘴𝘦 𝘱𝘶𝘦𝘥𝘦 𝘳𝘢𝘴𝘵𝘳𝘦𝘢𝘳, 𝘵𝘰𝘥𝘰 𝘵𝘳𝘢𝘵𝘰 𝘴𝘦 𝘭𝘭𝘦𝘷𝘢𝘳á 𝘢 𝘤𝘢𝘣𝘰 𝘣𝘢𝘫𝘰 𝘯𝘰𝘮𝘣𝘳𝘦𝘴 𝘢𝘯ó𝘯𝘪𝘮𝘰 𝘶 𝘢𝘱𝘰𝘥𝘰𝘴.')
      .setColor(0xb977ff);

    // Agregar thumbnail si está configurada la URL
    if (imageUrl) {
      embed.setThumbnail(imageUrl);
    }

    // Crear opciones del menú
    const selectOptions = categories.map((label, index) => ({
      label: label,
      value: `ticket:${encodeURIComponent(label)}`,
      description: `Crear un ticket de ${label}`,
      emoji: index === 0 ? '💼' : '💰' // emojis de ejemplo, personaliza según necesites
    }));

    // Crear el Select Menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('ticket-menu')
      .setPlaceholder('Selecciona una categoría...')
      .addOptions(selectOptions);

    const row = new ActionRowBuilder()
      .addComponents(selectMenu);

    try {
      await message.channel.send({ embeds: [embed], components: [row] });
      await message.reply({ content: 'Menú de creación de tickets publicado.', ephemeral: true }).catch(() => {});
    } catch (err) {
      console.error('Error publicando menú de creación de tickets:', err);
      message.reply('No pude publicar el menú de creación de tickets. Revisa permisos.');
    }
  }
};
