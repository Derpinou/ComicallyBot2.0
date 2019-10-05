const { getCommandStatus, hasPermissions } = require("../../functions.js")

module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    permissions: "member",
    run: async (client, message, args) => {
        getCommandStatus(message, "ping").then(async function (res) {
            if (res === false) message.reply("Command disabled.").then(m => m.delete(5000))
            if (res === true) {
                hasPermissions(message, "member").then(async function (res) {
                    if (res === false) message.reply("You do not have permissions for this command.").then(m => m.delete(5000))
                    if (res === true) {
                        if (message.deletable) message.delete();
                        const msg = await message.channel.send(`🏓 Pinging....`);
                        msg.edit(`🏓 Pong!
                Latency is ${Math.floor(msg.createdTimestap - message.createdTimestap)}ms
                API Latency is ${Math.round(client.ping)}ms`);
                    }
                });
            }
        });
    }
}