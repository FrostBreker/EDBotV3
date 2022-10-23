const { auth, noHomework } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Timeline } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("emploisdutemps")
    .setDescription("Voire votre emploi du temps EcoleDirecte.")
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
        const data = [];
        interaction.options._hoistedOptions.forEach((x) => {
            return data.push(x.value);
        })
        const privacy = data[0];

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.asgarConnect(user).catch(() => { });
        if (client.isEmpty(compte)) {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const timeline = await compte.getSchedule();
        timeline.sort(function compare(a, b) {
            if (a.start_date < b.start_date)
                return -1;
            if (a.start_date > b.start_date)
                return 1;
            return 0;
        });
        if (client.isEmpty(timeline)) {
            return interaction.editReply({ embeds: [noHomework()], ephemeral: true });
        }

        await interaction.editReply({ embeds: [Timeline(timeline, user, client)] }).catch(() => {
            return interaction.editReply({ embeds: [noHomework()], ephemeral: true });
        })
    }
}