const { MessageEmbed } = require("discord.js");
const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');

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

        const authPass = await client.getUser(user).catch(() => { });
        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student" || client.isEmpty(authPass)) {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        let PPV = authPass.ppv;
        let PHOTOPP = authPass.photo;
        let autoPost = authPass.autoPost;

        PPV = PPV === 'p' ? "Publique." : "Priver.";
        PHOTOPP = PHOTOPP === 'p' ? "Publique." : "Priver.";
        autoPost = autoPost ? "Oui." : "Non.";
        const acc = compte.account;

        const embedPrincipal = new MessageEmbed()
            .setColor(430591)
            .setTitle(`🔔 | Compte de ${user.tag}`)
            .setDescription(`\n\n**👤 ${acc.prenom} ${acc.nom}**\n\u200B\n> **📅 ${acc.anneeScolaireCourante} | 🎒 ${acc.profile.classe.libelle}**\n\u200B\n`)
            .setThumbnail(authPass.picture)
            .setTimestamp()
            .addFields(
                {
                    name: `➡️ Confidentialités :  ${PPV}`,
                    value: "\u200B",
                    inline: false
                },
                {
                    name: `➡️ Photo : ${PHOTOPP}`,
                    value: "\u200B",
                    inline: false
                },
                {
                    name: `➡️ Autopost : ${autoPost}`,
                    value: "\u200B",
                    inline: false
                }
            )
            .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })

        interaction.editReply({ embeds: [embedPrincipal] });
    }
}