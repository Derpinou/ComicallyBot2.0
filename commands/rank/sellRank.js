const { del, findID } = require("../../functions.js");
const db = require("../../schemas/db.js");
const coins = require('../../schemas/coins.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "sellrank",
    aliases: ["ranksell",],
    category: "rank",
    description: "Sells a rank for user coins.",
    permissions: "member",
    usage: "<@role|roleID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        let guildID = message.guild.id;
        let userID = message.member.id;
        let author = message.member;

        // No bot permissions
        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I do not have permissions to manage roles. Please contact a moderator.").then(m => del(m, 7500));

        //No rank to buy
        if (!args[0])
            return message.reply("Please provide a rank ID or an at mention of the rank that you wish to buy.").then(m => del(m, 7500));

        let ID = findID(message, args[0], "role");

        //check if they already have rank first, if not check if rank exists in db, then check if they have enough coins, then assign rank.
        if (args[0]) {
            if (ID) {
                if (!message.member.roles.cache.find(r => r.id === ID)) {
                    return message.reply("You don't have this role!").then(m => del(m, 7500));
                } else findRole(ID)
            } else return message.reply("Please provide a valid role.").then(m => del(m, 7500));
        }

        //finds role in database/price of role
        function findRole(roleID) {
            let cost = 0;
            let roleName = "";

            db.findOne({ guildID: guildID, buyableRanks: { $elemMatch: { roleID: roleID } } }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    cost = (exists.buyableRanks[exists.buyableRanks.map(role => role.roleID).indexOf(roleID)].cost);
                    roleName = (exists.buyableRanks[exists.buyableRanks.map(role => role.roleID).indexOf(roleID)].roleName);
                    sell(cost, roleName, roleID)
                } else return message.reply("This rank is not able to be bought or sold").then(m => del(m, 7500));
            })
        }

        //finds the user in coins db, then subtracts purchase cost then attempts to assign role.
        function sell(cost, roleName, roleID) {
            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    author.roles.remove(roleID)
                        .then(res => {
                            exists.coins += cost
                            exists.save().catch(err => console.log(err));
                            message.reply(`You ave successfully sold the ${roleName} role for ${cost} coins!`).then(m => del(m, 7500));

                            const embed = new MessageEmbed()
                                .setColor("#0efefe")
                                .setThumbnail(message.author.displayAvatarURL())
                                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                                .setTimestamp()
                                .setDescription(stripIndents`**> User:** ${message.member.user}
                                **> Rank Sold:** ${roleName} (${roleID})
                                **> Coins Given:** ${cost}`);

                            logChannel.send(embed);
                        })
                } else return message.reply("You do not have coins yet or you are not in the database!").then(m => del(m, 7500));
            }).catch(err => message.reply("Could not remove role due to: " + err + ", no coins were added to your balance."))
        }
    }
}