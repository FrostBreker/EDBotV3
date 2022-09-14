const { MessageEmbed } = require('discord.js');
const _ = require('lodash');

function sendGrades(member, user, notes, client) {
    if (!client.isEmpty(notes) && !client.isEmpty(user.notes)) {
        if (!_.isEqual(user.notes, notes)) {
            const sortedArray = client.getDifference(notes, user.notes);
            sortedArray.map(async (s) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Nouvelle note en ${s.subjectName}`)
                    .setThumbnail(member.avatarURL() || client.user.avatarURL())
                    .setDescription("<:annonce:962378435815161936> : **" + s.subjectName + "** - **" + s.name + "** - **" + s._raw.typeDevoir + "**\n\n<:stats:962354418660028416> : " + s.value + "/" + s.outOf + "(**Coef** : " + s._raw.coef + ")\n\n" + client.getPercent(s.value, s.classAvg, s.outOf) + "\n\n<:planning:959563680398315540> : <t:" + parseInt(Date.parse(s._raw.date) / 1000) + ":R>")
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                return await member.send({ embeds: [embedPrincipal] }).then(async () => {
                    console.log(`[INFO] Notes sent to ${user.userId}`);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendGrades