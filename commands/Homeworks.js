const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("devoir")
    .setDescription("Voire vos devoir EcoleDirecte.")
    .addNumberOption(option =>
        option.setName("devoir")
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
    data: data,
    admin: false,
    description: "Voire vos devoir(s) EcoleDirecte.",
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

        const homeworks = await compte.getHomework(Date.now(), true);
        if (client.isEmpty(homeworks)) {
            return interaction.editReply(`**Aucun devoir(s) pour le ${client.timestampParser(Date.now())}.**\n🏖️***Profiter!***🏖️`)
        }
        let nb = homeworks.length;

        let nbv = nb > 0 ? nb - 1 : nb;
        const h = homeworks[number];
        if (number > nbv || client.isEmpty(h)) {
            return interaction.editReply({ content: `Veuillez préciser un nombre entre : **0** - **${nbv}**`, ephemeral: true });
        }

        const embedPrincipal = new MessageEmbed()
            .setColor(430591)
            .setTitle(`> 🔔 | Travaille à faire en ${h.subject.name} (${h.teacher})`)
            .setThumbnail(user.avatarURL())
            .setDescription(`Nombre(s) de devoirs: 0 - ${nbv}\n\n> ${h.job.content.text}\n\n<:planning:959563680398315540> ${h.date ? `<t:${parseInt(Date.parse(h.date) / 1000)}:R>` : "Inconue"}`)
            .setTimestamp()
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })

        interaction.editReply({ embeds: [embedPrincipal] });
    }
}