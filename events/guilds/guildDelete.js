module.exports = {
    name: "guildDelete",
    once: false,
    async execute(client, guild) {
        const user = await client.users.fetch(guild.ownerId);
        user.send("Votre serveur a été supprimé du bot, merci d'avoir utilisé le bot !");
        await client.deleteGuild(guild);
    }
}