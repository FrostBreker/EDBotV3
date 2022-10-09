const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { schoolLife } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("schoollife")
    .setDescription("Voire ses retards, sanctions, etc...")
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
        const user = interaction.user;
        const privacy = await interaction.options.getString("confidentialités");

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.asgarConnect(user).catch(() => { });
        if (client.isEmpty(compte)) {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        };

        const vieScolaire = await compte.getSchoolLife();
        const vs = vieScolaire[0];
        if (client.isEmpty(vieScolaire) || client.isEmpty(vs)) {
            return interaction.editReply({ content: "Une érreur est survenue.", ephemeral: true });
        };

        await interaction.editReply({ embeds: [schoolLife(user, vs, client)], components: [client.createSelectMenu(vieScolaire, "schoollife", vs.id)] });
    }
}