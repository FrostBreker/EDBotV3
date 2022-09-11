const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { baseImageURI } = require("../config");

const data = new SlashCommandBuilder()
    .setName("moyenne")
    .setDescription("Voire ses moyennes EcoleDirecte.")
    .addNumberOption(option =>
        option.setName("moyenne")
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
    description: "Voire vos moyenne(s) EcoleDirecte.",
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

        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student") {
            return await interaction.editReply({ embeds: [auth()], ephemeral: true });
        }
        const periods = await compte.getPeriods();

        if (client.isEmpty(periods)) {
            return await interaction.editReply({ content: `Cette periode n'existe **pas**\nPeriodes disponibles**:**\n**0** - **${nbv}**`, ephemral: true });
        }
        let nb = periods.length;

        const ref = periods[number];

        let nbv = nb > 0 ? nb - 1 : nb;
        if (number > nbv || client.isEmpty(ref)) {
            return await interaction.editReply({ content: `Veuillez préciser un nombre entre : **0** - **${nbv}**`, ephemeral: true });
        }
        const semester = ref._raw;
        const moyenneClasse = semester.ensembleMatieres.moyenneClasse;

        const embedPrincipal = new MessageEmbed()
            .setColor(430591)
            .setTitle(`> 🔔 | Moyenne genérale`)
            .setThumbnail(user.avatarURL() || baseImageURI)
            .setDescription("**Periodes :** `" + "0 - " + nbv + "`\n\n📅 : **" + semester.periode + "**\n\n📈 : **" + semester.ensembleMatieres.moyenneGenerale + "/20" + "**\n\n" + client.getPercent(semester.ensembleMatieres.moyenneGenerale, moyenneClasse, 20))
            .setTimestamp()
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: client.user.avatarURL() })

        interaction.editReply({ embeds: [embedPrincipal] });
    }
}