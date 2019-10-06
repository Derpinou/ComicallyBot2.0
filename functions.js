const db = require('./schemas/db.js');

module.exports = {
    hasPermissions: async function (message, commandType) {
        let guildID = message.guild.id;
        let roleIDs = message.member.roles.map(roles => roles.id);
        let userID = message.member.id;

        let hasPermissions = new Promise((resolve, reject) => {
            if (message.member.hasPermission("ADMINISTRATOR")) resolve(true)
            else {
                db.findOne({ guildID: guildID }, (err, exists) => {
                    if (err) console.log(err)
                    if (!exists) {
                    } else {
                        let modRolesIDs = exists.modRoles.map(roles => roles.roleID);
                        let memberRolesIDs = exists.memberRoles.map(roles => roles.roleID)

                        if (commandType === "moderator" && roleIDs.forEach((element) => {
                            if (modRolesIDs.includes(element) || modRolesIDs.includes(userID)) resolve(true)
                        })) {
                            roleIDs.forEach((element) => {
                                if (memberRolesIDs.includes(element)) resolve(true);
                            });
                        } else if (commandType === "member" && roleIDs.forEach((element) => {
                            if (memberRolesIDs.includes(element) || memberRolesIDs.includes(userID)) resolve(true)
                        })) {
                            roleIDs.forEach((element) => {
                                if (memberRolesIDs.includes(element)) resolve(true);
                            });
                        } else resolve(false);
                    }
                })
            }
        });
        let bool = await hasPermissions;
        return bool;
    },
    getCommandStatus: async function (message, command) {
        let guildID = message.guild.id;
        let commandStatus = new Promise((resolve, reject) => {
            db.findOne({
                guildID: guildID,
                commands: {
                    $elemMatch: {
                        name: command
                    }
                }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) return message.reply("Error within database").then(m => m.delete(7500))
                else {
                    if (exists.commands[exists.commands.map(cmd => cmd.name).indexOf(command)].status === true) resolve(true);
                    else resolve(false)
                }
            }).catch(err => console.log(err))
        });
        let status = await commandStatus;
        return status;
    },
    getResponseChannel: async function (message, command) {
        let guildID = message.guild.id;
        let responseChannel = new Promise((resolve, reject) => {
            db.findOne({
                guildID: guildID,
                channels: {
                    $elemMatch: { command: command }
                }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) return message.reply("Try setting channel first").then(m => m.delete(7500));
                else resolve(exists.channels[exists.channels.map(cmd => cmd.command).indexOf(command)].channelID)
            }).catch(err => console.log(err))
        });
        let status = await responseChannel;
        return status;
    },

    getMember: function (message, toFind = '') {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.get(toFind);

        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                    member.user.tag.toLowerCase().includes(toFind)
            });
        }

        if (!target)
            target = message.member;

        return target;
    },

    formatDate: function (date) {
        return new Intl.DateTimeFormat('en-US').format(date)
    },

    promptMessage: async function (message, author, time, validReactions) {
        time *= 1000;

        for (const reaction of validReactions) await message.react(reaction);

        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        return message
            .awaitReactions(filter, {
                max: 1,
                time: time
            })
            .then(collected => collected.first() && collected.first().emoji.name);
    }
}