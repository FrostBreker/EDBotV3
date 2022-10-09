const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { grades } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("note")
    .setDescription("Voire ses notes EcoleDirecte.")
    .addStringOption(option =>
        option.setName("confidentialités")
            .setDescription("Choisissez votre confidentialité")
            .setRequired(true)
            .addChoice("Publique", "p")
            .addChoice("Priver", "pv")
    )

module.exports = {
    admin: false,
    description: "Voire vos notes(s) EcoleDirecte.",
    data: data,
    runSlash: async (client, interaction) => {
        const user = interaction.member.user;
        const privacy = await interaction.options.getString("confidentialités");

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student") {
            return await interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const gradesList = await compte.getGrades();

        const gr = gradesList[0];
        if (client.isEmpty(gradesList) || client.isEmpty(gr)) {
            return interaction.editReply({ content: `**Une erreur est survenue.**`, ephemeral: true })
        }
        await interaction.editReply({ embeds: [grades(gr, user, client)], components: [client.createSelectMenu(gradesList, "grades", gr._raw.id)] });
    }
}