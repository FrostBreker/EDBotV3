const { MessageEmbed } = require('discord.js');
const _ = require('lodash');

function sendSL(member, user, schoollife, client) {
    console.log(`[INFO] Started sending school life to ${user.userId}`);
    if (!client.isEmpty(schoollife) && !client.isEmpty(user.schoollife)) {
        if (!_.isEqual(user.schoollife, schoollife)) {
            const sortedArray = client.getDifference(schoollife, user.schoollife);
            sortedArray.map(async (vs) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | ${vs.type} de ${member.user.tag}`)
                    .setThumbnail(member.avatarURL() || client.user.avatarURL())
                    .setDescription("📢 :" + vs.motif + "\n📚 :" + vs.content + "\n📅 :" + vs.displayDate + "\n🕒 :" + vs.libelle + "\n📝 :" + vs.justifie ? "Oui" : "Non" + "**")
                    .setTimestamp()
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                return await member.send(embedPrincipal).then(async () => {
                    console.log(`[INFO] School life sent to ${user.userId}`);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendSL