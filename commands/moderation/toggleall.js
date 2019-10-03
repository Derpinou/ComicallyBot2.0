const db = require('../../schemas/db.js');

module.exports = {
    name: "toggleall",
    aliases: ["allcommands"],
    category: "moderation",
    description: "Enable or disable commands",
    usage: "<true|false>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let commands = client.commands.map(cmd => cmd.name);

        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return message.reply("You don't have the required permissions to use this command.").then(m => m.delete(7500));

        if (!args[0])
            return message.reply("Please provide a true or false/enable or disable.").then(m => m.delete(7500))

        if (args[0] !== "true" && args[0] !== "false" && args[0] !== "enable" && args[0] !== "disable")
            return message.reply("Please provide only true or false/enable or disable.").then(m => m.delete(7500))

        if (args[0] === "true" || args[0] === "enable") {
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({
                    guildID: guildID,
                    'commands.name': cmdIndex
                }, {
                    $set: {
                        'commands.$.status': true
                    }
                }).catch(err => console.log(err))
            });
            if (message.deletable) message.delete();
            return message.reply("Toggling all commands on... this may take a second...").then(m => m.delete(7500))
        }

        if (args[0] === "false" || args[0] === "disable") {
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({
                    guildID: guildID,
                    'commands.name': cmdIndex
                }, {
                    $set: {
                        'commands.$.status': false
                    }
                }).catch(err => console.log(err))
            });
            if (message.deletable) message.delete();
            return message.reply("Toggling all commands off... this may take a second...").then(m => m.delete(7500))
        }
    }
}