const { MessageEmbed } = require('discord.js');
const _ = require('lodash');

function sendHomeworks(member, user, homeworks, client) {
    if (!client.isEmpty(homeworks) && !client.isEmpty(user.homeworks)) {
        if (!_.isEqual(user.homeworks, homeworks)) {
            const sortedArray = client.getDifference(homeworks, user.homeworks);
            sortedArray.map(async (s) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Travaille à faire en ${s.subject.name} (${s.teacher})`)
                    .setThumbnail(member.avatarURL() || client.user.avatarURL())
                    .setDescription(`> ${s.job !== undefined ? s.job.content.text : "Contenue inconnue"}\n\n<:planning:959563680398315540> ${s.date ? `<t:${parseInt(Date.parse(s.date) / 1000)}:R>` : "Inconue"}`)
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                return await member.send({ embeds: [embedPrincipal] }).then(() => {
                    console.log(`[INFO] Homeworks sent to ${user.userId}`);
                    return client.updateStats("msg");
                }).catch((err) => { console.log(err); })
            })
        }
    }
}

module.exports = sendHomeworks