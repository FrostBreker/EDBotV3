const { MessageEmbed } = require('discord.js');
const { baseImageURI } = require('../config');

const color = 430591;
module.exports = {
    schoolLife: (user, vs, client) => {
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`> 🔔 | ${vs.typeElement} de ${user.tag}`)
            .setThumbnail(user.avatarURL() || client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

        switch (vs.typeElement) {
            case "Punition":
                embedPrincipal.setDescription(`${vs.motif !== "" ? `📢 **${vs.motif}**` : null}${vs.aFaire !== "" ? `\n\n📚 **${vs.aFaire}**` : null}${vs.dateDeroulement !== "" ? `\n\n<:planning:1020044801409826816> **${vs.dateDeroulement}**` : null}${vs.libelle !== "" ? `\n\n🕒 **${vs.libelle}**` : null}`)
                break;
            default:
                embedPrincipal.setDescription(`${vs.motif !== "" ? `📢 **${vs.motif}**` : ""}${vs.displayDate !== "" ? `\n\n<:planning:1020044801409826816> **${vs.displayDate}**` : null}${vs.libelle !== "" ? `\n\n🕒 **${vs.libelle}**` : null}`)
                break;
        }
        return embedPrincipal;
    },
    Timeline: async (timeline, user, client) => {
        const date = timeline[0].start_date.split(" ");

        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`🔔 | Emplois du temps du: ${date[0]}`)
            .setThumbnail(user.avatarURL() || baseImageURI)
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })
            .addField('\u200B', '\u200B');

        if (timeline[0].typeCours === "CONGE") {
            return await interaction.editReply({ embeds: [noHomework()], ephemeral: true });
        } else {
            for (let i = 0; i < timeline.length; i++) {
                const startDate = timeline[i].start_date.split(" ");
                const endDate = timeline[i].end_date.split(" ");

                embedPrincipal.addFields(
                    { name: "📚", value: `**${timeline[i].text || timeline[i].matiere}** de **${startDate[1]}** à **${endDate[1]}**.`, inline: true },
                    { name: "👩‍🏫", value: `**${timeline[i].prof || timeline[i].typeCours}**`, inline: true },
                    { name: "\u200B", value: "\u200B", inline: false }
                );
            }
        }

        return embedPrincipal;
    },
    gradesTop: (sortedArray, user, client) => {
        let i = 1;

        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setThumbnail(user.avatarURL() || baseImageURI)
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })
            .setDescription(sortedArray.map((x) => {
                if (x.value !== 'Abs ') {
                    return `\`${i++}\` **${x.value}**/**${x.outOf}** (${x.subjectName} - **${x.name} - ${x._raw.typeDevoir})`;
                }
            })
                .join("\n\n"));

        return embedPrincipal;
    },
    grades: (s, dUser, client) => {
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`> 🔔 | Nouvelle note en ${s.subjectName}`)
            .setThumbnail(dUser.avatarURL() || client.user.avatarURL())
            .setDescription("<:annonce:962378435815161936> : **" + s.subjectName + "** - **" + s.name + "** - **" + s._raw.typeDevoir + "**\n\n<:stats:962354418660028416> : " + s.value + "/" + s.outOf + "(**Coef** : " + s._raw.coef + ")\n\n" + client.getPercent(s.value, s.classAvg, s.outOf) + "\n\n<:planning:1020044801409826816> : <t:" + parseInt(Date.parse(s._raw.date) / 1000) + ":R>")
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

        return embedPrincipal;
    },
    gradesAverage: (s, moyenneClasse, nbv, dUser, client) => {
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`> 🔔 | Moyenne genérale`)
            .setThumbnail(dUser.avatarURL() || baseImageURI)
            .setDescription("**Periodes :** `" + "0 - " + nbv + "`\n\n📅 : **" + s.periode + "**\n\n📈 : **" + s.ensembleMatieres.moyenneGenerale + "/20" + "**\n\n" + client.getPercent(s.ensembleMatieres.moyenneGenerale, moyenneClasse, 20))
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

        return embedPrincipal;
    },
    edMessages: (s, ref, dUser, client) => {
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`> 🔔 | Message de ${s._raw.from.name}`)
            .setThumbnail(dUser.avatarURL() || client.user.avatarURL())
            .setDescription("\n📢 : **" + s._raw.subject + "**\n\n📚  : **" + ref + "**\n\n<:planning:1020044801409826816> : " + "<t:" + parseInt(Date.parse(s.date) / 1000) + ":R>")
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })
        return embedPrincipal;
    },
    edHomeworks: (s, dUser, client) => {
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`> 🔔 | Travaille à faire en ${s.subject.name} (${s.teacher})`)
            .setThumbnail(dUser.avatarURL() || client.user.avatarURL())
            .setDescription(`> ${s.job.content.text}\n\n<:planning:1020044801409826816> ${s.date ? `<t:${parseInt(Date.parse(s.date) / 1000)}:R>` : "Inconue"}`)
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

        return embedPrincipal;
    },
    edAccount: (acc, dUser, dbUser, client) => {
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`🔔 | Compte de ${dUser.tag}`)
            .setDescription(`\n\n**👤 ${acc.prenom} ${acc.nom}**\n\u200B\n> **📅 ${acc.anneeScolaireCourante} | 🎒 ${acc.profile.classe.libelle}**\n\u200B\n`)
            .setThumbnail(dUser.avatarURL() || baseImageURI)
            .setTimestamp()
            .addFields(
                {
                    name: `➡️ Autopost : ${dbUser.autoPost ? "Oui." : "Non."}`,
                    value: "\u200B",
                    inline: false
                }
            )
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

        return embedPrincipal;
    },
    edScheduleCanceled: (s, dUser, client) => {
        var days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'decembre'];
        const embedPrincipal = new MessageEmbed()
            .setColor(color)
            .setTitle(`> 📅 | **Cours de ${s.subject} annulé pour le ${days[new Date(s.startDate).getDay()]} ${new Date(s.startDate).getDate() < 10 ? 0 + new Date(s.startDate).getDate() : new Date(s.startDate).getDate()} ${months[new Date(s.startDate).getMonth()]}**`)
            .setThumbnail(dUser.avatarURL() || client.user.avatarURL())
            .setTimestamp()
            .addFields(
                { name: "👩‍🏫", value: `**${s.teacher}**`, inline: true },
                { name: "🕒", value: `**De ${s._raw.start_date.split(" ")[1]} à ${s._raw.end_date.split(" ")[1]}**`, inline: true },
            )
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })
        return embedPrincipal;
    }
}