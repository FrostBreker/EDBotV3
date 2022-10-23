const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { gradesAverage } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("moyenne")
    .setDescription("Voire ses moyennes EcoleDirecte.")
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
        const privacy = await interaction.options.getString("confidentialités");

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student") {
            return await interaction.editReply({ embeds: [auth()], ephemeral: true });
        }
        const periods = await compte.getPeriods();

        if (client.isEmpty(periods)) {
            return interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });
        }
        const ref = periods[0];
        if (client.isEmpty(ref)) {
            return interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });
        }

        const moyenneClasse = ref._raw.ensembleMatieres.moyenneClasse;

        interaction.editReply({ embeds: [gradesAverage(ref, moyenneClasse, user, client)], components: [client.createSelectMenu(periods, "average", ref.code)] });
    }
}