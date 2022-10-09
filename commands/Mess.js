const { auth } = require("../Embeds/Misc");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { edMessages } = require("../Embeds/ED");

const data = new SlashCommandBuilder()
    .setName("messages")
    .setDescription("Voire ses messages EcoleDirecte.")
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
        const privacy = await interaction.options.getString("confidentialités");

        await client.defferWithPrivacy(privacy, interaction)

        const compte = await client.connect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student") {
            return interaction.editReply({ embeds: [auth()], ephemeral: true });
        }

        const messages = await compte.getMessages();
        if (client.isEmpty(messages)) {
            return interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });
        }
        const h = messages[0];
        if (client.isEmpty(h)) {
            return interaction.editReply({ content: `Une erreur est survenue.`, ephemeral: true });
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

        interaction.editReply({ embeds: [edMessages(h, ref, user, client)], components: [client.createSelectMenu(messages, "mails", h.id)] });
    }
}