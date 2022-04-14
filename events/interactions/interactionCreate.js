const { wrongVBtn } = require('../../Buttons/MiscButtons');
const config = require('../../config');

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
            await client.addOrUpdateGuild(guild);
            if (cmd.admin) {
                if (interaction.user.id === config.admin) return cmd.runSlash(client, interaction);
                else return interaction.reply({ content: "Vous n'êtes pas administrateur.", ephemeral: true });
            } else {
                return cmd.runSlash(client, interaction);
            }
        }
    }
}