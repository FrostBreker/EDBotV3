const { MessageEmbed } = require('discord.js');
const _ = require('lodash');

function sendHomeworks(member, user, homeworks, client) {
    if (!client.isEmpty(homeworks) && !client.isEmpty(user.homeworks)) {
        if (!_.isEqual(user.homeworks, homeworks)) {
            const sortedArray = client.getDifference(homeworks, user.homeworks);
            sortedArray.map(async (s) => {
                if (s.job === undefined) return;
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Travaille à faire en ${s.subject.name} (${s.teacher})`)
                    .setThumbnail(member.avatarURL() || client.user.avatarURL())
                    .setDescription(`> ${s.job.content.text}\n\n<:planning:1020044801409826816> ${s.date ? `<t:${parseInt(Date.parse(s.date) / 1000)}:R>` : "Inconue"}`)
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                if (user.userId === "284792282249428993") {
                    client.addHomeworkToNotion(` | ${s.subject.name} (${s.teacher})`, s.job.content.text, s.job.givenAt, s.date);
                }


                return await member.send({ embeds: [embedPrincipal] }).then(() => {
                    client.logger(`${client.timestampParser()} => [INFO] Homeworks sent to ${user.userId}`);
                    return client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendHomeworks