const _ = require('lodash');
const { baseImageURI } = require("../../config");

async function sendSL(member, user, schoollife, client) {
    if (schoollife) {
        if (!_.isEqual(user.schoollife, schoollife)) {
            const sortedArray = client.getDifference(schoollife, user.schoollife);
            sortedArray.map((vs) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | ${vs.type} de ${member.user.tag}`)
                    .setThumbnail(member.avatarURL() || baseImageURI)
                    .setDescription("📢 :" + vs.motif + "\n📚 :" + vs.content + "\n📅 :" + vs.displayDate + "\n🕒 :" + vs.libelle + "\n📝 :" + vs.justifie ? "Oui" : "Non" + "**")
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })

                    .setDescription("<:annonce:962378435815161936> : **" + s.subjectName + "** - **" + s.name + "** - **" + s._raw.typeDevoir + "**\n\n<:stats:962354418660028416> : " + s.value + "/" + s.outOf + "(**Coef** : " + s._raw.coef + ")\n\n" + client.getPercent(s.value, s.classAvg, s.outOf) + "\n\n<:planning:959563680398315540> : <t:" + parseInt(Date.parse(s._raw.date) / 1000) + ":R>")
            })
        }
    }
}

module.exports = sendSL