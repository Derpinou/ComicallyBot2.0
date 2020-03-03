const { getMember } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "goodnight",
    aliases: ["gn"],
    category: "fun",
    description: "Sends a cute goodnight message.",
    permissions: "member",
    run: (client, message, args) => {
        const member = getMember(message, args.join(" "));

        const embed = new MessageEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .addField('Goodnight Message:', `Goodnight ${member.displayName} sleep tight`)
            .setTimestamp();

        message.channel.send(embed).then(m => m.delete({ timeout: 150000 }));;
    }
}