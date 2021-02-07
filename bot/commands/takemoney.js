const Discord = require("discord.js");
const db = require("quick.db");

module.exports.run = async (bot, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR"))
    return message.author.send("You dont have access to that command");
  let user = message.mentions.members.first() || message.author;
  if (isNaN(parseInt(args[1]))) return message.channel.send("nOt A nUmBeR");
  db.subtract(`money_${message.guild.id}_${user.id}`, args[1]);
  let bal = await db.fetch(`money_${message.guild.id}_${user.id}`);

  let embed = new Discord.MessageEmbed()
    .setColor("#FF0000")
    .setDescription(`Given ${args[1]} coins\n\nNew Balance: ${bal}`);
  message.channel.send(embed);
};

module.exports.help = {
  name: "takemoney"
};
