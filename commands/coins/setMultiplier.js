const db = require('../../schemas/db.js');

module.exports = {
    name: "setmultiplier",
    aliases: ["multiplierset", "setcoinsmultiplier", "coinssetmultiplier"],
    category: "coins",
    description: "Get number of coins",
    permissions: "moderator",
    run: (client, message, args) => {
        if (message.deletable) message.delete();

        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a multiplier.").then(m => m.delete(7500));

        if (isNaN(args[0]))
            return message.reply("Please provide a number.").then(m => m.delete(7500));

        if (!isNaN(args[0]))
            if (args[0] > 3) return message.reply("Please provide only numbers 1-3").then(m => m.delete(7500));
            else {
                db.updateOne({ guildID: guildID }, {
                    coinsMultiplier: args[0]
                }).catch(err => console.log(err))
                return message.reply("Server multiplier set to: " + args[0] + "x coins").then(m => m.delete(7500));
            }
    }
}