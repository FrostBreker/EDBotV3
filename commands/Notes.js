const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("note")
    .setDescription("Voire vos notes EcoleDirecte.")
    .addNumberOption(option =>
        option.setName("note")
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
            return await interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const grades = await compte.getGrades();

        if (client.isEmpty(grades)) {
            return await interaction.editReply({ content: `Cette notes n'existe **pas**\nNotes disponibles**:**\n**0** - **${nbv}**`, ephemral: true });
        }
        let nb = grades.length;

        const gr = grades[number];
        const date = gr._raw.date;

        let nbv = nb > 0 ? nb - 1 : nb;
        if (number > nbv || client.isEmpty(gr)) {
            return await interaction.editReply({ content: `Veuillez préciser un nombre entre : **0** - **${nbv}**`, ephemeral: true });
        }

        const embedPrincipal = new MessageEmbed()
            .setColor(430591)
            .setTitle(`> 🔔 | Note de ${gr.subjectName}`)
            .setThumbnail(user.avatarURL() || 'https://cdn.discordapp.com/attachments/779466058171154483/842742558354571274/logo_ecole_directe2.jpg')
            .setDescription("**Notes :** `" + "0 - " + nbv + "`\n\n📢 : **" + gr.subjectName + "** - **" + gr.name + "** - **" + gr._raw.typeDevoir + "**\n\n📈 : " + gr.value + "/20 (**Coef** : " + gr._raw.coef + ")\n\n" + client.getPercent(gr.value, gr.classAvg, gr.outOf) + "\n\n📅 : <t:" + parseInt(Date.parse(date) / 1000) + ":R>")
            .setTimestamp()
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })

        await interaction.editReply({ embeds: [embedPrincipal] });
    }
}