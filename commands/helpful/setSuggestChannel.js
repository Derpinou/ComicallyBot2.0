const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "setsuggestchannel",
    aliases: ["setsuggestch", "suggestchannelset", "rolechannelset", "setrolechannel"],
    category: "helpful",
    description: "Set a channel for suggest command.",
    permissions: "moderator",
    usage: "<channelID|#channel>",
    run: (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a channel.").then(m => del(m, 7500));

        let guildID = message.guild.id;
        let serverChannels = client.channels.cache.map(channel => channel).filter(channel => channel.type === "text").filter(channel => channel.guild.id === guildID)
        let channelNames = serverChannels.map(channel => channel.name)
        let channelIDs = serverChannels.map(channel => channel.id)
        let hashMention = args[0].slice(2, args[0].length - 1)

        if (!channelIDs.includes(hashMention) && !channelIDs.includes(args[0]))
            return message.reply("Channel not found in this server.").then(m => del(m, 7500));

        if (channelIDs.includes(args[0]))
            dbUpdate(args[0], channelNames[channelIDs.indexOf(args[0])]);

        if (channelIDs.includes(hashMention))
            dbUpdate(hashMention, channelNames[channelIDs.indexOf(hashMention)]);

        function dbUpdate(channelID, channelName) {
            db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "suggest" } } }, (err, exists) => {
                if (err) console.log(err);
                if (!exists) {
                    //push channel if it doesn't exist
                    db.updateOne({ guildID: guildID }, {
                        $push: { channels: { command: "suggest", channelID: channelID, channelName: channelName } }
                    }).catch(err => console.log(err));
                    return message.reply("Suggestion channel has been set!").then(m => del(m, 7500));
                } else {
                    ///update channel if it does exist
                    db.updateOne({ guildID: guildID, 'channels.command': "suggest" }, {
                        $set: { 'channels.$.channelID': channelID, 'channels.$.channelName': channelName }
                    }).catch(err => console.log(err));
                    return message.reply("Updated suggest channel.").then(m => del(m, 7500));
                }
            }).catch(err => console.log(err));
        }
    }
}