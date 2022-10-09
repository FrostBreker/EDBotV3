const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { edAccount } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("compte")
    .setDescription("Afficher son compte EcoleDirecte.")
    .addStringOption(option =>
        option.setName("confidentialités")
            .setDescription("Choisissez votre confidentialité")
            .setRequired(true)
            .addChoice("Publique", "p")
            .addChoice("Priver", "pv")
    )

module.exports = {
    admin: false,
    description: "Voire votre compte EcoleDirecte.",
    data: data,
    runSlash: async (client, interaction) => {
        const user = interaction.member.user;
        const data = [];
        interaction.options._hoistedOptions.forEach((x) => {
            return data.push(x.value);
        })
        const privacy = data[0];

        await client.defferWithPrivacy(privacy, interaction)

        const dbUser = await client.getUser(user).catch(() => { });
        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student" || client.isEmpty(dbUser)) {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }
        const acc = compte.account;

        interaction.editReply({ embeds: [edAccount(acc, user, dbUser, client)] });
    }
}