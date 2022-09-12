const { MessageEmbed } = require('discord.js');
const _ = require('lodash');
const { baseImageURI } = require("../../config");

async function sendMessage(member, user, messages, client) {
    if (!client.isEmpty(messages) && !client.isEmpty(user.messages)) {
        if (!_.isEqual(user.messages, messages)) {
            const sortedArray = client.getDifference(messages, user.messages);
            sortedArray.map(async (s) => {
                const content = await s.getContent();
                let refined = []
                content.text.split("\n").map(x => {
                    if (!x.startsWith("[data:image")) {
                        refined.push(x);
                    }
                })
                const ref = refined ? refined.join("\n") : `Inconnue.`;
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Message de ${s._raw.from.name}`)
                    .setThumbnail(member.avatarURL() || baseImageURI)
                    .setDescription("\n📢 : **" + s._raw.subject + "**\n\n📚  : **" + ref + "**\n\n📅 : " + "<t:" + parseInt(Date.parse(s.date) / 1000) + ":R>")
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendMessage