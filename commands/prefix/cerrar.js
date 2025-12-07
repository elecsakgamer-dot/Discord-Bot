module.exports = {
  name: 'cerrar',
  description: 'Cierra (elimina) el ticket actual si estás autorizado',
  async execute(message, args) {
    if (!message.guild) return message.reply('Este comando solo funciona en servidores.');

    const channel = message.channel;
    const topic = channel.topic || '';
    if (!topic.startsWith('ticket:')) return message.reply('Este comando solo puede usarse dentro de canales de ticket.');

    const ownerId = topic.split(':')[1];
    const authorId = message.author.id;
    const member = message.member;

    const supportRoleId = process.env.TICKET_ROLE_ID || null;

    const isOwner = ownerId === authorId;
    const hasManage = member.permissions.has('ManageChannels');
    const isSupport = supportRoleId ? member.roles.cache.has(supportRoleId) : false;

    if (!isOwner && !hasManage && !isSupport) {
      return message.reply('No tienes permiso para cerrar este ticket.');
    }

    try {
      await channel.send('Cerrando ticket...');
      await new Promise(r => setTimeout(r, 2000));
      await channel.delete('Ticket cerrado por comando');
    } catch (err) {
      console.error('Error cerrando ticket:', err);
      message.reply('No pude eliminar el canal. ¿Tengo permisos para eliminar canales?');
    }
  }
};
