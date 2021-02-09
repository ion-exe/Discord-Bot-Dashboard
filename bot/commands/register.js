module.exports.run = function(client, message, args) {
  let channelId = message.channel.id;
  let guildId = message.guild.id;
  console.log('ugh')
  if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('nop')
  let db = require('quick.db');
  db.set(`c_${guildId}`, channelId);
  message.channel.send('This channel has been registered to receive messages from the dashboard.')
};
module.exports.help = {
  name: 'register'
}