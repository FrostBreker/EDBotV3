const { MessageEmbed } = require('discord.js');
const _ = require('lodash');
const { baseImageURI } = require("../../config");

async function sendGrades(member, user, notes, client) {
    if (!client.isEmpty(notes) && !client.isEmpty(user.notes)) {
        if (!_.isEqual(user.notes, notes)) {
            const sortedArray = client.getDifference(notes, user.notes);
            sortedArray.map((s) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Nouvelle note en ${s.subjectName}`)
                    .setThumbnail(member.avatarURL() || baseImageURI)
                    .setDescription("<:annonce:962378435815161936> : **" + s.subjectName + "** - **" + s.name + "** - **" + s._raw.typeDevoir + "**\n\n<:stats:962354418660028416> : " + s.value + "/" + s.outOf + "(**Coef** : " + s._raw.coef + ")\n\n" + client.getPercent(s.value, s.classAvg, s.outOf) + "\n\n<:planning:959563680398315540> : <t:" + parseInt(Date.parse(s._raw.date) / 1000) + ":R>")
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendGrades