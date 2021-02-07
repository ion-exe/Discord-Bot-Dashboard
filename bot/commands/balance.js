const Discord = require("discord.js");
const db = require("quick.db");

module.exports.run = async (bot, message, args, utils) => {
  let user = message.mentions.members.first() || message.author;
  let bal = db.fetch(`money_${message.guild.id}_${user.id}`);
  if (bal === null) bal = 0;
  let embed = new Discord.MessageEmbed()
    .setColor("#0000FF")
    .setDescription(`**${user}'s Balance**\n\nAmount: ${bal}`);
  message.channel.send(embed);
};

module.exports.help = {
  name: "balance"
};
