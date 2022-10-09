const { wrongVBtn } = require('../../Buttons/MiscButtons');
const config = require('../../config');
const { edHomeworks } = require("../../Embeds/ED");

module.exports = {
    name: "interactionCreate",
    once: false,
    async execute(client, interaction) {
        const guild = await client.guilds.cache.get(interaction.guildId);
        const guildAuth = await client.getGuild(guild);

        if (interaction.isCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (!cmd) return await interaction.reply("Cette commande n'existe pas!");
            if (client.isEmpty(guildAuth)) {
                return interaction.reply({ content: `**Serveur : ${guild.name} inconnu re-invité le en cliquant sur le bouton ci-dessous\nSi le problème persiste veuillez rejoindre le serveur de support.**`, components: [wrongVBtn()] })
            }
            await client.addOrUpdateGuild(interaction.guild, "cmd", interaction.commandName, interaction.user.tag)
            if (cmd.admin) {
                if (interaction.user.id === config.admin) return cmd.runSlash(client, interaction);
                else return;
            } else {
                return cmd.runSlash(client, interaction);
            }
        } else if (interaction.isSelectMenu()) {
            await interaction.deferUpdate().catch(() => { });
            if (interaction.customId.startsWith("edselect")) {
                const id = interaction.customId.split("-");
                const edID = interaction.values[0];
                const user = interaction.user;
                const embed = await client.findEdObjectWithId(user, edID, id[1], client)
                if (client.isEmpty(embed)) return interaction.editReply({ content: "Une erreur est survenue", embeds: [], components: [] });
                else return await interaction.editReply({ embeds: [embed] });
            }
        }
    }
}