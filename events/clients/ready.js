const cron = require('node-cron');
const { add, send } = require("../../Actions/Autopost/index");
const app = require("../../main");

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
        setInterval(async () => client.user.setPresence({ activities: [{ name: `EcoleDirecte - ${(await client.getAllGuild()).length} serveurs`, type: 'WATCHING' }], status: 'online' }), 10000);

        //Autopost
        await add(client);
        cron.schedule('*/15 * * * *', async () => {
            if (!client.isEmpty(users)) {
                await send(client);
                await add(client);
            } else {
                add(client);
            }
        });

        //Created stats
        cron.schedule('0 0 * * *', async () => {
            await client.createStat();
        });

        app.listen(process.env.PORT, () => {
            client.logger(`${client.timestampParser()} => Express server is connected on port: ${process.env.PORT}`)
        });
        app.use("/api", async (req, res) => {
            res.status(200).json(await client.getStats());
        });

        //Bot login
        client.logger(`${client.timestampParser()} => ${client.user.tag} with ${client.guilds.cache.map(g => g.
            memberCount).reduce((a, b) => a + b)} users!`)

    }
}
