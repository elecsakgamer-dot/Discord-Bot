const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'crearticket',
  description: 'Crea un ticket privado para soporte',

  async execute(message, args) {
    const guild = message.guild;
    if (!guild) return message.reply('Este comando solo funciona dentro de un servidor.');

    const ticketCategoryId = process.env.TICKET_CATEGORY_ID || null;
    const supportRoleId = process.env.TICKET_ROLE_ID || null;

    // Generar nombre: ticket-usuario-1234
    const safeName = message.author.username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortId = Date.now().toString().slice(-4);
    const channelName = `ticket-${safeName}-${shortId}`;

    try {
      const permissionOverwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: message.author.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        },
        {
          id: message.client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ];

      if (supportRoleId) {
        permissionOverwrites.push({
          id: supportRoleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        });
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategoryId || undefined,
        permissionOverwrites,
        topic: `ticket:${message.author.id}`
      });

      await channel.send({ content: `${message.author}, tu ticket ha sido creado: <#${channel.id}>${supportRoleId ? ` <@&${supportRoleId}>` : ''}` });
      await channel.send('Describe tu problema o pregunta con la mayor cantidad de detalles posible. Usa `!cerrar` cuando quieras cerrar este ticket.');

      await message.reply(`He creado tu ticket: ${channel}`);
    } catch (err) {
      console.error('Error creando ticket:', err);
      message.reply('No pude crear el ticket. Asegúrate de que tengo permisos para crear canales y gestionar permisos.');
    }
  }
};
