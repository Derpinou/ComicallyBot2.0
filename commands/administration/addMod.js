const db = require('../../schemas/db.js');
const { findID } = require("../../functions.js");

const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "addmod",
    aliases: ["amod", "modadd"],
    category: "administration",
    description: "Add permitted role/user for mod commands",
    permissions: "admin",
    usage: "<role name|@role|userID|@user>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "mods-log") || message.channel;
        let guildID = message.guild.id;
        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("Please provide a user/role.").then(m => m.delete(7500));

        let roleNames = message.guild.roles.map(role => role.name.toLowerCase());
        let roleIDs = message.guild.roles.map(role => role.id);
        let userNames = message.guild.members.map(user => user.user.username.toLowerCase());
        let userIDs = message.guild.members.map(user => user.user.id);

        let ID = findID(message, args[0])

        if (!ID)
            return message.reply("user/role not found").then(m => m.delete(7500));

        //if it is a role
        if (roleIDs.includes(ID))
            addMod(roleNames[roleIDs.indexOf(ID)], ID)

        //if it is a user
        if (userIDs.includes(ID))
            addMod(userNames[userIDs.indexOf(ID)], ID)

        function addMod(roleName, roleID) {
            db.findOne({
                guildID: guildID, modRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { modRoles: { roleName: roleName, roleID: roleID } }
                    }).then(function () {

                        const embed = new RichEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.member.displayAvatarURL)
                            .setFooter(message.member.displayName, message.author.displayAvatarURL)
                            .setTimestamp()
                            .setDescription(stripIndents`**> Mod Added by:** ${message.member.user.username} (${message.member.id})
                    **> Role/User Added:** ${roleName} (${roleID})`);

                        logChannel.send(embed);

                        return message.reply("Adding mod... this may take a second...").then(m => m.delete(7500));
                    }).catch(err => console.log(err))
                } else return message.reply("user/role already added.").then(m => m.delete(7500));
            }).catch(err => console.log(err))
        }
    }
}