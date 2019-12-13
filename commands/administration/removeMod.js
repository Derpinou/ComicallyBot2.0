const db = require('../../schemas/db.js');
const { findID } = require("../../functions.js");

const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "removemod",
    aliases: ["rmod", "modremove"],
    category: "administration",
    description: "Remove permitted role/user for mod commands",
    permissions: "admin",
    usage: "<role ID|@role|userID|@user>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "mods-log") || message.channel;
        let guildID = message.guild.id;
        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("Please provide a user/role.").then(m => m.delete(7500));

        let ID = findID(message, args[0]);

        if (!ID)
            return message.reply("user/role not found").then(m => m.delete(7500));
        else removeMod(ID);

        function removeMod(roleID) {
            db.findOne({
                guildID: guildID,
                modRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { modRoles: { roleID: roleID } }
                    }).then(function () {

                        const embed = new RichEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.member.displayAvatarURL)
                            .setFooter(message.member.displayName, message.author.displayAvatarURL)
                            .setTimestamp()
                            .setDescription(stripIndents`**> Mod Removed by:** ${message.member.user.username} (${message.member.id})
                    **> Role/User ID Removed:**  (${roleID})`);

                        logChannel.send(embed);

                        return message.reply("Removing mod... this may take a second...").then(m => m.delete(7500));
                    }).catch(err => console.log(err))
                } else return message.reply("user/role was never added, or it was already removed.").then(m => m.delete(7500));
            }).catch(err => console.log(err))
        }
    }
}