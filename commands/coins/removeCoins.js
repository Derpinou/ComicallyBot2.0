const coins = require('../../schemas/coins.js');

module.exports = {
    name: "removecoins",
    aliases: ["coinsremove"],
    category: "coins",
    description: "Remove coins to user",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        if (message.deletable) message.delete();
        let guildID = message.guild.id;
        let userIDs = message.guild.members.map(role => role.user.id);

        if (!args[0])
            return message.reply("Please provide a user.").then(m => m.delete(7500));

        let userMention = args[0].slice(2, args[0].length - 1);

        if (!args[1])
            return message.reply("Please provide amount of coins.").then(m => m.delete(7500));

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return message.reply("Please provide a valid amount above 0.").then(m => m.delete(7500));

        if (userIDs.includes(args[0]))
            removeCoins(args[0], parseInt(args[1]))

        if (userIDs.includes(userMention))
            removeCoins(userMention, parseInt(args[1]))

        if (!userIDs.includes(args[0]) && !userIDs.includes(userMention))
            return message.reply("User not found.").then(m => m.delete(7500));

        function removeCoins(userID, coinsToRemove) {
            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (!exists) return message.reply("This user has not yet been added to the database.").then(m => m.delete(7500))
                else {
                    if (exists.coins - coinsToRemove < 0) return message.reply("A user may not go below 0 coins").then(m => m.delete(7500))
                    else {
                        exists.coins -= coinsToRemove;
                        exists.save().catch(err => console.log(err));
                        return message.reply(coinsToRemove + " coins were removed to the user.").then(m => m.delete(7500))
                    }
                }
            }).catch(err => console.log(err))
        }
    }
}