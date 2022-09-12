const { MessageEmbed } = require('discord.js');
const _ = require('lodash');
const { baseImageURI } = require("../../config");

async function sendHomeworks(member, user, homeworks, client) {
    if (!client.isEmpty(homeworks) && !client.isEmpty(user.homeworks)) {
        if (!_.isEqual(user.homeworks, homeworks)) {
            const sortedArray = client.getDifference(homeworks, user.homeworks);
            sortedArray.map((s) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Travaille à faire en ${s.subject.name} (${s.teacher})`)
                    .setThumbnail(member.avatarURL() | baseImageURI)
                    .setDescription(`> ${s.job.content.text}\n\n<:planning:959563680398315540> ${s.date ? `<t:${parseInt(Date.parse(s.date) / 1000)}:R>` : "Inconue"}`)
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendHomeworks