const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Voire votre emploi du temps EcoleDirecte.")
    .addNumberOption(option =>
        option.setName("top")
            .setDescription("Compris entre 0 et 50.")
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(50)
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
    description: "Voire vos notes(s) EcoleDirecte.",
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
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const notes = await compte.getGrades();
        const refData = []
        notes.forEach((x) => {
            if (!isNaN(x.value)) return refData.push(x)
        })
        const sortedArray = refData.sort((a, b) => {
            const aD = a.value / a.outOf;
            const bD = b.value / b.outOf;
            return bD - aD;
        });

        function getTopNumber() {
            if (!isNaN(number)) {
                if (number > 50) return 10
                else return number
            } else return 10
        }
        if (client.isEmpty(sortedArray)) {
            return interaction.editReply({ content: "Une érreur est survenue.", ephemeral: true });
        }

        sortedArray.length = getTopNumber();
        let i = 1;

        const embedPrincipal = new MessageEmbed()
            .setColor(430591)
            .setThumbnail(user.avatarURL())
            .setTimestamp()
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })
            .setDescription(sortedArray.map((x) => {
                if (x.value !== 'Abs ') {
                    return `\`${i++}\` **${x.value}**/**${x.outOf}** (${x.subjectName} - **${x.name} - ${x._raw.typeDevoir})`;
                }
            })
                .join("\n\n"));

        interaction.editReply({ embeds: [embedPrincipal] });
    }
}