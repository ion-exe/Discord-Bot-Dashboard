const Discord = require("discord.js");
const db = require("quick.db");
const ms = require("parse-ms");

module.exports.run = async (bot, message, args) => {
  let user = message.author;
  let timeout = 86400000;
  let amount = 200;
  let daily = await db.fetch(`daily_${message.guild.id}_${user.id}`);
  if (daily !== null && timeout - (Date.now() - daily) > 0) {
    let t = ms(timeout - (Date.now() - daily));
    let tembed = new Discord.MessageEmbed()
      .setColor("#FFFFFF")
      .setDescription(
        `You've already collected your daily reward\n\nCollect it again in ${t.hours}H ${t.minutes}M ${t.seconds}S `
      );
    message.channel.send(tembed);
  } else {
    let embed = new Discord.MessageEmbed()
      .setColor("#FFFFFF")
      .setDescription(
        `You've collected your daily reward of ${amount} coins`
      );
    message.channel.send(embed);
    db.add(`money_${message.guild.id}_${user.id}`, amount);
    db.set(`daily_${message.guild.id}_${user.id}`, Date.now());
  }
};

module.exports.help = {
  name: "daily"
};
