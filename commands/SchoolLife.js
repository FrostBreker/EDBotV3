const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("vie-scolaire")
    .setDescription("Voire ses retards, sanctions, etc...")
    .addNumberOption(option =>
        option.setName("nombre")
            .setDescription("Compris entre 0 et infinie.")
            .setRequired(true)
            .setMinValue(0)
    )
    .addStringOption(option =>
        option.setName("confidentialités")
            .setDescription("Choisissez votre confidentialité")
            .setRequired(true)
            .addChoice("Publique", "p")
            .addChoice("Priver", "pv")
    )

module.exports = {
    admin: false,
    description: "Voire vos retard, sanctions, etc...",
    data: data,
    runSlash: async (client, interaction) => {
        const user = interaction.member.user;
        const data = [];
        interaction.options._hoistedOptions.forEach((x) => {
            return data.push(x.value);
        })
        const number = data[0];
        const privacy = data[1];

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.asgarConnect(user).catch(() => { });
        if (client.isEmpty(compte)) {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const vieScolaire = await compte.getSchoolLife();

        if (client.isEmpty(vieScolaire.absencesRetards)) {
            return interaction.editReply({ content: "Une érreur est survenue.", ephemeral: true });
        }
        const vs = vieScolaire.absencesRetards[number];
        let nb = vieScolaire.absencesRetards.length;

        let nbv = nb > 0 ? nb - 1 : nb;
        if (number > nbv || client.isEmpty(vs)) {
            return interaction.editReply({ content: `Ce retard/santion n'existe **pas**\nDisponibles**:**\n**0** - **${nbv}**`, ephemeral: true });
        }

        let type = vs.typeElement ? vs.typeElement : "Inconnu";
        let date = vs.displayDate ? vs.displayDate : "Inconnu";
        let libelle = vs.libelle ? vs.libelle : "Inconnu";

        let motif = vs.motif;
        let justifieEd = vs.justifie;

        justifieEd = (justifieEd = true) ? "Oui" : "Non";

        if (motif === '') {
            motif = "Aucun motif"
        }

        const embedPrincipal = new MessageEmbed()
            .setColor('#25ff')
            .setTitle(`🔔 | VieScolaire de ${user.tag}`)
            .setThumbnail('https://cdn.discordapp.com/attachments/779466058171154483/842742558354571274/logo_ecole_directe2.jpg')
            .setDescription(`Nombres de retard(s): **0** - **${nbv}**`)
            .setTimestamp()
            .addFields(
                { name: `Date: `, value: date },
                { name: `Type: `, value: type },
                { name: `Durée: `, value: libelle },
                { name: `Motif: `, value: motif },
                { name: `Justifié: `, value: justifieEd }
            )
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })

        interaction.editReply({ embeds: [embedPrincipal] });
    }
}