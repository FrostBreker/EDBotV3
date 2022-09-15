const { MessageEmbed } = require('discord.js');
const _ = require('lodash');

function sendMessage(member, user, messages, client) {
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
                    .setThumbnail(member.avatarURL() || client.user.avatarURL())
                    .setDescription("\n📢 : **" + s._raw.subject + "**\n\n📚  : **" + ref + "**\n\n<:planning:1020044801409826816> : " + "<t:" + parseInt(Date.parse(s.date) / 1000) + ":R>")
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                return await member.send({ embeds: [embedPrincipal] }).then(async () => {
                    console.log(`[INFO] Messages sent to ${user.userId}`);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendMessage