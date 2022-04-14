module.exports = {
    name: "guildCreate",
    once: false,
    async execute(client, guild) {
        const data = await client.getGuild(guild);
        if (client.isEmpty(data)) {
            return await client.createGuild(guild);
        }
    }
}