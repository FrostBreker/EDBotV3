const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { edHomeworks } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("devoir")
    .setDescription("Voire ses devoirs EcoleDirecte.")
    .addStringOption(option =>
        option.setName("confidentialités")
            .setDescription("Choisissez votre confidentialité")
            .setRequired(true)
            .addChoice("Publique", "p")
            .addChoice("Priver", "pv")
    )

module.exports = {
    data: data,
    admin: false,
    description: "Voire vos devoir(s) EcoleDirecte.",
    runSlash: async (client, interaction) => {
        const user = interaction.member.user;
        const privacy = await interaction.options.getString("confidentialités");

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student") {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const homeworks = await compte.getHomework(Date.now(), true);
        if (client.isEmpty(homeworks)) {
            return interaction.editReply(`**Aucun devoir(s) pour le ${client.timestampParser(Date.now())}.**\n🏖️***Profiter!***🏖️`)
        }
        const h = homeworks[homeworks.length > 0 ? homeworks.length - 1 : 0];
        if (client.isEmpty(homeworks[0])) {
            return interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });
        }

        interaction.editReply({ embeds: [edHomeworks(h, user, client)], components: [client.createSelectMenu(homeworks, "homeworks", h.id)] });
    }
}