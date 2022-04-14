const { MessageEmbed } = require("discord.js");
const { auth, noHomework } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("timeline")
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

        const date = timeline[0].start_date.split(" ");

        const embedPrincipal = new MessageEmbed()
            .setColor(timeline[0].color)
            .setTitle(`🔔 | Emplois du temps du: ${date[0]}`)
            .setThumbnail(user.avatarURL() || 'https://cdn.discordapp.com/attachments/779466058171154483/842742558354571274/logo_ecole_directe2.jpg')
            .setTimestamp()
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })
            .addField('\u200B', '\u200B');

        if (timeline[0].typeCours === "CONGE") {
            return await interaction.editReply({ embeds: [noHomework()], ephemeral: true });;
        } else {
            for (let i = 0; i < timeline.length; i++) {
                const startDate = timeline[i].start_date.split(" ");
                const endDate = timeline[i].end_date.split(" ");

                embedPrincipal.addFields(
                    { name: "📚", value: `**${timeline[i].text || timeline[i].matiere}** de **${startDate[1]}** à **${endDate[1]}**.`, inline: true },
                    { name: "👩‍🏫", value: `**${timeline[i].prof || timeline[i].typeCours}**`, inline: true },
                    { name: "\u200B", value: "\u200B", inline: false }
                );
            }
        }

        interaction.editReply({ embeds: [embedPrincipal] });
    }
}