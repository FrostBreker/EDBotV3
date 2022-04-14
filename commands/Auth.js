const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("authentication")
    .setDescription("Vous connectez à EcoleDirecte.")

module.exports = {
    data: data,
    admin: false,
    description: "Vous connectez à EcoleDirecte.",
    runSlash: async (client, interaction) => {
        interaction.reply({ embeds: [auth()], ephemeral: true });
    }
}