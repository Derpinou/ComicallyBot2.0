const { getMember, getCommandStatus, hasPermissions } = require("../../functions.js");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "love",
    aliases: ["loveme", "feels"],
    category: "fun",
    description: "Calculates the love affinity you have for another person.",
    permissions: "member",
    usage: "[mention | id | username]",
    run: (client, message, args) => {
        getCommandStatus(message, "love").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500));
            if (res) {
                hasPermissions(message, "member").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {
                        let person = getMember(message, args[0]);

                        if (!person || message.author.id === person.id) {
                            person = message.guild.members
                                .filter(m => m.id !== message.author.id)
                                .random();
                        }

                        const love = Math.random() * 100;
                        const loveIndex = Math.floor(love / 10);
                        const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

                        const embed = new RichEmbed()
                            .setColor("#ffb6c1")
                            .addField(`☁ **${person.displayName}** loves **${message.member.displayName}** this much:`,
                                `💟 ${Math.floor(love)}%\n\n${loveLevel}`);

                        message.channel.send(embed);
                    }
                })
            }
        })
    }
}