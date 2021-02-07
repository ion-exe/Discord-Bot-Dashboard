const Discord = require('discord.js');
const db = require('quick.db');

module.exports.run = function(client, message, args) {
  let rand = Math.random();
  let succeed = false;
  if (rand > 0.8) succeed = true;
  let userBal = db.fetch(`money_${message.guild.id}_${message.author.id}`);
  let money = Math.floor(rand * 1000);
  let failMsg = 'You were caught by the security cactus!'
  let sucMsg = 'You fooled the security cactus and got '+money+' coins!'
  if (succeed) db.add(`money_${message.guild.id}_${user.id}`, money);
  let emb = new Discord.MessageEmbed().setTitle('Heist Mission Results').setDescription(succeed? sucMsg : failMsg)
}

module.exports.help = {
  name: 'heist'
}
