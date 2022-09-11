const _ = require('lodash');
const { baseImageURI } = require("../../config");

async function sendCanceledClass(member, user, schedule, client) {
    if (schedule) {
        if (!_.isEqual(user.schedule, client.getCanceledClasses(schedule))) {
            const sortedArray = client.getDifference(client.getCanceledClasses(schedule), user.schedule);
            sortedArray.map((s) => {
                var days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
                var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'decembre'];
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 📅 | **Cours de ${s.subject} annulé pour le ${days[new Date(s.startDate).getDay()]} ${new Date(s.startDate).getDate() < 10 ? 0 + new Date(s.startDate).getDate() : new Date(s.startDate).getDate()} ${months[new Date(s.startDate).getMonth()]}**`)
                    .setThumbnail(member.avatarURL() || baseImageURI)
                    .setTimestamp()
                    .addFields(
                        { name: "👩‍🏫", value: `**${s.teacher}**`, inline: true },
                        { name: "🕒", value: `**De ${s._raw.start_date.split(" ")[1]} à ${s._raw.end_date.split(" ")[1]}**`, inline: true },
                    )
                    .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendCanceledClass;