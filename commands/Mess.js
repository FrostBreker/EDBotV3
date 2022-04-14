const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName("mess")
    .setDescription("Voire vos message EcoleDirecte.")
    .addNumberOption(option =>
        option.setName("message")
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
    description: "Voire vos message(s) EcoleDirecte.",
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

        const messages = await compte.getMessages();
        if (client.isEmpty(messages)) {
            return interaction.editReply({ content: `Ce message n'existe **pas**\nMessage(s) disponible(s)**:**\n**0** - **${nbv}**`, ephemeral: true })
        }
        let nb = messages.length;

        let nbv = nb > 0 ? nb - 1 : nb;
        const h = messages[number];
        if (number > nbv || client.isEmpty(h)) {
            return interaction.editReply({ content: `Veuillez préciser un nombre entre : **0** - **${nbv}**`, ephemeral: true });
        }

        if (!h._raw.from.name || !h._raw.subject || !h._raw.date) {
            return interaction.editReply({ content: `**Une erreur est survenue avec ce mail.**`, ephemeral: true })
        }
        const content = await h.getContent();
        let refined = []
        content.text.split("\n").map(x => {
            if (!x.startsWith("[data:image")) {
                refined.push(x);
            }
        })
        const ref = refined ? refined.join("\n") : `Inconnue.`;

        const embedPrincipal = new MessageEmbed()
            .setColor(430591)
            .setTitle(`> 🔔 | Message de ${h._raw.from.name}`)
            .setThumbnail(user.avatarURL() || 'https://cdn.discordapp.com/attachments/779466058171154483/842742558354571274/logo_ecole_directe2.jpg')
            .setDescription("**Messages : ** `0 - " + nbv + "`\n\n<:annonce:962378435815161936> : **" + h._raw.subject + "**\n\n<:__:962378088082190366>  : **" + ref + "**\n\n<:planning:959563680398315540> : " + "<t:" + parseInt(Date.parse(h.date) / 1000) + ":R>")
            .setTimestamp()
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })


        interaction.editReply({ embeds: [embedPrincipal] });
    }
}