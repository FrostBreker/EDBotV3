const cron = require('node-cron');
const { add, send } = require("../../Actions/Autopost/index");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {

        //API
        const guild = [];
        await client.guilds.cache.map(e => guild.push(e));

        //Delete guild if not present  in the bot;
        (await client.getAllGuild()).forEach(async g => {
            const findGuild = await guild.find((guild) => {
                if (guild.id === g.guildID) return guild;
            });
            if (!findGuild) {
                return client.deleteGuild({ id: g.guildID, name: g.guildName });
            }
        });

        //Check guild on DB
        guild.forEach(async (g) => {
            const data = await client.getGuild(g);
            if (!data) return client.createGuild(g);
        });

        //Presence
        setInterval(async () => client.user.setPresence({ activities: [{ name: `ED BOT - ${(await client.getAllGuild()).length} serveurs`, type: 'WATCHING' }], status: 'online' }), 10000);

        //Autosend
        await add(client);
        cron.schedule('0 */1 * * *', async () => {
            if (!client.isEmpty(users)) {
                await send(client);
                await add(client);
            } else {
                add(client);
            }
        });

        //Bot login
        console.log(`${client.timestampParser()} => ${client.user.tag} with ${client.guilds.cache.map(g => g.
            memberCount).reduce((a, b) => a + b)} users!`)
    }
}